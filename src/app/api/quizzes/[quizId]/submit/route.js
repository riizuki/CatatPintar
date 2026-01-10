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
        
        // 2. Check if already taken
        const existingResult = await prisma.quizResult.findFirst({
            where: { quizId: parseInt(quizId), userId: session.user.id },
        });

        if (existingResult) {
            return NextResponse.json({ message: 'You have already taken this quiz.' }, { status: 409 });
        }

        // 3. Get user answers from request body
        const body = await request.json();
        const { answers } = body; // Expected format: [{ questionId: 1, answer: 'A' }, ...]

        if (!answers || !Array.isArray(answers)) {
            return NextResponse.json({ message: 'Invalid answers format.' }, { status: 400 });
        }

        // 4. Compare answers and calculate score
        let correctCount = 0;
        const correctAnswers = new Map(quiz.questions.map(q => [q.id, q.correctAnswer]));
        
        answers.forEach(userAnswer => {
            const correctAnswer = correctAnswers.get(userAnswer.questionId);
            if (correctAnswer && correctAnswer.toUpperCase() === userAnswer.answer.toUpperCase()) {
                correctCount++;
            }
        });

        const score = Math.round((correctCount / quiz.questions.length) * 100);

        // 5. Save the result
        await prisma.quizResult.create({
            data: {
                quizId: parseInt(quizId),
                userId: session.user.id,
                score,
            },
        });
        
        // 6. Return score and the correct answers for review
        const reviewData = quiz.questions.map(q => ({
            questionId: q.id,
            correctAnswer: q.correctAnswer,
        }));

        return NextResponse.json({ score, correctAnswers: reviewData });

    } catch (error) {
        console.error(`Error submitting quiz ${quizId}:`, error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
