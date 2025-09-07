// Combina fecha (Date o string) + hora ("HH:mm") en una Date local segura
export const combineDateAndTime = (dateInput, time = "00:00") => {
  if (!dateInput) return null;
  
  const base = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (Number.isNaN(base.getTime())) return null;

  const [hh = "00", mm = "00"] = String(time || "00:00").split(":");
  return new Date(
    base.getFullYear(),
    base.getMonth(),
    base.getDate(),
    parseInt(hh, 10),
    parseInt(mm, 10),
    0,
    0
  );
};

export const isSameDay = (a, b) => {
  if (!a || !b) return false;
  const d1 = a instanceof Date ? a : new Date(a);
  const d2 = b instanceof Date ? b : new Date(b);
  
  if (Number.isNaN(d1.getTime()) || Number.isNaN(d2.getTime())) return false;
  
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};

export const sortEventsByDateTime = (events) =>
  [...events].sort((a, b) => {
    const da = combineDateAndTime(a.date, a.time)?.getTime() ?? 0;
    const db = combineDateAndTime(b.date, b.time)?.getTime() ?? 0;
    return da - db;
  });

// Diferencia restante desde ahora hasta target (Date)
export const getTimeRemaining = (target) => {
  if (!target) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };

  const now = new Date();
  const diff = target.getTime() - now.getTime();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };

  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  return { days, hours, minutes, seconds, expired: false };
};