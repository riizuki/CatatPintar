import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import { OPEN_STATUSES } from '@/lib/notes/detectGaps';
import { DEFAULT_QUESTIONS, MAX_QUESTIONS, generateGapQuestions } from '@/lib/quiz/gapQuiz';
import { AiUnavailableError } from '@/lib/ai/errors';

/**
 * F3 — buat Kuis Celah Catatan untuk satu catatan.
 *
 * Syaratnya: celah catatan sudah dianalisis (F2) dan masih ada celah terbuka.
 * Kuis ini sengaja tidak menganalisis ulang secara diam-diam — mahasiswa
 * harus melihat celahnya lebih dulu, termasuk kesempatan membantahnya (F4),
 * supaya ia tidak diuji atas tuduhan yang belum sempat ia periksa.
 */

export const maxDuration = 300;

export async function POST(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const noteId = Number.parseInt(params.noteId, 10);
  if (!Number.isInteger(noteId)) {
    return NextResponse.json({ message: 'Invalid note id' }, { status: 400 });
  }

  const note = await prisma.note.findFirst({
    where: { id: noteId, userId: session.user.id },
    select: { id: true, title: true, materialId: true, isAiGenerated: true },
  });

  if (!note) {
    return NextResponse.json({ message: 'Note not found' }, { status: 404 });
  }

  if (note.isAiGenerated || !note.materialId) {
    return NextResponse.json(
      { message: 'Kuis celah hanya bisa dibuat dari catatan yang kamu tulis sendiri untuk sebuah materi.' },
      { status: 422 },
    );
  }

  const body = await request.json().catch(() => ({}));
  const language = body?.language === 'en' ? 'en' : 'id';
  const requested = Number.parseInt(body?.numQuestions, 10);
  const limit = Number.isInteger(requested)
    ? Math.min(Math.max(requested, 1), MAX_QUESTIONS)
    : DEFAULT_QUESTIONS;

  const openGaps = await prisma.noteGap.findMany({
    where: { noteId: note.id, status: { in: OPEN_STATUSES } },
    include: { slidePoint: true },
  });

  if (openGaps.length === 0) {
    const analyzed = await prisma.noteGap.count({ where: { noteId: note.id } });
    return NextResponse.json(
      analyzed === 0
        ? { message: 'Celah catatan belum dianalisis. Jalankan "Cek Celah Catatan" dulu.', code: 'NOT_ANALYZED' }
        : { message: 'Tidak ada celah terbuka — catatanmu sudah lengkap!', code: 'NO_OPEN_GAPS' },
      { status: 422 },
    );
  }

  const allPoints = await prisma.slidePoint.findMany({
    where: { materialId: note.materialId },
    orderBy: [{ page: 'asc' }, { orderIndex: 'asc' }],
  });

  try {
    const { questions, skipped } = await generateGapQuestions(openGaps, allPoints, { language, limit });

    if (questions.length === 0) {
      throw new Error('AI tidak berhasil membuat soal yang valid dari celah catatanmu.');
    }

    const title = `${language === 'en' ? 'Gap Quiz' : 'Kuis Celah'} — ${note.title}`.slice(0, 190);

    const quiz = await prisma.$transaction(async (tx) => {
      const created = await tx.quiz.create({
        data: {
          userId: session.user.id,
          sourceType: 'gap',
          sourceValue: title,
          numQuestions: questions.length,
          noteId: note.id,
        },
      });

      await tx.quizQuestion.createMany({
        data: questions.map(({ misconceptionLetter, ...q }) => ({ ...q, quizId: created.id })),
      });

      return created;
    });

    return NextResponse.json(
      {
        quizId: quiz.id,
        numQuestions: questions.length,
        openGaps: openGaps.length,
        skipped: skipped.length,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error(`Error creating gap quiz for note ${note.id}:`, error?.cause ?? error);
    return NextResponse.json(
      {
        message: error?.message ?? 'Gagal membuat kuis dari celah catatan.',
        code: error instanceof AiUnavailableError ? `AI_${error.kind.toUpperCase()}` : 'QUIZ_FAILED',
      },
      { status: error instanceof AiUnavailableError ? error.httpStatus : 500 },
    );
  }
}
