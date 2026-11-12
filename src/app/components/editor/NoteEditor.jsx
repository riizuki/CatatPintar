"use client";

import "./note-editor.css";
import { useCallback, useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAlignCenter, faAlignLeft, faAlignRight, faBold, faChevronDown, faCode, faEraser, faFont,
  faHighlighter, faImage, faItalic, faLink, faLinkSlash, faListOl, faListUl, faMinus, faQuoteLeft,
  faRotateLeft, faRotateRight, faStrikethrough, faTable, faTerminal, faUnderline, faUpload,
  faWandMagicSparkles, faXmark, faExpand, faCompress,
} from "@fortawesome/free-solid-svg-icons";
import { Modal } from "../ui/kit";
import {
  MARKDOWN_SHORTCUTS, applyMarkdown, closest, exec, insertImage, insertLink, insertTable, readState,
  restoreSelection, saveSelection, setBlock, setColor, setHighlight, textBeforeCaret, toggleInlineCode,
} from "./editorCommands";
import { normalizeUrl, sanitizeHtml } from "./sanitize";

/* ---------- Teks antarmuka ---------- */
const L = {
  id: {
    paragraph: "Paragraf", h1: "Judul 1", h2: "Judul 2", h3: "Judul 3",
    bold: "Tebal", italic: "Miring", underline: "Garis bawah", strike: "Coret", code: "Kode",
    color: "Warna teks", highlight: "Stabilo", none: "Hapus",
    ul: "Daftar bullet", ol: "Daftar bernomor", quote: "Kutipan", codeBlock: "Blok kode (Ctrl+Enter untuk keluar)",
    left: "Rata kiri", center: "Rata tengah", right: "Rata kanan", align: "Perataan",
    link: "Link", unlink: "Hapus link", image: "Gambar", table: "Tabel", hr: "Garis pemisah",
    clear: "Hapus format", undo: "Urungkan", redo: "Ulangi",
    linkPh: "Tempel link, mis. wikipedia.org", imagePh: "Tempel URL gambar", upload: "Unggah",
    save: "Sisipkan", cancel: "Batal", askAi: "Tanya AI",
    words: "kata", read: "menit baca", lines: "Garis buku",
    hint: "Ketik # judul, - daftar, > kutipan, ``` kode, lalu spasi",
    legendBtn: "Arti warna", legendTitle: "Arti warna stabilo",
    full: "Layar penuh (Ctrl/⌘+Shift+F)", exitFull: "Keluar layar penuh (Esc)",
    legendIntro: "Warna ini dipakai otomatis saat materi diimpor. Kamu juga bisa memakainya sendiri lewat tombol stabilo di toolbar.",
    close: "Mengerti",
    bigImage: "Gambar terlalu besar (maks. 2 MB).",
  },
  en: {
    paragraph: "Paragraph", h1: "Heading 1", h2: "Heading 2", h3: "Heading 3",
    bold: "Bold", italic: "Italic", underline: "Underline", strike: "Strikethrough", code: "Code",
    color: "Text color", highlight: "Highlighter", none: "Remove",
    ul: "Bulleted list", ol: "Numbered list", quote: "Quote", codeBlock: "Code block (Ctrl+Enter to exit)",
    left: "Align left", center: "Align center", right: "Align right", align: "Alignment",
    link: "Link", unlink: "Remove link", image: "Image", table: "Table", hr: "Divider",
    clear: "Clear formatting", undo: "Undo", redo: "Redo",
    linkPh: "Paste a link, e.g. wikipedia.org", imagePh: "Paste an image URL", upload: "Upload",
    save: "Insert", cancel: "Cancel", askAi: "Ask AI",
    words: "words", read: "min read", lines: "Ruled lines",
    hint: "Type # heading, - list, > quote, ``` code, then space",
    legendBtn: "Color guide", legendTitle: "Highlighter color guide",
    full: "Full screen (Ctrl/⌘+Shift+F)", exitFull: "Exit full screen (Esc)",
    legendIntro: "These colors are applied automatically when you import material. You can also use them yourself with the highlighter button.",
    close: "Got it",
    bigImage: "Image is too large (max 2 MB).",
  },
};

