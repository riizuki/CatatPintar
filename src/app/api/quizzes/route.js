import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

// GET /api/quizzes - Get all quizzes for the logged-in user
export async function GET(request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const quizzes = await prisma.quiz.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        // Include the result if the user has taken the quiz
        results: {
          where: {
            userId: session.user.id,
          },
          select: {
            score: true,
            takenAt: true,
          },
        },
      },
    });

    // Remap to a more friendly structure
    const formattedQuizzes = quizzes.map(quiz => {
        const result = quiz.results.length > 0 ? quiz.results[0] : null;
        return {
            id: quiz.id,
            sourceType: quiz.sourceType,
            sourceValue: quiz.sourceValue,
            createdAt: quiz.createdAt,
            result: result, // Will be null if not taken
        }
    });


    return NextResponse.json(formattedQuizzes);
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
