import React, { useState, useRef, useEffect, useMemo } from "react";
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
import { useEmployeeSchedules } from "./hooks/useEmployeeSchedules";

// Importaciones para permisos
import PermissionGuard from "../../../../../../../shared/components/PermissionGuard";
import { usePermissions } from "../../../../../../../shared/hooks/usePermissions";

const EmployeeSchedule = ({ disabled = false, initialSchedules = [] }) => {
  const { hasPermission } = usePermissions();
  const {
    schedules,
    employees,
    loading,
    loadingEmployees,
    loadSchedules,
    loadEmployees,
    createSchedule,
    updateSchedule,
    deleteSchedule: removeSchedule,
    cancelSchedule,
  } = useEmployeeSchedules();

  const [filteredSchedules, setFilteredSchedules] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [isNew, setIsNew] = useState(true);
  const containerRef = useRef(null);
  const isLoading = loading || loadingEmployees;

  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedScheduleForAction, setSelectedScheduleForAction] = useState(null);

  const disabledSchedules = useMemo(
    () =>
      initialSchedules.map((s) => ({
        ...s,
        start: s.start instanceof Date ? s.start : new Date(s.start),
        end: s.end instanceof Date ? s.end : new Date(s.end),
      })),
    [initialSchedules]
  );

  useEffect(() => {
    if (disabled) return;
    if (hasPermission("employeesSchedule", "Ver")) {
      loadSchedules();
    }
    loadEmployees();
  }, [disabled, hasPermission, loadEmployees, loadSchedules]);

  useEffect(() => {
    setFilteredSchedules(schedules);
  }, [schedules]);

  const createDefaultSchedule = ({ start, end } = {}) => {
    const now = start ? new Date(start) : new Date();
    const defaultStart = start || now;
    const defaultEnd = end || new Date(now.getTime() + 60 * 60 * 1000);

    return {
      empleadoId: "",
      empleado: "",
      cargo: "",
      fecha: format(defaultStart, "yyyy-MM-dd"),
      horaInicio: format(defaultStart, "HH:mm"),
      horaFin: format(defaultEnd, "HH:mm"),
      area: "",
      estado: "Programado",
      repeticion: "no",
      customRecurrence: null,
      descripcion: "",
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
    const startDate = event.start
      ? new Date(event.start)
      : event.fecha
      ? new Date(`${event.fecha}T${event.horaInicio || "00:00"}`)
      : new Date();
    const endDate = event.end
      ? new Date(event.end)
      : event.fecha
      ? new Date(`${event.fecha}T${event.horaFin || event.horaInicio || "00:00"}`)
      : startDate;

    const payload = {
      id: event.scheduleId || event.id,
      empleadoId: event.empleadoId || event.employeeId || "",
      empleado: (event.empleado || event.title || "").replace(/^Turno\s*-\s*/i, ""),
      cargo: event.cargo || "",
      fecha: format(startDate, "yyyy-MM-dd"),
      horaInicio: format(startDate, "HH:mm"),
      horaFin: format(endDate, "HH:mm"),
      area: event.area || "",
      estado: event.estado || "Programado",
      observaciones: event.observaciones || event.descripcion || "",
      descripcion: event.descripcion || event.observaciones || "",
      repeticion: event.repeticion || "no",
      customRecurrence: event.customRecurrence || null,
      motivoCancelacion: event.motivoCancelacion || "",
      _isReadOnly: readOnly,
    };
    setSelectedSchedule(payload);
    setIsNew(false);
    setIsModalOpen(true);
  };

  const openDetailsModal = (schedule) => {
    if (!schedule) return;
    const scheduleData = {
      ...schedule,
      scheduleId: schedule.scheduleId || schedule.id,
      hora: `${schedule.horaInicio || format(schedule.start, "HH:mm")} - ${
        schedule.horaFin || format(schedule.end, "HH:mm")
      }`,
    };
    setSelectedScheduleForAction(scheduleData);
    setShowDetailsModal(true);
  };

  const openCancelModal = (schedule) => {
    const scheduleObj =
      typeof schedule === "string" || typeof schedule === "number"
        ? schedules.find((s) => (s.scheduleId || s.id) === schedule)
        : schedule;
    if (!scheduleObj) return;
    const scheduleData = {
      ...scheduleObj,
      scheduleId: scheduleObj.scheduleId || scheduleObj.id,
      hora: `${scheduleObj.horaInicio || format(scheduleObj.start, "HH:mm")} - ${
        scheduleObj.horaFin || format(scheduleObj.end, "HH:mm")
      }`,
    };
    setSelectedScheduleForAction(scheduleData);
    setShowCancelModal(true);
  };

  const handleSaveFromModal = async (form) => {
    const payload = {
      ...form,
      descripcion: form.descripcion || form.observaciones || "",
      observaciones: form.descripcion || form.observaciones || "",
    };

    try {
      if (isNew) {
        await createSchedule(payload);
      } else if (form.id) {
        await updateSchedule(form.id, payload);
      }
      closeModal();
    } catch (error) {
      // Los mensajes de error se manejan en el hook
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedSchedule(null);
  };

  const handleDeleteSchedule = async (id) => {
    if (!id) return;
    try {
      await removeSchedule(id);
      closeModal();
    } catch (error) {
      // Alertas gestionadas en el hook
    }
  };

  const handleCancelConfirm = async (scheduleWithReason) => {
    if (!scheduleWithReason) return;
    try {
      await cancelSchedule(
        scheduleWithReason.scheduleId || scheduleWithReason.id,
        scheduleWithReason.motivoCancelacion || ""
      );
      setShowCancelModal(false);
      setSelectedScheduleForAction(null);
    } catch (error) {
      // Alertas gestionadas en el hook
    }
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

  const disabledList =
    disabledSchedules.length > 0 ? disabledSchedules : schedules;

  if (disabled) {
    return (
      <div className="font-monserrat p-6">
        <div className="flex flex-col">
          <label className="mb-2 font-medium text-gray-700">
            Horario de Empleados
          </label>
          <div className="p-4 bg-gray-100 rounded-lg">
            {disabledList.length > 0 ? (
              <div className="space-y-3">
                {disabledList.map((schedule) => (
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
          {isLoading && (
            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full border border-gray-200">
              Cargando...
            </span>
          )}
          
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
            <EmployeeScheduleReportGenerator
              data={filteredSchedules}
              columns={[
                { key: "empleado", label: "Empleado" },
                { key: "cargo", label: "Cargo" },
                { key: "fecha", label: "Fecha" },
                { key: "horaInicio", label: "Hora inicio" },
                { key: "horaFin", label: "Hora fin" },
                { key: "estado", label: "Estado" },
              ]}
            />
          </PermissionGuard>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 mb-3 text-sm text-gray-600">
          <span className="w-3 h-3 border-2 border-gray-300 border-t-[#c084fc] rounded-full animate-spin" />
          <span>Cargando horarios y empleados...</span>
        </div>
      )}

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
            onDeleteEvent={hasPermission('employeesSchedule', 'Eliminar') ? handleDeleteSchedule : null}
            onCancelEvent={hasPermission('employeesSchedule', 'Editar') ? openCancelModal : null}
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
                employeesOptions={employees}
                isLoadingEmployees={loadingEmployees}
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
        onClose={() => {
          setShowCancelModal(false);
          setSelectedScheduleForAction(null);
        }}
        onConfirm={handleCancelConfirm}
        employee={selectedScheduleForAction}
      />
    </div>
  );
};

export default EmployeeSchedule;
