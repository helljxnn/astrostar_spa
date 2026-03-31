import { useEffect, useState } from "react";
import { CalendarDays } from "lucide-react";
import { convertTo24Hour } from "../../../../../shared/utils/helpers/eventsHelper";
import {
  combineDateAndTime,
  getTimeRemaining,
  parseDateValue,
} from "../../../../../shared/utils/helpers/dateHelpers";

const formatDate = (value) => {
  if (!value) return "";
  const parsed = parseDateValue(value);
  return !parsed || Number.isNaN(parsed.getTime())
    ? value
    : new Intl.DateTimeFormat("es-CO", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }).format(parsed);
};

export const CountdownTimer = ({ selectedEvent }) => {
  const initial = { days: 0, hours: 0, minutes: 0, seconds: 0, expired: false };
  const [timeLeft, setTimeLeft] = useState(initial);

  useEffect(() => {
    if (!selectedEvent?.date || !selectedEvent?.time) {
      setTimeLeft(initial);
      return;
    }

    const tick = () => {
      const targetTime = combineDateAndTime(
        selectedEvent.date,
        convertTo24Hour(selectedEvent.time),
      );
      setTimeLeft(getTimeRemaining(targetTime));
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [selectedEvent]);

  const TimeUnit = ({ value, label }) => (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-2 py-2.5 text-center">
      <p className="font-montserrat text-lg font-bold leading-none text-slate-900 sm:text-[22px]">
        {String(value ?? 0).padStart(2, "0")}
      </p>
      <p className="mt-1 whitespace-nowrap text-[10px] font-semibold leading-none tracking-[0.02em] text-slate-500">
        {label}
      </p>
    </div>
  );

  if (!selectedEvent) {
    return (
      <div className="rounded-[24px] border border-slate-200 bg-white p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
          Proximo evento
        </p>
        <p className="mt-2 text-sm text-slate-500">
          No hay un evento seleccionado.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <div className="rounded-full border border-[#e6dcff] bg-[#faf7ff] p-2 text-[#a585ef]">
          <CalendarDays size={14} />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
            Proximo evento
          </p>
          <h3 className="mt-2 line-clamp-2 font-montserrat text-sm font-bold uppercase leading-tight text-slate-900 sm:text-[15px]">
            {selectedEvent.title}
          </h3>
          <p className="mt-1.5 text-xs text-slate-500 sm:text-sm">{formatDate(selectedEvent.date)}</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-4 gap-2">
        <TimeUnit value={timeLeft.days} label="Dias" />
        <TimeUnit value={timeLeft.hours} label="Horas" />
        <TimeUnit value={timeLeft.minutes} label="Min." />
        <TimeUnit value={timeLeft.seconds} label="Seg." />
      </div>
    </div>
  );
};
