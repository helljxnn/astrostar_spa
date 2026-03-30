import { useEffect } from "react";
import { motion } from "framer-motion";
import { CalendarDays, Clock3, MapPin, Phone, Tags, Users, X } from "lucide-react";
import { parseDateValue } from "../../../../../shared/utils/helpers/dateHelpers";

const dateFormatter = new Intl.DateTimeFormat("es-CO", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

const isRealValue = (value) => {
  if (!value) return false;
  const normalized = String(value).trim().toLowerCase();
  return normalized !== "por confirmar" && normalized !== "evento";
};

const formatDate = (value) => {
  if (!value) return "";
  const parsed = parseDateValue(value);
  return !parsed || Number.isNaN(parsed.getTime()) ? value : dateFormatter.format(parsed);
};

const formatDateRange = (startDate, endDate) => {
  if (!startDate) return "";
  if (!endDate || startDate === endDate) return formatDate(startDate);
  return `${formatDate(startDate)} - ${formatDate(endDate)}`;
};

const EventInfoItem = ({ icon: Icon, label, value, children }) => {
  if (!children && !isRealValue(value)) return null;

  return (
    <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <Icon className="mt-0.5 text-slate-700" size={18} />
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
          {label}
        </p>
        {children || <p className="text-sm font-medium text-slate-900">{value}</p>}
      </div>
    </div>
  );
};

export const EventModal = ({ event, onClose }) => {
  if (!event) return null;

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        className="relative grid max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-[2rem] bg-white shadow-2xl lg:grid-cols-[1.05fr_0.95fr]"
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.96, opacity: 0 }}
        transition={{ duration: 0.25 }}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-slate-900 shadow-lg transition hover:bg-white"
          aria-label="Cerrar"
        >
          <X size={20} />
        </button>

        <div className="relative min-h-[260px] overflow-hidden bg-slate-200 lg:min-h-[640px]">
          <img
            src={event.image}
            alt={event.title}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
            <h2 className="max-w-2xl font-montserrat text-2xl font-bold uppercase tracking-[0.04em] text-white sm:text-3xl">
              {event.title}
            </h2>
          </div>
        </div>

        <div className="overflow-y-auto p-6 sm:p-8 lg:p-10">
          <div className="space-y-5">
            {isRealValue(event.description) && (
              <p className="text-base leading-7 text-slate-700">
                {event.description}
              </p>
            )}

            <div className="grid gap-3">
              <EventInfoItem
                icon={CalendarDays}
                label="Fecha"
                value={formatDateRange(event.date, event.endDate)}
              />

              <EventInfoItem
                icon={Clock3}
                label="Hora"
                value={
                  isRealValue(event.endTime) && event.endTime !== event.time
                    ? `${event.time} - ${event.endTime}`
                    : event.time
                }
              />

              <EventInfoItem icon={MapPin} label="Lugar" value={event.location} />
              <EventInfoItem icon={Phone} label="Telefono" value={event.telefono} />
              <EventInfoItem icon={Tags} label="Categoria" value={event.category} />

              {Array.isArray(event.patrocinadores) && event.patrocinadores.length > 0 && (
                <EventInfoItem icon={Users} label="Patrocinadores">
                  <div className="mt-1 flex flex-wrap gap-2">
                    {event.patrocinadores.map((sponsor) => (
                      <span
                        key={sponsor}
                        className="rounded-full border border-[#d9cbff] bg-[#faf7ff] px-3 py-1 text-xs font-semibold text-[#8e73d8]"
                      >
                        {sponsor}
                      </span>
                    ))}
                  </div>
                </EventInfoItem>
              )}

            </div>

            {isRealValue(event.details) && event.details !== event.description && (
              <p className="text-sm leading-7 text-slate-600">{event.details}</p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
