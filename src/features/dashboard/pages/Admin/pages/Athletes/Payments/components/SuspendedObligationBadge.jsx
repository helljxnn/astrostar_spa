import { FaPause, FaPlay } from "react-icons/fa";

/**
 * Badge para mostrar el estado de suspensión de una obligación
 * Muestra si está suspendida o fue reactivada
 */
const SuspendedObligationBadge = ({ obligation }) => {
  if (!obligation?.metadata) return null;

  const isSuspended = obligation.metadata.suspended === true;
  const wasReactivated = obligation.metadata.reactivatedAt && !isSuspended;

  if (isSuspended) {
    return (
      <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
        <FaPause className="w-3 h-3" />
        <span>Suspendida</span>
      </div>
    );
  }

  if (wasReactivated) {
    return (
      <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
        <FaPlay className="w-3 h-3" />
        <span>Reactivada</span>
      </div>
    );
  }

  return null;
};

export default SuspendedObligationBadge;
