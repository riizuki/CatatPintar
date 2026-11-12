import { GoogleGenerativeAI } from '@google/generative-ai';
import { AiUnavailableError, classifyAiError } from '../ai/errors.js';

/**
 * F3 — Kuis Celah Catatan.
 *
 * Yang membedakan kuis ini dari kuis biasa (dan dari penelitian sebelumnya):
 * soal TIDAK dibangkitkan dari seluruh materi, melainkan HANYA dari selisih
 * antara slide dosen dan catatan mahasiswa — poin yang belum dicatat, kurang
 * lengkap, atau keliru.
 *
 * Dua keputusan rancangan:
 *
 * 1. Pengecoh (distractor) diambil dari POIN SLIDE LAIN yang berdekatan,
 *    bukan dikarang bebas oleh model. Pengecohnya jadi masuk akal secara
 *    materi, sehingga soal benar-benar menguji pemahaman — bukan menguji
 *    kemampuan menebak jawaban yang "terdengar paling akademis".
 *
 * 2. Untuk celah berstatus `incorrect`, KEKELIRUAN MAHASISWA SENDIRI dipakai
 *    sebagai salah satu pengecoh. Kalau ia masih memilihnya, berarti
 *    miskonsepsinya belum terkoreksi — sinyal yang jauh lebih bermakna
 *    daripada sekadar "jawaban salah".
 */

const MODEL = 'gemini-3-flash-preview';
const LETTERS = ['A', 'B', 'C', 'D'];

/** Urutan prioritas: kekeliruan dulu, lalu yang kurang lengkap, lalu yang terlewat. */
const PRIORITY = { incorrect: 0, partial: 1, missing: 2 };

export const DEFAULT_QUESTIONS = 10;
export const MAX_QUESTIONS = 20;

function getModel() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY belum diisi di file .env');
  }
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  return genAI.getGenerativeModel({
    model: MODEL,
    generationConfig: { temperature: 0.3, responseMimeType: 'application/json' },
  });
}

/**
 * Pilih celah mana yang dijadikan soal: urut prioritas, lalu urut halaman,
 * sehingga kuis mengikuti alur materi.
 */
export function selectGaps(openGaps, limit) {
  return [...openGaps]
    .sort(
      (a, b) =>
        (PRIORITY[a.status] ?? 9) - (PRIORITY[b.status] ?? 9) ||
        a.slidePoint.page - b.slidePoint.page ||
        a.slidePoint.orderIndex - b.slidePoint.orderIndex,
    )
    .slice(0, limit)
    .sort(
      (a, b) =>
        a.slidePoint.page - b.slidePoint.page || a.slidePoint.orderIndex - b.slidePoint.orderIndex,
    );
}

/** Poin lain dari halaman yang sama atau bertetangga — bahan pengecoh. */
function neighborPoints(target, allPoints, max = 5) {
  return allPoints
    .filter((p) => p.id !== target.id)
    .map((p) => ({ p, distance: Math.abs(p.page - target.page) }))
    .filter(({ distance }) => distance <= 2)
    .sort((a, b) => a.distance - b.distance || a.p.orderIndex - b.p.orderIndex)
    .slice(0, max)
    .map(({ p }) => p);
}

function buildPrompt(items, language) {
  const isEn = language === 'en';
  const lang = isEn ? 'English' : 'Bahasa Indonesia';

  const body = items
    .map(({ gap, neighbors }) => {
      const lines = [
        `CELAH id=${gap.id} (status: ${gap.status}, halaman ${gap.slidePoint.page})`,
        `  Poin materi yang harus diuji : ${gap.slidePoint.text}`,
      ];
      if (gap.slidePoint.sourceQuote) {
        lines.push(`  Kutipan asli slide           : "${gap.slidePoint.sourceQuote}"`);
      }
      if (gap.status === 'incorrect' && gap.noteEvidence) {
        lines.push(`  Catatan mahasiswa yang KELIRU: "${gap.noteEvidence}"`);
      } else if (gap.status === 'partial' && gap.noteEvidence) {
        lines.push(`  Catatan mahasiswa (kurang)   : "${gap.noteEvidence}"`);
      }
      if (neighbors.length) {
        lines.push('  Poin lain di sekitarnya (bahan pengecoh):');
        neighbors.forEach((n) => lines.push(`    - ${n.text}`));
      }
      return lines.join('\n');
    })
    .join('\n\n');

  return `
You write multiple-choice questions to close the gaps in a university student's lecture notes.
Write every question, option and explanation in ${lang}.

For EACH gap below, write exactly ONE question that tests the "Poin materi yang harus diuji".

RULES:
1. The question must be answerable using ONLY that point. Do not test anything outside the slide.
2. Exactly 4 options. Exactly one is correct. All four must be similar in length and style.
3. Distractors must be PLAUSIBLE. Build them from the "Poin lain di sekitarnya" by altering or
   swapping key details (wrong condition, wrong term, swapped order, a neighbouring concept).
   Never write joke options, "all of the above" or "none of the above".
4. If the gap status is "incorrect", ONE distractor MUST state the student's mistaken belief from
   "Catatan mahasiswa yang KELIRU" (rephrased as an option). Set "misconception_option" to the
   letter of that option. For other statuses set it to null.
5. If the gap status is "partial", target the part the student left out.
6. "explanation" is 1-2 sentences explaining why the correct answer is right, referring to the slide.
7. Put the correct answer in option A. (The system shuffles the options afterwards.)

Return ONLY a JSON array, one object per gap, with the same "gap_id":
[{"gap_id": 12, "question": "...", "options": {"A": "...", "B": "...", "C": "...", "D": "..."},
  "explanation": "...", "misconception_option": "C"}]

GAPS:
${body}
`.trim();
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
      if (Array.isArray(parsed?.questions)) return parsed.questions;
    } catch {
      // coba kandidat berikutnya
    }
  }
  return null;
}

