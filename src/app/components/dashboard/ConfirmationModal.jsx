"use client";

import { faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";
import { Modal, cls } from "../ui/kit";
import { useLanguage } from "../../../lib/contexts/LanguageContext";
import { dashboardTranslations } from "../../../locales/dashboard";

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, children, isMutating }) => {
  const { language } = useLanguage();
  const t = dashboardTranslations[language];

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={title}
      icon={faTriangleExclamation}
      iconClass="bg-[var(--hl-pink)]"
      busy={isMutating}
      footer={
        <>
          <button type="button" onClick={onClose} disabled={isMutating} className={cls.btnOutline}>
            {t.confirmationModal.cancel}
          </button>
          <button type="button" onClick={onConfirm} disabled={isMutating} className={cls.btnDanger}>
            {isMutating ? t.confirmationModal.processing : t.confirmationModal.confirm}
          </button>
        </>
      }
    >
      <div className="text-[var(--ink-soft)]">{children}</div>
    </Modal>
  );
};

export default ConfirmationModal;
