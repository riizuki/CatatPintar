"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBookOpen, faCheck, faCloudArrowUp, faDownload,
  faFileArrowUp, faLayerGroup, faMagnifyingGlassChart, faPenToSquare, faRotateRight, faTrashCan,
  faTriangleExclamation, faWandMagicSparkles,
} from "@fortawesome/free-solid-svg-icons";
import ConfirmationModal from "../../components/dashboard/ConfirmationModal";
import { EmptyState, Modal, Page, PageHeader, Spinner, cls } from "../../components/ui/kit";
import { useLanguage } from "@/lib/contexts/LanguageContext";
import { dashboardTranslations } from "@/locales/dashboard";
import toast from "react-hot-toast";
import "./dropzone.css";

const STATUS_STYLE = {
  pending: "bg-[var(--rule)] text-[var(--ink-soft)]",
  processing: "bg-[var(--hl-blue)] text-[var(--ink-fixed)]",
  done: "bg-[var(--hl-green)] text-[var(--ink-fixed)]",
  failed: "bg-[var(--hl-pink)] text-[var(--ink-fixed)]",
};

function MaterialsContent() {
  const { language } = useLanguage();
  const t = dashboardTranslations[language];
  const router = useRouter();

  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  // 0: idle, 1: mengunggah, 2: membaca halaman, 3: memecah jadi poin, 4: selesai
  const [statusStep, setStatusStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [pointsModal, setPointsModal] = useState(null); // { title, points }
  const [busyAction, setBusyAction] = useState(null);

  const fetchHistory = async () => {
    try {
      const res = await fetch("/api/materials");
      if (res.ok) setHistory(await res.json());
    } catch (err) {
      console.error("Failed to load materials history", err);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const validateFile = (selectedFile) => {
    const extension = selectedFile.name.split(".").pop().toLowerCase();
    if (!["pdf", "ppt", "pptx"].includes(extension)) {
      toast.error(t.materials.errors.unsupportedType);
      return false;
    }
    if (selectedFile.size > 20 * 1024 * 1024) {
      toast.error(t.materials.errors.fileTooLarge);
      return false;
    }
    return true;
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped && validateFile(dropped)) {
      setFile(dropped);
      uploadAndProcess(dropped);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    const selected = e.target.files?.[0];
    if (selected && validateFile(selected)) {
      setFile(selected);
      uploadAndProcess(selected);
    }
  };

  /**
   * Dua langkah terpisah: unggah dulu (cepat), lalu ekstraksi poin (lama).
   * Dipisah supaya kegagalan ekstraksi tidak ikut membuang berkas yang
   * sudah berhasil diunggah — materinya tetap ada dan bisa diproses ulang.
   */
  const uploadAndProcess = async (selectedFile) => {
    setLoading(true);
    setStatusStep(1);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const uploadRes = await fetch("/api/materials", { method: "POST", body: formData });
      if (!uploadRes.ok) {
        const data = await uploadRes.json().catch(() => ({}));
        throw new Error(data.message || t.materials.errors.uploadFailed);
      }
      const material = await uploadRes.json();

      setStatusStep(2);
      await fetchHistory();

      const extracted = await runExtraction(material.id);

      setResult({
        materialId: material.id,
        title: material.title,
        pointCount: extracted.pointCount,
        pageCount: extracted.pageCount,
        extractMode: extracted.extractMode,
      });
      setStatusStep(4);
      setShowSuccessModal(true);
      toast.success(t.materials.successTitle);
      fetchHistory();
    } catch (err) {
      toast.error(err.message);
      setStatusStep(0);
      setFile(null);
      fetchHistory();
    } finally {
      setLoading(false);
    }
  };

  const runExtraction = async (materialId) => {
    setStatusStep(3);
    const res = await fetch(`/api/materials/${materialId}/extract`, { method: "POST" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || t.materials.errors.extractFailed);
    return data;
  };

  const retryExtraction = async (material) => {
    setBusyAction(`retry-${material.id}`);
    try {
      await fetch(`/api/materials/${material.id}/extract?force=true`, { method: "POST" }).then(
        async (res) => {
          const data = await res.json().catch(() => ({}));
          if (!res.ok) throw new Error(data.message || t.materials.errors.extractFailed);
          return data;
        },
      );
      toast.success(t.materials.successTitle);
      fetchHistory();
    } catch (err) {
      toast.error(err.message);
      fetchHistory();
    } finally {
      setBusyAction(null);
    }
  };

  /**
   * Jalur utama F0: buka catatan milik mahasiswa sendiri untuk materi ini.
   * `target` menentukan tujuannya — editor catatan, atau halaman celah (F2).
   */
  const openOwnNote = async (materialId, target = "edit") => {
    setBusyAction(`${target === "gaps" ? "gaps" : "note"}-${materialId}`);
    try {
      const res = await fetch(`/api/materials/${materialId}/note`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || t.materials.errors.noteFailed);

      setShowSuccessModal(false);
      router.push(
        target === "gaps"
          ? `/dashboard/notes/${data.id}/gaps`
          : `/dashboard/notes/${data.id}/edit?materialId=${materialId}`,
      );
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusyAction(null);
    }
  };

  /** Mode opsional: minta AI merangkum. Catatannya ditandai dan dikecualikan dari analisis celah. */
  const requestAiSummary = async (materialId) => {
    setBusyAction(`summary-${materialId}`);
    try {
      const res = await fetch(`/api/materials/${materialId}/summarize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || t.materials.errors.summaryFailed);

      setShowSuccessModal(false);
      router.push(`/dashboard/notes/${data.id}/edit`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusyAction(null);
    }
  };

  const openPoints = async (material) => {
    setBusyAction(`points-${material.id}`);
    try {
      const res = await fetch(`/api/materials/${material.id}?points=true`);
      if (!res.ok) throw new Error(t.materials.errors.extractFailed);
      const data = await res.json();
      setPointsModal({ title: data.title, points: data.points ?? [], extractMode: data.extractMode });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusyAction(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!toDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/materials/${toDelete.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success(language === "id" ? "Materi berhasil dihapus" : "Material deleted successfully");
      setHistory((prev) => prev.filter((item) => item.id !== toDelete.id));
      setToDelete(null);
    } catch {
      toast.error(language === "id" ? "Gagal menghapus materi" : "Failed to delete material");
    } finally {
      setIsDeleting(false);
    }
  };

  const resetUpload = () => {
    setStatusStep(0);
    setFile(null);
    setResult(null);
  };

  const steps = [t.materials.uploading, t.materials.parsing, t.materials.structuring];
  const busy = loading || statusStep !== 0;

  const groupedPoints = (pointsModal?.points ?? []).reduce((acc, point) => {
    (acc[point.page] ||= []).push(point);
    return acc;
  }, {});

  return (
    <Page wide>
      <ConfirmationModal
        isOpen={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={handleConfirmDelete}
        isMutating={isDeleting}
        title={language === "id" ? "Hapus materi" : "Delete material"}
      >
        <p>
          {language === "id" ? "Hapus materi" : "Delete"}{" "}
          <strong className="text-[var(--ink)]">{toDelete?.title}</strong>?
        </p>
        <p className="mt-2 text-sm text-[var(--ink-soft)]">
          {language === "id"
            ? "Catatan yang sudah kamu tulis tidak ikut terhapus."
            : "The notes you have written will not be deleted."}
        </p>
      </ConfirmationModal>

      <PageHeader title={t.materials.title} subtitle={t.materials.subtitle} />

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* ---------- Unggah ---------- */}
        <section className="lg:col-span-6">
          {!busy ? (
            <div
              role="button"
              tabIndex={0}
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => document.getElementById("file-input").click()}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && document.getElementById("file-input").click()}
              aria-label={`${t.materials.uploadArea.title}. ${t.materials.uploadArea.supportedTypes}`}
              className={`dropzone group ${dragActive ? "is-drag" : ""}`}
            >
              <input id="file-input" type="file" className="hidden" accept=".pdf,.ppt,.pptx" onChange={handleChange} />

              <span className="dz-tape hand" aria-hidden="true">{t.materials.uploadArea.tape}</span>

              <div className="dz-body">
                <span className="dz-icon" aria-hidden="true">
                  <FontAwesomeIcon icon={dragActive ? faCloudArrowUp : faFileArrowUp} />
                </span>
                <h2 className="mt-6 text-xl font-extrabold sm:text-2xl">
                  <span className="dz-mark">{dragActive ? t.materials.uploadArea.drop : t.materials.uploadArea.title}</span>
                </h2>
                <p className="mt-1.5 text-[var(--ink-soft)]">{t.materials.uploadArea.subtitle}</p>

                <span className="btn-ink mt-5 h-10 px-5 text-sm">
                  <FontAwesomeIcon icon={faCloudArrowUp} />
                  {t.materials.uploadArea.choose}
                </span>

                <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                  <span className="dz-chip bg-[var(--hl-pink)]">PDF</span>
                  <span className="dz-chip bg-[var(--hl-yellow)]">PPT</span>
                  <span className="dz-chip bg-[var(--hl-blue)]">PPTX</span>
                  <span className="hand ml-1 text-xl text-[var(--margin)]">{t.materials.uploadArea.maxSize}</span>
                </div>
                <p className="hand mt-3 text-lg text-[var(--ink-soft)]">
                  <FontAwesomeIcon icon={faPenToSquare} className="mr-1.5 text-sm" />
                  {t.materials.uploadArea.hint}
                </p>
              </div>
            </div>
          ) : (
            <div className={`flex min-h-[340px] flex-col justify-center p-8 ${cls.card}`}>
              <p className="truncate text-sm font-semibold text-[var(--ink-soft)]">{file?.name}</p>
              <h2 className="mt-1 text-xl font-extrabold">
                {statusStep === 4 ? t.materials.successTitle : steps[Math.max(0, statusStep - 1)]}
              </h2>

              <ol className="mt-6 space-y-4">
                {steps.map((label, i) => {
                  const n = i + 1;
                  const done = statusStep > n;
                  const active = statusStep === n;
                  return (
                    <li key={label} className="flex items-center gap-3">
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border-2 text-sm ${
                          done
                            ? "border-[var(--right)] bg-[var(--right)] text-white"
                            : active
                              ? "border-[var(--ink-fixed)] bg-[var(--hl-yellow)] text-[var(--ink-fixed)]"
                              : "border-[var(--rule)] text-[var(--ink-soft)]"
                        }`}
                      >
                        {done ? <FontAwesomeIcon icon={faCheck} /> : active ? <FontAwesomeIcon icon={faWandMagicSparkles} className="animate-pulse" /> : n}
                      </span>
                      <span className={`font-semibold ${done || active ? "" : "text-[var(--ink-soft)]"}`}>{label}</span>
                    </li>
                  );
                })}
              </ol>

              <div className="mt-6 h-2 overflow-hidden rounded-full bg-[var(--rule)]">
                <div
                  className="h-full rounded-full bg-[var(--ink-btn)] transition-[width] duration-700"
                  style={{ width: `${statusStep >= 4 ? 100 : statusStep * 30}%` }}
                />
              </div>

              {statusStep === 4 && (
                <div className="mt-6 flex flex-wrap gap-3">
                  {result && (
                    <button onClick={() => openOwnNote(result.materialId)} className="btn-ink h-10 px-5 text-sm">
                      <FontAwesomeIcon icon={faPenToSquare} />
                      {t.materials.actions.startNote}
                    </button>
                  )}
                  <button onClick={resetUpload} className={cls.btnOutline}>
                    <FontAwesomeIcon icon={faRotateRight} />
                    {language === "id" ? "Unggah materi lain" : "Upload another"}
                  </button>
                </div>
              )}
            </div>
          )}
        </section>

        {/* ---------- Riwayat ---------- */}
        <section className="lg:col-span-6">
          <h2 className="mb-4 flex items-center gap-2.5 text-xl font-extrabold tracking-tight">
            <FontAwesomeIcon icon={faBookOpen} className="text-base text-[var(--ink-soft)]" />
            {t.materials.history.title}
          </h2>

          {historyLoading ? (
            <Spinner />
          ) : history.length > 0 ? (
            <ul className="max-h-[520px] space-y-2 overflow-y-auto pr-1">
              {history.map((item) => (
                <li key={item.id}>
                  <div className={`group px-4 py-3 ${cls.card}`}>
                    <div className="flex items-center gap-3">
                      <span
                        className={`flex h-10 w-12 shrink-0 items-center justify-center rounded-lg text-xs font-extrabold uppercase text-[var(--ink-fixed)] ${
                          item.fileType === "pdf" ? "bg-[var(--hl-pink)]" : "bg-[var(--hl-yellow)]"
                        }`}
                      >
                        {item.fileType || "doc"}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-bold">{item.title}</span>
                        <span className="flex flex-wrap items-center gap-2 text-sm text-[var(--ink-soft)]">
                          <span className={`rounded px-1.5 py-0.5 text-xs font-bold ${STATUS_STYLE[item.status] ?? ""}`}>
                            {t.materials.status[item.status] ?? item.status}
                          </span>
                          {item.status === "done" && (
                            <span>
                              {item.pointCount} {t.materials.pointsFound}
                              {item.pageCount ? ` · ${item.pageCount} ${t.materials.pagesFound}` : ""}
                            </span>
                          )}
                        </span>
                      </span>

                      <a
                        href={`/api/materials/${item.id}/file?download=true`}
                        className={cls.iconBtn}
                        title={t.materials.actions.download}
                        aria-label={t.materials.actions.download}
                      >
                        <FontAwesomeIcon icon={faDownload} />
                      </a>
                      <button
                        onClick={() => setToDelete(item)}
                        className={`${cls.iconBtn} hover:!text-[var(--wrong)]`}
                        title={language === "id" ? "Hapus" : "Delete"}
                        aria-label={language === "id" ? "Hapus materi" : "Delete material"}
                      >
                        <FontAwesomeIcon icon={faTrashCan} />
                      </button>
                    </div>

                    {item.status === "failed" && item.errorReason && (
                      <p className="mt-2 flex items-start gap-2 rounded-lg bg-[var(--hl-pink)] px-3 py-2 text-sm text-[var(--ink-fixed)]">
                        <FontAwesomeIcon icon={faTriangleExclamation} className="mt-0.5 shrink-0" />
                        <span>{item.errorReason}</span>
                      </p>
                    )}

                    <div className="mt-3 flex flex-wrap gap-2">
                      {item.status === "done" ? (
                        <>
                          <button
                            onClick={() => openOwnNote(item.id)}
                            disabled={busyAction === `note-${item.id}`}
                            className="btn-ink h-9 px-4 text-sm disabled:opacity-60"
                          >
                            <FontAwesomeIcon icon={faPenToSquare} />
                            {item.noteCount > 0 ? t.materials.actions.continueNote : t.materials.actions.startNote}
                          </button>
                          {item.noteCount > 0 && (
                            <button
                              onClick={() => openOwnNote(item.id, "gaps")}
                              disabled={busyAction === `gaps-${item.id}`}
                              className={`${cls.btnOutline} h-9 text-sm disabled:opacity-60`}
                            >
                              <FontAwesomeIcon icon={faMagnifyingGlassChart} />
                              {t.materials.actions.checkGaps}
                            </button>
                          )}
                          <button
                            onClick={() => openPoints(item)}
                            disabled={busyAction === `points-${item.id}`}
                            className={`${cls.btnOutline} h-9 text-sm disabled:opacity-60`}
                          >
                            <FontAwesomeIcon icon={faLayerGroup} />
                            {t.materials.actions.viewPoints}
                          </button>
                          {/* Sebelumnya hanya muncul sekali di modal sesudah unggah. */}
                          <button
                            onClick={() => requestAiSummary(item.id)}
                            disabled={busyAction === `summary-${item.id}`}
                            title={t.materials.aiSummaryWarning}
                            className={`${cls.btnOutline} h-9 text-sm disabled:opacity-60`}
                          >
                            <FontAwesomeIcon
                              icon={busyAction === `summary-${item.id}` ? faRotateRight : faWandMagicSparkles}
                              className={busyAction === `summary-${item.id}` ? "animate-spin" : "text-amber-500"}
                            />
                            {t.materials.actions.aiSummary}
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => retryExtraction(item)}
                          disabled={busyAction === `retry-${item.id}` || item.status === "processing"}
                          className={`${cls.btnOutline} h-9 text-sm disabled:opacity-60`}
                        >
                          <FontAwesomeIcon icon={faRotateRight} />
                          {t.materials.actions.retry}
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState icon={faCloudArrowUp} title={t.materials.history.emptyTitle} text={t.materials.history.emptySubtitle} />
          )}
        </section>
      </div>

      {/* ---------- Modal sukses ---------- */}
      <Modal
        open={showSuccessModal && !!result}
        onClose={() => setShowSuccessModal(false)}
        title={t.materials.successTitle}
        icon={faCheck}
        iconClass="bg-[var(--hl-green)]"
        size="max-w-xl"
      >
        <p className="text-[var(--ink-soft)]">{t.materials.successSubtitle}</p>
        <p className="mt-4 truncate rounded-[10px] bg-[var(--hl-yellow)] px-4 py-3 font-bold text-[var(--ink-fixed)]">
          {result?.title}
        </p>
        <p className="mt-2 text-sm text-[var(--ink-soft)]">
          {result?.pointCount} {t.materials.pointsFound}
          {result?.pageCount ? ` · ${result.pageCount} ${t.materials.pagesFound}` : ""}
        </p>
        {result?.extractMode === "vision_pdf" && (
          <p className="mt-2 flex items-start gap-2 rounded-lg bg-[var(--hl-blue)] px-3 py-2 text-sm text-[var(--ink-fixed)]">
            <FontAwesomeIcon icon={faTriangleExclamation} className="mt-0.5 shrink-0" />
            <span>{t.materials.extractModeNote}</span>
          </p>
        )}

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            onClick={() => openOwnNote(result.materialId)}
            disabled={busyAction === `note-${result?.materialId}`}
            className="btn-ink h-12 justify-start px-4 disabled:opacity-60"
          >
            <FontAwesomeIcon icon={faPenToSquare} fixedWidth />
            {t.materials.actions.startNote}
          </button>
          <button
            onClick={() => openPoints({ id: result.materialId })}
            disabled={busyAction === `points-${result?.materialId}`}
            className={`${cls.btnOutline} h-12 justify-start disabled:opacity-60`}
          >
            <FontAwesomeIcon icon={faLayerGroup} fixedWidth className="text-sky-500" />
            {t.materials.actions.viewPoints}
          </button>
        </div>

        <div className="mt-4 border-t border-[var(--rule)] pt-4">
          <button
            onClick={() => requestAiSummary(result.materialId)}
            disabled={busyAction === `summary-${result?.materialId}`}
            className={`${cls.btnOutline} h-10 w-full justify-start text-sm disabled:opacity-60`}
          >
            <FontAwesomeIcon icon={faWandMagicSparkles} fixedWidth className="text-amber-500" />
            {t.materials.actions.aiSummary}
          </button>
          <p className="mt-2 text-xs text-[var(--ink-soft)]">{t.materials.aiSummaryWarning}</p>
        </div>
      </Modal>

      {/* ---------- Modal daftar poin ---------- */}
      <Modal
        open={!!pointsModal}
        onClose={() => setPointsModal(null)}
        title={t.materials.actions.viewPoints}
        icon={faLayerGroup}
        iconClass="bg-[var(--hl-blue)]"
        size="max-w-2xl"
      >
        <p className="truncate font-bold">{pointsModal?.title}</p>
        <p className="mt-1 text-sm text-[var(--ink-soft)]">
          {pointsModal?.points?.length ?? 0} {t.materials.pointsFound}
        </p>

        <div className="mt-4 max-h-[55vh] space-y-5 overflow-y-auto pr-1">
          {Object.entries(groupedPoints).map(([page, points]) => (
            <div key={page}>
              <h3 className="mb-2 text-sm font-extrabold uppercase tracking-wide text-[var(--ink-soft)]">
                {language === "id" ? "Halaman" : "Page"} {page}
              </h3>
              <ul className="space-y-2">
                {points.map((point) => (
                  <li key={point.id} className="rounded-lg border border-[var(--rule)] px-3 py-2">
                    <span className="mb-1 inline-block rounded bg-[var(--hl-yellow)] px-1.5 py-0.5 text-[11px] font-bold uppercase text-[var(--ink-fixed)]">
                      {point.pointType}
                    </span>
                    <p className="text-sm">{point.text}</p>
                    {point.sourceQuote && (
                      <p className="mt-1 border-l-2 border-[var(--rule)] pl-2 text-xs italic text-[var(--ink-soft)]">
                        “{point.sourceQuote}”
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Modal>
    </Page>
  );
}

export default function MaterialsPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <MaterialsContent />
    </Suspense>
  );
}
