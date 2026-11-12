"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faFloppyDisk, faFolder } from "@fortawesome/free-solid-svg-icons";

/* Komponen bersama halaman catatan baru & edit */

export function FolderPicker({ folders, value, onChange, t }) {
  return (
    <label className="relative inline-flex items-center">
      <span className="sr-only">{t.notes.editor.folder}</span>
      <FontAwesomeIcon icon={faFolder} className="pointer-events-none absolute left-3 text-amber-500" />
      <select
        id="folder"
        name="folder"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 appearance-none rounded-full border-2 border-[var(--rule)] bg-[var(--card)] pr-9 pl-9 text-sm font-semibold text-[var(--ink)] hover:border-[var(--ink-soft)] focus:border-[var(--ink-soft)] focus:outline-none"
      >
        <option value="">{t.notes.editor.noFolder}</option>
        {folders.map((folder) => (
          <option key={folder.id} value={folder.id}>
            {folder.name}
          </option>
        ))}
      </select>
      <FontAwesomeIcon icon={faChevronDown} className="pointer-events-none absolute right-3.5 text-[10px] text-[var(--ink-soft)]" />
    </label>
  );
}

/** Tombol simpan kecil di baris atas (sejajar pilihan folder) */
export function TopSaveButton({ busy, label, busyLabel }) {
  return (
    <button type="submit" disabled={busy} title="⌘/Ctrl+S" className="btn-ink ml-auto h-9 px-4 text-sm disabled:opacity-60">
      <FontAwesomeIcon icon={faFloppyDisk} />
      {busy ? busyLabel : label}
      <kbd className="ml-1 hidden rounded border border-white/40 px-1.5 text-[11px] font-semibold opacity-80 sm:inline">⌘/Ctrl S</kbd>
    </button>
  );
}

export function ActionBar({ children }) {
  return (
    <div className="mt-6 flex flex-wrap items-center justify-end gap-3 rounded-2xl border-2 border-[var(--rule)] bg-[var(--card)] p-3">
      {children}
    </div>
  );
}

