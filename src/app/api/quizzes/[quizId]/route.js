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

// DELETE /api/quizzes/[quizId] - Delete a quiz
export async function DELETE(request, { params }) {
  const session = await getServerSession(authOptions);
  const { quizId } = params;

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const quiz = await prisma.quiz.findFirst({
      where: {
        id: parseInt(quizId),
        userId: session.user.id,
      },
    });

    if (!quiz) {
      return NextResponse.json({ message: 'Quiz not found or access denied' }, { status: 404 });
    }

    await prisma.quiz.delete({
      where: {
        id: parseInt(quizId),
      },
    });

    return NextResponse.json({ message: 'Quiz deleted successfully' });
  } catch (error) {
    console.error(`Error deleting quiz ${quizId}:`, error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
