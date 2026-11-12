import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import { recordCoverageSnapshot } from '@/lib/notes/coverage';

/**
 * F4 — kendali mahasiswa atas penilaian sistem.
 *
 * Mahasiswa boleh membantah: "catatan saya sudah benar". Celahnya ditandai
 * `dismissed` dan tidak dihitung lagi.
 *
 * Selain soal kepercayaan, tiap bantahan adalah LABEL KOREKSI MANUSIA.
 * `statusBefore` menyimpan tuduhan asli sistem, sehingga presisi deteksi celah
 * bisa dihitung belakangan tanpa perlu anotator terpisah — data evaluasi untuk
 * Bab Hasil skripsi.
 */

export async function PATCH(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const id = Number.parseInt(params.gapId, 10);
  if (!Number.isInteger(id)) {
    return NextResponse.json({ message: 'Invalid gap id' }, { status: 400 });
  }

  const gap = await prisma.noteGap.findFirst({
    where: { id, note: { userId: session.user.id } },
  });

  if (!gap) {
    return NextResponse.json({ message: 'Gap not found' }, { status: 404 });
  }

  const body = await request.json().catch(() => ({}));
  const action = body?.action;

  if (action === 'dismiss') {
    if (gap.status === 'dismissed') {
      return NextResponse.json({ id: gap.id, status: gap.status });
    }

    const updated = await prisma.noteGap.update({
      where: { id: gap.id },
      data: {
        status: 'dismissed',
        statusBefore: gap.status,
        dismissedAt: new Date(),
      },
      select: { id: true, status: true, statusBefore: true, dismissedAt: true },
    });

    await recordCoverageSnapshot(gap.noteId, 'dismiss');
    return NextResponse.json(updated);
  }

  if (action === 'undismiss') {
    if (gap.status !== 'dismissed') {
      return NextResponse.json({ id: gap.id, status: gap.status });
    }

    const updated = await prisma.noteGap.update({
      where: { id: gap.id },
      data: {
        // Kembalikan ke tuduhan semula; kalau tidak tercatat, anggap perlu ditinjau.
        status: gap.statusBefore ?? 'partial',
        statusBefore: null,
        dismissedAt: null,
      },
      select: { id: true, status: true, statusBefore: true, dismissedAt: true },
    });

    await recordCoverageSnapshot(gap.noteId, 'undismiss');
    return NextResponse.json(updated);
  }

  return NextResponse.json(
    { message: 'action harus "dismiss" atau "undismiss"' },
    { status: 400 },
  );
}
