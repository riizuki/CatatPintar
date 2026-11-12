import { GoogleGenerativeAI } from '@google/generative-ai';
import { htmlToChunks } from './noteText.js';
import { screenPoints, MIN_SCREEN_SCORE } from './screening.js';
import { AiUnavailableError, classifyAiError } from '../ai/errors.js';

/**
 * F2 tahap 2 — PENILAIAN oleh model.
 *
 * Tiap poin slide diberi salah satu status terhadap catatan mahasiswa.
 * Model TIDAK memvonis sendirian: ia wajib menyertakan alasan, tingkat
 * keyakinan, dan kutipan catatan yang jadi dasar penilaian. Semuanya
 * ditampilkan ke mahasiswa, yang berhak membantah lewat status `dismissed`.
 *
 * Alasan rancangan ini: membedakan "catatan keliru" dari "catatan ringkas
 * padat" itu sulit. Kalau sistem menuduh mahasiswa salah padahal catatannya
 * cuma singkat, kepercayaan hilang dan aplikasinya ditinggalkan.
 */

const MODEL = 'gemini-3-flash-preview';

export const GAP_STATUSES = ['covered', 'partial', 'incorrect', 'missing', 'dismissed'];
/** Status yang berarti "ada yang perlu dikerjakan" — nanti jadi sumber soal di F3. */
export const OPEN_STATUSES = ['missing', 'partial', 'incorrect'];

const BATCH_SIZE = 8;

const INSTRUCTIONS = `
Kamu menilai catatan seorang mahasiswa terhadap poin-poin materi kuliah dari slide dosen.

Untuk SETIAP poin, tentukan satu status:
- "covered"   : inti poin ini benar-benar ada di catatan, walaupun kalimatnya berbeda atau lebih singkat.
- "partial"   : poin ini disinggung, tetapi bagian penting hilang (syarat, angka, batasan, salah satu dari beberapa hal yang disebut).
- "incorrect" : catatan membahas poin ini tetapi isinya BERTENTANGAN dengan materi.
- "missing"   : tidak ada jejak poin ini sama sekali di potongan catatan yang diberikan.

ATURAN PENTING:
1. Catatan yang RINGKAS bukan berarti salah. Kalau maknanya sepadan, statusnya "covered", bukan "partial".
2. Jangan menuntut kata yang persis sama. Parafrase, singkatan, dan bahasa sendiri tetap dihitung "covered".
3. Pakai "incorrect" HANYA kalau ada pertentangan yang jelas, bukan sekadar kurang lengkap.
4. Kalau ragu antara "partial" dan "covered", pilih "covered" dan turunkan confidence.
5. Nilai hanya berdasarkan potongan catatan yang diberikan untuk poin itu.

"confidence" adalah angka 0 sampai 1, seberapa yakin kamu pada status tersebut.
"reason" adalah satu kalimat pendek dalam Bahasa Indonesia yang menjelaskan alasanmu.
"evidence" adalah kutipan PERSIS dari catatan mahasiswa yang jadi dasar penilaian
(maksimal 200 karakter). Kosongkan ("") kalau statusnya "missing".

Balas HANYA dengan JSON array, satu objek per poin, memakai "id" yang sama persis:
[{"id": 12, "status": "partial", "confidence": 0.7, "reason": "...", "evidence": "..."}]
`.trim();

function getModel() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY belum diisi di file .env');
  }
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  return genAI.getGenerativeModel({
    model: MODEL,
    generationConfig: { temperature: 0.1, responseMimeType: 'application/json' },
  });
}

function parseJsonArray(raw) {
  const text = String(raw ?? '').trim();
  if (!text) return null;

  const candidates = [];
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced) candidates.push(fenced[1]);
  candidates.push(text);

  const first = text.indexOf('[');
  const last = text.lastIndexOf(']');
  if (first !== -1 && last > first) candidates.push(text.slice(first, last + 1));

  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(candidate.trim());
      if (Array.isArray(parsed)) return parsed;
      if (Array.isArray(parsed?.results)) return parsed.results;
    } catch {
      // coba kandidat berikutnya
    }
  }
  return null;
}

async function judgeBatch(model, batch) {
  const body = batch
    .map(({ point, candidates }) => {
      const excerpts = candidates.length
        ? candidates.map((c, i) => `  (${i + 1}) ${c.chunk}`).join('\n')
        : '  (tidak ada potongan catatan yang mirip)';
      return `POIN id=${point.id} (halaman ${point.page}, jenis ${point.pointType}):\n  ${point.text}\nPOTONGAN CATATAN MAHASISWA:\n${excerpts}`;
    })
    .join('\n\n---\n\n');

  const result = await model.generateContent(`${INSTRUCTIONS}\n\n${body}`);
  const parsed = parseJsonArray(result.response.text());
  if (!parsed) throw new Error('Jawaban AI bukan JSON array yang valid');
  return parsed;
}

