import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, X, AlertCircle, Send } from "lucide-react";
import { DatePickerField } from "../../../../../../../../shared/components/DatePickerField";
import { addMinutes } from "date-fns";
import apiClient from "../../../../../../../../shared/services/apiClient";

const RescheduleAppointmentModal = ({ isOpen, onClose, onConfirm, appointmentData }) => {
  const [newDateTime, setNewDateTime] = useState(null);
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [error, setError] = useState("");
  const [specialistSchedules, setSpecialistSchedules] = useState([]);
  const [loadingSchedules, setLoadingSchedules] = useState(false);

  // Cargar horarios del especialista
  useEffect(() => {
    if (!isOpen || !appointmentData?.specialistId) {
      setSpecialistSchedules([]);
      return;
    }

    const loadSchedules = async () => {
      setLoadingSchedules(true);
      try {
        const response = await apiClient.get(`/schedules/employee/${appointmentData.specialistId}`);
        const schedules = response?.data?.data || response?.data || [];
        setSpecialistSchedules(Array.isArray(schedules) ? schedules : []);
      } catch (error) {
        console.error("Error cargando horarios:", error);
        setSpecialistSchedules([]);
      } finally {
        setLoadingSchedules(false);
      }
    };

    loadSchedules();
  }, [isOpen, appointmentData?.specialistId]);

  // Filtrar horas disponibles según horarios del especialista
  const filterAvailableTimes = (time) => {
    if (specialistSchedules.length === 0) {
      return true;
    }

    const selectedDate = newDateTime || new Date();
    const timeDate = new Date(time);
    
    const hasActiveSchedule = specialistSchedules.some((schedule) => {
      const scheduleDate = new Date(schedule.scheduleDate);
      const isSameDay = 
        scheduleDate.getFullYear() === selectedDate.getFullYear() &&
        scheduleDate.getMonth() === selectedDate.getMonth() &&
        scheduleDate.getDate() === selectedDate.getDate();
      
      if (!isSameDay) return false;

      const [startHour, startMin] = schedule.startTime.split(':').map(Number);
      const [endHour, endMin] = schedule.endTime.split(':').map(Number);
      
      const scheduleStart = new Date(selectedDate);
      scheduleStart.setHours(startHour, startMin, 0, 0);
      
      const scheduleEnd = new Date(selectedDate);
      scheduleEnd.setHours(endHour, endMin, 0, 0);
      
      return timeDate >= scheduleStart && timeDate <= scheduleEnd;
    });

    return hasActiveSchedule;
  };

  const handleSubmit = () => {
    if (!newDateTime) {
      setError("Debes seleccionar una fecha y hora");
      return;
    }

    const endDateTime = addMinutes(newDateTime, durationMinutes);

    onConfirm({
      newDate: newDateTime.toISOString().split('T')[0],
      newStartTime: newDateTime.toTimeString().slice(0, 5),
      newEndTime: endDateTime.toTimeString().slice(0, 5)
    });

    // Reset form
    setNewDateTime(null);
    setDurationMinutes(60);
    setError("");
  };

  const handleClose = () => {
    setNewDateTime(null);
    setDurationMinutes(60);
    setError("");
    onClose();
  };

  const isValid = newDateTime && durationMinutes > 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            style={{ zIndex: 99998 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />
          <div 
            className="fixed inset-0 flex items-center justify-center p-4 pointer-events-none"
            style={{ zIndex: 99999 }}
          >
            <motion.div
              className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl pointer-events-auto overflow-hidden"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 px-6 py-5 border-b border-purple-100">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-purple/10">
                      <Calendar className="h-6 w-6 text-primary-purple" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">
                        Reagendar Cita
                      </h2>
                      <p className="text-sm text-gray-600 mt-0.5">
                        Proponer nueva fecha al deportista
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleClose}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Cerrar"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="px-6 py-5 space-y-4">
                <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-blue-800">
                    Se enviará un correo al deportista con la nueva fecha propuesta. El deportista deberá aceptar o rechazar la propuesta.
                  </p>
                </div>

                {appointmentData && (
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Cita cancelada:</p>
                    <p className="text-sm text-gray-600">
                      <strong>Deportista:</strong> {appointmentData.athleteName}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Especialidad:</strong> {appointmentData.specialtyLabel}
                    </p>
                    {appointmentData.cancelReason && (
                      <p className="text-sm text-gray-600 mt-2">
                        <strong>Motivo:</strong> {appointmentData.cancelReason}
                      </p>
                    )}
                  </div>
                )}

                <DatePickerField
                  label="Nueva Fecha y Hora"
                  selected={newDateTime}
                  onChange={(date) => {
                    setNewDateTime(date);
                    setError("");
                  }}
                  timeIntervals={15}
                  error={error}
                  required
                  placeholder="Seleccione fecha y hora"
                  minDate={new Date()}
                  filterTime={filterAvailableTimes}
                />

                {loadingSchedules && (
                  <p className="text-xs text-gray-500">Cargando horarios disponibles...</p>
                )}
                {!loadingSchedules && specialistSchedules.length === 0 && (
                  <p className="text-xs text-amber-600">El especialista no tiene horarios configurados</p>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Duración (minutos) <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-purple/30 transition-all"
                  >
                    <option value="30">30 minutos</option>
                    <option value="45">45 minutos</option>
                    <option value="60">60 minutos</option>
                    <option value="90">90 minutos</option>
                    <option value="120">120 minutos</option>
                  </select>
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-100">
                <button
                  onClick={handleClose}
                  className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!isValid}
                  className={`px-5 py-2.5 text-sm font-semibold text-white rounded-lg transition-colors shadow-sm flex items-center gap-2 ${
                    isValid
                      ? 'bg-primary-purple hover:bg-[#9d7bff]'
                      : 'bg-gray-300 cursor-not-allowed'
                  }`}
                >
                  <Send className="h-4 w-4" />
                  Enviar Propuesta
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default RescheduleAppointmentModal;
