"use client";

import { XMarkIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, children, isMutating }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm sm:max-w-md p-6 sm:p-8 bg-white rounded-2xl shadow-xl">
        <div className="flex justify-between items-start">
          <div className="flex items-center">
            <div className="mr-4 flex-shrink-0 flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-red-100">
                <ExclamationTriangleIcon className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" aria-hidden="true" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-black">{title}</h2>
          </div>
          <button onClick={onClose} disabled={isMutating} className="p-1 rounded-full hover:bg-gray-100">
            <XMarkIcon className="w-6 h-6 text-gray-500" />
          </button>
        </div>
        <div className="mt-4 text-sm sm:text-base text-black">
            {children}
        </div>
        <div className="mt-8 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-4">
          <button
            onClick={onClose}
            disabled={isMutating}
            className="w-full sm:w-auto mt-2 sm:mt-0 px-4 py-2 text-sm font-medium text-black bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            disabled={isMutating}
            className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
          >
            {isMutating ? "Memproses..." : "Konfirmasi"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
