import { GoogleGenerativeAI } from '@google/generative-ai';
import { extractPages } from './extractPages.js';

/**
 * Mode "Ringkasan Dosen" — AI merangkum slide menjadi catatan jadi.
 *
 * Dulu ini adalah jalur utama saat mengunggah materi. Sekarang statusnya
 * diturunkan menjadi mode opsional, dan catatan hasilnya ditandai
 * `isAiGenerated = true` sehingga DIKECUALIKAN dari analisis celah:
 * catatan yang lahir dari slide tidak mungkin punya celah terhadap slide itu,
 * jadi menilainya hanya akan membuat sistem menguji karangannya sendiri.
 */

const MODEL = 'gemini-3-flash-preview';

const HL = { yellow: '#ffe14d', green: '#96edb6', blue: '#a9def5', pink: '#ff9fcb' };

function buildNotePrompt({ filename, language, extractedText }) {
  const isEn = language === 'en';
  const lang = isEn ? 'English' : 'Bahasa Indonesia';
  const summaryTitle = isEn ? 'Summary' : 'Ringkasan';
  const termsTitle = isEn ? 'Key Terms' : 'Istilah Penting';
  const termCol = isEn ? 'Term' : 'Istilah';
  const meaningCol = isEn ? 'Meaning' : 'Arti';
  const source = extractedText
    ? `Below is the raw extracted text of the material:\n---\n${extractedText}\n---`
    : 'The material is attached as a document.';

  return `
You are an expert study assistant for high-school and university students.
A student uploaded a learning material file named "${filename}". ${source}

Turn it into a clean, well-structured study note in ${lang}. Be complete: do not drop important concepts, definitions, formulas, or examples.

OUTPUT FORMAT (strict, it is loaded into a rich text editor):
1. Return ONLY HTML. No markdown, no code fences, no <html>, <head>, or <body>.
2. Allowed tags only: h1, h2, h3, p, ul, ol, li, strong, em, u, blockquote, pre, code, table, thead, tbody, tr, th, td, hr, span, br.
3. Structure:
   - Exactly one <h1> with the material's real topic (not the file name).
   - <h2> for main sections, <h3> for subsections. Never use h4, h5, or h6.
   - Short paragraphs (2-4 sentences). Use <ul>/<ol> for lists and steps.
   - Code or commands in <pre><code>...</code></pre> with HTML-escaped characters.
   - Use <blockquote> for one important quote, principle, or rule worth remembering (optional).
4. HIGHLIGHTER ("stabilo") — mark only short phrases of 1-6 words, at most 2 per paragraph or list item, never whole sentences, never nested, never inside headings. Use EXACTLY these spans:
   - Key term or concept: <span style="background-color: ${HL.yellow}">...</span>
   - Definition, formula, or correct answer: <span style="background-color: ${HL.green}">...</span>
   - Example: <span style="background-color: ${HL.blue}">...</span>
   - Must remember, warning, or common mistake: <span style="background-color: ${HL.pink}">...</span>
5. End with:
   - <h2>${termsTitle}</h2> followed by a <table> with header row <th>${termCol}</th><th>${meaningCol}</th> (4-10 rows), if the material has terminology.
   - <h2>${summaryTitle}</h2> followed by a <ul> of 3-6 bullets.
6. No inline styles other than the highlighter spans. No class attributes. No emojis.
`;
}

/** Rapikan HTML dari AI supaya cocok dengan editor (sanitasi ringan berbasis regex di server). */
function cleanNoteHtml(raw = '') {
  let html = String(raw).trim();
  html = html.replace(/^```(?:html)?\s*/i, '').replace(/```\s*$/i, '').trim();
  html = html.replace(/<(script|style|head|iframe|object|embed)[\s\S]*?<\/\1>/gi, '');
  html = html.replace(/<\/?(html|body|!doctype)[^>]*>/gi, '');
  html = html.replace(/<h[4-6](\s[^>]*)?>/gi, '<h3>').replace(/<\/h[4-6]>/gi, '</h3>');
  html = html.replace(/<mark[^>]*>/gi, `<span style="background-color: ${HL.yellow}">`).replace(/<\/mark>/gi, '</span>');
  html = html.replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '');
  html = html.replace(/\sclass\s*=\s*("[^"]*"|'[^']*')/gi, '');

  const palette = Object.values(HL);
  html = html.replace(/<(\w+)([^>]*?)\sstyle\s*=\s*"([^"]*)"([^>]*)>/gi, (m, tag, before, style, after) => {
    if (tag.toLowerCase() !== 'span') return `<${tag}${before}${after}>`;
    const bg = (style.match(/background(?:-color)?\s*:\s*([^;]+)/i) || [])[1];
    if (!bg) return `<span${before}${after}>`;
    const val = bg.trim().toLowerCase();
    const color = palette.includes(val) ? val : HL.yellow;
    return `<span${before} style="background-color: ${color}"${after}>`;
  });
  html = html.replace(/<span>([\s\S]*?)<\/span>/gi, '$1');
  return html.trim();
}

/** Hasilkan HTML catatan ringkasan dari berkas materi. */
export async function generateSummaryHtml({ buffer, filename, extension, language }) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY belum diisi di file .env');
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: MODEL });
  const ext = String(extension || '').toLowerCase().replace(/^\./, '');

  let result;
  if (ext === 'pdf') {
    const pdfPart = { inlineData: { data: buffer.toString('base64'), mimeType: 'application/pdf' } };
    result = await model.generateContent([pdfPart, buildNotePrompt({ filename, language })]);
  } else {
    const { pages } = await extractPages(buffer, ext);
    const extractedText = pages.map((p) => `--- Slide ${p.page} ---\n${p.text}`).join('\n\n');

    if (!extractedText.trim()) {
      throw new Error('Tidak ada teks yang bisa dibaca dari berkas ini.');
    }

    result = await model.generateContent(buildNotePrompt({ filename, language, extractedText }));
  }

  return cleanNoteHtml(result.response.text());
}
