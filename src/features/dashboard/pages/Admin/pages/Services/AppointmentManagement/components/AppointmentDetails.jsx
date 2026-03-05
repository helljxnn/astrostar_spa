import React from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarClock,
  UserRound,
  Stethoscope,
  FileText,
  CheckCircle2,
  XCircle,
  PencilLine,
  Clock4,
  RefreshCw,
} from "lucide-react";

const getSpecialtyLabel = (value, options = []) => {
  const option = options.find((opt) => opt.value === value);
  return option ? option.label : "No especificada";
};

const getAthleteName = (athleteId, athleteList) => {
  const athlete = athleteList.find(
    (a) => a.id === athleteId || a.athleteId === athleteId,
  );
  if (!athlete) return "Desconocido";
  return (
    athlete.label ||
    athlete.fullName ||
    `${athlete.nombres || athlete.firstName || ""} ${
      athlete.apellidos || athlete.lastName || ""
    }`.trim()
  );
};

const statusConfig = {
  Programado: { label: "Programada", badge: "bg-blue-100 text-blue-700" },
  Completado: { label: "Completada", badge: "bg-green-100 text-green-700" },
  Cancelado: { label: "Cancelada", badge: "bg-red-100 text-red-700" },
};

const AppointmentDetails = ({
  isOpen,
  onClose,
  appointmentData,
  athleteList = [],
  specialtyOptions = [],
  onCancelAppointment,
  onMarkAsCompleted,
  onEdit,
  isAthleteScope = false,
}) => {
  if (!appointmentData) return null;

  const status =
    statusConfig[appointmentData.status] || statusConfig.Programado || {};

  const formattedDate = appointmentData.start
    ? format(new Date(appointmentData.start), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })
    : "Sin fecha";
  const formattedTime = appointmentData.start
    ? format(new Date(appointmentData.start), "h:mm a", { locale: es })
    : "Sin hora";

  const infoLeft = [
    {
      label: "Deportista",
      value: getAthleteName(
        appointmentData.athleteId || appointmentData.athlete,
        athleteList,
      ),
      icon: UserRound,
    },
    {
      label: "Especialista",
      value:
        appointmentData.specialistName ||
        appointmentData.specialist ||
        "No especificado",
      icon: Stethoscope,
    },
    {
      label: "Estado",
      value: status.label || "Programada",
      icon: CheckCircle2,
    },
  ];

  const infoRight = [
    {
      label: "Especialidad",
      value: getSpecialtyLabel(appointmentData.specialty, specialtyOptions),
      icon: FileText,
    },
    {
      label: "Fecha",
      value: formattedDate,
      icon: CalendarClock,
    },
    {
      label: "Hora",
      value: formattedTime,
      icon: Clock4,
    },
  ];

  const canActOnAppointment = appointmentData.status === "Programado";
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            style={{ zIndex: 99998 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <div 
            className="fixed inset-0 flex items-center justify-center p-4 pointer-events-none"
            style={{ zIndex: 99999 }}
          >
            <motion.div
              className="relative w-full max-w-3xl max-h-[92vh] overflow-hidden rounded-2xl bg-white shadow-2xl pointer-events-auto"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-gray-100">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-purple">
                  Detalles de la cita
                </p>
                <h2 className="text-2xl font-bold text-gray-900 leading-tight">
                  {getAthleteName(
                    appointmentData.athleteId || appointmentData.athlete,
                    athleteList,
                  )}
                </h2>
                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                  <span className="inline-flex items-center gap-2">
                    <CalendarClock className="h-4 w-4 text-primary-purple" />
                    {formattedDate}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <Clock4 className="h-4 w-4 text-primary-purple" />
                    {formattedTime}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${status.badge}`}
                >
                  {status.label || "Programada"}
                </span>
                <button
                  onClick={onClose}
                  className="ml-1 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Cerrar"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-5 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[infoLeft, infoRight].map((column, columnIndex) => (
                  <div key={columnIndex} className="space-y-3">
                    {column.map(({ label, value, icon: Icon }) => (
                      <div
                        key={label}
                        className="flex items-start gap-3 rounded-xl border border-gray-100 px-3 py-2.5 shadow-sm"
                      >
                        <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#F4F1FF] to-[#EAF4FF] text-primary-purple">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                            {label}
                          </p>
                          <p className="text-sm text-gray-900 leading-snug">
                            {value || "N/A"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                    Descripción / motivo
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-gray-800">
                    {appointmentData.description || "Sin descripción registrada."}
                  </p>
                </div>

                {appointmentData.status === "Cancelado" && (
                  <div className="rounded-xl border border-red-100 bg-red-50 p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-red-600">
                      Motivo de cancelación
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-red-800">
                      {appointmentData.cancelReason || "No especificado"}
                    </p>
                  </div>
                )}

                {appointmentData.status === "Completado" && (
                  <div className="rounded-xl border border-green-100 bg-green-50 p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-green-700">
                      Conclusión de la cita
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-green-900">
                      {appointmentData.conclusion || "No registrada"}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex flex-wrap items-center justify-end gap-3 border-t border-gray-100 bg-white px-6 py-4">
              {canActOnAppointment && onEdit && !isAthleteScope && (
                <button
                  onClick={() => {
                    onEdit(appointmentData);
                    onClose();
                  }}
                  className="inline-flex items-center gap-2 rounded-lg border border-primary-purple/30 px-4 py-2 text-sm font-semibold text-primary-purple transition hover:bg-primary-purple hover:text-white"
                >
                  <PencilLine className="h-4 w-4" />
                  Editar
                </button>
              )}

              {canActOnAppointment && onCancelAppointment && (
                <button
                  onClick={async () => {
                    await onCancelAppointment(appointmentData);
                    onClose();
                  }}
                  className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100"
                >
                  <XCircle className="h-4 w-4" />
                  Cancelar
                </button>
              )}

              {canActOnAppointment && onMarkAsCompleted && !isAthleteScope && (
                <button
                  onClick={() => onMarkAsCompleted(appointmentData)}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary-purple px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#9d7bff]"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Completar
                </button>
              )}

              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
              >
                Cerrar
              </button>
            </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AppointmentDetails;
