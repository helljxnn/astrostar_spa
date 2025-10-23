// UTILIDADES PARA FECHAS CON SOPORTE MULTI-DÍA

// Combina fecha (Date o string) + hora ("HH:mm") en una Date local segura
// ⚠️ RETORNA Date POR DEFECTO para compatibilidad, pero puede retornar { start, end }
export const combineDateAndTime = (dateInput, time = "00:00", endDateInput = null) => {
  if (!dateInput) return null;

  const base = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (Number.isNaN(base.getTime())) return null;

  const [hh = "00", mm = "00"] = String(time || "00:00").split(":");
  const start = new Date(
    base.getFullYear(),
    base.getMonth(),
    base.getDate(),
    parseInt(hh, 10),
    parseInt(mm, 10),
    0,
    0
  );

  // Si NO hay endDate, retornar solo Date (compatibilidad con código antiguo)
  if (!endDateInput) {
    return start;
  }

  // Si HAY endDate, retornar { start, end }
  const endBase = endDateInput instanceof Date ? endDateInput : new Date(endDateInput);
  let end = start;
  
  if (!Number.isNaN(endBase.getTime())) {
    end = new Date(
      endBase.getFullYear(),
      endBase.getMonth(),
      endBase.getDate(),
      parseInt(hh, 10),
      parseInt(mm, 10),
      0,
      0
    );
  }

  return { start, end };
};

// Verifica si dos fechas son el mismo día O si una fecha está dentro del rango de un evento
export const isSameDay = (a, b, endDate = null) => {
  if (!a || !b) return false;
  const d1 = a instanceof Date ? a : new Date(a);
  const d2 = b instanceof Date ? b : new Date(b);

  if (Number.isNaN(d1.getTime()) || Number.isNaN(d2.getTime())) return false;

  // Si hay endDate, verificar si d2 está dentro del rango [d1, endDate]
  if (endDate) {
    const end = endDate instanceof Date ? endDate : new Date(endDate);
    if (Number.isNaN(end.getTime())) return false;

    // Comparar solo fechas (ignorar hora)
    const d2Date = new Date(d2.getFullYear(), d2.getMonth(), d2.getDate());
    const d1Date = new Date(d1.getFullYear(), d1.getMonth(), d1.getDate());
    const endDateDate = new Date(end.getFullYear(), end.getMonth(), end.getDate());

    return d2Date >= d1Date && d2Date <= endDateDate;
  }

  // Comparación simple de un solo día
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
    
    // Manejar tanto Date como { start, end }
    const timeA = da?.start ? da.start.getTime() : da?.getTime() ?? 0;
    const timeB = db?.start ? db.start.getTime() : db?.getTime() ?? 0;
    
    return timeA - timeB;
  });

// Diferencia restante desde ahora hasta target (Date o { start, end })
export const getTimeRemaining = (target) => {
  if (!target) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  }

  // Manejar tanto Date como { start, end }
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