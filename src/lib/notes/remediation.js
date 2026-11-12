import { detectGaps } from './detectGaps.js';

/**
 * F6 — lingkar perbaikan catatan.
 *
 * Alurnya: mahasiswa menjawab salah → melihat slide sumbernya → MENULIS SENDIRI
 * tambahan catatan untuk poin itu → sistem memeriksa ulang poin tersebut saja
 * → kalau sekarang tercatat, celahnya dinyatakan tertutup.
 *
 * Yang ditutup adalah CELAH DI CATATAN, bukan sekadar "sudah tahu jawabannya".
 * Itu pembeda dari umpan balik kuis biasa yang hanya memperlihatkan kunci
 * jawaban: di sini catatan mahasiswa benar-benar bertambah lengkap, dan
 * perubahannya terukur lewat Skor Kelengkapan (F7).
 */

/** Batas panjang satu tambahan catatan. Cukup untuk beberapa paragraf. */
export const MAX_REMEDIATION_CHARS = 2000;

export function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Ubah teks biasa dari kotak isian jadi HTML yang aman untuk editor:
 * baris kosong memisahkan paragraf, ganti baris tunggal jadi <br>.
 * Semua karakter HTML di-escape — teks mahasiswa tidak boleh bisa
 * menyisipkan tag ke dalam catatannya sendiri.
 */
export function textToParagraphs(text) {
  return String(text ?? '')
    .replace(/\r\n?/g, '\n')
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => `<p>${block.split('\n').map(escapeHtml).join('<br>')}</p>`)
    .join('');
}

/**
 * Tambahkan tulisan mahasiswa ke akhir catatannya.
 *
 * Sengaja ditaruh di akhir dan tanpa label tambahan dari sistem: catatan itu
 * milik mahasiswa, jadi sistem tidak menyisipkan judul atau penanda yang tidak
 * ia tulis. Ia bebas memindahkannya ke tempat yang lebih pas lewat editor.
 */
export function appendToNote(noteHtml, text) {
  const addition = textToParagraphs(text);
  if (!addition) return String(noteHtml ?? '');
  const base = String(noteHtml ?? '').trimEnd();
  return base ? `${base}\n${addition}` : addition;
}

/**
 * Nilai ulang SATU poin terhadap isi catatan terbaru.
 *
 * Memakai jalur yang sama persis dengan analisis penuh (F2) — penyaringan
 * lalu penilaian model — supaya standar "tercatat" tidak berbeda antara
 * analisis awal dan perbaikan. Kalau standarnya berbeda, kenaikan skor
 * sesudah perbaikan tidak bisa diklaim sebagai hasil yang sahih.
 */
export async function rejudgePoint(noteHtml, point) {
  const { verdicts } = await detectGaps(noteHtml, [point]);
  return verdicts.find((v) => v.slidePointId === point.id) ?? null;
}
