"use client";

/**
 * Mode belajar flashcard:
 * - balik kartu (klik / Spasi), tandai "Belum hafal" / "Sudah hafal" (tombol, 1 / 2, atau geser di HP)
 * - bar progres berwarna per kartu, acak urutan, ringkasan di akhir sesi
 * Semua status hanya di browser (tidak mengubah data di server).
 */
import "./study-deck.css";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft, faArrowRight, faCheck, faLayerGroup, faRotate, faRotateLeft, faShuffle, faXmark,
} from "@fortawesome/free-solid-svg-icons";

const L = {
  id: {
    question: "pertanyaan", answer: "jawaban", flip: "Klik atau tekan Spasi untuk membalik",
    review: "Belum hafal", known: "Sudah hafal", shuffle: "Acak", prev: "Sebelumnya", next: "Lewati",
    card: "Kartu", of: "dari", left: "kartu tersisa",
    doneTitle: "Sesi selesai!", knownLabel: "sudah hafal", reviewLabel: "perlu diulang",
    againReview: (n) => `Ulangi ${n} kartu yang belum hafal`, againAll: "Ulangi semua", other: "Pilih set lain",
    perfect: "Semua kartu sudah kamu hafal. Mantap!",
    hint: "← → pindah, Spasi balik, 1 belum hafal, 2 sudah hafal",
    swipe: "Geser kanan = hafal, kiri = belum",
  },
  en: {
    question: "question", answer: "answer", flip: "Click or press Space to flip",
    review: "Still learning", known: "Got it", shuffle: "Shuffle", prev: "Previous", next: "Skip",
    card: "Card", of: "of", left: "cards left",
    doneTitle: "Session complete!", knownLabel: "memorized", reviewLabel: "to review",
    againReview: (n) => `Review ${n} card${n > 1 ? "s" : ""} again`, againAll: "Restart all", other: "Choose another set",
    perfect: "You memorized every card. Nice!",
    hint: "← → move, Space flip, 1 still learning, 2 got it",
    swipe: "Swipe right = got it, left = still learning",
  },
};

const sizeFor = (text = "", back = false) => {
  const n = text.length;
  if (n < 60) return back ? "text-2xl sm:text-3xl" : "text-2xl sm:text-4xl";
  if (n < 140) return back ? "text-xl sm:text-2xl" : "text-xl sm:text-3xl";
  return back ? "text-lg sm:text-xl" : "text-lg sm:text-2xl";
};

const shuffled = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

