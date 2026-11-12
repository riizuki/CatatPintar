import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import path from 'path';
import { saveMaterialFile } from '@/lib/materials/storage';

/**
 * F0 — materi dosen kini jadi entitas sendiri (`Material`), terpisah dari
 * catatan mahasiswa (`Note`).
 *
 * Rute ini SENGAJA tidak lagi memanggil AI. Mengunggah slide hanya menyimpan
 * slide. Pemecahan jadi poin dijalankan terpisah lewat
 * `POST /api/materials/[materialId]/extract`, supaya proses yang lama tidak
 * menyandera satu request HTTP (S4).
 */

const ALLOWED = ['pdf', 'ppt', 'pptx'];
const MAX_BYTES = 20 * 1024 * 1024;

// GET /api/materials - daftar materi milik pengguna
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const materials = await prisma.material.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        fileType: true,
        fileSize: true,
        pageCount: true,
        status: true,
        extractMode: true,
        errorReason: true,
        createdAt: true,
        _count: { select: { points: true, notes: true } },
      },
    });

    return NextResponse.json(
      materials.map(({ _count, ...material }) => ({
        ...material,
        pointCount: _count.points,
        noteCount: _count.notes,
      })),
    );
  } catch (error) {
    console.error('Error fetching materials:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/materials - unggah berkas materi (tanpa AI)
export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || typeof file.arrayBuffer !== 'function') {
      return NextResponse.json({ message: 'No file uploaded' }, { status: 400 });
    }

    const filename = file.name || 'material';
    const extension = path.extname(filename).toLowerCase().replace('.', '');

    if (!ALLOWED.includes(extension)) {
      return NextResponse.json(
        { message: 'Format file tidak didukung. Harap unggah berkas PDF, PPT, atau PPTX.' },
        { status: 400 },
      );
    }

    if (typeof file.size === 'number' && file.size > MAX_BYTES) {
      return NextResponse.json(
        { message: 'Ukuran file terlalu besar. Maksimal adalah 20MB.' },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    if (buffer.length > MAX_BYTES) {
      return NextResponse.json(
        { message: 'Ukuran file terlalu besar. Maksimal adalah 20MB.' },
        { status: 400 },
      );
    }

    const relativePath = await saveMaterialFile(session.user.id, filename, buffer);

    const material = await prisma.material.create({
      data: {
        userId: session.user.id,
        title: filename,
        filePath: relativePath,
        fileType: extension,
        fileSize: buffer.length,
        status: 'pending',
      },
      select: { id: true, title: true, fileType: true, status: true, createdAt: true },
    });

    return NextResponse.json(material, { status: 201 });
  } catch (error) {
    console.error('Error uploading material:', error);
    return NextResponse.json(
      { message: 'Gagal mengunggah berkas materi.', error: error.message },
      { status: 500 },
    );
  }
}
