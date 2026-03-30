import { motion, AnimatePresence } from "framer-motion";
import { FaEdit, FaTrash, FaEye } from "react-icons/fa";
import { Package } from "lucide-react";
import { createPortal } from "react-dom";

const EventActionModal = ({
  isOpen,
  onClose,
  onAction,
  position,
  eventStatus,
  event,
}) => {
  if (!isOpen) {
    return null;
  }

  // Verificar si el evento está finalizado
  const isFinalized =
    eventStatus === "Finalizado" || eventStatus === "finalizado";

  // Verificar si el evento está cancelado y ya pasó su fecha
  const isCancelledAndPassed = () => {
    if (
      !event ||
      (eventStatus !== "Cancelado" && eventStatus !== "cancelado")
    ) {
      return false;
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Obtener la fecha de fin del evento
    const eventEndDate = event.end
      ? new Date(event.end)
      : new Date(event.start);
    const endDateOnly = new Date(
      eventEndDate.getFullYear(),
      eventEndDate.getMonth(),
      eventEndDate.getDate(),
    );

    // Verificar si el evento ya pasó su fecha
    return endDateOnly < today;
  };

  // Verificar si el evento se puede eliminar
  const canDeleteEvent = () => {
    const dashboardEvent = event?.extendedProps?.dashboardEvent || event;
    const estadoRaw =
      dashboardEvent?.estadoOriginal ||
      dashboardEvent?.estado ||
      dashboardEvent?.status ||
      eventStatus ||
      "";
    const estado = String(estadoRaw).toLowerCase().replace(/[\s-]+/g, "_");
    const participantCount =
      dashboardEvent?.participants?.length ||
      dashboardEvent?._count?.participants ||
      0;
    const hasRegistrations = Boolean(dashboardEvent?.hasRegistrations);
    const materialCount =
      dashboardEvent?.donationMaterialsCount ??
      dashboardEvent?._count?.eventMaterials ??
      dashboardEvent?.eventMaterials?.length ??
      0;

    // No se puede eliminar si está en curso o finalizado
    if (estado === "en_curso" || estado === "finalizado") {
      return false;
    }

    // No se puede eliminar si tiene inscritos
    if (participantCount > 0 || hasRegistrations) {
      return false;
    }

    // No se puede eliminar si tiene materiales asignados
    if (materialCount > 0) {
      return false;
    }

    return true;
  };

  // Obtener mensaje de por qué no se puede eliminar
  const getDeleteDisabledReason = () => {
    const dashboardEvent = event?.extendedProps?.dashboardEvent || event;
    const estadoRaw =
      dashboardEvent?.estadoOriginal ||
      dashboardEvent?.estado ||
      dashboardEvent?.status ||
      eventStatus ||
      "";
    const estado = String(estadoRaw).toLowerCase().replace(/[\s-]+/g, "_");
    const participantCount =
      dashboardEvent?.participants?.length ||
      dashboardEvent?._count?.participants ||
      0;
    const hasRegistrations = Boolean(dashboardEvent?.hasRegistrations);
    const materialCount =
      dashboardEvent?.donationMaterialsCount ??
      dashboardEvent?._count?.eventMaterials ??
      dashboardEvent?.eventMaterials?.length ??
      0;

    if (estado === "en_curso") {
      return "No se puede eliminar un evento en curso";
    }

    if (estado === "finalizado") {
      return "No se puede eliminar un evento finalizado";
    }

    if (participantCount > 0 || hasRegistrations) {
      const inscritos = participantCount > 0 ? participantCount : 1;
      return `No se puede eliminar: tiene ${inscritos} inscrito(s)`;
    }

    if (materialCount > 0) {
      return `No se puede eliminar: tiene ${materialCount} material(es) comprometido(s) con donante(s)`;
    }

    return "";
  };

  const cannotEdit = isFinalized || isCancelledAndPassed();
  const cannotDelete = !canDeleteEvent();
  const deleteDisabledReason = getDeleteDisabledReason();

  const allActions = [
    {
      id: "edit",
      label: "Editar evento",
      icon: <FaEdit className="w-4 h-4" />,
      color: "text-blue-600",
      hoverColor: "hover:bg-blue-50",
      showWhen: !cannotEdit,
      disabled: false,
    },
    {
      id: "materials",
      label: "Gestionar materiales",
      icon: <Package className="w-4 h-4" />,
      color: "text-primary-pink",
      hoverColor: "hover:bg-pink-50",
      showWhen: true,
      disabled: false,
    },
    {
      id: "delete",
      label: "Eliminar evento",
      icon: <FaTrash className="w-4 h-4" />,
      color: cannotDelete ? "text-gray-400" : "text-red-600",
      hoverColor: cannotDelete ? "" : "hover:bg-red-50",
      showWhen: true,
      disabled: cannotDelete,
      disabledReason: deleteDisabledReason,
    },
    {
      id: "view",
      label: "Ver detalles del evento",
      icon: <FaEye className="w-4 h-4" />,
      color: "text-gray-600",
      hoverColor: "hover:bg-gray-50",
      showWhen: true,
      disabled: false,
    },
  ];

  // Filtrar acciones según el estado del evento
  const actions = allActions.filter((action) => action.showWhen);

  const modalContent = (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-[9998]"
        onClick={onClose}
        style={{
          pointerEvents: "auto",
          zIndex: 9999998,
          backgroundColor: "transparent",
        }}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -10 }}
        transition={{ duration: 0.15, ease: "easeOut" }}
        className="fixed z-[9999] bg-white rounded-xl shadow-2xl border border-gray-200 min-w-[220px] max-w-[280px]"
        style={{
          top: position?.top || "50%",
          left: position?.left || "50%",
          transform: position ? "none" : "translate(-50%, -50%)",
          pointerEvents: "auto",
          zIndex: 9999999,
          position: "fixed",
        }}
      >
        <div className="p-2">
          <div className="text-xs font-medium text-gray-500 px-3 py-2 border-b border-gray-100">
            Gestionar evento
          </div>
          <div className="py-1">
            {actions.map((action) => (
              <button
                key={action.id}
                onClick={() => {
                  if (!action.disabled) {
                    onAction(action.id);
                    onClose();
                  }
                }}
                disabled={action.disabled}
                title={action.disabledReason || ""}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors rounded-lg ${
                  action.disabled
                    ? "text-gray-400 bg-gray-100 cursor-not-allowed"
                    : `${action.color} ${action.hoverColor}`
                }`}
              >
                {action.icon}
                {action.label}
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </>
  );

  // Renderizar usando portal para evitar problemas de z-index
  return createPortal(modalContent, document.body);
};

export default EventActionModal;

