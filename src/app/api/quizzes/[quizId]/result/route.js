import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

export async function GET(request, { params }) {
    const session = await getServerSession(authOptions);
    const { quizId } = params;

    if (!session) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const quizResult = await prisma.quizResult.findFirst({
            where: {
                quizId: parseInt(quizId),
                userId: session.user.id,
            },
        });

        if (!quizResult) {
            return NextResponse.json({ message: 'Quiz result not found' }, { status: 404 });
        }

        // Kunci jawaban baru boleh dibuka SETELAH kuis dikerjakan. Sebelumnya
        // halaman kuis mencoba membaca kunci dari GET /api/quizzes/[quizId],
        // yang memang tidak mengirimkannya — sehingga pembahasan jawaban
        // kosong setiap kali kuis yang sudah dikerjakan dibuka ulang.
        const questions = await prisma.quizQuestion.findMany({
            where: { quizId: quizResult.quizId },
            select: { id: true, correctAnswer: true, slidePage: true, gapId: true, explanation: true },
        });

        return NextResponse.json({
            ...quizResult,
            correctAnswers: questions.map((q) => ({
                questionId: q.id,
                correctAnswer: q.correctAnswer,
                slidePage: q.slidePage ?? null,
                gapId: q.gapId ?? null,
                explanation: q.explanation ?? null,
            })),
        });

    } catch (error) {
        console.error(`Error fetching quiz result for quizId ${quizId}:`, error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
