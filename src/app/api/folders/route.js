import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

// GET /api/folders - Get all folders for the logged-in user
export async function GET(request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const folders = await prisma.folder.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        _count: {
          select: { notes: true },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    // Map the result to a more friendly structure for the client
    const formattedFolders = folders.map(folder => ({
      id: folder.id,
      name: folder.name,
      createdAt: folder.createdAt,
      noteCount: folder._count.notes,
    }));

    return NextResponse.json(formattedFolders);
  } catch (error) {
    console.error('Error fetching folders:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/folders - Create a new folder
export async function POST(request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json({ message: 'Folder name is required' }, { status: 400 });
    }

    const newFolder = await prisma.folder.create({
      data: {
        name,
        userId: session.user.id,
      },
    });

    return NextResponse.json(newFolder, { status: 201 });
  } catch (error) {
    console.error('Error creating folder:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