export default function StudyDeck({ cards, lang = "id" }) {
  const t = L[lang] || L.id;
  const all = useMemo(() => cards.map((_, i) => i), [cards]);

  const [order, setOrder] = useState(all);
  const [pos, setPos] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [status, setStatus] = useState({}); // index kartu -> "known" | "review"
  const [finished, setFinished] = useState(false);
  const [enter, setEnter] = useState("next"); // arah animasi masuk kartu
  const [drag, setDrag] = useState(0); // geseran jari (px)
  const touchX = useRef(null);

  useEffect(() => {
    setOrder(all);
    setPos(0);
    setStatus({});
    setFinished(false);
    setFlipped(false);
  }, [all]);

  const cardIdx = order[pos];
  const card = cards[cardIdx];

  const goTo = useCallback(
    (nextPos, dir) => {
      setFlipped(false);
      setEnter(dir);
      if (nextPos >= order.length) setFinished(true);
      else setPos(Math.max(0, nextPos));
    },
    [order.length]
  );

  const mark = useCallback(
    (kind) => {
      if (finished) return;
      setStatus((s) => ({ ...s, [cardIdx]: kind }));
      goTo(pos + 1, kind);
    },
    [cardIdx, finished, goTo, pos]
  );

  const restart = (onlyReview) => {
    const next = onlyReview ? order.filter((i) => status[i] === "review") : all;
    setOrder(next.length ? next : all);
    setStatus((s) => {
      if (!onlyReview) return {};
      const copy = { ...s };
      next.forEach((i) => delete copy[i]);
      return copy;
    });
    setPos(0);
    setFlipped(false);
    setFinished(false);
    setEnter("next");
  };

  const doShuffle = () => {
    setOrder((o) => shuffled(o));
    setPos(0);
    setFlipped(false);
    setEnter("next");
  };

  /* ---------- keyboard ---------- */
  useEffect(() => {
    const onKey = (e) => {
      if (["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName) || document.activeElement?.isContentEditable) return;
      if (finished) return;
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        setFlipped((f) => !f);
      } else if (e.key === "ArrowRight") goTo(pos + 1, "next");
      else if (e.key === "ArrowLeft") goTo(pos - 1, "prev");
      else if (e.key === "1") mark("review");
      else if (e.key === "2") mark("known");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [finished, goTo, mark, pos]);

  /* ---------- geser di HP ---------- */
  const dragRef = useRef(0);
  const onTouchStart = (e) => {
    touchX.current = e.touches[0].clientX;
    dragRef.current = 0;
  };
  const onTouchMove = (e) => {
    if (touchX.current === null) return;
    dragRef.current = e.touches[0].clientX - touchX.current;
    setDrag(dragRef.current);
  };
  const onTouchEnd = () => {
    const dx = dragRef.current;
    if (dx > 80) mark("known");
    else if (dx < -80) mark("review");
    dragRef.current = 0;
    setDrag(0);
    touchX.current = null;
  };

  const knownCount = order.filter((i) => status[i] === "known").length;
  const reviewCount = order.filter((i) => status[i] === "review").length;
  const remaining = order.length - pos;

  /* ================= RINGKASAN ================= */
  if (finished) {
    const pct = Math.round((knownCount / order.length) * 100);
    return (
      <section className="sd-enter-next mx-auto mt-8 max-w-2xl rounded-2xl border-2 border-[var(--ink-fixed)] bg-[var(--card)] px-6 py-10 text-center">
        <p className="hand text-3xl text-[var(--margin)]">{t.doneTitle}</p>
        <div className="relative mx-auto mt-2 flex h-36 w-44 items-center justify-center text-[var(--right)]">
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 96 80" fill="none" aria-hidden="true">
            <path d="M80 14C64 2 26 4 12 22C0 38 10 66 44 72C76 78 94 58 88 36C85 26 76 18 60 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span className="hand text-6xl leading-none">{pct}%</span>
        </div>
        <div className="mt-4 flex justify-center gap-3">
          <span className="rounded-lg bg-[var(--hl-green)] px-3 py-1.5 font-bold text-[var(--ink-fixed)]">
            <FontAwesomeIcon icon={faCheck} className="mr-1.5" />
            {knownCount} {t.knownLabel}
          </span>
          <span className="rounded-lg bg-[var(--hl-pink)] px-3 py-1.5 font-bold text-[var(--ink-fixed)]">
            <FontAwesomeIcon icon={faRotateLeft} className="mr-1.5" />
            {reviewCount} {t.reviewLabel}
          </span>
        </div>
        {reviewCount === 0 && <p className="mt-4 text-[var(--ink-soft)]">{t.perfect}</p>}
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          {reviewCount > 0 && (
            <button onClick={() => restart(true)} className="btn-ink h-11 px-5">
              <FontAwesomeIcon icon={faRotateLeft} />
              {t.againReview(reviewCount)}
            </button>
          )}
          <button
            onClick={() => restart(false)}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-[10px] border-2 border-[var(--rule)] px-5 font-bold hover:border-[var(--ink-soft)]"
          >
            <FontAwesomeIcon icon={faRotate} />
            {t.againAll}
          </button>
        </div>
      </section>
    );
  }

  /* ================= KARTU ================= */
  const dragStyle = drag ? { transform: `translateX(${drag}px) rotate(${drag / 25}deg)`, transition: "none" } : undefined;

  return (
    <div className="mt-6">
      {/* Bar progres per kartu */}
      <div className="flex items-center gap-3">
        <div className="flex h-2.5 flex-1 gap-[3px]" aria-hidden="true">
          {order.map((i, n) => (
            <span
              key={`${i}-${n}`}
              className={`h-full flex-1 rounded-full transition-colors ${
                status[i] === "known"
                  ? "bg-[var(--right)]"
                  : status[i] === "review"
                    ? "bg-[var(--hl-pink)]"
                    : n === pos
                      ? "bg-[var(--ink-btn)]"
                      : "bg-[var(--rule)]"
              }`}
            />
          ))}
        </div>
        <span className="shrink-0 text-sm font-bold whitespace-nowrap">
          {t.card} {pos + 1} {t.of} {order.length}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm">
        <div className="flex gap-2">
          <span className="rounded-md bg-[var(--hl-green)] px-2 py-0.5 font-bold text-[var(--ink-fixed)]">
            <FontAwesomeIcon icon={faCheck} className="mr-1" />
            {knownCount}
          </span>
          <span className="rounded-md bg-[var(--hl-pink)] px-2 py-0.5 font-bold text-[var(--ink-fixed)]">
            <FontAwesomeIcon icon={faRotateLeft} className="mr-1" />
            {reviewCount}
          </span>
        </div>
        <button onClick={doShuffle} className="inline-flex items-center gap-2 rounded-lg px-2 py-1 font-semibold text-[var(--ink-soft)] hover:bg-[var(--rule)] hover:text-[var(--ink)]">
          <FontAwesomeIcon icon={faShuffle} />
          {t.shuffle}
        </button>
      </div>

      {/* Tumpukan + kartu aktif */}
      <div className="relative mx-auto mt-6 max-w-3xl pb-6">
        {remaining > 2 && <span className="absolute inset-x-8 top-6 bottom-0 rounded-2xl border-2 border-[var(--rule)] bg-[var(--card)]" aria-hidden="true" />}
        {remaining > 1 && <span className="absolute inset-x-4 top-3 bottom-3 rounded-2xl border-2 border-[var(--rule)] bg-[var(--card)]" aria-hidden="true" />}

        <div
          key={`${cardIdx}-${pos}`}
          className={`relative sd-enter-${enter}`}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <button
            type="button"
            onClick={() => setFlipped((f) => !f)}
            aria-label={flipped ? t.question : t.answer}
            className="perspective-1000 block h-[22rem] w-full sm:h-[26rem]"
            style={dragStyle}
          >
            <div className={`transform-style-3d relative h-full w-full transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${flipped ? "rotate-y-180" : ""}`}>
              {/* Depan */}
              <div className="backface-hidden ruled absolute inset-0 flex flex-col overflow-hidden rounded-2xl border-2 border-[var(--ink-fixed)] bg-[var(--card)] text-[var(--ink)]">
                <div className="flex items-center justify-between px-6 pt-4">
                  <span className="hand text-2xl text-[var(--ink-soft)]">{t.question}</span>
                  <span className="hand text-2xl text-[var(--margin)]">#{cardIdx + 1}</span>
                </div>
                <span className="mt-2 h-0.5 bg-[var(--margin)] opacity-60" aria-hidden="true" />
                <div className="flex flex-1 items-center justify-center overflow-y-auto px-6 py-4 sm:px-12">
                  <p className={`text-center leading-snug font-extrabold ${sizeFor(card.frontText)}`}>{card.frontText}</p>
                </div>
                <p className="flex items-center justify-center gap-2 pb-4 text-sm font-semibold text-[var(--ink-soft)]">
                  <FontAwesomeIcon icon={faRotate} />
                  {t.flip}
                </p>
              </div>

              {/* Belakang */}
              <div className="backface-hidden rotate-y-180 absolute inset-0 flex flex-col overflow-hidden rounded-2xl border-2 border-[var(--ink-fixed)] bg-[var(--hl-yellow)] text-[var(--ink-fixed)]">
                <div className="flex items-center justify-between px-6 pt-4">
                  <span className="hand text-2xl opacity-70">{t.answer}</span>
                  <span className="hand text-2xl opacity-70">#{cardIdx + 1}</span>
                </div>
                <div className="flex flex-1 items-center justify-center overflow-y-auto px-6 pt-2 pb-8 sm:px-12">
                  <p className={`text-center leading-relaxed font-bold ${sizeFor(card.backText, true)}`}>{card.backText}</p>
                </div>
              </div>
            </div>
          </button>

          {/* Label saat digeser */}
          {drag !== 0 && (
            <span
              className={`hand pointer-events-none absolute top-6 rounded-lg border-2 px-3 py-1 text-2xl ${
                drag > 0 ? "right-6 rotate-12 border-[var(--right)] text-[var(--right)]" : "left-6 -rotate-12 border-[var(--wrong)] text-[var(--wrong)]"
              }`}
              style={{ opacity: Math.min(Math.abs(drag) / 80, 1) }}
            >
              {drag > 0 ? t.known : t.review}
            </span>
          )}
        </div>
      </div>

      {/* Penilaian diri */}
      <div className="mx-auto grid max-w-3xl grid-cols-2 gap-3">
        <button
          onClick={() => mark("review")}
          className="inline-flex h-14 items-center justify-center gap-2 rounded-xl border-2 border-[var(--wrong)] bg-[var(--card)] font-bold text-[var(--wrong)] transition-colors hover:bg-[var(--hl-pink)] hover:text-[var(--ink-fixed)] active:scale-[0.98]"
        >
          <FontAwesomeIcon icon={faXmark} />
          {t.review}
          <kbd className="ml-1 hidden rounded border border-current px-1.5 text-xs opacity-60 sm:inline">1</kbd>
        </button>
        <button
          onClick={() => mark("known")}
          className="inline-flex h-14 items-center justify-center gap-2 rounded-xl border-2 border-[var(--right)] bg-[var(--card)] font-bold text-[var(--right)] transition-colors hover:bg-[var(--hl-green)] hover:text-[var(--ink-fixed)] active:scale-[0.98]"
        >
          <FontAwesomeIcon icon={faCheck} />
          {t.known}
          <kbd className="ml-1 hidden rounded border border-current px-1.5 text-xs opacity-60 sm:inline">2</kbd>
        </button>
      </div>

      <div className="mx-auto mt-4 flex max-w-3xl items-center justify-between gap-3 text-sm">
        <button onClick={() => goTo(pos - 1, "prev")} disabled={pos === 0} className="inline-flex items-center gap-2 rounded-lg px-2 py-1.5 font-semibold text-[var(--ink-soft)] hover:text-[var(--ink)] disabled:opacity-40">
          <FontAwesomeIcon icon={faArrowLeft} />
          {t.prev}
        </button>
        <span className="hidden text-center text-[var(--ink-soft)] sm:block">{t.hint}</span>
        <span className="text-center text-[var(--ink-soft)] sm:hidden">
          <FontAwesomeIcon icon={faLayerGroup} className="mr-1" />
          {remaining} {t.left}
        </span>
        <button onClick={() => goTo(pos + 1, "next")} className="inline-flex items-center gap-2 rounded-lg px-2 py-1.5 font-semibold text-[var(--ink-soft)] hover:text-[var(--ink)]">
          {t.next}
          <FontAwesomeIcon icon={faArrowRight} />
        </button>
      </div>
      <p className="mt-2 text-center text-xs text-[var(--ink-soft)] sm:hidden">{t.swipe}</p>
    </div>
  );
}
