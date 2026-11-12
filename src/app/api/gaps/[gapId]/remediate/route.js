import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import { OPEN_STATUSES, summarize } from '@/lib/notes/detectGaps';
import { MAX_REMEDIATION_CHARS, appendToNote, rejudgePoint } from '@/lib/notes/remediation';
import { recordCoverageSnapshot } from '@/lib/notes/coverage';
import { AiUnavailableError } from '@/lib/ai/errors';

/**
 * F6 — tutup satu celah.
 *
 * Body:
 *   { text: "..." }  tambahkan tulisan mahasiswa ke catatannya, lalu periksa ulang
 *   { }              periksa ulang saja (mis. ia sudah memperbaiki lewat editor)
 *
 * Urutannya sengaja: SIMPAN tulisan mahasiswa lebih dulu, BARU periksa.
 * Kalau AI sedang tidak tersedia, tulisannya tetap aman di catatan dan ia
 * cukup menekan "Periksa ulang" nanti — tidak perlu mengetik ulang.
 */

export const maxDuration = 120;

export async function POST(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const id = Number.parseInt(params.gapId, 10);
  if (!Number.isInteger(id)) {
    return NextResponse.json({ message: 'Invalid gap id' }, { status: 400 });
  }

  const gap = await prisma.noteGap.findFirst({
    where: { id, note: { userId: session.user.id } },
    include: {
      slidePoint: true,
      note: { select: { id: true, content: true, isAiGenerated: true } },
    },
  });

  if (!gap) {
    return NextResponse.json({ message: 'Gap not found' }, { status: 404 });
  }

  if (!OPEN_STATUSES.includes(gap.status)) {
    return NextResponse.json(
      { message: 'Celah ini sudah tertutup.', code: 'ALREADY_CLOSED', status: gap.status },
      { status: 409 },
    );
  }

  const body = await request.json().catch(() => ({}));
  const text = typeof body?.text === 'string' ? body.text.trim() : '';

  if (text.length > MAX_REMEDIATION_CHARS) {
    return NextResponse.json(
      { message: `Tambahan catatan terlalu panjang (maksimal ${MAX_REMEDIATION_CHARS} karakter).` },
      { status: 400 },
    );
  }

  // 1) Simpan tulisan mahasiswa lebih dulu.
  let content = gap.note.content;
  if (text) {
    content = appendToNote(content, text);
    await prisma.note.update({ where: { id: gap.note.id }, data: { content } });
  }

  // 2) Periksa ulang poin ini saja.
  let verdict;
  try {
    verdict = await rejudgePoint(content, gap.slidePoint);
  } catch (error) {
    console.error(`Error re-judging gap ${gap.id}:`, error?.cause ?? error);
    const isAi = error instanceof AiUnavailableError;
    return NextResponse.json(
      {
        message: text
          ? `Tambahan catatanmu sudah tersimpan, tapi belum bisa diperiksa. ${error?.message ?? ''}`.trim()
          : error?.message ?? 'Gagal memeriksa ulang celah ini.',
        noteSaved: Boolean(text),
        code: isAi ? `AI_${error.kind.toUpperCase()}` : 'RECHECK_FAILED',
      },
      { status: isAi ? error.httpStatus : 500 },
    );
  }

  if (!verdict) {
    return NextResponse.json(
      { message: 'Gagal memeriksa ulang celah ini.', noteSaved: Boolean(text) },
      { status: 500 },
    );
  }

  const closed = verdict.status === 'covered';

  const updated = await prisma.noteGap.update({
    where: { id: gap.id },
    data: {
      status: verdict.status,
      confidence: verdict.confidence,
      aiReason: verdict.aiReason,
      noteEvidence: verdict.noteEvidence,
      remediationAttempts: { increment: 1 },
      ...(closed ? { closedAt: new Date() } : {}),
    },
    include: { slidePoint: true },
  });

  await recordCoverageSnapshot(gap.note.id, 'remediation');

  const allGaps = await prisma.noteGap.findMany({
    where: { noteId: gap.note.id },
    select: { status: true },
  });

  return NextResponse.json({
    closed,
    noteSaved: Boolean(text),
    summary: summarize(allGaps),
    gap: {
      id: updated.id,
      status: updated.status,
      confidence: updated.confidence,
      aiReason: updated.aiReason,
      noteEvidence: updated.noteEvidence,
      closedAt: updated.closedAt,
      remediationAttempts: updated.remediationAttempts,
    },
  });
}
