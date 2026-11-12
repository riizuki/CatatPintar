"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft, faArrowUpRightFromSquare, faCheck, faCircleCheck, faListCheck, faMagnifyingGlassChart,
  faPenToSquare, faRotateRight, faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";
import { EmptyState, Page, PageHeader, Spinner, cls } from "@/app/components/ui/kit";
import { useLanguage } from "@/lib/contexts/LanguageContext";
import { dashboardTranslations } from "@/locales/dashboard";
import toast from "react-hot-toast";

const OPEN_STATUSES = ["incorrect", "partial", "missing"];

const STATUS_STYLE = {
  covered: "bg-[var(--hl-green)] text-[var(--ink-fixed)]",
  partial: "bg-[var(--hl-yellow)] text-[var(--ink-fixed)]",
  incorrect: "bg-[var(--hl-pink)] text-[var(--ink-fixed)]",
  missing: "bg-[var(--rule)] text-[var(--ink)]",
  dismissed: "bg-[var(--hl-blue)] text-[var(--ink-fixed)]",
};

/** Urutan tampil: yang paling mendesak dulu. */
const STATUS_ORDER = { incorrect: 0, partial: 1, missing: 2, covered: 3, dismissed: 4 };

/**
 * F6 — kotak perbaikan untuk satu celah. Mahasiswa menulis SENDIRI tambahan
 * catatannya; sistem menyimpannya lalu memeriksa ulang poin itu saja.
 */
