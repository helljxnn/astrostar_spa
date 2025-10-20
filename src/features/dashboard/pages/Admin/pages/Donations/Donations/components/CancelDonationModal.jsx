import { useState } from "react";
import { FaBan } from "react-icons/fa";

const CancelDonationModal = ({ donation, onClose, onConfirm }) => {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!reason.trim()) {
      setError("Debes ingresar un motivo de anulación");
      return;
    }
    onConfirm(reason);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 font-questrial">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 relative animate-fadeIn">
        {/* ---------- Cerrar ---------- */}
        <button
          onClick={onClose}
          className="absolute top-5 right-6 text-primary-purple text-2xl hover:text-primary-blue transition-colors"
        >
          ✕
        </button>

        {/* ---------- Encabezado ---------- */}
        <h2 className="text-2xl font-bold text-sky-300 mb-2">
          Anular Donación
        </h2>
        <p className="text-gray-500 mb-6">
          ¿Estás seguro de que deseas anular la donación de{" "}
          <span className="font-semibold text-primary-blue">
            {donation.donorName}
          </span>
          ?
        </p>

        {/* ---------- Campo de texto ---------- */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Motivo de anulación <span className="text-red-500">*</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              setError("");
            }}
            placeholder="Escribe el motivo de la anulación..."
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-sky-300 resize-none"
            rows="4"
          />
          {error && (
            <p className="text-red-500 text-sm mt-1 transition-all">
              {error}
            </p>
          )}
        </div>

        {/* ---------- Botones ---------- */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors shadow-sm"
          >
            Cancelar
          </button>

          <button
            onClick={handleSubmit}
            className="px-5 py-2 rounded-lg flex items-center gap-2 bg-gradient-to-r from-sky-300 to-sky-400 hover:from-sky-400 hover:to-sky-500 text-white font-medium shadow-md transition-all duration-200 ease-in-out transform hover:scale-[1.03]"
          >
            <FaBan />
            Anular Donación
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancelDonationModal;
