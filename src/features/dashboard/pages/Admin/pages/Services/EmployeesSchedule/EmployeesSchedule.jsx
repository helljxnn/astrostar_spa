import React, { useState } from "react";
import { FaPlus } from "react-icons/fa";
import EmployeesScheduleCalendar from "./components/EmployeesScheduleCalendar";
import ScheduleModal from "./components/EmployeesScheduleModal";
import { format } from "date-fns";

const EmployeeSchedule = () => {
  const [schedules, setSchedules] = useState([]); // eventos del calendario
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [isNew, setIsNew] = useState(true);

  // Abrir modal para crear un nuevo horario (recibe start/end como Date desde el calendario)
  const openModalForSlot = ({ start, end }) => {
    const payload = {
      empleado: "",
      fecha: format(start, "yyyy-MM-dd"),
      horaInicio: format(start, "HH:mm"),
      horaFin: format(end, "HH:mm"),
      area: "",
      estado: "Programado",
      observaciones: "",
      id: null,
    };
    setSelectedSchedule(payload);
    setIsNew(true);
    setIsModalOpen(true);
  };

  // Abrir modal para editar un horario (recibe el evento del calendario)
  const openModalForEvent = (event) => {
    const payload = {
      empleado: event.title?.replace("Turno - ", "") || "",
      fecha: format(event.start, "yyyy-MM-dd"),
      horaInicio: format(event.start, "HH:mm"),
      horaFin: format(event.end, "HH:mm"),
      area: event.area || "",
      estado: event.estado || "Programado",
      observaciones: event.observaciones || "",
      id: event.id,
    };
    setSelectedSchedule(payload);
    setIsNew(false);
    setIsModalOpen(true);
  };

  // Guardar (veniendo del modal)
  const handleSaveFromModal = (form) => {
    // Conversión a objeto que react-big-calendar entiende
    const start = new Date(`${form.fecha}T${form.horaInicio}`);
    const end = new Date(`${form.fecha}T${form.horaFin}`);

    const eventObj = {
      id: form.id || Date.now(),
      title: `Turno - ${form.empleado}`,
      start,
      end,
      color: "bg-primary-purple",
      empleado: form.empleado,
      area: form.area,
      estado: form.estado,
      observaciones: form.observaciones,
    };

    if (isNew) {
      setSchedules((prev) => [...prev, eventObj]);
    } else {
      setSchedules((prev) => prev.map((s) => (s.id === eventObj.id ? eventObj : s)));
    }

    setIsModalOpen(false);
    setSelectedSchedule(null);
  };

  return (
    <div className="font-monserrat p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Horario de Empleados</h1>
        <button
          onClick={() =>
            openModalForSlot({
              start: new Date(), // si quieres abrir el modal vacío con hoy; o puedes usar un slot por defecto
              end: new Date(new Date().getTime() + 60 * 60 * 1000),
            })
          }
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-purple to-primary-blue text-white rounded-lg shadow hover:opacity-90 transition"
        >
          <FaPlus /> Nuevo Horario
        </button>
      </div>

      <div className="mt-2">
        <EmployeesScheduleCalendar
          schedules={schedules}
          onOpenModalForSlot={openModalForSlot}
          onOpenModalForEvent={openModalForEvent}
        />
      </div>

      {isModalOpen && (
        <ScheduleModal
          schedule={selectedSchedule}
          isNew={isNew}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveFromModal}
        />
      )}
    </div>
  );
};

export default EmployeeSchedule;
