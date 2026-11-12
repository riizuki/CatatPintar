/**
 * F2 tahap 1 — PENYARINGAN (tanpa AI).
 *
 * Untuk tiap poin slide, cari potongan catatan yang paling mungkin membahas
 * poin itu. Tahap ini murni leksikal: cepat, gratis, dan hasilnya sama setiap
 * kali dijalankan.
 *
 * Gunanya dua: memangkas jumlah panggilan ke Gemini (biaya & kuota), dan
 * memberi model konteks yang sempit sehingga penilaiannya lebih akurat
 * daripada melempar seluruh catatan sekaligus.
 */

/** Kata yang terlalu umum untuk membedakan satu poin dari poin lain. */
const STOPWORDS = new Set([
  // Indonesia
  'yang', 'untuk', 'dengan', 'pada', 'dari', 'dalam', 'adalah', 'akan', 'atau', 'dan',
  'ini', 'itu', 'tidak', 'bisa', 'dapat', 'sebuah', 'suatu', 'juga', 'agar', 'jika',
  'karena', 'oleh', 'ada', 'saat', 'telah', 'sudah', 'harus', 'lebih', 'antara', 'serta',
  'setiap', 'yaitu', 'yakni', 'maka', 'hanya', 'secara', 'terhadap', 'sehingga', 'kita',
  // Inggris
  'the', 'and', 'for', 'with', 'that', 'this', 'from', 'are', 'was', 'were', 'has',
  'have', 'had', 'not', 'but', 'can', 'will', 'into', 'than', 'then', 'its', 'such',
  'which', 'when', 'where', 'each', 'they', 'their', 'been', 'because', 'also', 'any',
]);

/**
 * Normalisasi ringan untuk bahasa Indonesia: buang imbuhan yang paling sering
 * membuat kata yang sama terlihat berbeda ("normalisasi" vs "menormalisasi",
 * "bergantung" vs "ketergantungan"). Ini bukan stemmer sungguhan — cukup untuk
 * penyaringan, dan keputusan akhirnya tetap di tangan model.
 */
function normalizeToken(token) {
  let t = token;
  t = t.replace(/^(meng|meny|mem|men|peng|peny|pem|pen|ber|ter|per|di|ke|se)/, '');
  t = t.replace(/(kannya|annya|nya|kan|an|i)$/, '');
  return t.length >= 3 ? t : token;
}

export function tokenize(text) {
  return String(text ?? '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter((token) => token.length >= 3 && !STOPWORDS.has(token))
    .map(normalizeToken);
}

/**
 * Bobot IDF: kata yang muncul di hampir semua potongan catatan (mis. nama mata
 * kuliah) nyaris tidak berguna untuk mencocokkan, jadi bobotnya kecil.
 */
function buildIdf(documents) {
  const docFreq = new Map();

  for (const tokens of documents) {
    for (const token of new Set(tokens)) {
      docFreq.set(token, (docFreq.get(token) ?? 0) + 1);
    }
  }

  const total = Math.max(documents.length, 1);
  return (token) => Math.log((total + 1) / ((docFreq.get(token) ?? 0) + 1)) + 1;
}

/**
 * Skor 0..1: seberapa besar bagian dari isi poin yang kata-katanya muncul di
 * potongan catatan, ditimbang IDF.
 */
function score(pointTokens, chunkTokenSet, idf) {
  if (pointTokens.length === 0) return 0;

  let matched = 0;
  let total = 0;

  for (const token of new Set(pointTokens)) {
    const weight = idf(token);
    total += weight;
    if (chunkTokenSet.has(token)) matched += weight;
  }

  return total === 0 ? 0 : matched / total;
}

/**
 * Untuk tiap poin, kembalikan potongan catatan terbaik beserta skornya.
 *
 * @param points [{ id, text, ... }]
 * @param chunks string[]  potongan catatan mahasiswa
 * @param topK   berapa potongan teratas yang disertakan sebagai konteks
 */
export function screenPoints(points, chunks, { topK = 3 } = {}) {
  const chunkTokens = chunks.map((chunk) => tokenize(chunk));
  const idf = buildIdf([...chunkTokens, ...points.map((p) => tokenize(p.text))]);
  const chunkSets = chunkTokens.map((tokens) => new Set(tokens));

  return points.map((point) => {
    const pointTokens = tokenize(point.text);

    const ranked = chunks
      .map((chunk, index) => ({ chunk, score: score(pointTokens, chunkSets[index], idf) }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);

    return {
      point,
      candidates: ranked,
      bestScore: ranked[0]?.score ?? 0,
    };
  });
}

/**
 * Di bawah ambang ini, tidak ada satu pun kata khas poin yang muncul di
 * catatan, jadi poin itu langsung dianggap `missing` tanpa perlu bertanya ke
 * AI. Ambangnya sengaja rendah: lebih baik bertanya ke model daripada salah
 * menuduh mahasiswa tidak mencatat.
 */
export const MIN_SCREEN_SCORE = 0.12;