const TEXT_COLORS = ["#1e2a78", "#e5484d", "#ea580c", "#16a34a", "#0284c7", "#7c3aed", "#db2777", "#6b7280"];
const HIGHLIGHTS = [
  { c: "#ffe14d", n: "kuning" }, { c: "#96edb6", n: "hijau" }, { c: "#a9def5", n: "biru" },
  { c: "#ff9fcb", n: "pink" }, { c: "#fdba74", n: "oranye" },
];

/* Arti setiap warna stabilo (sama dengan yang dipakai AI saat impor materi) */
const LEGEND = {
  id: [
    { c: "#ffe14d", name: "Kata kunci", desc: "Poin atau istilah paling penting.", sample: "fotosintesis" },
    { c: "#96edb6", name: "Pengertian & rumus", desc: "Arti sebuah istilah, rumus, atau jawaban yang benar.", sample: "a² + b² = c²" },
    { c: "#a9def5", name: "Contoh", desc: "Contoh nyata yang membantu memahami materi.", sample: "misalnya saldo bank" },
    { c: "#ff9fcb", name: "Wajib diingat", desc: "Bagian yang sering keluar di ujian atau sering salah.", sample: "jangan tertukar" },
    { c: "#fdba74", name: "Bebas", desc: "Pakai sesukamu untuk tanda pribadi.", sample: "tanya dosen" },
  ],
  en: [
    { c: "#ffe14d", name: "Key point", desc: "The most important ideas or terms.", sample: "photosynthesis" },
    { c: "#96edb6", name: "Definition & formula", desc: "What a term means, a formula, or a correct answer.", sample: "a² + b² = c²" },
    { c: "#a9def5", name: "Example", desc: "A real example that makes the idea clearer.", sample: "like a bank balance" },
    { c: "#ff9fcb", name: "Must remember", desc: "Often tested, or easy to get wrong.", sample: "don't mix these up" },
    { c: "#fdba74", name: "Free use", desc: "Use it however you like for personal marks.", sample: "ask the teacher" },
  ],
};

const isEmptyHtml = (html) => html.replace(/<(p|div|br)[^>]*>|<\/(p|div)>|\s|&nbsp;|​/gi, "") === "";

/* ---------- Tombol kecil ---------- */
function Btn({ label, active, onPress, children, disabled }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active ?? undefined}
      disabled={disabled}
      onMouseDown={(e) => {
        e.preventDefault();
        if (!disabled) onPress();
      }}
      className={`ne-btn ${active ? "is-active" : ""}`}
    >
      {children}
    </button>
  );
}
const Sep = () => <span className="ne-sep" aria-hidden="true" />;

/* ============================================================ */