function sanitizeVerdict(raw, point) {
  const status = GAP_STATUSES.includes(raw?.status) && raw.status !== 'dismissed' ? raw.status : null;
  if (!status) return null;

  let confidence = Number(raw?.confidence);
  if (!Number.isFinite(confidence)) confidence = null;
  else confidence = Math.min(1, Math.max(0, confidence));

  return {
    slidePointId: point.id,
    status,
    confidence,
    aiReason: String(raw?.reason ?? '').trim().slice(0, 500) || null,
    noteEvidence: status === 'missing' ? null : String(raw?.evidence ?? '').trim().slice(0, 500) || null,
  };
}

/**
 * Bandingkan satu catatan dengan seluruh poin materinya.
 *
 * @param noteHtml  isi catatan mahasiswa (HTML dari editor)
 * @param points    [{ id, text, page, pointType }]
 * @returns { verdicts, stats } — stats mencatat berapa poin yang disaring
 *          tanpa AI, berguna untuk dilaporkan di bab metodologi.
 */
export async function detectGaps(noteHtml, points) {
  const chunks = htmlToChunks(noteHtml);
  const screened = screenPoints(points, chunks);

  const verdicts = [];
  const needsJudging = [];

  for (const entry of screened) {
    if (entry.bestScore < MIN_SCREEN_SCORE) {
      // Tidak satu pun kata khas poin ini muncul di catatan.
      verdicts.push({
        slidePointId: entry.point.id,
        status: 'missing',
        confidence: null,
        aiReason: 'Tidak ditemukan kata kunci poin ini di catatan.',
        noteEvidence: null,
      });
    } else {
      needsJudging.push(entry);
    }
  }

  const model = needsJudging.length > 0 ? getModel() : null;

  for (let i = 0; i < needsJudging.length; i += BATCH_SIZE) {
    const batch = needsJudging.slice(i, i + BATCH_SIZE);

    // Kalau layanan AI gagal (kuota habis, server sibuk, jawaban rusak),
    // SELURUH analisis dibatalkan dan tidak ada yang disimpan.
    //
    // Versi awal menelan error ini dan menandai semua poin di kelompok itu
    // sebagai "kurang lengkap, keyakinan 30%". Akibatnya, saat kuota Gemini
    // habis, analisis tampak berhasil padahal isinya palsu — mahasiswa
    // dituduh punya celah yang tidak pernah dinilai.
    let parsed = null;
    let lastError = null;
    for (let attempt = 1; attempt <= 2 && !parsed; attempt += 1) {
      try {
        parsed = await judgeBatch(model, batch);
      } catch (error) {
        lastError = error;
        const aiError = classifyAiError(error);
        // Kuota/izin tidak akan pulih dalam hitungan detik; jangan buang
        // percobaan ulang untuk itu.
        if (aiError && (aiError.kind === 'quota' || aiError.kind === 'auth')) throw aiError;
      }
    }

    if (!parsed) {
      throw (
        classifyAiError(lastError) ??
        new AiUnavailableError('AI gagal menilai catatanmu. Coba jalankan analisis lagi.', {
          kind: 'unknown',
          cause: lastError,
        })
      );
    }

    const byId = new Map(parsed.map((item) => [Number(item?.id), item]));

    for (const { point, candidates } of batch) {
      const verdict = sanitizeVerdict(byId.get(point.id), point);

      if (verdict) {
        verdicts.push(verdict);
      } else {
        // Model menjawab untuk kelompok ini, tapi melewatkan SATU poin ini.
        // Jangan menebak "missing": menuduh mahasiswa tidak mencatat padahal
        // belum dinilai itu lebih merugikan daripada menandainya perlu ditinjau.
        verdicts.push({
          slidePointId: point.id,
          status: 'partial',
          confidence: 0.3,
          aiReason: 'Belum bisa dinilai otomatis — silakan periksa sendiri.',
          noteEvidence: candidates[0]?.chunk?.slice(0, 500) ?? null,
        });
      }
    }
  }

  return {
    verdicts,
    stats: {
      totalPoints: points.length,
      screenedOutAsMissing: points.length - needsJudging.length,
      judgedByAi: needsJudging.length,
      noteChunks: chunks.length,
    },
  };
}

/** Ringkasan jumlah per status + Skor Kelengkapan Catatan (F7). */
export function summarize(gaps) {
  const counts = { covered: 0, partial: 0, incorrect: 0, missing: 0, dismissed: 0 };
  for (const gap of gaps) {
    if (counts[gap.status] !== undefined) counts[gap.status] += 1;
  }

  const total = gaps.length;
  // Celah yang dibantah mahasiswa dihitung sebagai tercatat: menurut pemiliknya
  // catatan itu sudah benar, dan penilaian merekalah yang menentukan.
  const score = total === 0 ? 0 : (counts.covered + counts.dismissed) / total;

  return { ...counts, total, score: Math.round(score * 1000) / 10 };
}
