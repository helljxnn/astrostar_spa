// RecurrenceGenerator.jsx
import { addDays, addWeeks, addMonths, addYears, isBefore } from "date-fns";

/**
 * Genera los horarios repetidos según la opción seleccionada
 * @param {Object} schedule Horario base
 * @param {Date} endDate Fecha límite para generar recurrencias (ej: +30 días)
 * @returns {Array} Lista de horarios expandidos
 */
export function generateRecurringSchedules(
  schedule,
  endDate = addMonths(new Date(), 1)
) {
  const schedules = [];

  const start = new Date(`${schedule.fecha}T${schedule.horaInicio}`);
  const end = new Date(`${schedule.fecha}T${schedule.horaFin}`);

  const intervalo = schedule.intervalo || 1;

  // siempre guardar el primero
  schedules.push({
    ...schedule,
    start,
    end,
    title: `${schedule.empleado} - ${schedule.cargo}`,
  });

  let cursor = start;

  switch (schedule.repeticion) {
    case "dia":
      while (isBefore(cursor, endDate)) {
        cursor = addDays(cursor, intervalo);
        schedules.push(makeSchedule(schedule, cursor, start, end));
      }
      break;

    case "semana":
      while (isBefore(cursor, endDate)) {
        cursor = addWeeks(cursor, intervalo);
        schedules.push(makeSchedule(schedule, cursor, start, end));
      }
      break;

    case "mes":
      while (isBefore(cursor, endDate)) {
        cursor = addMonths(cursor, intervalo);
        schedules.push(makeSchedule(schedule, cursor, start, end));
      }
      break;

    case "anio":
      while (isBefore(cursor, endDate)) {
        cursor = addYears(cursor, intervalo);
        schedules.push(makeSchedule(schedule, cursor, start, end));
      }
      break;

    case "laboral":
      while (isBefore(cursor, endDate)) {
        cursor = addDays(cursor, 1);
        if (cursor.getDay() >= 1 && cursor.getDay() <= 5) {
          schedules.push(makeSchedule(schedule, cursor, start, end));
        }
      }
      break;

    case "personalizado":
      const { dias = [], repeticiones = 10 } = schedule;
      let count = 1;

      while (count < repeticiones) {
        cursor = addDays(cursor, 1);
        if (dias.includes(cursor.getDay())) {
          schedules.push(makeSchedule(schedule, cursor, start, end));
          count++;
        }
      }
      break;

    default:
      break;
  }

  return schedules;
}

function makeSchedule(schedule, cursor, start, end) {
  return {
    ...schedule,
    start: new Date(cursor),
    end: new Date(cursor.getTime() + (end - start)),
    title: `${schedule.empleado} - ${schedule.cargo}`,
  };
}
