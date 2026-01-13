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

        return NextResponse.json(quizResult);

    } catch (error) {
        console.error(`Error fetching quiz result for quizId ${quizId}:`, error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
