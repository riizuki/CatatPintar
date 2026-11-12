/**
 * Sanitizer berbasis allowlist untuk isi catatan.
 * Dipakai saat paste dan saat memuat catatan lama (termasuk HTML hasil Quill).
 * Catatan: tetap sanitasi ulang di server sebelum menyimpan/menampilkan ke orang lain.
 */

const ALLOWED_TAGS = new Set([
  "P", "BR", "H1", "H2", "H3", "H4", "H5", "H6", "STRONG", "B", "EM", "I", "U", "S", "STRIKE", "DEL",
  "SUB", "SUP", "MARK", "UL", "OL", "LI", "BLOCKQUOTE", "PRE", "CODE", "A", "IMG", "SPAN", "HR", "DIV",
  "TABLE", "THEAD", "TBODY", "TR", "TH", "TD", "IFRAME",
]);

const ALLOWED_ATTRS = {
  A: ["href", "target", "rel"],
  IMG: ["src", "alt", "width", "height"],
  IFRAME: ["src", "frameborder", "allowfullscreen"],
  TD: ["colspan", "rowspan"],
  TH: ["colspan", "rowspan"],
  UL: ["data-checked"],
};
const GLOBAL_ATTRS = ["style", "class"];

const ALLOWED_STYLES = ["color", "background-color", "text-align"];
// Kelas yang dipertahankan: bawaan Quill (ql-*) dan highlight.js (hljs*) supaya catatan lama tetap rapi
const ALLOWED_CLASS = /^(ql-[\w-]+|hljs[\w-]*)$/;

const DROP_WITH_CONTENT = new Set(["SCRIPT", "STYLE", "OBJECT", "EMBED", "META", "LINK", "TITLE", "NOSCRIPT", "SVG", "MATH"]);

const SAFE_URL = /^(https?:|mailto:|tel:|\/|#|data:image\/(png|jpe?g|gif|webp);)/i;
const SAFE_IFRAME = /^https:\/\/(www\.)?(youtube\.com|youtube-nocookie\.com|player\.vimeo\.com)\//i;

export function sanitizeHtml(dirty = "") {
  if (typeof window === "undefined") return dirty;
  const doc = new DOMParser().parseFromString(`<body>${dirty}</body>`, "text/html");
  clean(doc.body);
  return doc.body.innerHTML;
}

function clean(node) {
  for (const child of Array.from(node.childNodes)) {
    if (child.nodeType === Node.COMMENT_NODE) {
      child.remove();
      continue;
    }
    if (!(child instanceof Element)) continue;
    const tag = child.tagName;

    if (DROP_WITH_CONTENT.has(tag)) {
      child.remove();
      continue;
    }
    clean(child);

    if (!ALLOWED_TAGS.has(tag)) {
      child.replaceWith(...Array.from(child.childNodes));
      continue;
    }

    const allowed = [...(ALLOWED_ATTRS[tag] || []), ...GLOBAL_ATTRS];
    for (const attr of Array.from(child.attributes)) {
      const name = attr.name.toLowerCase();
      const value = attr.value.trim();
      if (!allowed.includes(name)) {
        child.removeAttribute(attr.name);
      } else if ((name === "href" || name === "src") && tag !== "IFRAME" && !SAFE_URL.test(value)) {
        child.removeAttribute(attr.name);
      } else if (name === "style") {
        const kept = value
          .split(";")
          .map((s) => s.trim())
          .filter((s) => {
            const prop = s.split(":")[0]?.trim().toLowerCase();
            return prop && ALLOWED_STYLES.includes(prop) && !/url\(|expression/i.test(s);
          })
          .join("; ");
        kept ? child.setAttribute("style", kept) : child.removeAttribute("style");
      } else if (name === "class") {
        const kept = value.split(/\s+/).filter((c) => ALLOWED_CLASS.test(c)).join(" ");
        kept ? child.setAttribute("class", kept) : child.removeAttribute("class");
      }
    }

    if (tag === "IFRAME" && !SAFE_IFRAME.test(child.getAttribute("src") || "")) {
      child.remove();
      continue;
    }
    if (tag === "IMG" && !child.getAttribute("src")) {
      child.remove();
      continue;
    }
    if (tag === "A") {
      child.setAttribute("target", "_blank");
      child.setAttribute("rel", "noopener noreferrer");
    }
  }
}

export function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}

export function normalizeUrl(raw) {
  const url = String(raw || "").trim();
  if (!url) return "";
  if (/^(https?:|mailto:|tel:|\/|#|data:image\/)/i.test(url)) return url;
  return `https://${url}`;
}
