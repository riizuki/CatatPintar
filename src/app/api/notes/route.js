import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

// GET /api/notes - Get all notes for a user
// Query params: ?recent=true, ?folderId=<id>
export async function GET(request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const getRecent = searchParams.get('recent');
  const folderId = searchParams.get('folderId');
  const searchTerm = searchParams.get('search'); // Get search term

  const whereClause = {
    userId: session.user.id,
  };

  if (folderId) {
    whereClause.folderId = parseInt(folderId);
  }

  if (searchTerm) {
    whereClause.OR = [
      { title: { contains: searchTerm } },
      { content: { contains: searchTerm } },
    ];
  }

  const findOptions = {
    where: whereClause,
    orderBy: {
      updatedAt: 'desc',
    },
  };

  if (getRecent === 'true') {
    findOptions.take = 5; // Or any number you prefer for "recent"
  }

  try {
    const notes = await prisma.note.findMany(findOptions);
    return NextResponse.json(notes);
  } catch (error) {
    console.error('Error fetching notes:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/notes - Create a new note
export async function POST(request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { title, content, folderId } = body;

    if (!title || !content) {
      return NextResponse.json({ message: 'Title and content are required' }, { status: 400 });
    }

    const data = {
      title,
      content,
      userId: session.user.id,
    };

    if (folderId) {
      // Verify the folder belongs to the user
      const folder = await prisma.folder.findFirst({
        where: {
          id: parseInt(folderId),
          userId: session.user.id,
        },
      });
      if (!folder) {
        return NextResponse.json({ message: 'Folder not found or access denied' }, { status: 404 });
      }
      data.folderId = parseInt(folderId);
    }

    const newNote = await prisma.note.create({ data });

    return NextResponse.json(newNote, { status: 201 });
  } catch (error) {
    console.error('Error creating note:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
