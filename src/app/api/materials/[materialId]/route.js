import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import { deleteMaterialFile } from '@/lib/materials/storage';

/** Ambil materi hanya kalau memang milik pengguna yang sedang login. */
async function findOwned(materialId, userId) {
  const id = Number.parseInt(materialId, 10);
  if (!Number.isInteger(id)) return null;
  return prisma.material.findFirst({ where: { id, userId } });
}

// GET /api/materials/[materialId] - detail materi, opsional beserta poinnya
export async function GET(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const material = await findOwned(params.materialId, session.user.id);
  if (!material) {
    return NextResponse.json({ message: 'Material not found' }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const withPoints = searchParams.get('points') === 'true';

  const points = withPoints
    ? await prisma.slidePoint.findMany({
        where: { materialId: material.id },
        orderBy: [{ page: 'asc' }, { orderIndex: 'asc' }],
      })
    : undefined;

  const pointCount = await prisma.slidePoint.count({ where: { materialId: material.id } });

  return NextResponse.json({
    id: material.id,
    title: material.title,
    fileType: material.fileType,
    fileSize: material.fileSize,
    pageCount: material.pageCount,
    status: material.status,
    extractMode: material.extractMode,
    errorReason: material.errorReason,
    createdAt: material.createdAt,
    pointCount,
    ...(points ? { points } : {}),
  });
}

// DELETE /api/materials/[materialId] - hapus materi beserta berkas fisiknya
export async function DELETE(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const material = await findOwned(params.materialId, session.user.id);
  if (!material) {
    return NextResponse.json({ message: 'Material not found' }, { status: 404 });
  }

  try {
    // Catatan mahasiswa sengaja TIDAK ikut terhapus; relasinya di-set null
    // (onDelete: SetNull) supaya tulisannya sendiri tidak hilang.
    await prisma.material.delete({ where: { id: material.id } });
    await deleteMaterialFile(material.filePath);

    return NextResponse.json({ message: 'Deleted' });
  } catch (error) {
    console.error('Error deleting material:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
