import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import { readMaterialFile } from '@/lib/materials/storage';

/**
 * Unduh berkas materi asli.
 *
 * Berkas sekarang disimpan di luar `public/`, jadi satu-satunya jalan untuk
 * mengambilnya adalah lewat rute ini — yang memeriksa sesi dan kepemilikan
 * lebih dulu. Sebelumnya berkas berada di `public/uploads/` dan bisa diunduh
 * siapa pun yang menebak URL-nya.
 */

const MIME = {
  pdf: 'application/pdf',
  ppt: 'application/vnd.ms-powerpoint',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
};

export async function GET(request, { params }) {
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
    const buffer = await readMaterialFile(material.filePath);
    const { searchParams } = new URL(request.url);
    const disposition = searchParams.get('download') === 'true' ? 'attachment' : 'inline';
    const safeTitle = material.title.replace(/"/g, '');

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': MIME[material.fileType] ?? 'application/octet-stream',
        'Content-Length': String(buffer.length),
        'Content-Disposition': `${disposition}; filename="${safeTitle}"`,
        'Cache-Control': 'private, max-age=3600',
      },
    });
  } catch (error) {
    console.error(`Error reading material file ${id}:`, error);
    return NextResponse.json({ message: 'Berkas materi tidak ditemukan.' }, { status: 404 });
  }
}
