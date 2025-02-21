import React from "react";

function Modal({ isOpen, onClose, onConfirm, title, message, confirmText, cancelText, icon }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <div className="flex items-center mb-4">
          {icon && <span className="text-red-500 text-3xl mr-2">{icon}</span>}
          <h2 className="text-xl font-bold">{title}</h2>
        </div>
        <p className="text-gray-700">{message}</p>
        <div className="mt-4 flex justify-end space-x-2">
          <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">
            {cancelText || "Cancel"}
          </button>
          <button onClick={onConfirm} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700">
            {confirmText || "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Modal;
