/**
 * Catatan mahasiswa disimpan sebagai HTML (dari editor). Untuk dibandingkan
 * dengan poin slide, isinya perlu diubah jadi teks biasa dan dipecah menjadi
 * potongan-potongan setingkat paragraf / butir daftar.
 *
 * Potongan inilah yang jadi "kandidat bukti": kalau sebuah poin slide memang
 * tercatat, jejaknya ada di salah satu potongan ini.
 */

const BLOCK_TAGS = 'p|div|li|h1|h2|h3|h4|h5|h6|tr|blockquote|pre|section|article';

function decodeEntities(text) {
  return text
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)));
}

/** Ubah HTML catatan jadi daftar potongan teks, satu per blok. */
export function htmlToChunks(html) {
  if (!html) return [];

  let text = String(html);

  // Buang isi yang tidak pernah terlihat mahasiswa.
  text = text.replace(/<(script|style)[\s\S]*?<\/\1>/gi, '');

  // Sel tabel digabung dengan pemisah supaya "istilah | arti" tidak menyatu.
  text = text.replace(/<\/t[dh]>\s*<t[dh][^>]*>/gi, ' — ');

  // Setiap akhir blok jadi batas potongan.
  text = text.replace(new RegExp(`</(?:${BLOCK_TAGS})>`, 'gi'), '\n');
  text = text.replace(/<br\s*\/?>/gi, '\n');

  // Sisa tag dibuang.
  text = text.replace(/<[^>]+>/g, '');
  text = decodeEntities(text);

  return text
    .split('\n')
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter((line) => line.length >= 3);
}

/** Seluruh isi catatan sebagai satu teks biasa. */
export function htmlToPlainText(html) {
  return htmlToChunks(html).join('\n');
}

/**
 * Catatan dianggap kosong kalau nyaris tidak ada isinya. Dipakai untuk menolak
 * analisis lebih awal, daripada melaporkan seluruh materi sebagai celah dan
 * membuat mahasiswa patah semangat sebelum sempat menulis apa pun.
 */
export function isEffectivelyEmpty(html, minChars = 40) {
  return htmlToPlainText(html).length < minChars;
}
