import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

// POST /api/quizzes/[quizId]/submit - Submit answers and get the result
export async function POST(request, { params }) {
    const session = await getServerSession(authOptions);
    const { quizId } = params;

    if (!session) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        // 1. Verify quiz ownership
        const quiz = await prisma.quiz.findFirst({
            where: { id: parseInt(quizId), userId: session.user.id },
            include: { questions: true },
        });

        if (!quiz) {
            return NextResponse.json({ message: 'Quiz not found or access denied' }, { status: 404 });
        }
        
        // 2. Get user answers from request body
        const body = await request.json();
        const { answers } = body; // Expected format: [{ questionId: 1, answer: 'A' }, ...]

        if (!answers || !Array.isArray(answers)) {
            return NextResponse.json({ message: 'Invalid answers format.' }, { status: 400 });
        }

        // 3. Compare answers and calculate score
        let correctCount = 0;
        const correctAnswersMap = new Map(quiz.questions.map(q => [q.id, q.correctAnswer]));
        
        answers.forEach(userAnswer => {
            const correctAnswer = correctAnswersMap.get(userAnswer.questionId);
            if (correctAnswer && correctAnswer.toUpperCase() === userAnswer.answer.toUpperCase()) {
                correctCount++;
            }
        });

        const score = Math.round((correctCount / quiz.questions.length) * 100);

        // 4. Save or update the result
        await prisma.quizResult.upsert({
            where: {
                userId_quizId: {
                    userId: session.user.id,
                    quizId: parseInt(quizId)
                }
            },
            update: { score: score, takenAt: new Date() }, // Update score and takenAt
            create: {
                quizId: parseInt(quizId),
                userId: session.user.id,
                score,
            },
        });
        
        // 5. Return score and the correct answers for review.
        // Untuk kuis celah (F3), sertakan juga asal-usul soal supaya jawaban
        // yang salah bisa diarahkan kembali ke halaman slide sumbernya (F5).
        const reviewData = quiz.questions.map(q => ({
            questionId: q.id,
            correctAnswer: q.correctAnswer,
            slidePage: q.slidePage ?? null,
            gapId: q.gapId ?? null,
            explanation: q.explanation ?? null,
        }));

        return NextResponse.json({ score, correctAnswers: reviewData });

    } catch (error) {
        console.error(`Error submitting quiz ${quizId}:`, error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