export default function NoteEditor({ value = "", onChange, placeholder, lang = "id", onAskAi, onSave }) {
  const t = L[lang] || L.id;
  const legend = LEGEND[lang] || LEGEND.id;
  const hlName = (c) => legend.find((x) => x.c === c)?.name || c;
  const [showLegend, setShowLegend] = useState(false);
  const [full, setFull] = useState(false);

  const wrapRef = useRef(null);
  const editorRef = useRef(null);
  const fileRef = useRef(null);
  const lastRange = useRef(null);
  const lastEmitted = useRef(null);

  const [state, setState] = useState(readState(null));
  const [empty, setEmpty] = useState(true);
  const [menu, setMenu] = useState(null); // 'color' | 'highlight' | 'align' | null
  const [popover, setPopover] = useState(null); // { kind: 'link'|'image', url, alt }

  // Mode layar penuh: kunci scroll halaman di belakang, Esc untuk keluar, Ctrl/⌘+Shift+F untuk beralih
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "f") {
        e.preventDefault();
        setFull((f) => !f);
      } else if (e.key === "Escape" && full && !showLegend && !popover && !menu && !e.target.closest?.(".ne-popover, .ne-strip, [role=dialog]")) {
        setFull(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [full, showLegend, popover, menu]);

  useEffect(() => {
    if (!full) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    editorRef.current?.focus();
    return () => {
      document.body.style.overflow = prev;
    };
  }, [full]);
  const [bubble, setBubble] = useState(null); // { top, left }
  const [stats, setStats] = useState({ words: 0 });
  const [ruled, setRuled] = useState(true);

  /* ---------- muat preferensi garis buku ---------- */
  useEffect(() => {
    try {
      const v = localStorage.getItem("cp-editor-ruled");
      if (v !== null) setRuled(v === "1");
    } catch {}
  }, []);
  const toggleRuled = () => {
    setRuled((r) => {
      try {
        localStorage.setItem("cp-editor-ruled", r ? "0" : "1");
      } catch {}
      return !r;
    });
  };

  /* ---------- sinkron value dari luar ---------- */
  const refreshMeta = useCallback(() => {
    const el = editorRef.current;
    if (!el) return;
    const text = el.innerText.replace(/​/g, "").trim();
    setEmpty(isEmptyHtml(el.innerHTML) && !el.querySelector("img,hr,table,iframe"));
    setStats({ words: text ? text.split(/\s+/).length : 0 });
  }, []);

  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    if (value !== lastEmitted.current) {
      el.innerHTML = sanitizeHtml(value || "");
      lastEmitted.current = value;
      refreshMeta();
    }
  }, [value, refreshMeta]);

  const emit = useCallback(() => {
    const el = editorRef.current;
    if (!el) return;
    let html = el.innerHTML;
    if (isEmptyHtml(html) && !el.querySelector("img,hr,table,iframe")) html = "";
    lastEmitted.current = html;
    onChange?.(html);
    refreshMeta();
    setState(readState(el));
  }, [onChange, refreshMeta]);

  /* ---------- pelacakan seleksi + bubble menu ---------- */
  useEffect(() => {
    exec("defaultParagraphSeparator", "p");
    const onSel = () => {
      const el = editorRef.current;
      const wrap = wrapRef.current;
      const sel = window.getSelection();
      if (!el || !wrap || !sel || sel.rangeCount === 0) return;
      if (!el.contains(sel.anchorNode)) {
        if (document.activeElement === el) return;
        setBubble(null);
        return;
      }
      lastRange.current = sel.getRangeAt(0).cloneRange();
      setState(readState(el));
      if (sel.isCollapsed || !sel.toString().trim()) {
        setBubble(null);
        return;
      }
      const w = wrap.getBoundingClientRect();
      // Di layar sempit (HP) pakai menu seleksi bawaan perangkat saja
      if (w.width < 560) {
        setBubble(null);
        return;
      }
      const r = sel.getRangeAt(0).getBoundingClientRect();
      const left = Math.min(Math.max(r.left + r.width / 2 - w.left, 180), w.width - 180);
      setBubble({ top: r.top - w.top - 52, left });
    };
    const onDocClick = (e) => {
      if (!e.target.closest?.(".ne-menu-root")) setMenu(null);
    };
    document.addEventListener("selectionchange", onSel);
    document.addEventListener("mousedown", onDocClick);
    return () => {
      document.removeEventListener("selectionchange", onSel);
      document.removeEventListener("mousedown", onDocClick);
    };
  }, []);

  /** Fokuskan editor, kembalikan seleksi terakhir, jalankan perintah, lalu kirim perubahan */
  const run = useCallback(
    (fn) => {
      const el = editorRef.current;
      if (!el) return;
      el.focus();
      if (lastRange.current && el.contains(lastRange.current.startContainer)) restoreSelection(lastRange.current);
      fn();
      emit();
    },
    [emit]
  );

  /* ---------- aksi ---------- */
  const onBlock = (tag) =>
    run(() => {
      const s = readState(editorRef.current);
      if (s.insertUnorderedList) exec("insertUnorderedList");
      else if (s.insertOrderedList) exec("insertOrderedList");
      setBlock(s.block === tag && tag !== "p" ? "p" : tag);
    });

  const openPopover = (kind) => {
    lastRange.current = saveSelection() ?? lastRange.current;
    const href = kind === "link" ? closest(window.getSelection()?.anchorNode, "A", editorRef.current)?.getAttribute("href") : "";
    setPopover({ kind, url: href || "", alt: "" });
    setMenu(null);
    setBubble(null);
  };

  const submitPopover = (e) => {
    e.preventDefault();
    if (!popover) return;
    const url = normalizeUrl(popover.url);
    const { kind, alt } = popover;
    setPopover(null);
    if (url) run(() => (kind === "link" ? insertLink(url) : insertImage(editorRef.current, url, alt)));
  };

  const readImageFile = (file, after) => {
    if (!file || !file.type.startsWith("image/")) return;
    if (file.size > 2 * 1024 * 1024) {
      alert(t.bigImage);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => after(reader.result);
    reader.readAsDataURL(file);
  };

  const onPickFile = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    readImageFile(file, (src) => {
      setPopover(null);
      run(() => insertImage(editorRef.current, src, file.name));
    });
  };

  /* ---------- keyboard ---------- */
  const onKeyDown = (e) => {
    const el = editorRef.current;
    const mod = e.metaKey || e.ctrlKey;
    const s = readState(el);

    if (mod && e.key.toLowerCase() === "k") {
      e.preventDefault();
      openPopover("link");
      return;
    }
    if (mod && e.key.toLowerCase() === "s") {
      e.preventDefault();
      onSave?.();
      return;
    }
    if (mod && e.key === "e") {
      e.preventDefault();
      run(() => toggleInlineCode(el));
      return;
    }
    if (mod && e.shiftKey && e.key.toLowerCase() === "h") {
      e.preventDefault();
      run(() => setHighlight(HIGHLIGHTS[0].c));
      return;
    }

    // Blok kode: Enter = baris baru, Ctrl/Cmd+Enter = keluar ke paragraf baru
    if (s.block === "pre" && e.key === "Enter") {
      e.preventDefault();
      if (mod) {
        const pre = closest(window.getSelection().anchorNode, "PRE", el);
        const p = document.createElement("p");
        p.innerHTML = "<br>";
        pre.after(p);
        const r = document.createRange();
        r.setStart(p, 0);
        restoreSelection(r);
      } else {
        exec("insertText", "\n");
      }
      emit();
      return;
    }
    // Enter di kutipan kosong = keluar dari kutipan
    if (e.key === "Enter" && !e.shiftKey && s.block === "blockquote") {
      const bq = closest(window.getSelection().anchorNode, "BLOCKQUOTE", el);
      if (bq && !bq.textContent.trim()) {
        e.preventDefault();
        const p = document.createElement("p");
        p.innerHTML = "<br>";
        bq.replaceWith(p);
        const r = document.createRange();
        r.setStart(p, 0);
        restoreSelection(r);
        emit();
        return;
      }
    }
    if (e.key === "Tab") {
      if (s.block === "pre") {
        e.preventDefault();
        exec("insertText", "  ");
        emit();
        return;
      }
      if (s.insertOrderedList || s.insertUnorderedList) {
        e.preventDefault();
        run(() => exec(e.shiftKey ? "outdent" : "indent"));
        return;
      }
    }

    // Shortcut Markdown di awal baris
    if (e.key === " " && !mod) {
      const before = textBeforeCaret(el);
      const action = before && MARKDOWN_SHORTCUTS[before.text];
      const inLi = closest(window.getSelection().anchorNode, "LI", el);
      if (action && !inLi && s.block !== "pre") {
        if (applyMarkdown(el, action, before.range)) {
          e.preventDefault();
          emit();
        }
      }
    }
  };

  const onPaste = (e) => {
    const files = Array.from(e.clipboardData.files || []).filter((f) => f.type.startsWith("image/"));
    e.preventDefault();
    if (files.length) {
      readImageFile(files[0], (src) => run(() => insertImage(editorRef.current, src)));
      return;
    }
    const html = e.clipboardData.getData("text/html");
    const text = e.clipboardData.getData("text/plain");
    if (html) exec("insertHTML", sanitizeHtml(html));
    else exec("insertText", text);
    emit();
  };

  const onDrop = (e) => {
    const file = Array.from(e.dataTransfer.files || []).find((f) => f.type.startsWith("image/"));
    if (!file) return;
    e.preventDefault();
    const pos = document.caretRangeFromPoint?.(e.clientX, e.clientY);
    if (pos) lastRange.current = pos;
    readImageFile(file, (src) => run(() => insertImage(editorRef.current, src, file.name)));
  };

  const onFocus = () => {
    const el = editorRef.current;
    if (el && el.innerHTML.trim() === "") {
      el.innerHTML = "<p><br></p>";
      const r = document.createRange();
      r.setStart(el.firstChild, 0);
      restoreSelection(r);
    }
    setState(readState(el));
  };

  const readMin = Math.max(1, Math.ceil(stats.words / 200));

  /* ---------- render ---------- */
  return (
    <div ref={wrapRef} className={`ne-root ${full ? "is-full" : ""}`}>
      {/* ===== Toolbar ===== */}
      <div className="ne-toolbar ne-menu-root" role="toolbar" aria-label="Format teks">
        <label className="ne-select-wrap">
          <span className="sr-only">Jenis paragraf</span>
          <select
            className="ne-select"
            value={["h1", "h2", "h3"].includes(state.block) ? state.block : "p"}
            onChange={(e) => onBlock(e.target.value)}
          >
            <option value="p">{t.paragraph}</option>
            <option value="h1">{t.h1}</option>
            <option value="h2">{t.h2}</option>
            <option value="h3">{t.h3}</option>
          </select>
          <FontAwesomeIcon icon={faChevronDown} className="ne-select-icon" />
        </label>
        <Sep />
        <Btn label={`${t.bold} (Ctrl+B)`} active={state.bold} onPress={() => run(() => exec("bold"))}><FontAwesomeIcon icon={faBold} /></Btn>
        <Btn label={`${t.italic} (Ctrl+I)`} active={state.italic} onPress={() => run(() => exec("italic"))}><FontAwesomeIcon icon={faItalic} /></Btn>
        <Btn label={`${t.underline} (Ctrl+U)`} active={state.underline} onPress={() => run(() => exec("underline"))}><FontAwesomeIcon icon={faUnderline} /></Btn>
        <Btn label={t.strike} active={state.strikeThrough} onPress={() => run(() => exec("strikeThrough"))}><FontAwesomeIcon icon={faStrikethrough} /></Btn>
        <Btn label={`${t.code} (Ctrl+E)`} active={state.code && state.block !== "pre"} onPress={() => run(() => toggleInlineCode(editorRef.current))}><FontAwesomeIcon icon={faCode} /></Btn>

        <Btn label={t.color} active={menu === "color"} onPress={() => setMenu(menu === "color" ? null : "color")}>
          <FontAwesomeIcon icon={faFont} />
        </Btn>
        <Btn label={`${t.highlight} (Ctrl+Shift+H)`} active={menu === "highlight"} onPress={() => setMenu(menu === "highlight" ? null : "highlight")}>
          <FontAwesomeIcon icon={faHighlighter} />
        </Btn>
        <Sep />
        <Btn label={t.ul} active={state.insertUnorderedList} onPress={() => run(() => exec("insertUnorderedList"))}><FontAwesomeIcon icon={faListUl} /></Btn>
        <Btn label={t.ol} active={state.insertOrderedList} onPress={() => run(() => exec("insertOrderedList"))}><FontAwesomeIcon icon={faListOl} /></Btn>
        <Btn label={t.quote} active={state.block === "blockquote"} onPress={() => onBlock("blockquote")}><FontAwesomeIcon icon={faQuoteLeft} /></Btn>
        <Btn label={t.codeBlock} active={state.block === "pre"} onPress={() => onBlock("pre")}><FontAwesomeIcon icon={faTerminal} /></Btn>
        <Sep />
        <Btn label={t.align} active={menu === "align"} onPress={() => setMenu(menu === "align" ? null : "align")}>
          <FontAwesomeIcon icon={state.justifyCenter ? faAlignCenter : state.justifyRight ? faAlignRight : faAlignLeft} />
        </Btn>
        <Sep />
        <Btn label={`${t.link} (Ctrl+K)`} active={state.link} onPress={() => openPopover("link")}><FontAwesomeIcon icon={faLink} /></Btn>
        {state.link && <Btn label={t.unlink} onPress={() => run(() => exec("unlink"))}><FontAwesomeIcon icon={faLinkSlash} /></Btn>}
        <Btn label={t.image} onPress={() => openPopover("image")}><FontAwesomeIcon icon={faImage} /></Btn>
        <Btn label={t.table} onPress={() => run(() => insertTable(editorRef.current))}><FontAwesomeIcon icon={faTable} /></Btn>
        <Btn label={t.hr} onPress={() => run(() => exec("insertHorizontalRule"))}><FontAwesomeIcon icon={faMinus} /></Btn>
        <Sep />
        <Btn label={t.clear} onPress={() => run(() => { exec("removeFormat"); exec("unlink"); })}><FontAwesomeIcon icon={faEraser} /></Btn>
        <Btn label={`${t.undo} (Ctrl+Z)`} onPress={() => run(() => exec("undo"))}><FontAwesomeIcon icon={faRotateLeft} /></Btn>
        <Btn label={`${t.redo} (Ctrl+Shift+Z)`} onPress={() => run(() => exec("redo"))}><FontAwesomeIcon icon={faRotateRight} /></Btn>
        <span className="ne-grow" />
        <button
          type="button"
          className="ne-legend-btn"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => setShowLegend(true)}
          title={t.legendTitle}
        >
          <span className="ne-legend-dots" aria-hidden="true">
            {legend.slice(0, 4).map((x) => (
              <span key={x.c} style={{ background: x.c }} />
            ))}
          </span>
          <span className="ne-legend-label">{t.legendBtn}</span>
        </button>
        <span className="ne-full-wrap">
          <Btn label={full ? t.exitFull : t.full} active={full} onPress={() => setFull((f) => !f)}>
            <FontAwesomeIcon icon={full ? faCompress : faExpand} />
          </Btn>
        </span>
      </div>

      {/* ===== Strip pilihan (warna, stabilo, perataan) ===== */}
      {menu && (
        <div className="ne-strip ne-menu-root" role="menu">
          {menu === "color" &&
            TEXT_COLORS.map((c) => (
              <button key={c} type="button" className="ne-swatch" style={{ background: c }} title={c} aria-label={`${t.color} ${c}`}
                onMouseDown={(e) => { e.preventDefault(); setMenu(null); run(() => setColor(c)); }} />
            ))}
          {menu === "highlight" && (
            <>
              {HIGHLIGHTS.map((h) => (
                <button key={h.c} type="button" className="ne-swatch ne-swatch-hl" style={{ background: h.c }} title={hlName(h.c)} aria-label={`${t.highlight}: ${hlName(h.c)}`}
                  onMouseDown={(e) => { e.preventDefault(); setMenu(null); run(() => setHighlight(h.c)); }} />
              ))}
              <button type="button" className="ne-swatch ne-swatch-none" title={t.none} aria-label={t.none}
                onMouseDown={(e) => { e.preventDefault(); setMenu(null); run(() => setHighlight("transparent")); }}>
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </>
          )}
          {menu === "align" && (
            <>
              <Btn label={t.left} active={state.justifyLeft} onPress={() => { setMenu(null); run(() => exec("justifyLeft")); }}><FontAwesomeIcon icon={faAlignLeft} /></Btn>
              <Btn label={t.center} active={state.justifyCenter} onPress={() => { setMenu(null); run(() => exec("justifyCenter")); }}><FontAwesomeIcon icon={faAlignCenter} /></Btn>
              <Btn label={t.right} active={state.justifyRight} onPress={() => { setMenu(null); run(() => exec("justifyRight")); }}><FontAwesomeIcon icon={faAlignRight} /></Btn>
            </>
          )}
        </div>
      )}

      {/* ===== Popover link / gambar ===== */}
      {popover && (
        <form className="ne-popover" onSubmit={submitPopover}>
          <FontAwesomeIcon icon={popover.kind === "link" ? faLink : faImage} className="ne-popover-icon" />
          <input
            autoFocus
            type="text"
            placeholder={popover.kind === "link" ? t.linkPh : t.imagePh}
            value={popover.url}
            onChange={(e) => setPopover({ ...popover, url: e.target.value })}
            onKeyDown={(e) => e.key === "Escape" && setPopover(null)}
          />
          {popover.kind === "image" && (
            <>
              <button type="button" className="ne-pop-ghost" onClick={() => fileRef.current?.click()}>
                <FontAwesomeIcon icon={faUpload} /> {t.upload}
              </button>
              <input ref={fileRef} type="file" accept="image/*" hidden onChange={onPickFile} />
            </>
          )}
          <button type="submit" className="ne-pop-primary">{t.save}</button>
          <button type="button" className="ne-pop-ghost" onClick={() => setPopover(null)}>{t.cancel}</button>
        </form>
      )}

      {/* ===== Bubble menu saat teks diblok ===== */}
      {bubble && !popover && (
        <div className="ne-bubble" style={{ top: bubble.top, left: bubble.left }} role="toolbar" aria-label="Format cepat">
          <Btn label={t.bold} active={state.bold} onPress={() => run(() => exec("bold"))}><FontAwesomeIcon icon={faBold} /></Btn>
          <Btn label={t.italic} active={state.italic} onPress={() => run(() => exec("italic"))}><FontAwesomeIcon icon={faItalic} /></Btn>
          <Btn label={t.underline} active={state.underline} onPress={() => run(() => exec("underline"))}><FontAwesomeIcon icon={faUnderline} /></Btn>
          {HIGHLIGHTS.slice(0, 3).map((h) => (
            <button key={h.c} type="button" title={hlName(h.c)} aria-label={`${t.highlight}: ${hlName(h.c)}`} className="ne-bubble-hl" style={{ background: h.c }}
              onMouseDown={(e) => { e.preventDefault(); run(() => setHighlight(h.c)); }} />
          ))}
          <Btn label={t.link} onPress={() => openPopover("link")}><FontAwesomeIcon icon={faLink} /></Btn>
          {onAskAi && (
            <button type="button" className="ne-bubble-ai" onMouseDown={(e) => { e.preventDefault(); onAskAi(window.getSelection()?.toString() || ""); }}>
              <FontAwesomeIcon icon={faWandMagicSparkles} /> {t.askAi}
            </button>
          )}
        </div>
      )}

      {/* ===== Kertas ===== */}
      <div className={`ne-paper ${ruled ? "is-ruled" : ""}`}>
        <div
          ref={editorRef}
          className={`ne-content ${empty ? "is-empty" : ""}`}
          contentEditable
          suppressContentEditableWarning
          role="textbox"
          aria-multiline="true"
          aria-label={placeholder || "Isi catatan"}
          data-placeholder={placeholder}
          spellCheck
          onInput={emit}
          onKeyDown={onKeyDown}
          onPaste={onPaste}
          onDrop={onDrop}
          onFocus={onFocus}
        />
      </div>

      {/* ===== Footer ===== */}
      <div className="ne-footer">
        <span className="ne-hint">{t.hint}</span>
        <span className="ne-grow" />
        <span>{stats.words} {t.words}</span>
        <span>± {readMin} {t.read}</span>
        <label className="ne-switch">
          <input type="checkbox" checked={ruled} onChange={toggleRuled} />
          <span>{t.lines}</span>
        </label>
      </div>

      <Modal open={showLegend} onClose={() => setShowLegend(false)} title={t.legendTitle} icon={faHighlighter} iconClass="bg-[var(--hl-yellow)]" size="max-w-lg">
        <p className="text-[var(--ink-soft)]">{t.legendIntro}</p>
        <ul className="mt-5 space-y-3">
          {legend.map((x) => (
            <li key={x.c} className="flex items-start gap-3 rounded-xl border-2 border-[var(--rule)] p-3">
              <span className="mt-0.5 h-6 w-6 shrink-0 rounded-md border-2 border-[var(--ink-fixed)]/20" style={{ background: x.c }} aria-hidden="true" />
              <span className="min-w-0 flex-1">
                <span className="block font-extrabold">{x.name}</span>
                <span className="block text-sm text-[var(--ink-soft)]">{x.desc}</span>
              </span>
              <span className="hidden shrink-0 rounded px-1.5 text-sm font-semibold text-[var(--ink-fixed)] sm:inline" style={{ background: x.c }}>
                {x.sample}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-6 flex justify-end">
          <button type="button" onClick={() => setShowLegend(false)} className="btn-ink h-10 px-5 text-sm">
            {t.close}
          </button>
        </div>
      </Modal>
    </div>
  );
}
