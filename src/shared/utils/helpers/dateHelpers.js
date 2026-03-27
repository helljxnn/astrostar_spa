// UTILIDADES PARA FECHAS CON SOPORTE MULTI-DIA

export const parseDateValue = (value) => {
  if (!value) return null;

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    const localDateMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);

    if (localDateMatch) {
      const [, year, month, day] = localDateMatch;
      return new Date(Number(year), Number(month) - 1, Number(day), 0, 0, 0, 0);
    }
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

// Combina fecha (Date o string) + hora ("HH:mm") en una Date local segura
// Retorna Date por defecto para compatibilidad, pero puede retornar { start, end }
export const combineDateAndTime = (dateInput, time = "00:00", endDateInput = null) => {
  if (!dateInput) return null;

  const base = parseDateValue(dateInput);
  if (!base) return null;

  const [hh = "00", mm = "00"] = String(time || "00:00").split(":");
  const start = new Date(
    base.getFullYear(),
    base.getMonth(),
    base.getDate(),
    parseInt(hh, 10),
    parseInt(mm, 10),
    0,
    0,
  );

  if (!endDateInput) {
    return start;
  }

  const endBase = parseDateValue(endDateInput);
  let end = start;

  if (endBase) {
    end = new Date(
      endBase.getFullYear(),
      endBase.getMonth(),
      endBase.getDate(),
      parseInt(hh, 10),
      parseInt(mm, 10),
      0,
      0,
    );
  }

  return { start, end };
};

// Verifica si dos fechas son el mismo dia o si una fecha esta dentro del rango de un evento
export const isSameDay = (a, b, endDate = null) => {
  if (!a || !b) return false;
  const d1 = parseDateValue(a);
  const d2 = parseDateValue(b);

  if (!d1 || !d2) return false;

  if (endDate) {
    const end = parseDateValue(endDate);
    if (!end) return false;

    const d2Date = new Date(d2.getFullYear(), d2.getMonth(), d2.getDate());
    const d1Date = new Date(d1.getFullYear(), d1.getMonth(), d1.getDate());
    const endDateDate = new Date(end.getFullYear(), end.getMonth(), end.getDate());

    return d2Date >= d1Date && d2Date <= endDateDate;
  }

  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};

export const sortEventsByDateTime = (events) =>
  [...events].sort((a, b) => {
    const da = combineDateAndTime(a.date, a.time, a.endDate);
    const db = combineDateAndTime(b.date, b.time, b.endDate);

    const timeA = da?.start ? da.start.getTime() : da?.getTime() ?? 0;
    const timeB = db?.start ? db.start.getTime() : db?.getTime() ?? 0;

    return timeA - timeB;
  });

export const getTimeRemaining = (target) => {
  if (!target) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  }

  let targetDate;
  if (target instanceof Date) {
    targetDate = target;
  } else if (target.start instanceof Date) {
    targetDate = target.start;
  } else {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  }

  const now = new Date();
  const diff = targetDate.getTime() - now.getTime();

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  }

  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);

  return { days, hours, minutes, seconds, expired: false };
};
