import { GoogleGenerativeAI } from '@google/generative-ai';
import { chunkPages } from './extractPages.js';
import { classifyAiError } from '../ai/errors.js';

/**
 * F1 — tahap 2: pecah tiap halaman slide menjadi POIN, yaitu unit sekecil
 * satu klaim/konsep. Poin inilah yang nanti dibandingkan dengan catatan
 * mahasiswa untuk menemukan celah (F2).
 *
 * Suhu sengaja dibuat rendah dan jumlah poin per halaman dibatasi, supaya
 * ekstraksi ulang materi yang sama tidak menghasilkan jumlah poin yang jauh
 * berbeda — kalau tidak, Skor Kelengkapan Catatan (F7) jadi tidak stabil.
 */

const MODEL = 'gemini-3-flash-preview';

export const POINT_TYPES = ['definisi', 'rumus', 'proses', 'contoh', 'klasifikasi', 'syarat'];

const GENERATION_CONFIG = {
  temperature: 0.1,
  responseMimeType: 'application/json',
};

const INSTRUCTIONS = `
Kamu memecah materi kuliah menjadi "poin" untuk keperluan penilaian catatan mahasiswa.

Satu poin = SATU klaim yang berdiri sendiri dan bisa dinilai benar/salah.
- Pecah kalimat majemuk menjadi beberapa poin.
- Jangan membuat poin dari judul slide, nomor halaman, nama mata kuliah, nama dosen, atau teks hiasan.
- Jangan menambahkan pengetahuan dari luar materi. Hanya yang tertulis di halaman itu.
- Tulis poin dalam bahasa yang sama dengan materi aslinya.
- Maksimal 8 poin per halaman. Kalau halaman hanya berisi judul atau gambar, kembalikan nol poin untuk halaman itu.

"type" harus salah satu dari: definisi, rumus, proses, contoh, klasifikasi, syarat.
- definisi    : arti sebuah istilah atau konsep
- rumus       : persamaan, formula, atau perhitungan
- proses      : langkah, urutan, atau alur kerja
- contoh      : ilustrasi atau kasus
- klasifikasi : jenis, kategori, atau pembagian
- syarat      : prasyarat, batasan, asumsi, atau pengecualian

"quote" adalah potongan teks ASLI dari halaman tersebut yang mendasari poin itu
(maksimal 200 karakter, disalin apa adanya). Ini dipakai sebagai bukti yang
ditampilkan ke mahasiswa, jadi jangan diparafrase.

Balas HANYA dengan JSON array, tanpa penjelasan apa pun:
[{"page": 3, "type": "definisi", "text": "...", "quote": "..."}]
`.trim();

function getModel() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY belum diisi di file .env');
  }
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  return genAI.getGenerativeModel({ model: MODEL, generationConfig: GENERATION_CONFIG });
}

/**
 * Gemini kadang tetap membungkus jawaban dengan ```json walau sudah diminta
 * JSON murni. Kode lama langsung melempar error kalau pembungkus itu tidak ada;
 * di sini semua bentuk yang masuk akal dicoba dulu (S9).
 */
function parseJsonArray(raw) {
  const text = String(raw ?? '').trim();
  if (!text) return null;

  const candidates = [];
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced) candidates.push(fenced[1]);
  candidates.push(text);

  const firstBracket = text.indexOf('[');
  const lastBracket = text.lastIndexOf(']');
  if (firstBracket !== -1 && lastBracket > firstBracket) {
    candidates.push(text.slice(firstBracket, lastBracket + 1));
  }

  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(candidate.trim());
      if (Array.isArray(parsed)) return parsed;
      if (Array.isArray(parsed?.points)) return parsed.points;
    } catch {
      // coba kandidat berikutnya
    }
  }

  return null;
}

async function generateJsonArray(parts, { attempts = 2 } = {}) {
  const model = getModel();
  let lastError;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const result = await model.generateContent(parts);
      const parsed = parseJsonArray(result.response.text());
      if (parsed) return parsed;
      lastError = new Error('Jawaban AI bukan JSON array yang valid');
    } catch (error) {
      lastError = error;
      const aiError = classifyAiError(error);
      if (aiError && (aiError.kind === 'quota' || aiError.kind === 'auth')) throw aiError;
    }
  }

  throw classifyAiError(lastError) ?? lastError ?? new Error('Gagal memanggil AI');
}

/** Bersihkan dan validasi poin mentah dari AI sebelum masuk database. */
function sanitizePoints(rawPoints, allowedPages) {
  const allowed = allowedPages ? new Set(allowedPages) : null;
  const seen = new Set();
  const clean = [];

  for (const raw of rawPoints) {
    const page = Number.parseInt(raw?.page, 10);
    const text = String(raw?.text ?? '').trim();

    if (!Number.isInteger(page) || page < 1) continue;
    if (allowed && !allowed.has(page)) continue;
    if (text.length < 8) continue;

    const type = POINT_TYPES.includes(raw?.type) ? raw.type : 'definisi';
    const quote = String(raw?.quote ?? '').trim().slice(0, 200) || null;

    // Buang poin kembar persis pada halaman yang sama.
    const key = `${page}::${text.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);

    clean.push({ page, pointType: type, text: text.slice(0, 1000), sourceQuote: quote });
  }

  return clean;
}

/** Urutkan per halaman lalu beri nomor urut dalam halaman tersebut. */
function withOrderIndex(points) {
  const counters = new Map();

  return [...points]
    .sort((a, b) => a.page - b.page)
    .map((point) => {
      const next = (counters.get(point.page) ?? 0) + 1;
      counters.set(point.page, next);
      return { ...point, orderIndex: next };
    });
}

/** Jalur utama: materi punya lapisan teks, jadi nomor halaman sudah pasti. */
export async function extractPointsFromPages(pages) {
  const chunks = chunkPages(pages);
  const collected = [];

  for (const chunk of chunks) {
    const body = chunk
      .map((page) => `--- HALAMAN ${page.page} ---\n${page.text}`)
      .join('\n\n');

    const prompt = `${INSTRUCTIONS}\n\nGunakan nomor halaman persis seperti yang tertulis pada penanda "--- HALAMAN n ---".\n\n${body}`;

    const raw = await generateJsonArray(prompt);
    collected.push(...sanitizePoints(raw, chunk.map((p) => p.page)));
  }

  return withOrderIndex(collected);
}

/**
 * Jalur cadangan untuk slide hasil pindai / isinya gambar semua (S3).
 * Berkas PDF dikirim utuh ke Gemini; nomor halaman jadi hasil inferensi model,
 * sehingga akurasinya lebih rendah daripada jalur utama. Material.extractMode
 * mencatat jalur mana yang dipakai, supaya bisa dilaporkan di Bab Hasil.
 */
export async function extractPointsFromPdfFile(buffer, { totalPages } = {}) {
  const pdfPart = {
    inlineData: { data: buffer.toString('base64'), mimeType: 'application/pdf' },
  };

  const prompt = `${INSTRUCTIONS}\n\nBerkas PDF materi terlampir${
    totalPages ? ` dan terdiri dari ${totalPages} halaman` : ''
  }. Untuk setiap poin, isi "page" dengan nomor halaman PDF tempat poin itu berada (halaman pertama = 1).`;

  const raw = await generateJsonArray([pdfPart, prompt]);
  return withOrderIndex(sanitizePoints(raw, null));
}
