import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

// GET /api/flashcards?noteId=<id> - Get all flashcards for a specific note
export async function GET(request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const noteId = searchParams.get('noteId');

  if (!noteId) {
    return NextResponse.json({ message: 'noteId query parameter is required' }, { status: 400 });
  }

  try {
    // First, verify the user owns the note associated with the flashcards
    const note = await prisma.note.findFirst({
        where: {
            id: parseInt(noteId),
            userId: session.user.id,
        }
    });

    if (!note) {
        return NextResponse.json({ message: 'Note not found or access denied' }, { status: 404 });
    }

    // If ownership is confirmed, fetch the flashcards
    const flashcards = await prisma.flashcard.findMany({
      where: {
        noteId: parseInt(noteId),
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return NextResponse.json(flashcards);
  } catch (error) {
    console.error('Error fetching flashcards:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
