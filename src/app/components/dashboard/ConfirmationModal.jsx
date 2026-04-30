"use client";

import { XMarkIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, children, isMutating }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-md p-4 transition-all">
      <div className="w-full max-w-sm sm:max-w-md p-6 sm:p-8 bg-white dark:bg-gray-800 rounded-3xl border border-gray-200/50 dark:border-gray-700/50">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center">
            <div className="mr-4 flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-2xl bg-rose-50 dark:bg-rose-900/20">
                <ExclamationTriangleIcon className="h-6 w-6 text-rose-600 dark:text-rose-400" aria-hidden="true" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
          </div>
          <button onClick={onClose} disabled={isMutating} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <XMarkIcon className="w-6 h-6 text-gray-500 dark:text-gray-400" />
          </button>
        </div>
        <div className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
            {children}
        </div>
        <div className="mt-8 flex flex-col-reverse sm:flex-row sm:justify-end gap-3 sm:space-x-4">
          <button
            onClick={onClose}
            disabled={isMutating}
            className="w-full sm:w-auto px-6 py-2.5 text-sm font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 transition-all"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            disabled={isMutating}
            className="w-full sm:w-auto px-6 py-2.5 text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl disabled:opacity-50 transition-all transform hover:-translate-y-0.5"
          >
            {isMutating ? "Memproses..." : "Konfirmasi"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
