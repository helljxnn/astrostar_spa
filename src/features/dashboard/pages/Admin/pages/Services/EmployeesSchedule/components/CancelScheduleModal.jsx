import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaExclamationTriangle, FaStickyNote } from "react-icons/fa";
import { useState, useEffect } from "react";

const CANCEL_TYPES = {
  FULL_DAY: "full",
  TIME_RANGE: "time",
};


const cancelOptions = [
  {
    id: CANCEL_TYPES.FULL_DAY,
    title: "Todo el dia",
    description: "Registra la novedad sobre el turno completo",
  },
  {
    id: CANCEL_TYPES.TIME_RANGE,
    title: "Por tramo",
    description: "Registra una novedad para una franja especifica",
  },
];


const CancelScheduleModal = ({ isOpen, onClose, onConfirm, employee }) => {
  const [novedadReason, setNovedadReason] = useState("");
  const [cancelType, setCancelType] = useState(CANCEL_TYPES.FULL_DAY);
  const [timeRangeStart, setTimeRangeStart] = useState("");
  const [timeRangeEnd, setTimeRangeEnd] = useState("");
  const [timeExplanation, setTimeExplanation] = useState("");
  const [error, setError] = useState("");
  const [timeError, setTimeError] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setNovedadReason("");
      setError("");
      setCancelType(CANCEL_TYPES.FULL_DAY);
      setTimeRangeStart("");
      setTimeRangeEnd("");
      setTimeExplanation("");
      setTimeError("");
      return;
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !employee) return;
    setTimeRangeStart(employee.horaInicio || "");
    setTimeRangeEnd(employee.horaFin || "");
    setTimeExplanation("");
    setTimeError("");
  }, [employee, isOpen]);

  if (!isOpen || !employee) return null;

  const handleSubmit = () => {
    if (cancelType === CANCEL_TYPES.TIME_RANGE) {
      if (!timeRangeStart || !timeRangeEnd) {
        setTimeError("Debes indicar la ventana horaria completa");
        return;
      }
      if (!timeExplanation.trim()) {
        setTimeError("Explica la novedad en ese intervalo");
        return;
      }
    } else if (!novedadReason.trim()) {
      setError("El motivo de la novedad es obligatorio");
      return;
    }

    const explanation = cancelType === CANCEL_TYPES.TIME_RANGE ? timeExplanation.trim() : novedadReason.trim();

    const finalReason =
      cancelType === CANCEL_TYPES.TIME_RANGE
        ? `Novedad parcial (${timeRangeStart} - ${timeRangeEnd}): ${explanation}`
        : `Novedad todo el dia: ${explanation}`;

    const novedadPayload = {
      motivoCancelacion: finalReason,
      tipoCancelacion: cancelType,
      tiempoCancelacion:
        cancelType === CANCEL_TYPES.TIME_RANGE
          ? `${timeRangeStart} - ${timeRangeEnd}`
          : "Todo el dia",
      explicacionTiempo: cancelType === CANCEL_TYPES.TIME_RANGE ? explanation : "",
    };

    onConfirm({
      ...employee,
      motivoCancelacion: finalReason,
      cancelPayload: novedadPayload,
    });

    setNovedadReason("");
    setError("");
    setCancelType(CANCEL_TYPES.FULL_DAY);
    setTimeRangeStart("");
    setTimeRangeEnd("");
    setTimeExplanation("");
    setTimeError("");
    onClose();
  };

  const isSubmitDisabled =
    cancelType === CANCEL_TYPES.TIME_RANGE
      ? !timeExplanation.trim()
      : !novedadReason.trim();

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
          onClick={handleOverlayClick}
        >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-xl mx-4 border border-gray-100 flex flex-col max-h-[90vh]"
          onClick={(e) => e.stopPropagation()}
        >
            <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-[#6C7EFF] to-[#8AD7FF] text-white">
            <div className="flex items-center gap-3">
                <FaStickyNote className="w-5 h-5" />
                <div>
                  <p className="text-xs uppercase tracking-wide opacity-80">
                    Crear novedad
                  </p>
                  <p className="text-lg font-semibold">Registrar novedad</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-full transition"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-5 flex-1 min-h-0 overflow-y-auto">
              <div className="p-4 rounded-xl border border-gray-100 bg-gray-50 text-sm text-gray-700">
                <p>
                  ¿Deseas registrar una novedad para el horario de{" "}
                  <span className="font-semibold">{employee.empleado}</span>
                  {employee.cargo ? ` (${employee.cargo})` : ""} el{" "}
                  <span className="font-semibold">{employee.fecha}</span>?
                </p>
                {employee.hora && (
                  <p className="text-xs text-gray-600 mt-1">Hora: {employee.hora}</p>
                )}
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Tipo de novedad
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {cancelOptions.map((option) => {
                    const isSelected = cancelType === option.id;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => {
                          setCancelType(option.id);
                          setTimeError("");
                        }}
                        className={`flex flex-col gap-1 rounded-2xl border px-4 py-3 text-left text-sm transition ${
                          isSelected
                            ? "border-primary-purple bg-primary-purple/10 shadow"
                            : "border-gray-200 bg-white hover:border-gray-300"
                        }`}
                      >
                        <span className="font-medium text-gray-900">
                          {option.title}
                        </span>
                        <span className="text-xs text-gray-500">
                          {option.description}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {cancelType === CANCEL_TYPES.TIME_RANGE ? (
                <div className="space-y-3 rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Registra un tramo del turno
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="text-xs font-semibold text-gray-500">
                      Desde
                      <input
                        type="time"
                        value={timeRangeStart}
                        onChange={(e) => {
                          setTimeRangeStart(e.target.value);
                          if (timeError) setTimeError("");
                        }}
                        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#7B61FF] focus:ring-2 focus:ring-[#7B61FF] focus:outline-none"
                      />
                    </label>
                    <label className="text-xs font-semibold text-gray-500">
                      Hasta
                      <input
                        type="time"
                        value={timeRangeEnd}
                        onChange={(e) => {
                          setTimeRangeEnd(e.target.value);
                          if (timeError) setTimeError("");
                        }}
                        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#7B61FF] focus:ring-2 focus:ring-[#7B61FF] focus:outline-none"
                      />
                    </label>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2">
                      Explicacion del intervalo <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={timeExplanation}
                      onChange={(e) => {
                        setTimeExplanation(e.target.value);
                        if (timeError) setTimeError("");
                      }}
                      placeholder="Describe la novedad y como impacta este tramo..."
                      rows={4}
                      className={`w-full px-4 py-3 rounded-lg border text-sm focus:ring-2 focus:outline-none transition ${
                        timeError
                          ? "border-red-300 focus:ring-red-400 focus:border-red-400"
                          : "border-gray-300 focus:ring-[#7B61FF] focus:border-[#7B61FF]"
                      }`}
                    />
                    {timeError && (
                      <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
                        <FaExclamationTriangle className="w-3 h-3" />
                        {timeError}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      El detalle se usara como motivo de la novedad para ese tramo.
                    </p>
                  </div>
                  <div className="text-xs text-gray-500">
                    Estado actual:{" "}
                    <strong className="text-gray-700">
                      {employee.estado || "Programado"}
                    </strong>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Motivo de la novedad <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={novedadReason}
                    onChange={(e) => {
                      setNovedadReason(e.target.value);
                      if (error) setError("");
                    }}
                    placeholder="Describa la novedad..."
                    rows={5}
                    className={`w-full px-4 py-3 rounded-lg border text-sm focus:ring-2 focus:outline-none transition ${
                      error
                        ? "border-red-300 focus:ring-red-400 focus:border-red-400"
                        : "border-gray-300 focus:ring-[#7B61FF] focus:border-[#7B61FF]"
                    }`}
                  />
                  {error && (
                    <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
                      <FaExclamationTriangle className="w-3 h-3" />
                      {error}
                    </p>
                  )}
                  <div className="flex justify-between items-center text-xs text-gray-500 mt-2">
                    <span>{novedadReason.length} caracteres</span>
                    <span>
                      Estado actual:{" "}
                      <strong className="text-gray-700">
                        {employee.estado || "Programado"}
                      </strong>
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg font-medium text-sm transition hover:bg-gray-100"
              >
                Cerrar
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitDisabled}
                className="px-5 py-2.5 bg-gradient-to-r from-[#6C7EFF] to-[#5B8DEF] text-white rounded-lg font-semibold text-sm transition disabled:opacity-50 disabled:cursor-not-allowed shadow"
              >
                Registrar novedad
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CancelScheduleModal;
