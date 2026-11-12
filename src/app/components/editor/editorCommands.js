/**
 * Lapisan perintah editor. Semua yang "menyentuh" DOM/seleksi ada di sini,
 * jadi kalau suatu saat mau ganti engine, cukup ubah file ini.
 * Engine saat ini: document.execCommand (masih didukung semua browser utama).
 */
import { escapeHtml } from "./sanitize";

const BLOCKS = ["p", "h1", "h2", "h3", "blockquote", "pre"];

export const exec = (cmd, value) => document.execCommand(cmd, false, value);

export function setBlock(tag) {
  exec("formatBlock", `<${tag}>`);
}

export function setColor(color) {
  exec("styleWithCSS", true);
  exec("foreColor", color);
  exec("styleWithCSS", false);
}

export function setHighlight(color) {
  exec("styleWithCSS", true);
  exec("hiliteColor", color);
  exec("styleWithCSS", false);
}

export function toggleInlineCode(root) {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return;
  const code = closest(sel.anchorNode, "CODE", root);
  if (code && !closest(code, "PRE", root)) {
    code.replaceWith(document.createTextNode(code.textContent));
    return;
  }
  const text = sel.toString() || "kode";
  exec("insertHTML", `<code>${escapeHtml(text)}</code>&#8203;`);
}

export function insertLink(url) {
  const sel = window.getSelection();
  if (sel && sel.isCollapsed) {
    exec("insertHTML", `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(url)}</a>`);
  } else {
    exec("createLink", url);
  }
}

export function insertImage(root, src, alt = "") {
  insertBlocks(root, `<img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" />`);
}

export function insertTable(root, rows = 3, cols = 3) {
  const head = `<tr>${Array.from({ length: cols }, (_, i) => `<th>Kolom ${i + 1}</th>`).join("")}</tr>`;
  const body = Array.from({ length: rows - 1 }, () => `<tr>${"<td><br></td>".repeat(cols)}</tr>`).join("");
  insertBlocks(root, `<table><thead>${head}</thead><tbody>${body}</tbody></table>`);
}

/** Elemen yang merupakan anak langsung root, tempat kursor berada */
export function topBlock(node, root) {
  let el = node;
  while (el && el.parentNode && el.parentNode !== root) el = el.parentNode;
  return el && el.parentNode === root ? el : null;
}

function caretAtStart(el) {
  const r = document.createRange();
  r.setStart(el, 0);
  r.collapse(true);
  restoreSelection(r);
}

const isBlank = (el) => !el.textContent.replace(/\u200b/g, "").trim() && !el.querySelector?.("img,table,hr,iframe");

/**
 * Sisipkan elemen blok (gambar, tabel, …) setelah blok tempat kursor berada,
 * atau menggantikannya kalau blok itu kosong. Lalu taruh kursor di paragraf baru.
 * Dilakukan lewat DOM langsung karena insertHTML di Chrome sering merusak tabel.
 */
export function insertBlocks(root, html) {
  const sel = window.getSelection();
  const block = sel && sel.rangeCount ? topBlock(sel.anchorNode, root) : null;
  const tpl = document.createElement("template");
  tpl.innerHTML = html;
  const after = document.createElement("p");
  after.innerHTML = "<br>";
  const frag = tpl.content;
  frag.appendChild(after);
  if (!block) root.appendChild(frag);
  else if (isBlank(block) && block.tagName === "P") block.replaceWith(frag);
  else block.after(frag);
  caretAtStart(after);
}

/** Terapkan shortcut Markdown: hapus penanda (mis. "##") lalu ubah blok */
export function applyMarkdown(root, action, prefixRange) {
  const block = topBlock(prefixRange.startContainer, root);
  if (!block || block.tagName !== "P") return false;
  prefixRange.deleteContents();

  if (action.cmd === "insertHorizontalRule") {
    const hr = document.createElement("hr");
    const p = document.createElement("p");
    p.innerHTML = "<br>";
    if (isBlank(block)) block.replaceWith(hr, p);
    else block.after(hr, p);
    caretAtStart(p);
    return true;
  }

  let target;
  let outer;
  if (action.block) {
    target = outer = document.createElement(action.block);
  } else {
    outer = document.createElement(action.cmd === "insertOrderedList" ? "ol" : "ul");
    target = document.createElement("li");
    outer.appendChild(target);
  }
  while (block.firstChild) target.appendChild(block.firstChild);
  if (isBlank(target)) target.innerHTML = "<br>";
  block.replaceWith(outer);
  caretAtStart(target);
  return true;
}

export function closest(node, tag, root) {
  let el = node;
  while (el && el !== root) {
    if (el.nodeType === 1 && el.tagName === tag) return el;
    el = el.parentNode;
  }
  return null;
}

export function currentBlock(node, root) {
  let el = node;
  while (el && el !== root) {
    if (el.nodeType === 1 && BLOCKS.includes(el.tagName.toLowerCase())) return el.tagName.toLowerCase();
    el = el.parentNode;
  }
  return "p";
}

/** Elemen blok terdekat (anak langsung root atau LI) tempat kursor berada */
export function blockElement(node, root) {
  let el = node;
  while (el && el !== root) {
    if (el.nodeType === 1 && (el.parentNode === root || el.tagName === "LI")) return el;
    el = el.parentNode;
  }
  return null;
}

export function readState(root) {
  const sel = window.getSelection();
  const empty = {
    bold: false, italic: false, underline: false, strikeThrough: false,
    insertUnorderedList: false, insertOrderedList: false,
    justifyLeft: false, justifyCenter: false, justifyRight: false,
    block: "p", link: false, code: false,
  };
  if (!root || !sel || sel.rangeCount === 0 || !root.contains(sel.anchorNode)) return empty;
  const q = (c) => {
    try {
      return document.queryCommandState(c);
    } catch {
      return false;
    }
  };
  return {
    bold: q("bold"),
    italic: q("italic"),
    underline: q("underline"),
    strikeThrough: q("strikeThrough"),
    insertUnorderedList: q("insertUnorderedList"),
    insertOrderedList: q("insertOrderedList"),
    justifyLeft: q("justifyLeft"),
    justifyCenter: q("justifyCenter"),
    justifyRight: q("justifyRight"),
    block: currentBlock(sel.anchorNode, root),
    link: !!closest(sel.anchorNode, "A", root),
    code: !!closest(sel.anchorNode, "CODE", root),
  };
}

export function saveSelection() {
  const sel = window.getSelection();
  return sel && sel.rangeCount > 0 ? sel.getRangeAt(0).cloneRange() : null;
}

export function restoreSelection(range) {
  if (!range) return;
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);
}

/**
 * Shortcut ala Markdown: dicek saat pengguna menekan spasi di awal baris.
 * Mengembalikan aksi yang cocok, atau null.
 */
export const MARKDOWN_SHORTCUTS = {
  "#": { block: "h1" },
  "##": { block: "h2" },
  "###": { block: "h3" },
  ">": { block: "blockquote" },
  "```": { block: "pre" },
  "-": { cmd: "insertUnorderedList" },
  "*": { cmd: "insertUnorderedList" },
  "1.": { cmd: "insertOrderedList" },
  "---": { cmd: "insertHorizontalRule" },
};

export function textBeforeCaret(root) {
  const sel = window.getSelection();
  if (!sel || !sel.isCollapsed || sel.rangeCount === 0) return null;
  const block = blockElement(sel.anchorNode, root);
  const range = document.createRange();
  range.setStart(block || root, 0);
  range.setEnd(sel.anchorNode, sel.anchorOffset);
  return { text: range.toString(), range };
}
