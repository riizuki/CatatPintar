import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

export async function GET(request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const notesWithFlashcards = await prisma.note.findMany({
            where: {
                userId: session.user.id,
                flashcards: {
                    some: {}, // Ensures that the note has at least one flashcard
                },
            },
            select: {
                id: true,
                title: true,
            },
            orderBy: {
                updatedAt: 'desc', // Or createdAt, depending on preference
            },
        });

        return NextResponse.json(notesWithFlashcards);
    } catch (error) {
        console.error('Error fetching notes with flashcards:', error);
        return NextResponse.json({ message: 'Error fetching notes with flashcards', details: error.message }, { status: 500 });
    }
}