function RemediationBox({ gap, t, onDone }) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(null); // "save" | "recheck"
  const [feedback, setFeedback] = useState(null);

  const submit = async (withText) => {
    setBusy(withText ? "save" : "recheck");
    setFeedback(null);
    try {
      const res = await fetch(`/api/gaps/${gap.id}/remediate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(withText ? { text } : {}),
      });
      const payload = await res.json().catch(() => ({}));

      // Tulisan sudah tersimpan walau pemeriksaan gagal: kosongkan kotaknya
      // supaya tidak tertambah dua kali saat ia menekan tombol lagi.
      if (payload.noteSaved) setText("");
      if (!res.ok) throw new Error(payload.message || t.errors.remediateFailed);

      if (payload.closed) {
        toast.success(t.closedToast);
      } else {
        setFeedback(payload.gap?.aiReason ? `${payload.gap.aiReason} ${t.stillOpen}` : t.stillOpen);
      }
      await onDone(gap.id, payload.closed);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="mt-4 rounded-xl border-2 border-dashed border-[var(--rule)] p-4">
      <label htmlFor={`remediate-${gap.id}`} className="text-sm font-extrabold">
        {t.remediateTitle}
      </label>
      <textarea
        id={`remediate-${gap.id}`}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={t.remediatePlaceholder}
        rows={3}
        maxLength={2000}
        className="mt-2 w-full rounded-lg border-2 border-[var(--rule)] bg-transparent px-3 py-2 text-sm focus:border-[var(--ink-soft)] focus:outline-none"
      />
      {feedback && <p className="mt-2 rounded-lg bg-[var(--hl-yellow)] px-3 py-2 text-sm text-[var(--ink-fixed)]">{feedback}</p>}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          onClick={() => submit(true)}
          disabled={!text.trim() || busy !== null}
          className="btn-ink h-9 px-4 text-sm disabled:opacity-50"
        >
          <FontAwesomeIcon icon={busy === "save" ? faRotateRight : faCheck} className={busy === "save" ? "animate-spin" : ""} />
          {busy === "save" ? t.remediating : t.remediateSubmit}
        </button>
        <button
          onClick={() => submit(false)}
          disabled={busy !== null}
          className={`${cls.btnOutline} h-9 text-sm disabled:opacity-50`}
        >
          <FontAwesomeIcon icon={faRotateRight} className={busy === "recheck" ? "animate-spin" : ""} />
          {t.recheck}
        </button>
      </div>
      <p className="mt-2 text-xs text-[var(--ink-soft)]">{t.recheckHint}</p>
    </div>
  );
}

export default function NoteGapsPage() {
  const { language } = useLanguage();
  const t = dashboardTranslations[language].gaps;
  const params = useParams();
  const router = useRouter();
  const noteId = params.noteId;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [filter, setFilter] = useState("open");
  const [busyGap, setBusyGap] = useState(null);
  const [creatingQuiz, setCreatingQuiz] = useState(false);
  const [openBox, setOpenBox] = useState(null); // id celah yang kotak perbaikannya terbuka
  const [justClosed, setJustClosed] = useState([]); // tetap tampil di filter "open" sesaat setelah ditutup
  const [focusGapId, setFocusGapId] = useState(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/notes/${noteId}/gaps`);
      if (!res.ok) throw new Error(t.errors.loadFailed);
      setData(await res.json());
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [noteId, t.errors.loadFailed]);

  useEffect(() => {
    load();
  }, [load]);

  // Datang dari jawaban salah di kuis celah: buka langsung kotak perbaikannya.
  useEffect(() => {
    const id = Number.parseInt(new URLSearchParams(window.location.search).get("gap"), 10);
    if (Number.isInteger(id)) {
      setFocusGapId(id);
      setOpenBox(id);
    }
  }, []);

  useEffect(() => {
    if (!data || !focusGapId) return;
    const target = data.gaps.find((g) => g.id === focusGapId);
    if (!target) return;
    if (!OPEN_STATUSES.includes(target.status)) setFilter("all");
    requestAnimationFrame(() =>
      document.getElementById(`gap-${focusGapId}`)?.scrollIntoView({ behavior: "smooth", block: "center" }),
    );
  }, [data, focusGapId]);

  const onRemediated = async (gapId, closed) => {
    if (closed) {
      setJustClosed((prev) => [...prev, gapId]);
      setOpenBox(null);
    }
    await load();
  };

  const analyze = async () => {
    setAnalyzing(true);
    try {
      const res = await fetch(`/api/notes/${noteId}/gaps`, { method: "POST" });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload.message || t.errors.analyzeFailed);
      setData(payload);
      setFilter("open");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  /** F3 — buat kuis yang soalnya HANYA dari celah terbuka. */
  const createGapQuiz = async () => {
    setCreatingQuiz(true);
    try {
      const res = await fetch(`/api/notes/${noteId}/gap-quiz`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload.message || t.errors.quizFailed);
      router.push(`/dashboard/quiz/${payload.quizId}`);
    } catch (err) {
      toast.error(err.message);
      setCreatingQuiz(false);
    }
  };

  const toggleDismiss = async (gap) => {
    const action = gap.status === "dismissed" ? "undismiss" : "dismiss";
    setBusyGap(gap.id);
    try {
      const res = await fetch(`/api/gaps/${gap.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) throw new Error(t.errors.dismissFailed);
      await load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusyGap(null);
    }
  };

  if (loading) return <Spinner />;
  if (!data) return null;

  const { summary, gaps, note, material } = data;
  const openCount = summary.incorrect + summary.partial + summary.missing;

  const visible = gaps
    .filter((gap) => {
      if (filter === "all") return true;
      if (filter === "open") return OPEN_STATUSES.includes(gap.status) || justClosed.includes(gap.id);
      return gap.status === filter;
    })
    .sort(
      (a, b) =>
        (STATUS_ORDER[a.status] ?? 9) - (STATUS_ORDER[b.status] ?? 9) ||
        a.point.page - b.point.page ||
        a.point.orderIndex - b.point.orderIndex,
    );

  const filters = [
    { key: "open", label: t.filters.open, count: openCount },
    { key: "covered", label: t.filters.covered, count: summary.covered },
    { key: "dismissed", label: t.filters.dismissed, count: summary.dismissed },
    { key: "all", label: t.filters.all, count: summary.total },
  ];

  return (
    <Page wide>
      <PageHeader
        title={t.title}
        subtitle={material ? `${note.title} · ${material.title}` : t.subtitle}
        action={
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => router.push(`/dashboard/notes/${noteId}/edit`)}
              className={`${cls.btnOutline} h-10 text-sm`}
            >
              <FontAwesomeIcon icon={faArrowLeft} />
              {t.backToNote}
            </button>
            <button onClick={analyze} disabled={analyzing} className="btn-ink h-10 px-5 text-sm disabled:opacity-60">
              <FontAwesomeIcon icon={data.analyzed ? faRotateRight : faMagnifyingGlassChart} className={analyzing ? "animate-spin" : ""} />
              {data.analyzed ? t.reanalyze : t.analyze}
            </button>
          </div>
        }
      />

      {analyzing && (
        <p className="mt-6 flex items-center gap-2 rounded-xl bg-[var(--hl-blue)] px-4 py-3 font-semibold text-[var(--ink-fixed)]">
          <FontAwesomeIcon icon={faRotateRight} className="animate-spin" />
          {t.analyzing}
        </p>
      )}

      {!data.analyzed && !analyzing ? (
        <div className="mt-8">
          <EmptyState icon={faMagnifyingGlassChart} title={t.emptyTitle} text={t.emptySubtitle}>
            <button onClick={analyze} className="btn-ink h-11 px-6">
              <FontAwesomeIcon icon={faMagnifyingGlassChart} />
              {t.analyze}
            </button>
          </EmptyState>
        </div>
      ) : (
        <>
          {/* ---------- Skor kelengkapan ---------- */}
          <section className={`mt-8 flex flex-wrap items-center gap-6 p-6 ${cls.card}`}>
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-[var(--ink-soft)]">{t.coverage}</p>
              <p className="text-4xl font-extrabold">{summary.score}%</p>
              <p className="text-sm text-[var(--ink-soft)]">
                {t.ofPoints.replace("{total}", summary.total)}
              </p>
              {data.history?.length >= 2 && (() => {
                const first = data.history[0].score;
                const last = data.history[data.history.length - 1].score;
                const delta = Math.round((last - first) * 10) / 10;
                return (
                  <div className="mt-2 text-sm">
                    <p className="font-semibold text-[var(--ink-soft)]">{t.history}</p>
                    <p className="font-bold">
                      {data.history.slice(-5).map((h) => `${h.score}%`).join(" → ")}
                    </p>
                    <p className={delta >= 0 ? "text-[var(--right)]" : "text-[var(--wrong)]"}>
                      {t.sinceFirst.replace("{delta}", `${delta >= 0 ? "+" : ""}${delta}`)}
                    </p>
                  </div>
                );
              })()}
            </div>

            <div className="h-14 w-px bg-[var(--rule)]" aria-hidden="true" />

            {openCount > 0 && (
              <button
                onClick={createGapQuiz}
                disabled={creatingQuiz || analyzing}
                className="btn-ink order-last h-11 px-5 disabled:opacity-60 sm:order-none sm:ml-auto"
              >
                <FontAwesomeIcon icon={creatingQuiz ? faRotateRight : faListCheck} className={creatingQuiz ? "animate-spin" : ""} />
                {creatingQuiz ? t.creatingQuiz : t.createQuiz.replace("{n}", Math.min(openCount, 10))}
              </button>
            )}

            <ul className="flex flex-wrap gap-2">
              {["covered", "partial", "incorrect", "missing", "dismissed"].map((status) => (
                <li
                  key={status}
                  className={`rounded-lg px-3 py-1.5 text-sm font-bold ${STATUS_STYLE[status]}`}
                >
                  {summary[status]} {t.status[status]}
                </li>
              ))}
            </ul>
          </section>

          <p className="mt-3 flex items-start gap-2 text-sm text-[var(--ink-soft)]">
            <FontAwesomeIcon icon={faTriangleExclamation} className="mt-0.5 shrink-0" />
            <span>{t.disclaimer}</span>
          </p>

          {/* ---------- Filter ---------- */}
          <div className="mt-6 flex flex-wrap gap-2">
            {filters.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`rounded-lg border-2 px-3 py-1.5 text-sm font-bold ${
                  filter === f.key
                    ? "border-[var(--ink-fixed)] bg-[var(--hl-yellow)] text-[var(--ink-fixed)]"
                    : "border-[var(--rule)] text-[var(--ink-soft)]"
                }`}
              >
                {f.label} ({f.count})
              </button>
            ))}
          </div>

          {/* ---------- Daftar celah ---------- */}
          {visible.length === 0 ? (
            <div className="mt-6">
              <EmptyState
                icon={faCircleCheck}
                title={filter === "open" ? t.allCoveredTitle : t.emptyTitle}
                text={filter === "open" ? t.allCoveredSubtitle : t.emptySubtitle}
              />
            </div>
          ) : (
            <ul className="mt-6 space-y-3">
              {visible.map((gap) => (
                <li
                  key={gap.id}
                  id={`gap-${gap.id}`}
                  className={`p-5 ${cls.card} ${focusGapId === gap.id ? "ring-2 ring-[var(--ink-soft)]" : ""}`}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-lg px-2.5 py-1 text-xs font-extrabold uppercase ${STATUS_STYLE[gap.status]}`}>
                      {t.status[gap.status]}
                    </span>
                    <span className="rounded bg-[var(--rule)] px-2 py-0.5 text-xs font-bold">
                      {t.page} {gap.point.page}
                    </span>
                    <span className="text-xs font-bold uppercase text-[var(--ink-soft)]">{gap.point.pointType}</span>
                    {gap.confidence != null && (
                      <span className="text-xs text-[var(--ink-soft)]">
                        {Math.round(gap.confidence * 100)}% {t.confidence}
                      </span>
                    )}
                    {gap.status === "covered" && gap.closedAt && (
                      <span className="rounded bg-[var(--hl-green)] px-2 py-0.5 text-xs font-bold text-[var(--ink-fixed)]">
                        <FontAwesomeIcon icon={faCheck} className="mr-1" />
                        {t.closedBadge}
                        {gap.remediationAttempts > 0 && ` · ${t.attempts.replace("{n}", gap.remediationAttempts)}`}
                      </span>
                    )}
                  </div>

                  <p className="mt-3 font-bold">{gap.point.text}</p>

                  {gap.aiReason && (
                    <p className="mt-1.5 text-sm text-[var(--ink-soft)]">{gap.aiReason}</p>
                  )}

                  {/* Panel bukti: slide di kiri, catatan mahasiswa di kanan. */}
                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="rounded-lg border border-[var(--rule)] p-3">
                      <p className="mb-1 text-xs font-extrabold uppercase tracking-wide text-[var(--ink-soft)]">
                        {t.slideEvidence}
                      </p>
                      <p className="text-sm italic">
                        {gap.point.sourceQuote ? `“${gap.point.sourceQuote}”` : gap.point.text}
                      </p>
                    </div>
                    <div className="rounded-lg border border-[var(--rule)] p-3">
                      <p className="mb-1 text-xs font-extrabold uppercase tracking-wide text-[var(--ink-soft)]">
                        {t.noteEvidence}
                      </p>
                      <p className={`text-sm ${gap.noteEvidence ? "italic" : "text-[var(--ink-soft)]"}`}>
                        {gap.noteEvidence ? `“${gap.noteEvidence}”` : t.noNoteEvidence}
                      </p>
                    </div>
                  </div>

                  {gap.status === "dismissed" && (
                    <p className="mt-3 flex items-center gap-2 text-sm text-[var(--ink-soft)]">
                      <FontAwesomeIcon icon={faCheck} />
                      {t.dismissedNote}
                    </p>
                  )}

                  <div className="mt-4 flex flex-wrap gap-2">
                    {OPEN_STATUSES.includes(gap.status) && (
                      <button
                        onClick={() => setOpenBox(openBox === gap.id ? null : gap.id)}
                        className={`${openBox === gap.id ? "btn-ink px-4" : cls.btnOutline} h-9 text-sm`}
                      >
                        <FontAwesomeIcon icon={faPenToSquare} />
                        {t.remediate}
                      </button>
                    )}
                    {material?.fileType === "pdf" && OPEN_STATUSES.includes(gap.status) && (
                      <a
                        href={`/api/materials/${material.id}/file#page=${gap.point.page}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`${cls.btnOutline} h-9 text-sm`}
                      >
                        <FontAwesomeIcon icon={faArrowUpRightFromSquare} />
                        {t.openSlide.replace("{page}", gap.point.page)}
                      </a>
                    )}
                    {gap.status !== "covered" && (
                      <button
                        onClick={() => toggleDismiss(gap)}
                        disabled={busyGap === gap.id}
                        className={`${cls.btnOutline} h-9 text-sm disabled:opacity-60`}
                      >
                        <FontAwesomeIcon icon={gap.status === "dismissed" ? faRotateRight : faCheck} />
                        {gap.status === "dismissed" ? t.undismiss : t.dismiss}
                      </button>
                    )}
                  </div>

                  {openBox === gap.id && OPEN_STATUSES.includes(gap.status) && (
                    <RemediationBox gap={gap} t={t} onDone={onRemediated} />
                  )}
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </Page>
  );
}
