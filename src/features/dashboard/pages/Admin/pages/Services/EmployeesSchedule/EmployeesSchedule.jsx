import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaPlus, FaCalendarAlt, FaClock, FaUser } from "react-icons/fa";
import EmployeesScheduleCalendar from "./components/EmployeesScheduleCalendar";
import ScheduleModal from "./components/EmployeesScheduleModal";
import { format } from "date-fns";

const EmployeeSchedule = ({ disabled = false, initialSchedules = [] }) => {
  const [schedules, setSchedules] = useState(initialSchedules);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [isNew, setIsNew] = useState(true);
  const [isCalendarVisible, setIsCalendarVisible] = useState(true);
  const containerRef = useRef(null);

  // Crear payload por defecto para nuevo horario
  const createDefaultSchedule = ({ start, end } = {}) => {
    const now = new Date();
    const defaultStart = start || now;
    const defaultEnd = end || new Date(now.getTime() + 60 * 60 * 1000);

    return {
      empleado: "",
      fecha: format(defaultStart, "yyyy-MM-dd"),
      horaInicio: format(defaultStart, "HH:mm"),
      horaFin: format(defaultEnd, "HH:mm"),
      area: "",
      estado: "Programado",
      observaciones: "",
      id: null,
    };
  };

  // Abrir modal para crear un nuevo horario
  const openModalForSlot = ({ start, end }) => {
    const payload = createDefaultSchedule({ start, end });
    setSelectedSchedule(payload);
    setIsNew(true);
    setIsModalOpen(true);
  };

  // Abrir modal para editar un horario existente
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

  // Guardar horario desde el modal
  const handleSaveFromModal = (form) => {
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

    closeModal();
  };

  // Cerrar modal y limpiar estado
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedSchedule(null);
  };

  // Eliminar horario
  const deleteSchedule = (scheduleId) => {
    setSchedules((prev) => prev.filter((s) => s.id !== scheduleId));
  };

  // Cerrar modal al hacer click afuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        if (isModalOpen) {
          closeModal();
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isModalOpen]);

  // Renderizado para modo "view"
  if (disabled) {
    return (
      <div className="font-monserrat p-6">
        <div className="flex flex-col">
          <label className="mb-2 font-medium text-gray-700">
            Horario de Empleados
          </label>
          <div className="p-4 bg-gray-100 rounded-lg">
            {schedules.length > 0 ? (
              <div className="space-y-3">
                {schedules.map((schedule) => (
                  <motion.div
                    key={schedule.id}
                    layout
                    className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm"
                  >
                    <FaUser className="text-primary-purple" />
                    <div className="flex-1">
                      <span className="font-medium">{schedule.empleado}</span>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                        <span className="flex items-center gap-1">
                          <FaCalendarAlt className="text-xs" />
                          {schedule.fecha}
                        </span>
                        <span className="flex items-center gap-1">
                          <FaClock className="text-xs" />
                          {schedule.horaInicio} - {schedule.horaFin}
                        </span>
                        {schedule.area && (
                          <span className="px-2 py-1 bg-primary-purple/20 text-primary-purple text-xs rounded-full">
                            {schedule.area}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <span className="text-gray-500">No hay horarios programados</span>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="font-monserrat p-6" ref={containerRef}>
      {/* Header con título y botón */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">
          Horario de Empleados
        </h1>
        
        <div className="flex items-center gap-3">
          {/* Botón para mostrar/ocultar calendario */}
          <button
            onClick={() => setIsCalendarVisible(!isCalendarVisible)}
            className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg shadow hover:bg-gray-200 transition"
          >
            <FaCalendarAlt />
            {isCalendarVisible ? "Ocultar" : "Mostrar"} Calendario
          </button>

          {/* Botón nuevo horario */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => openModalForSlot(createDefaultSchedule())}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-purple to-primary-blue text-white rounded-lg shadow hover:opacity-90 transition"
          >
            <FaPlus /> Nuevo Horario
          </motion.button>
        </div>
      </div>

      {/* Resumen de horarios */}
      <div className="mb-6">
        <div className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-md border border-gray-200">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-primary-purple">
              {schedules.length}
            </span>
            <span className="text-gray-600">
              {schedules.length === 1 ? "Horario programado" : "Horarios programados"}
            </span>
          </div>
          
          {schedules.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {schedules.slice(0, 3).map((schedule) => (
                <span
                  key={schedule.id}
                  className="px-3 py-1 bg-primary-purple/20 text-primary-purple text-sm font-medium rounded-full"
                >
                  {schedule.empleado}
                </span>
              ))}
              {schedules.length > 3 && (
                <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                  +{schedules.length - 3} más
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Calendario con animación */}
      <AnimatePresence>
        {isCalendarVisible && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
              <EmployeesScheduleCalendar
                schedules={schedules}
                onOpenModalForSlot={openModalForSlot}
                onOpenModalForEvent={openModalForEvent}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal animado */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50"
              onClick={closeModal}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative z-10"
            >
              <ScheduleModal
                schedule={selectedSchedule}
                isNew={isNew}
                onClose={closeModal}
                onSave={handleSaveFromModal}
                onDelete={deleteSchedule}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EmployeeSchedule;