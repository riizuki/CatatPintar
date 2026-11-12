import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import { detectGaps, summarize } from '@/lib/notes/detectGaps';
import { isEffectivelyEmpty } from '@/lib/notes/noteText';
import { AiUnavailableError } from '@/lib/ai/errors';
import { getCoverageHistory, recordCoverageSnapshot } from '@/lib/notes/coverage';

/**
 * F2 — analisis celah catatan.
 *
 * GET  : daftar celah yang tersimpan + ringkasan
 * POST : jalankan ulang analisis terhadap isi catatan terkini
 */

export const maxDuration = 300;

async function loadNote(noteId, userId) {
  const id = Number.parseInt(noteId, 10);
  if (!Number.isInteger(id)) return null;

  return prisma.note.findFirst({
    where: { id, userId },
    include: {
      material: { select: { id: true, title: true, status: true, pageCount: true, fileType: true } },
    },
  });
}

function serialize(gap) {
  return {
    id: gap.id,
    status: gap.status,
    confidence: gap.confidence,
    aiReason: gap.aiReason,
    noteEvidence: gap.noteEvidence,
    statusBefore: gap.statusBefore,
    dismissedAt: gap.dismissedAt,
    closedAt: gap.closedAt,
    remediationAttempts: gap.remediationAttempts,
    point: {
      id: gap.slidePoint.id,
      page: gap.slidePoint.page,
      orderIndex: gap.slidePoint.orderIndex,
      pointType: gap.slidePoint.pointType,
      text: gap.slidePoint.text,
      sourceQuote: gap.slidePoint.sourceQuote,
    },
  };
}

export async function GET(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const note = await loadNote(params.noteId, session.user.id);
  if (!note) {
    return NextResponse.json({ message: 'Note not found' }, { status: 404 });
  }

  const gaps = await prisma.noteGap.findMany({
    where: { noteId: note.id },
    include: { slidePoint: true },
    orderBy: [{ slidePoint: { page: 'asc' } }, { slidePoint: { orderIndex: 'asc' } }],
  });

  return NextResponse.json({
    note: { id: note.id, title: note.title, isAiGenerated: note.isAiGenerated },
    material: note.material,
    analyzed: gaps.length > 0,
    summary: summarize(gaps),
    history: await getCoverageHistory(note.id),
    gaps: gaps.map(serialize),
  });
}

export async function POST(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const note = await loadNote(params.noteId, session.user.id);
  if (!note) {
    return NextResponse.json({ message: 'Note not found' }, { status: 404 });
  }

  // Catatan yang ditulis AI dari slide yang sama tidak boleh dianalisis:
  // isinya diturunkan dari slide itu, jadi hasilnya hanya menguji karangan AI.
  if (note.isAiGenerated) {
    return NextResponse.json(
      {
        message:
          'Catatan ini dibuat oleh AI dari slide yang sama, jadi tidak bisa dicek celahnya. Tulis catatanmu sendiri dulu.',
        code: 'AI_GENERATED_NOTE',
      },
      { status: 422 },
    );
  }

  if (!note.materialId || !note.material) {
    return NextResponse.json(
      { message: 'Catatan ini belum tertaut ke materi mana pun.', code: 'NO_MATERIAL' },
      { status: 422 },
    );
  }

  if (note.material.status !== 'done') {
    return NextResponse.json(
      { message: 'Materi belum selesai dipecah jadi poin.', code: 'MATERIAL_NOT_READY' },
      { status: 409 },
    );
  }

  if (isEffectivelyEmpty(note.content)) {
    return NextResponse.json(
      { message: 'Catatanmu masih kosong. Tulis dulu catatanmu, baru dicek celahnya.', code: 'EMPTY_NOTE' },
      { status: 422 },
    );
  }

  const points = await prisma.slidePoint.findMany({
    where: { materialId: note.materialId },
    orderBy: [{ page: 'asc' }, { orderIndex: 'asc' }],
  });

  if (points.length === 0) {
    return NextResponse.json(
      { message: 'Materi ini belum punya poin.', code: 'NO_POINTS' },
      { status: 409 },
    );
  }

  try {
    const { verdicts, stats } = await detectGaps(note.content, points);

    // Bantahan mahasiswa dipertahankan: kalau dia sudah menyatakan catatannya
    // benar, analisis ulang tidak boleh menuduhnya lagi.
    const dismissed = await prisma.noteGap.findMany({
      where: { noteId: note.id, status: 'dismissed' },
      select: { slidePointId: true },
    });
    const dismissedIds = new Set(dismissed.map((gap) => gap.slidePointId));

    await prisma.$transaction(
      verdicts
        .filter((verdict) => !dismissedIds.has(verdict.slidePointId))
        .map((verdict) =>
          prisma.noteGap.upsert({
            where: {
              noteId_slidePointId: { noteId: note.id, slidePointId: verdict.slidePointId },
            },
            create: { noteId: note.id, ...verdict },
            // Kalau poin yang dulu sudah ditutup kini kembali jadi celah
            // (mis. tulisannya dihapus dari catatan), cap "tertutup"-nya dicabut.
            update: {
              ...verdict,
              statusBefore: null,
              dismissedAt: null,
              ...(verdict.status === 'covered' ? {} : { closedAt: null }),
            },
          }),
        ),
    );

    await recordCoverageSnapshot(note.id, 'analysis');

    const gaps = await prisma.noteGap.findMany({
      where: { noteId: note.id },
      include: { slidePoint: true },
      orderBy: [{ slidePoint: { page: 'asc' } }, { slidePoint: { orderIndex: 'asc' } }],
    });

    return NextResponse.json({
      note: { id: note.id, title: note.title, isAiGenerated: note.isAiGenerated },
      material: note.material,
      analyzed: true,
      stats: { ...stats, keptDismissed: dismissedIds.size },
      summary: summarize(gaps),
      history: await getCoverageHistory(note.id),
      gaps: gaps.map(serialize),
    });
  } catch (error) {
    console.error(`Error detecting gaps for note ${note.id}:`, error?.cause ?? error);
    // Tidak ada yang tersimpan: hasil lama (kalau ada) tetap utuh.
    return NextResponse.json(
      {
        message: error?.message ?? 'Gagal menganalisis celah catatan.',
        code: error instanceof AiUnavailableError ? `AI_${error.kind.toUpperCase()}` : 'ANALYSIS_FAILED',
      },
      { status: error instanceof AiUnavailableError ? error.httpStatus : 500 },
    );
  }
}
