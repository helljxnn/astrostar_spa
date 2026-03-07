import { useState, useRef, useEffect } from "react";
import { FaChevronDown, FaCheck } from "react-icons/fa";
import { showConfirmAlert } from "../../../../../../../../shared/utils/alerts";

const STATUS_FLOW = {
  Recibida: {
    order: 0,
    label: "Recibida",
    color: "bg-purple-100 text-purple-700",
  },
  EnProceso: {
    order: 1,
    label: "En proceso",
    color: "bg-purple-100 text-purple-700",
  },
  Verificada: {
    order: 2,
    label: "Verificada",
    color: "bg-purple-100 text-purple-700",
  },
  Ejecutada: {
    order: 3,
    label: "Ejecutada",
    color: "bg-gray-200 text-gray-700",
  },
  Anulada: {
    order: 4,
    label: "Anulada",
    color: "bg-red-100 text-red-700",
  },
};

const ALL_STATUSES = ["Recibida", "EnProceso", "Verificada", "Ejecutada"];

const StatusSelector = ({
  currentStatus,
  donationId,
  onStatusChange,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const statusInfo = STATUS_FLOW[currentStatus] || STATUS_FLOW.Recibida;
  const currentOrder = statusInfo.order;
  const isLocked = currentStatus === "Ejecutada";

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleStatusClick = async (newStatus) => {
    setIsOpen(false);

    const newStatusInfo = STATUS_FLOW[newStatus];
    const result = await showConfirmAlert(
      "Cambiar estado de donación",
      `¿Estás seguro de cambiar el estado a "${newStatusInfo.label}"? Esta acción no se puede deshacer.`,
      "Sí, cambiar",
      "Cancelar",
    );

    if (result.isConfirmed) {
      onStatusChange(donationId, newStatus);
    }
  };

  if (disabled || isLocked) {
    return (
      <span
        className={`inline-block px-3 py-1.5 rounded-full text-xs font-semibold ${statusInfo.color} min-w-[100px] text-center`}
      >
        {statusInfo.label}
      </span>
    );
  }

  return (
    <div ref={containerRef} className="relative inline-block min-w-[100px]">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-3 py-1.5 rounded-full text-xs font-semibold ${statusInfo.color} hover:opacity-80 transition-all flex items-center justify-center gap-2 cursor-pointer`}
      >
        {statusInfo.label}
        <FaChevronDown
          className={`text-xs transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 bg-white border-2 border-primary-purple/30 rounded-xl shadow-lg min-w-[150px] py-2">
          {ALL_STATUSES.map((status) => {
            const statusData = STATUS_FLOW[status];
            const isCurrent = status === currentStatus;
            const isPast = statusData.order < currentOrder;
            const isDisabled = isPast || isCurrent;

            return (
              <button
                key={status}
                type="button"
                onClick={() => !isDisabled && handleStatusClick(status)}
                disabled={isDisabled}
                className={`w-full px-4 py-2 text-left text-sm transition-colors flex items-center justify-between gap-2 ${
                  isDisabled
                    ? "opacity-40 cursor-not-allowed bg-gray-50"
                    : "hover:bg-primary-purple/10 cursor-pointer"
                } ${isCurrent ? "bg-primary-purple/5" : ""}`}
              >
                <span
                  className={`font-medium ${isDisabled ? "text-gray-400" : "text-gray-700"}`}
                >
                  {statusData.label}
                  {isCurrent && " (actual)"}
                </span>
                {!isDisabled && (
                  <FaCheck className="text-primary-purple text-xs" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StatusSelector;
