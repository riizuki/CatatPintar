"use client";

import { useState, useEffect } from "react";
import { faFolderPlus, faPen } from "@fortawesome/free-solid-svg-icons";
import { Modal, cls } from "../ui/kit";
import { useLanguage } from "../../../lib/contexts/LanguageContext";
import { dashboardTranslations } from "../../../locales/dashboard";

export default function FolderModal({ isOpen, onClose, onSave, editingFolder, isLoading }) {
  const { language } = useLanguage();
  const t = dashboardTranslations[language];
  const [name, setName] = useState("");

  useEffect(() => {
    setName(editingFolder ? editingFolder.name : "");
  }, [editingFolder, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ name, id: editingFolder ? editingFolder.id : null });
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      busy={isLoading}
      title={editingFolder ? t.folders.modal.editTitle : t.folders.modal.createTitle}
      icon={editingFolder ? faPen : faFolderPlus}
      iconClass="bg-[var(--hl-yellow)]"
    >
      <form onSubmit={handleSubmit} autoComplete="off">
        <label htmlFor="folder-name" className={cls.label}>
          {t.folders.modal.folderName}
        </label>
        <input
          id="folder-name"
          name="name"
          type="text"
          required
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={language === "id" ? "mis. Persiapan UTS" : "e.g. Midterm prep"}
          className={cls.input}
        />
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} disabled={isLoading} className={cls.btnOutline}>
            {t.folders.modal.cancel}
          </button>
          <button type="submit" disabled={isLoading} className="btn-ink h-10 px-5 text-sm disabled:opacity-60">
            {isLoading ? t.folders.modal.saving : editingFolder ? t.folders.modal.save : t.folders.modal.create}
          </button>
        </div>
      </form>
    </Modal>
  );
}
