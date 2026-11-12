import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import { readMaterialFile } from '@/lib/materials/storage';
import { extractPages } from '@/lib/materials/extractPages';
import { extractPointsFromPages, extractPointsFromPdfFile } from '@/lib/materials/extractPoints';
import { AiUnavailableError } from '@/lib/ai/errors';

/**
 * F1 — jalankan ekstraksi poin untuk satu materi.
 *
 * Dipisahkan dari rute unggah supaya unggahan terasa cepat dan proses panjang
 * punya status sendiri yang bisa dipantau klien (S4).
 *
 * Hasil ekstraksi disimpan sekali dan dipakai berkali-kali (S8) — materi yang
 * sudah `done` tidak diekstrak ulang kecuali diminta dengan `?force=true`.
 */

export const maxDuration = 300;

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

  const { searchParams } = new URL(request.url);
  const force = searchParams.get('force') === 'true';

  if (material.status === 'done' && !force) {
    const pointCount = await prisma.slidePoint.count({ where: { materialId: material.id } });
    return NextResponse.json({ status: 'done', pointCount, cached: true });
  }

  if (material.status === 'processing' && !force) {
    return NextResponse.json({ status: 'processing' }, { status: 409 });
  }

  await prisma.material.update({
    where: { id: material.id },
    data: { status: 'processing', errorReason: null },
  });

  try {
    const buffer = await readMaterialFile(material.filePath);
    const { pages, totalPages, hasTextLayer } = await extractPages(buffer, material.fileType);

    let points;
    let extractMode;

    if (hasTextLayer) {
      // Jalur utama: nomor halaman diambil langsung dari berkas, jadi pasti.
      points = await extractPointsFromPages(pages);
      extractMode = 'text_layer';
    } else if (material.fileType === 'pdf') {
      // Slide hasil pindai: serahkan ke Gemini, nomor halaman jadi inferensi.
      points = await extractPointsFromPdfFile(buffer, { totalPages });
      extractMode = 'vision_pdf';
    } else {
      throw new Error(
        'Tidak ada teks yang bisa dibaca dari berkas PPT ini. Coba ekspor ke PDF lalu unggah ulang.',
      );
    }

    if (points.length === 0) {
      throw new Error('Tidak ada poin materi yang bisa diambil dari berkas ini.');
    }

    await prisma.$transaction(async (tx) => {
      await tx.slidePoint.deleteMany({ where: { materialId: material.id } });
      await tx.slidePoint.createMany({
        data: points.map((point) => ({ ...point, materialId: material.id })),
      });
      await tx.material.update({
        where: { id: material.id },
        data: {
          status: 'done',
          extractMode,
          pageCount: totalPages ?? null,
          errorReason: null,
        },
      });
    });

    return NextResponse.json({
      status: 'done',
      extractMode,
      pageCount: totalPages ?? null,
      pointCount: points.length,
    });
  } catch (error) {
    console.error(`Error extracting material ${id}:`, error);

    await prisma.material.update({
      where: { id: material.id },
      data: { status: 'failed', errorReason: String(error?.message ?? error).slice(0, 500) },
    });

    return NextResponse.json(
      { status: 'failed', message: error?.message ?? 'Gagal memproses materi.' },
      { status: error instanceof AiUnavailableError ? error.httpStatus : 500 },
    );
  }
}
