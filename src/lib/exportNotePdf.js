/**
 * Ekspor catatan ke PDF lewat dialog cetak browser ("Save as PDF").
 * Membangun dokumen HTML khusus cetak di iframe tersembunyi, lalu memanggil print().
 */

const esc = (s = "") =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

/** String aman untuk CSS content: "..." */
const cssStr = (s = "") => String(s).replace(/[\\"]/g, "\\$&").replace(/[\n\r]/g, " ").replace(/</g, "\\3C ");

const stripExt = (t = "") => t.replace(/\.(pdf|pptx?|docx?)$/i, "").trim();

/** Bersihkan HTML catatan untuk dicetak: buang skrip, ukuran/jenis huruf, dan warna teks inline. */
function prepareContent(html = "") {
  const doc = new DOMParser().parseFromString(`<body>${html}</body>`, "text/html");
  doc.querySelectorAll("script,style,iframe,object,embed").forEach((el) => el.remove());
  doc.querySelectorAll("[style]").forEach((el) => {
    const keep = el
      .getAttribute("style")
      .split(";")
      .map((s) => s.trim())
      .filter((s) => /^(background-color|text-align)\s*:/i.test(s));
    keep.length ? el.setAttribute("style", keep.join("; ")) : el.removeAttribute("style");
  });
  // Penanda stabilo → kelas cetak supaya warnanya konsisten
  doc.querySelectorAll('[style*="background-color"]').forEach((el) => el.classList.add("mark"));
  doc.querySelectorAll("[class]").forEach((el) => {
    el.className = el.className.replace(/\bql-size-\w+\b/g, "").trim();
  });
  const text = (doc.body.textContent || "").replace(/\s+/g, " ").trim();
  return { html: doc.body.innerHTML, words: text ? text.split(" ").length : 0 };
}

const CSS = `
@page {
  size: A4;
  margin: 22mm 20mm 20mm 22mm;
  @top-left { content: "CatatPintar"; font: 600 8pt "Bricolage Grotesque", system-ui, sans-serif; color: #1e2a78; }
  @bottom-right { content: counter(page) " / " counter(pages); font: 600 8pt "Bricolage Grotesque", system-ui, sans-serif; color: #8a93b8; }
}
@page :first { @top-left { content: none; } @top-right { content: none; } }

*, *::before, *::after { box-sizing: border-box; }
html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
body {
  margin: 0;
  font-family: "Source Serif 4", Georgia, "Times New Roman", serif;
  font-size: 11pt;
  line-height: 1.65;
  color: #222a4a;
  font-variant-ligatures: common-ligatures;
  hyphens: auto;
}

/* ---------- Kepala dokumen ---------- */
.brand {
  display: flex; align-items: center; justify-content: space-between;
  font: 600 8.5pt "Bricolage Grotesque", system-ui, sans-serif;
  color: #1e2a78; letter-spacing: .01em;
  padding-bottom: 8pt; border-bottom: 1.5pt solid #1e2a78;
}
.brand .sub { font-weight: 400; color: #8a93b8; }
h1.title {
  font: 800 24pt/1.15 "Bricolage Grotesque", system-ui, sans-serif;
  letter-spacing: -.02em; color: #1e2a78;
  margin: 18pt 0 8pt;
}
.meta {
  display: flex; flex-wrap: wrap; gap: 4pt 14pt;
  font: 500 8.5pt "Bricolage Grotesque", system-ui, sans-serif; color: #5b6390;
  padding-bottom: 12pt; margin-bottom: 18pt; border-bottom: .75pt solid #d6e4f5;
}
.meta b { color: #1e2a78; font-weight: 700; }
.chip { display: inline-block; padding: 0 5pt; border-radius: 3pt; background: #ffe14d; color: #1e2a78; font-weight: 700; }

/* ---------- Isi ---------- */
.content > *:first-child { margin-top: 0; }
.content p { margin: 0 0 8pt; orphans: 3; widows: 3; }
.content h1, .content h2, .content h3, .content h4, .content h5, .content h6 {
  font-family: "Bricolage Grotesque", system-ui, sans-serif;
  color: #1e2a78; line-height: 1.25; letter-spacing: -.01em;
  break-after: avoid; page-break-after: avoid;
}
.content h1 { font-size: 17pt; font-weight: 800; margin: 20pt 0 8pt; padding-bottom: 4pt; border-bottom: .75pt solid #d6e4f5; }
.content h2 { font-size: 14pt; font-weight: 800; margin: 18pt 0 6pt; padding-left: 8pt; border-left: 3pt solid #e5484d; }
.content h3 { font-size: 12pt; font-weight: 700; margin: 14pt 0 4pt; }
.content h4, .content h5, .content h6 { font-size: 11pt; font-weight: 700; margin: 12pt 0 4pt; }
.content strong, .content b { font-weight: 700; color: #141b3d; }
.content a { color: #1e2a78; text-decoration: underline; text-decoration-color: #a9def5; text-decoration-thickness: 1.5pt; }
.content ul, .content ol { margin: 4pt 0 10pt; padding-left: 18pt; }
.content li { margin: 0 0 3pt; break-inside: avoid; }
.content li::marker { color: #e5484d; font-weight: 700; }
.content ul ul, .content ol ol, .content ul ol, .content ol ul { margin: 3pt 0; }
.content blockquote {
  margin: 10pt 0; padding: 6pt 12pt;
  border-left: 3pt solid #a9def5; background: #f2f8fd;
  color: #4a5487; font-style: italic; break-inside: avoid;
}
.content pre, .content .ql-syntax {
  margin: 10pt 0; padding: 9pt 11pt; border-radius: 4pt;
  background: #f5f7fb; border: .75pt solid #d6e4f5; color: #1e2a78;
  font: 8.5pt/1.55 "JetBrains Mono", ui-monospace, Menlo, Consolas, monospace;
  white-space: pre-wrap; word-wrap: break-word; break-inside: avoid;
}
.content code { font: 9pt "JetBrains Mono", ui-monospace, Menlo, Consolas, monospace; background: #fdeaf3; padding: 0 3pt; border-radius: 2pt; }
.content pre code { background: none; padding: 0; font-size: inherit; }
.content img { display: block; max-width: 100%; max-height: 120mm; margin: 10pt auto; border-radius: 3pt; break-inside: avoid; }
.content table { width: 100%; border-collapse: collapse; margin: 10pt 0; font-size: 9.5pt; line-height: 1.4; break-inside: auto; }
.content tr { break-inside: avoid; }
.content th, .content td { border: .75pt solid #c9d5e8; padding: 5pt 7pt; text-align: left; vertical-align: top; }
.content th, .content thead td { background: #fff6c2; font-family: "Bricolage Grotesque", system-ui, sans-serif; font-weight: 700; color: #1e2a78; }
.content hr { border: 0; border-top: .75pt dashed #9aa7cf; margin: 14pt 0; }
.content .mark { background-color: #fff1a6 !important; padding: 0 1.5pt; border-radius: 2pt; }
.content .ql-align-center { text-align: center; }
.content .ql-align-right { text-align: right; }
.content .ql-align-justify { text-align: justify; }
.content .ql-indent-1 { margin-left: 2em; } .content .ql-indent-2 { margin-left: 4em; } .content .ql-indent-3 { margin-left: 6em; }
.content .hljs-comment { color: #8a93b8; font-style: italic; }
.content .hljs-keyword, .content .hljs-selector-tag { color: #7c3aed; font-weight: 600; }
.content .hljs-string { color: #1a9e55; }
.content .hljs-number, .content .hljs-literal { color: #c2410c; }
.content .hljs-title, .content .hljs-function { color: #1e40af; }

.end {
  margin-top: 22pt; padding-top: 8pt; border-top: .75pt solid #d6e4f5;
  font: 400 8pt "Bricolage Grotesque", system-ui, sans-serif; color: #8a93b8;
  display: flex; justify-content: space-between;
}
`;

/**
 * @param {{ title: string, html: string, updatedAt?: string|Date, folderName?: string, language?: "id"|"en" }} opts
 */
export async function exportNotePdf({ title, html, updatedAt, folderName, language = "id" }) {
  const isId = language === "id";
  const cleanTitle = stripExt(title) || (isId ? "Catatan" : "Note");
  const { html: body, words } = prepareContent(html);
  const minutes = Math.max(1, Math.round(words / 200));
  const locale = isId ? "id-ID" : "en-US";
  const date = new Date(updatedAt || Date.now()).toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric" });
  const printedAt = new Date().toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric" });

  const metaParts = [
    folderName ? `<span>${isId ? "Folder" : "Folder"} <b>${esc(folderName)}</b></span>` : "",
    `<span>${isId ? "Diperbarui" : "Updated"} <b>${esc(date)}</b></span>`,
    `<span><b>${words.toLocaleString(locale)}</b> ${isId ? "kata" : "words"}</span>`,
    `<span>±<b>${minutes}</b> ${isId ? "menit baca" : "min read"}</span>`,
  ].join("");

  const docHtml = `<!DOCTYPE html>
<html lang="${isId ? "id" : "en"}">
<head>
<meta charset="utf-8">
<title>${esc(cleanTitle)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@400;500;600;700;800&family=Source+Serif+4:ital,wght@0,400;0,600;0,700;1,400&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
<style>${CSS}
@page { @top-right { content: "${cssStr(cleanTitle.slice(0, 70))}"; font: 400 8pt "Bricolage Grotesque", system-ui, sans-serif; color: #8a93b8; } }
@page :first { @top-right { content: none; } }</style>
</head>
<body>
  <div class="brand"><span>CatatPintar</span><span class="sub">${isId ? "Catatan belajar" : "Study note"}</span></div>
  <h1 class="title">${esc(cleanTitle)}</h1>
  <div class="meta">${metaParts}</div>
  <main class="content">${body || `<p><em>${isId ? "Catatan ini masih kosong." : "This note is empty."}</em></p>`}</main>
  <div class="end"><span>${isId ? "Dibuat dengan CatatPintar" : "Made with CatatPintar"}</span><span>${isId ? "Dicetak" : "Printed"} ${esc(printedAt)}</span></div>
</body>
</html>`;

  const iframe = document.createElement("iframe");
  Object.assign(iframe.style, { position: "fixed", right: "0", bottom: "0", width: "0", height: "0", border: "0", opacity: "0" });
  iframe.setAttribute("aria-hidden", "true");
  document.body.appendChild(iframe);

  const win = iframe.contentWindow;
  win.document.open();
  win.document.write(docHtml);
  win.document.close();

  const timeout = (ms) => new Promise((r) => setTimeout(r, ms));
  await Promise.race([new Promise((r) => (win.document.readyState === "complete" ? r() : (iframe.onload = r))), timeout(2500)]);
  const imgs = [...win.document.images].filter((img) => !img.complete).map((img) => new Promise((r) => (img.onload = img.onerror = r)));
  await Promise.race([Promise.all([win.document.fonts?.ready, ...imgs]), timeout(3000)]);

  // Nama file default "Save as PDF" mengikuti judul halaman induk di sebagian browser
  const prevTitle = document.title;
  document.title = cleanTitle;
  win.focus();
  win.print();
  document.title = prevTitle;

  setTimeout(() => iframe.remove(), 3000);
}
