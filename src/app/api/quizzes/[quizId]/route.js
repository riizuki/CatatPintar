import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

// GET /api/quizzes/[quizId] - Get a specific quiz for taking
export async function GET(request, { params }) {
  const session = await getServerSession(authOptions);
  const { quizId } = params;

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const quiz = await prisma.quiz.findFirst({
      where: {
        id: parseInt(quizId),
        userId: session.user.id, // Ensure the user owns the quiz
      },
      include: {
        questions: {
          // Select all fields EXCEPT the correct answer
          select: {
            id: true,
            question: true,
            optionA: true,
            optionB: true,
            optionC: true,
            optionD: true,
            quizId: true,
          },
        },
      },
    });

    if (!quiz) {
      return NextResponse.json({ message: 'Quiz not found or access denied' }, { status: 404 });
    }

    return NextResponse.json(quiz);
  } catch (error) {
    console.error(`Error fetching quiz ${quizId}:`, error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
