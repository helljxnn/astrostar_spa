import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaPlus, FaCalendarAlt, FaBriefcase } from "react-icons/fa";
import { format } from "date-fns";

// Importar TUS componentes (asegúrate de que las rutas sean correctas)
import EmployeesScheduleCalendar from "./components/EmployeesScheduleCalendar";
import ScheduleModal from "./components/EmployeesScheduleModal";
import EmployeeScheduleSearchBar from "./components/EmployeeScheduleSearchBar";
import EmployeeScheduleReportGenerator from "./components/EmployeeScheduleReportGenerator";
import ScheduleDetailsModal from "./components/ScheduleDetailsModal";
import CancelScheduleModal from "./components/CancelScheduleModal";

// Importaciones para permisos
import PermissionGuard from "../../../../../../../shared/components/PermissionGuard";
import { usePermissions } from "../../../../../../../shared/hooks/usePermissions";

const EmployeeSchedule = ({ disabled = false, initialSchedules = [] }) => {
  const { hasPermission } = usePermissions();
  const [schedules, setSchedules] = useState(
    initialSchedules.length > 0
      ? initialSchedules.map((s) => ({
          ...s,
          start: s.start instanceof Date ? s.start : new Date(s.start),
          end: s.end instanceof Date ? s.end : new Date(s.end),
        }))
      : [
          {
            id: 1,
            empleado: "Juan Pérez",
            cargo: "Supervisor",
            fecha: "2025-10-12",
            horaInicio: "08:00",
            horaFin: "12:00",
            estado: "Programado",
            color: "bg-[#c084fc]",
            title: "Turno - Juan Pérez",
            start: new Date("2025-10-12T08:00:00"),
            end: new Date("2025-10-12T12:00:00"),
          },
          {
            id: 2,
            empleado: "María López",
            cargo: "Analista",
            fecha: "2025-10-13",
            horaInicio: "13:00",
            horaFin: "18:00",
            estado: "Programado",
            color: "bg-[#60a5fa]",
            title: "Turno - María López",
            start: new Date("2025-10-13T13:00:00"),
            end: new Date("2025-10-13T18:00:00"),
          },
        ]
  );

  const [filteredSchedules, setFilteredSchedules] = useState(schedules);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [isNew, setIsNew] = useState(true);
  const containerRef = useRef(null);

  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedScheduleForAction, setSelectedScheduleForAction] = useState(null);

  const createDefaultSchedule = ({ start, end } = {}) => {
    const now = start ? new Date(start) : new Date();
    const defaultStart = start || now;
    const defaultEnd = end || new Date(now.getTime() + 60 * 60 * 1000);

    return {
      empleado: "",
      cargo: "",
      fecha: format(defaultStart, "yyyy-MM-dd"),
      horaInicio: format(defaultStart, "HH:mm"),
      horaFin: format(defaultEnd, "HH:mm"),
      area: "",
      estado: "Programado",
      observaciones: "",
      motivoCancelacion: "",
      id: null,
    };
  };

  const openModalForSlot = ({ start, end } = {}) => {
    setSelectedSchedule(createDefaultSchedule({ start, end }));
    setIsNew(true);
    setIsModalOpen(true);
  };

  const openModalForEvent = (event, { readOnly = false } = {}) => {
    const payload = {
      empleado: (event.empleado || event.title || "").replace(/^Turno\s*-\s*/i, ""),
      cargo: event.cargo || "",
      fecha: format(event.start, "yyyy-MM-dd"),
      horaInicio: format(event.start, "HH:mm"),
      horaFin: format(event.end, "HH:mm"),
      area: event.area || "",
      estado: event.estado || "Programado",
      observaciones: event.observaciones || "",
      motivoCancelacion: event.motivoCancelacion || "",
      id: event.id,
      _isReadOnly: readOnly,
    };
    setSelectedSchedule(payload);
    setIsNew(false);
    setIsModalOpen(true);
  };

  const openDetailsModal = (schedule) => {
    const scheduleData = {
      ...schedule,
      hora: `${schedule.horaInicio} - ${schedule.horaFin}`,
    };
    setSelectedScheduleForAction(scheduleData);
    setShowDetailsModal(true);
  };

  const openCancelModal = (schedule) => {
    const scheduleData = {
      ...schedule,
      hora: `${schedule.horaInicio} - ${schedule.horaFin}`,
    };
    setSelectedScheduleForAction(scheduleData);
    setShowCancelModal(true);
  };

  const handleSaveFromModal = (form) => {
    const start = new Date(`${form.fecha}T${form.horaInicio}`);
    const end = new Date(`${form.fecha}T${form.horaFin}`);

    // Asignar colores según el estado
    const color =
      form.estado === "Cancelado"
        ? "bg-gray-400"
        : form.estado === "Completado"
        ? "bg-green-500"
        : "bg-[#c084fc]";

    const eventObj = {
      id: form.id || Date.now(),
      title: `Turno - ${form.empleado}${form.estado === "Cancelado" ? " (Cancelado)" : ""}`,
      start,
      end,
      color,
      empleado: form.empleado,
      cargo: form.cargo || "",
      fecha: form.fecha,
      horaInicio: form.horaInicio,
      horaFin: form.horaFin,
      area: form.area || "",
      estado: form.estado || "Programado",
      observaciones: form.observaciones || "",
      motivoCancelacion: form.motivoCancelacion || "",
    };

    setSchedules((prev) => {
      const exists = prev.some((s) => s.id === eventObj.id);
      const updated = exists
        ? prev.map((s) => (s.id === eventObj.id ? eventObj : s))
        : [...prev, eventObj];
      return updated;
    });

    closeModal();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedSchedule(null);
  };

  const deleteSchedule = (id) => {
    setSchedules((prev) => prev.filter((s) => s.id !== id));
  };

  const handleCancelConfirm = (scheduleWithReason) => {
    setSchedules((prev) =>
      prev.map((s) =>
        s.id === scheduleWithReason.id
          ? {
              ...s,
              estado: "Cancelado",
              color: "bg-gray-400",
              motivoCancelacion: scheduleWithReason.motivoCancelacion || "",
              title: `Turno - ${s.empleado} (Cancelado)`,
            }
          : s
      )
    );

    setShowCancelModal(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        if (isModalOpen) closeModal();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isModalOpen]);

  const handleSearch = (term) => {
    if (!term) {
      setFilteredSchedules(schedules);
      return;
    }

    const lower = term.toLowerCase();
    const filtered = schedules.filter(
      (s) =>
        (s.empleado || "").toLowerCase().includes(lower) ||
        (s.fecha || "").toLowerCase().includes(lower) ||
        (s.cargo || "").toLowerCase().includes(lower) ||
        (s.area || "").toLowerCase().includes(lower)
    );
    setFilteredSchedules(filtered);
  };

  useEffect(() => {
    setFilteredSchedules(schedules);
  }, [schedules]);

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
                    <FaCalendarAlt className="text-[#c084fc]" />
                    <div className="flex-1">
                      <span className="font-medium">{schedule.empleado}</span>
                      {schedule.cargo && (
                        <span className="ml-2 text-sm text-gray-600">
                          ({schedule.cargo})
                        </span>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                        <span>{schedule.fecha}</span>
                        <span>
                          {schedule.horaInicio} - {schedule.horaFin}
                        </span>
                        {schedule.area && (
                          <span className="px-2 py-1 bg-purple-50 text-[#c084fc] text-xs rounded-full">
                            {schedule.area}
                          </span>
                        )}
                      </div>
                      {schedule.observaciones && (
                        <p className="text-xs mt-1 text-gray-700 line-clamp-2">
                          <span className="font-semibold">Descripción:</span>{" "}
                          {schedule.observaciones}
                        </p>
                      )}
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">
          Horario de Empleados
        </h1>
        <div className="flex items-center gap-3">
          <EmployeeScheduleSearchBar onSearch={handleSearch} />
          
          <PermissionGuard module="employeesSchedule" action="Crear">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => openModalForSlot(createDefaultSchedule())}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#c084fc] to-[#60a5fa] text-white rounded-lg shadow hover:opacity-90 transition"
            >
              <FaPlus />
              Crear
            </motion.button>
          </PermissionGuard>
          
          <PermissionGuard module="employeesSchedule" action="Ver">
            <EmployeeScheduleReportGenerator schedules={filteredSchedules} />
          </PermissionGuard>
        </div>
      </div>

      <div className="flex gap-6">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-1/3 bg-white rounded-2xl shadow-lg p-4 overflow-y-auto max-h-[calc(100vh-200px)]"
        >
          <h2 className="text-lg font-semibold text-[#c084fc] mb-3 text-center">
            Actividades Programadas
          </h2>
          {filteredSchedules.length > 0 ? (
            <ul className="space-y-2">
              {filteredSchedules.map((schedule) => {
                const colors = [
                  "from-[#e9d5ff] to-[#c084fc]",
                  "from-[#ddd6fe] to-[#a78bfa]",
                  "from-[#bfdbfe] to-[#60a5fa]",
                  "from-[#c7d2fe] to-[#818cf8]",
                ];
                const colorIndex = schedule.id % colors.length;
                const gradient = colors[colorIndex];

                return (
                  <motion.li
                    key={schedule.id}
                    whileHover={{ scale: 1.02 }}
                    className={`bg-gradient-to-br ${gradient} rounded-lg p-3 shadow-sm hover:shadow-md transition cursor-pointer`}
                    onClick={() => openDetailsModal(schedule)}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm text-gray-800">
                          {schedule.empleado || "Sin nombre"}
                        </h3>
                        {schedule.cargo && (
                          <div className="flex items-center gap-1 mt-0.5">
                            <FaBriefcase className="w-2.5 h-2.5 text-gray-600" />
                            <span className="text-xs text-gray-700">
                              {schedule.cargo}
                            </span>
                          </div>
                        )}
                      </div>
                      <span
                        className={`px-1.5 py-0.5 text-[10px] font-semibold rounded-full ${
                          schedule.estado === "Programado"
                            ? "bg-blue-100 text-blue-700"
                            : schedule.estado === "Cancelado"
                            ? "bg-red-100 text-red-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {schedule.estado}
                      </span>
                    </div>

                    <div className="space-y-0.5 text-xs text-gray-700">
                      <p className="font-medium">{schedule.fecha}</p>
                      <p className="flex items-center gap-1">
                        ⏰ {schedule.horaInicio} - {schedule.horaFin}
                      </p>
                    </div>

                    {schedule.area && (
                      <p className="text-[10px] mt-1.5 bg-white bg-opacity-40 px-1.5 py-0.5 rounded inline-block text-gray-700">
                        📍 {schedule.area}
                      </p>
                    )}

                    {schedule.observaciones && (
                      <div className="mt-2 pt-2 border-t border-gray-400 border-opacity-20">
                        <p className="text-[10px] text-gray-800 line-clamp-2">
                          {schedule.observaciones}
                        </p>
                      </div>
                    )}
                  </motion.li>
                );
              })}
            </ul>
          ) : (
            <p className="text-gray-500 text-center text-sm">
              No hay actividades registradas.
            </p>
          )}
        </motion.div>

        <div className="flex-1 bg-white rounded-2xl shadow-lg p-4 border border-gray-200">
          <EmployeesScheduleCalendar
            schedules={filteredSchedules}
            onOpenModalForSlot={hasPermission('employeesSchedule', 'Crear') ? openModalForSlot : null}
            onOpenModalForEvent={hasPermission('employeesSchedule', 'Ver') ? (event) => openModalForEvent(event, { readOnly: !hasPermission('employeesSchedule', 'Editar') }) : null}
            onEditEvent={hasPermission('employeesSchedule', 'Editar') ? (event) => openModalForEvent(event, { readOnly: false }) : null}
            onViewEvent={hasPermission('employeesSchedule', 'Ver') ? (event) => openDetailsModal(event) : null}
            onDeleteEvent={hasPermission('employeesSchedule', 'Eliminar') ? deleteSchedule : null}
            onCancelEvent={hasPermission('employeesSchedule', 'Editar') ? openCancelModal : null}
            onSaveNewEvent={(ev) => {
              if (hasPermission('employeesSchedule', 'Crear')) {
                setSchedules((prev) => {
                  const exists = prev.some((s) => s.id === ev.id);
                  return exists ? prev : [...prev, ev];
                });
              }
            }}
          />
        </div>
      </div>

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
                isReadOnly={selectedSchedule?._isReadOnly}
                onClose={closeModal}
                onSave={handleSaveFromModal}
                onDelete={deleteSchedule}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ScheduleDetailsModal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        employee={selectedScheduleForAction}
      />

      <CancelScheduleModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancelConfirm}
        employee={selectedScheduleForAction}
      />
    </div>
  );
};

export default EmployeeSchedule;