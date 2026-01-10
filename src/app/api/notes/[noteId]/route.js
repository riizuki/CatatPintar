import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

// Helper function to verify note ownership
async function verifyNoteOwnership(userId, noteId) {
  const note = await prisma.note.findUnique({
    where: { id: parseInt(noteId) },
  });
  return note && note.userId === userId;
}

// GET /api/notes/[noteId] - Get a single note
export async function GET(request, { params }) {
  const session = await getServerSession(authOptions);
  const { noteId } = params;

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const isOwner = await verifyNoteOwnership(session.user.id, noteId);
  if (!isOwner) {
    // Return 404 instead of 403 to avoid leaking information
    return NextResponse.json({ message: 'Note not found' }, { status: 404 });
  }

  try {
    const note = await prisma.note.findUnique({
      where: { id: parseInt(noteId) },
    });
    return NextResponse.json(note);
  } catch (error) {
    console.error(`Error fetching note ${noteId}:`, error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT /api/notes/[noteId] - Update a note
export async function PUT(request, { params }) {
  const session = await getServerSession(authOptions);
  const { noteId } = params;

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const isOwner = await verifyNoteOwnership(session.user.id, noteId);
  if (!isOwner) {
    return NextResponse.json({ message: 'Note not found' }, { status: 404 });
  }

  try {
    const body = await request.json();
    const { title, content, folderId } = body;

    const dataToUpdate = {};
    if (title) dataToUpdate.title = title;
    if (content) dataToUpdate.content = content;
    if (folderId !== undefined) {
        if(folderId === null) {
            dataToUpdate.folderId = null;
        } else {
            // Verify folder ownership if moving to a new folder
            const folder = await prisma.folder.findFirst({
                where: { id: parseInt(folderId), userId: session.user.id }
            });
            if (!folder) return NextResponse.json({ message: 'Folder not found or access denied' }, { status: 404 });
            dataToUpdate.folderId = parseInt(folderId);
        }
    }


    const updatedNote = await prisma.note.update({
      where: { id: parseInt(noteId) },
      data: dataToUpdate,
    });

    return NextResponse.json(updatedNote);
  } catch (error) {
    console.error(`Error updating note ${noteId}:`, error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE /api/notes/[noteId] - Delete a note
export async function DELETE(request, { params }) {
    const session = await getServerSession(authOptions);
    const { noteId } = params;

    if (!session) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const isOwner = await verifyNoteOwnership(session.user.id, noteId);
    if (!isOwner) {
        return NextResponse.json({ message: 'Note not found' }, { status: 404 });
    }

    try {
        await prisma.note.delete({
            where: { id: parseInt(noteId) },
        });

        return NextResponse.json({ message: 'Note deleted successfully' }, { status: 200 });
    } catch (error) {
        console.error(`Error deleting note ${noteId}:`, error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
