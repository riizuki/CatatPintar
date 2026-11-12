import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

/**
 * F0 — jalur utama: mahasiswa menulis catatannya SENDIRI.
 *
 * Rute ini membuat catatan kosong yang tertaut ke materi, lalu mahasiswa
 * mengisinya sambil membaca slide. Tidak ada AI di sini — justru itu intinya:
 * kalau AI yang menulis, tidak akan pernah ada celah untuk diuji, dan
 * keterlibatan kognitif mahasiswa menurun (Chen dkk., 2025).
 */

async function ensureFolder(userId, language) {
  const name = language === 'en' ? 'Lecture Materials' : 'Materi Kuliah';
  const existing = await prisma.folder.findFirst({ where: { userId, name } });
  if (existing) return existing;
  return prisma.folder.create({ data: { userId, name } });
}

export async function POST(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const id = Number.parseInt(params.materialId, 10);
  if (!Number.isInteger(id)) {
    return NextResponse.json({ message: 'Invalid material id' }, { status: 400 });
  }

  const material = await prisma.material.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!material) {
    return NextResponse.json({ message: 'Material not found' }, { status: 404 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const language = body?.language === 'en' ? 'en' : 'id';

    // Kalau mahasiswa sudah punya catatan sendiri untuk materi ini, buka yang
    // itu saja daripada menambah catatan kosong baru.
    const existing = await prisma.note.findFirst({
      where: { userId: session.user.id, materialId: material.id, isAiGenerated: false },
      orderBy: { updatedAt: 'desc' },
      select: { id: true, title: true },
    });

    if (existing) {
      return NextResponse.json({ ...existing, reused: true });
    }

    const folder = await ensureFolder(session.user.id, language);
    const baseTitle = material.title.replace(/\.(pdf|pptx?|PDF|PPTX?)$/u, '');

    const note = await prisma.note.create({
      data: {
        userId: session.user.id,
        folderId: folder.id,
        materialId: material.id,
        title: `${language === 'en' ? 'Notes' : 'Catatan'} — ${baseTitle}`.slice(0, 150),
        content: '',
        isAiGenerated: false,
      },
      select: { id: true, title: true },
    });

    return NextResponse.json({ ...note, reused: false }, { status: 201 });
  } catch (error) {
    console.error(`Error creating note for material ${id}:`, error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