/**
 * Model diminta menaruh jawaban benar di A, lalu opsi DIACAK di server.
 * LLM cenderung menaruh jawaban benar di posisi awal; kalau dibiarkan,
 * mahasiswa bisa menebak polanya dan kuisnya kehilangan daya ukur.
 *
 * Pengacakannya deterministik per celah (bukan Math.random), supaya hasilnya
 * bisa direproduksi saat pengujian.
 *
 * Catatan: perkalian 32-bit biasa (`state * 1103515245`) di JavaScript
 * melewati batas presisi 2^53, bit-bit rendahnya jadi nol, dan hasil
 * "acak"-nya konstan untuk semua seed — versi awal fungsi ini menaruh SEMUA
 * jawaban benar di posisi yang sama. Karena itu dipakai mulberry32 dengan
 * Math.imul, yang benar-benar beroperasi dalam 32 bit.
 */
function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffleOptions(options, seed) {
  const rand = mulberry32(seed);
  const order = options.map((_, index) => index);
  for (let i = order.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order.map((index) => options[index]);
}

/**
 * Posisi jawaban benar untuk satu kuis: dibagi RATA ke A/B/C/D lalu urutannya
 * diacak. Acak murni per soal tetap bisa menghasilkan pola seperti
 * "A A A A" dalam satu kuis pendek, dan pola itu bisa ditebak mahasiswa.
 */
export function balancedAnswerPositions(count, seed) {
  const slots = Array.from({ length: count }, (_, i) => i % LETTERS.length);
  return shuffleOptions(slots, seed);
}

function sanitizeQuestion(raw, gap, targetIndex) {
  const question = String(raw?.question ?? '').trim();
  const opts = raw?.options ?? {};
  const original = LETTERS.map((letter) => String(opts[letter] ?? '').trim());

  if (question.length < 8) return null;
  if (original.some((o) => o.length === 0)) return null;
  if (new Set(original.map((o) => o.toLowerCase())).size !== 4) return null;

  // Tandai mana yang benar (A) dan mana yang miskonsepsi, sebelum diacak.
  const tagged = original.map((text, index) => ({
    text,
    correct: index === 0,
    misconception: LETTERS[index] === raw?.misconception_option && index !== 0,
  }));

  // Pengecoh diacak di antara mereka sendiri, lalu jawaban benar diselipkan
  // tepat di posisi yang sudah dijatah untuk soal ini.
  const distractors = shuffleOptions(tagged.slice(1), gap.id);
  const shuffled = [...distractors];
  shuffled.splice(targetIndex, 0, tagged[0]);
  const correctIndex = shuffled.findIndex((o) => o.correct);
  const misconceptionIndex = shuffled.findIndex((o) => o.misconception);

  return {
    gapId: gap.id,
    slidePointId: gap.slidePoint.id,
    slidePage: gap.slidePoint.page,
    question: question.slice(0, 2000),
    optionA: shuffled[0].text.slice(0, 190),
    optionB: shuffled[1].text.slice(0, 190),
    optionC: shuffled[2].text.slice(0, 190),
    optionD: shuffled[3].text.slice(0, 190),
    correctAnswer: LETTERS[correctIndex],
    explanation: String(raw?.explanation ?? '').trim().slice(0, 1000) || null,
    // Tidak disimpan di database; dipakai untuk pelaporan/pengujian.
    misconceptionLetter: misconceptionIndex >= 0 ? LETTERS[misconceptionIndex] : null,
  };
}

/**
 * Bangkitkan soal dari celah terbuka.
 *
 * @param openGaps   celah berstatus missing/partial/incorrect, beserta slidePoint-nya
 * @param allPoints  seluruh poin materi (bahan pengecoh)
 * @returns { questions, skipped } — `skipped` = celah yang soalnya gagal dibuat
 */
export async function generateGapQuestions(openGaps, allPoints, { language = 'id', limit = DEFAULT_QUESTIONS } = {}) {
  const selected = selectGaps(openGaps, Math.min(Math.max(limit, 1), MAX_QUESTIONS));
  if (selected.length === 0) return { questions: [], skipped: [] };

  const items = selected.map((gap) => ({ gap, neighbors: neighborPoints(gap.slidePoint, allPoints) }));
  const model = getModel();

  let parsed = null;
  let lastError = null;
  for (let attempt = 1; attempt <= 2 && !parsed; attempt += 1) {
    try {
      const result = await model.generateContent(buildPrompt(items, language));
      parsed = parseJsonArray(result.response.text());
    } catch (error) {
      lastError = error;
      const aiError = classifyAiError(error);
      if (aiError && (aiError.kind === 'quota' || aiError.kind === 'auth')) throw aiError;
    }
  }

  if (!parsed) {
    throw (
      classifyAiError(lastError) ??
      new AiUnavailableError('AI gagal membuat soal dari celah catatan. Coba lagi.', {
        kind: 'unknown',
        cause: lastError,
      })
    );
  }

  const byGap = new Map(parsed.map((q) => [Number(q?.gap_id), q]));
  const questions = [];
  const skipped = [];
  const seed = items.reduce((sum, { gap }) => sum + gap.id, 0);
  const targets = balancedAnswerPositions(items.length, seed);

  for (const [index, { gap }] of items.entries()) {
    const q = sanitizeQuestion(byGap.get(gap.id), gap, targets[index]);
    if (q) questions.push(q);
    else skipped.push(gap.id);
  }

  return { questions, skipped };
}
