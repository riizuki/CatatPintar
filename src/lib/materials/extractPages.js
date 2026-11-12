import AdmZip from 'adm-zip';

/**
 * F1 — tahap 1: ambil teks materi PER HALAMAN, bukan sebagai satu gumpalan.
 *
 * Nomor halaman inilah yang nanti dipakai untuk mengarahkan mahasiswa kembali
 * ke slide yang tepat (F5), jadi di sini nomor halaman tidak boleh hilang.
 */

/** Di bawah ambang ini, satu halaman dianggap tidak punya lapisan teks yang berguna. */
const MIN_CHARS_PER_PAGE = 40;

function normalize(text) {
  return String(text ?? '')
    .replace(/\u0000/g, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/** Teks per halaman dari PDF, memakai lapisan teks berkas (nomor halaman pasti). */
async function extractPdfPages(buffer) {
  // unpdf adalah paket ESM-only, jadi diimpor dinamis.
  const { extractText, getDocumentProxy } = await import('unpdf');

  const pdf = await getDocumentProxy(new Uint8Array(buffer));
  const { totalPages, text } = await extractText(pdf, { mergePages: false });

  const pages = (Array.isArray(text) ? text : [text]).map((value, index) => ({
    page: index + 1,
    text: normalize(value),
  }));

  return { pages, totalPages: totalPages ?? pages.length };
}

/** Teks per slide dari PPTX. Satu slide = satu "halaman". */
function extractPptxPages(buffer) {
  const zip = new AdmZip(buffer);

  const slides = zip
    .getEntries()
    .filter((entry) => /^ppt\/slides\/slide\d+\.xml$/.test(entry.entryName))
    .sort((a, b) => {
      const numA = parseInt(a.entryName.match(/\d+/)[0], 10);
      const numB = parseInt(b.entryName.match(/\d+/)[0], 10);
      return numA - numB;
    });

  const pages = slides.map((entry, index) => {
    const xml = entry.getData().toString('utf8');
    const matches = xml.match(/<a:t>([\s\S]*?)<\/a:t>/g) || [];

    const text = matches
      .map((match) => match.replace(/<\/?a:t>/g, ''))
      .map((value) =>
        value
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&apos;/g, "'"),
      )
      .join('\n');

    return { page: index + 1, text: normalize(text) };
  });

  return { pages, totalPages: pages.length };
}

/**
 * Ambil teks per halaman dari berkas materi.
 *
 * Mengembalikan:
 *   pages       — [{ page, text }]
 *   totalPages  — jumlah halaman/slide
 *   hasTextLayer — false kalau berkasnya hasil pindai / isinya gambar semua.
 *                  Pemanggil memakai ini untuk beralih ke jalur Gemini (vision).
 */
export async function extractPages(buffer, extension) {
  const ext = String(extension || '').toLowerCase().replace(/^\./, '');

  let result;
  if (ext === 'pdf') {
    result = await extractPdfPages(buffer);
  } else if (ext === 'pptx' || ext === 'ppt') {
    result = extractPptxPages(buffer);
  } else {
    throw new Error(`Unsupported material type: ${ext}`);
  }

  const withText = result.pages.filter((p) => p.text.length >= MIN_CHARS_PER_PAGE);
  const hasTextLayer = result.pages.length > 0 && withText.length >= result.pages.length * 0.3;

  return { ...result, hasTextLayer };
}

/**
 * Potong halaman jadi kelompok kecil supaya satu permintaan ke Gemini tidak
 * melebihi batas token (S5). Halaman kosong dibuang lebih dulu.
 */
export function chunkPages(pages, { maxPages = 6, maxChars = 12000 } = {}) {
  const chunks = [];
  let current = [];
  let currentChars = 0;

  for (const page of pages) {
    if (!page.text) continue;

    const size = page.text.length;
    const wouldOverflow = current.length >= maxPages || (current.length > 0 && currentChars + size > maxChars);

    if (wouldOverflow) {
      chunks.push(current);
      current = [];
      currentChars = 0;
    }

    current.push(page);
    currentChars += size;
  }

  if (current.length > 0) chunks.push(current);
  return chunks;
}
