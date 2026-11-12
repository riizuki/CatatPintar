import prisma from '@/lib/prisma';
import { summarize } from './detectGaps';

/**
 * F7 — simpan potret Skor Kelengkapan Catatan saat ini.
 *
 * Dipanggil setiap kali skor bisa berubah. Potret yang identik dengan potret
 * terakhir tidak disimpan ulang, supaya riwayatnya hanya berisi perubahan
 * yang benar-benar terjadi (mis. membuka ulang analisis tanpa perubahan apa
 * pun tidak menambah baris).
 *
 * @param trigger analysis | remediation | dismiss | undismiss
 */
export async function recordCoverageSnapshot(noteId, trigger, client = prisma) {
  const gaps = await client.noteGap.findMany({
    where: { noteId },
    select: { status: true },
  });

  if (gaps.length === 0) return null;

  const summary = summarize(gaps);
  const last = await client.coverageSnapshot.findFirst({
    where: { noteId },
    orderBy: { takenAt: 'desc' },
  });

  const unchanged =
    last &&
    ['covered', 'partial', 'incorrect', 'missing', 'dismissed', 'total'].every(
      (key) => last[key] === summary[key],
    );

  if (unchanged) return last;

  return client.coverageSnapshot.create({
    data: {
      noteId,
      covered: summary.covered,
      partial: summary.partial,
      incorrect: summary.incorrect,
      missing: summary.missing,
      dismissed: summary.dismissed,
      total: summary.total,
      score: summary.score,
      trigger,
    },
  });
}

/** Riwayat skor, dari yang paling lama. */
export async function getCoverageHistory(noteId, client = prisma) {
  return client.coverageSnapshot.findMany({
    where: { noteId },
    orderBy: { takenAt: 'asc' },
    select: { score: true, trigger: true, takenAt: true, total: true, covered: true, dismissed: true },
  });
}
