import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import { readMaterialFile } from '@/lib/materials/storage';
import { generateSummaryHtml } from '@/lib/materials/summaryNote';

/**
 * Mode opsional "Ringkasan Dosen": AI merangkum slide jadi catatan jadi.
 *
 * Catatan hasilnya ditandai `isAiGenerated = true` dan HARUS dikecualikan dari
 * analisis celah nanti (F2), karena isinya diturunkan dari slide yang sama —
 * membandingkannya dengan slide itu hanya akan menguji karangan AI sendiri.
 */

export const maxDuration = 300;

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

    const existing = await prisma.note.findFirst({
      where: { userId: session.user.id, materialId: material.id, isAiGenerated: true },
      orderBy: { updatedAt: 'desc' },
      select: { id: true, title: true },
    });

    if (existing) {
      return NextResponse.json({ ...existing, reused: true });
    }

    const buffer = await readMaterialFile(material.filePath);
    const html = await generateSummaryHtml({
      buffer,
      filename: material.title,
      extension: material.fileType,
      language,
    });

    if (!html) {
      throw new Error('AI tidak menghasilkan ringkasan yang bisa dipakai.');
    }

    const folder = await ensureFolder(session.user.id, language);
    const baseTitle = material.title.replace(/\.(pdf|pptx?|PDF|PPTX?)$/u, '');

    const note = await prisma.note.create({
      data: {
        userId: session.user.id,
        folderId: folder.id,
        materialId: material.id,
        title: `${language === 'en' ? 'AI Summary' : 'Ringkasan AI'} — ${baseTitle}`.slice(0, 150),
        content: html,
        isAiGenerated: true,
      },
      select: { id: true, title: true },
    });

    return NextResponse.json({ ...note, reused: false }, { status: 201 });
  } catch (error) {
    console.error(`Error summarizing material ${id}:`, error);
    return NextResponse.json(
      { message: error?.message ?? 'Gagal merangkum materi.' },
      { status: 500 },
    );
  }
}
