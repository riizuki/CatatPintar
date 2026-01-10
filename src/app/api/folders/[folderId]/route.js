import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

// Helper function to verify folder ownership
async function verifyFolderOwnership(userId, folderId) {
  const folder = await prisma.folder.findUnique({
    where: { id: parseInt(folderId) },
  });
  return folder && folder.userId === userId;
}

// GET /api/folders/[folderId] - Get a single folder's details
export async function GET(request, { params }) {
    const session = await getServerSession(authOptions);
    const { folderId } = params;

    if (!session) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const isOwner = await verifyFolderOwnership(session.user.id, folderId);
    if (!isOwner) {
        return NextResponse.json({ message: 'Folder not found or access denied' }, { status: 404 });
    }

    try {
        const folder = await prisma.folder.findUnique({
            where: { id: parseInt(folderId) },
        });
        return NextResponse.json(folder);
    } catch (error) {
        console.error(`Error fetching folder ${folderId}:`, error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

// PUT /api/folders/[folderId] - Update a folder's name
export async function PUT(request, { params }) {
  const session = await getServerSession(authOptions);
  const { folderId } = params;

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const isOwner = await verifyFolderOwnership(session.user.id, folderId);
  if (!isOwner) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json({ message: 'Folder name is required' }, { status: 400 });
    }

    const updatedFolder = await prisma.folder.update({
      where: {
        id: parseInt(folderId),
      },
      data: {
        name,
      },
    });

    return NextResponse.json(updatedFolder);
  } catch (error) {
    console.error(`Error updating folder ${folderId}:`, error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE /api/folders/[folderId] - Delete a folder
export async function DELETE(request, { params }) {
  const session = await getServerSession(authOptions);
  const { folderId } = params;

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const isOwner = await verifyFolderOwnership(session.user.id, folderId);
  if (!isOwner) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  try {
    await prisma.folder.delete({
      where: {
        id: parseInt(folderId),
      },
    });

    return NextResponse.json({ message: 'Folder deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error(`Error deleting folder ${folderId}:`, error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
