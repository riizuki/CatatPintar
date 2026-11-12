"use client";

import { useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowUpRightFromSquare, faChevronDown, faLayerGroup, faMagnifyingGlassChart, faRotateRight,
} from "@fortawesome/free-solid-svg-icons";

/**
 * Panel "Bahan dari slide" di samping editor catatan (S1).
 *
 * Sejak F0, catatan untuk sebuah materi dibuka KOSONG — mahasiswa yang
 * menulisnya. Tanpa panel ini, mahasiswa dihadapkan pada halaman kosong tanpa
 * bahan apa pun di sampingnya.
 *
 * Sengaja TIDAK ada tombol "salin ke catatan": kalau poin slide bisa disalin
 * mentah-mentah, catatannya jadi identik dengan slide dan deteksi celah (F2)
 * kehilangan maknanya. Panel ini bahan bacaan, bukan sumber tempelan.
 */
export default function MaterialPointsPanel({ material, isAiNote, t, onCheckGaps, checking }) {
  const [points, setPoints] = useState(null);
  const [error, setError] = useState("");
  const [openPages, setOpenPages] = useState(() => new Set([1]));
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!material?.id || material.status !== "done") return;
    let cancelled = false;

    fetch(`/api/materials/${material.id}?points=true`)
      .then((res) => {
        if (!res.ok) throw new Error(t.loadFailed);
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        setPoints(data.points ?? []);
        // Buka halaman pertama yang punya poin.
        const firstPage = data.points?.[0]?.page;
        if (firstPage) setOpenPages(new Set([firstPage]));
      })
      .catch((err) => !cancelled && setError(err.message));

    return () => {
      cancelled = true;
    };
  }, [material?.id, material?.status, t.loadFailed]);

  const pages = useMemo(() => {
    const byPage = new Map();
    for (const point of points ?? []) {
      if (!byPage.has(point.page)) byPage.set(point.page, []);
      byPage.get(point.page).push(point);
    }
    return [...byPage.entries()].sort((a, b) => a[0] - b[0]);
  }, [points]);

  const togglePage = (page) =>
    setOpenPages((prev) => {
      const next = new Set(prev);
      next.has(page) ? next.delete(page) : next.add(page);
      return next;
    });

  const allOpen = pages.length > 0 && pages.every(([page]) => openPages.has(page));
  const slideHref = (page) =>
    material?.fileType === "pdf" ? `/api/materials/${material.id}/file#page=${page}` : null;

  return (
    <aside className="lg:sticky lg:top-24">
      {/* Di layar kecil panel dilipat, supaya editor tetap jadi fokus. */}
      <button
        type="button"
        onClick={() => setMobileOpen((v) => !v)}
        aria-expanded={mobileOpen}
        className="mb-3 flex w-full items-center justify-between rounded-xl border-2 border-[var(--rule)] px-4 py-3 text-left font-bold lg:hidden"
      >
        <span className="flex items-center gap-2">
          <FontAwesomeIcon icon={faLayerGroup} className="text-[var(--ink-soft)]" />
          {mobileOpen ? t.toggleHide : t.toggleShow}
          {points && <span className="text-sm font-semibold text-[var(--ink-soft)]">({points.length})</span>}
        </span>
        <FontAwesomeIcon icon={faChevronDown} className={`transition-transform ${mobileOpen ? "rotate-180" : ""}`} />
      </button>

      <div
        className={`${mobileOpen ? "block" : "hidden"} rounded-xl border-2 border-[var(--rule)] lg:block`}
      >
        <div className="border-b-2 border-dashed border-[var(--rule)] p-4">
          <p className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide text-[var(--ink-soft)]">
            <FontAwesomeIcon icon={faLayerGroup} />
            {t.title}
          </p>
          <p className="mt-1 truncate font-bold" title={material?.title}>{material?.title}</p>
          {points && (
            <p className="text-sm text-[var(--ink-soft)]">
              {/* Jumlah halaman berkas, bukan hanya halaman yang punya poin — supaya
                  sama dengan angka di riwayat materi (halaman judul/gambar tak berpoin). */}
              {t.summary.replace("{points}", points.length).replace("{pages}", material?.pageCount ?? pages.length)}
            </p>
          )}
          <p className="mt-2 rounded-lg bg-[var(--hl-yellow)] px-3 py-2 text-xs text-[var(--ink-fixed)]">{t.hint}</p>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-3 lg:max-h-[calc(100vh-20rem)]">
          {material?.status !== "done" ? (
            <p className="p-2 text-sm text-[var(--ink-soft)]">{t.notReady}</p>
          ) : error ? (
            <p className="p-2 text-sm text-[var(--wrong)]">{error}</p>
          ) : !points ? (
            <p className="flex items-center gap-2 p-2 text-sm text-[var(--ink-soft)]">
              <FontAwesomeIcon icon={faRotateRight} className="animate-spin" />
              {t.loading}
            </p>
          ) : (
            <>
              <div className="mb-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setOpenPages(allOpen ? new Set() : new Set(pages.map(([p]) => p)))}
                  className="text-xs font-bold text-[var(--ink-soft)] hover:text-[var(--ink)]"
                >
                  {allOpen ? t.collapseAll : t.expandAll}
                </button>
              </div>

              <ul className="space-y-2">
                {pages.map(([page, items]) => {
                  const open = openPages.has(page);
                  const href = slideHref(page);
                  return (
                    <li key={page} className="rounded-lg border border-[var(--rule)]">
                      <div className="flex items-center gap-2 px-3 py-2">
                        <button
                          type="button"
                          onClick={() => togglePage(page)}
                          aria-expanded={open}
                          aria-label={`${t.page} ${page}, ${t.pointsOnPage.replace("{n}", items.length)}`}
                          className="flex min-w-0 flex-1 items-center gap-2 text-left text-sm font-bold"
                        >
                          <FontAwesomeIcon
                            icon={faChevronDown}
                            className={`shrink-0 text-xs text-[var(--ink-soft)] transition-transform ${open ? "" : "-rotate-90"}`}
                          />
                          <span className="truncate">{t.page} {page}</span>
                          <span className="shrink-0 rounded-full bg-[var(--rule)] px-1.5 text-[11px] font-bold">
                            {items.length}
                          </span>
                        </button>
                        {href && (
                          <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-xs text-[var(--ink-soft)] hover:bg-[var(--rule)] hover:text-[var(--ink)]"
                            title={`${t.openSlide} ${page}`}
                            aria-label={`${t.openSlide} ${page}`}
                          >
                            <FontAwesomeIcon icon={faArrowUpRightFromSquare} />
                          </a>
                        )}
                      </div>

                      {open && (
                        <ul className="space-y-2 border-t border-[var(--rule)] px-3 py-2">
                          {items.map((point) => (
                            <li key={point.id} className="text-sm leading-relaxed">
                              <span className="mr-1.5 inline-block rounded bg-[var(--rule)] px-1.5 py-0.5 align-middle text-[10px] font-bold uppercase">
                                {point.pointType}
                              </span>
                              {point.text}
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </div>

        <div className="border-t-2 border-dashed border-[var(--rule)] p-3">
          {isAiNote ? (
            <p className="text-xs text-[var(--ink-soft)]">{t.aiNote}</p>
          ) : (
            <button
              type="button"
              onClick={onCheckGaps}
              disabled={checking || material?.status !== "done"}
              className="btn-ink h-10 w-full justify-center text-sm disabled:opacity-60"
            >
              <FontAwesomeIcon
                icon={checking ? faRotateRight : faMagnifyingGlassChart}
                className={checking ? "animate-spin" : ""}
              />
              {checking ? t.checking : t.checkGaps}
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
