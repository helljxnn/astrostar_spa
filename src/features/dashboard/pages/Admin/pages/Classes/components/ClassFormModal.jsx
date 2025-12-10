import React, { useState, useEffect } from "react";
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Users,
  User,
  FileText,
} from "lucide-react";
import { useClasses } from "../hooks/useClasses";
import LoadingSpinner from "../../../../../../../shared/components/LoadingSpinner";
import employeeService from "../../Services/Employees/services/employeeService";
import AthletesService from "../../Athletes/AthletesSection/services/AthletesService";

const ClassFormModal = ({ isOpen, onClose, onSuccess, classData = null }) => {
  const { createClass, updateClass, loading } = useClasses();
  const [employees, setEmployees] = useState([]);
  const [athletes, setAthletes] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    classDate: "",
    startTime: "",
    endTime: "",
    location: "",
    maxCapacity: "",
    employeeId: "",
    athleteIds: [],
    notes: "",
  });

  const [errors, setErrors] = useState({});

  // Cargar datos de referencia
  useEffect(() => {
    const loadReferenceData = async () => {
      try {
        setLoadingData(true);

        const [employeesResponse, athletesResponse] = await Promise.all([
          employeeService.getAll({ limit: 1000 }),
          AthletesService.getAll({ limit: 1000 }),
        ]);

        if (employeesResponse.success) {
          setEmployees(employeesResponse.data || []);
        }

        if (athletesResponse.success) {
          setAthletes(athletesResponse.data || []);
        }
      } catch (error) {
        console.error("Error loading reference data:", error);
      } finally {
        setLoadingData(false);
      }
    };

    if (isOpen) {
      loadReferenceData();
    }
  }, [isOpen]);

  // Cargar datos de la clase si es edición
  useEffect(() => {
    if (classData) {
      setFormData({
        title: classData.title || "",
        description: classData.description || "",
        classDate: classData.classDate ? classData.classDate.split("T")[0] : "",
        startTime: classData.startTime || "",
        endTime: classData.endTime || "",
        location: classData.location || "",
        maxCapacity: classData.maxCapacity || "",
        employeeId: classData.employeeId || "",
        athleteIds: classData.athletes
          ? classData.athletes.map((a) => a.athleteId)
          : [],
        notes: classData.notes || "",
      });
    } else {
      // Resetear formulario para nueva clase
      setFormData({
        title: "",
        description: "",
        classDate: "",
        startTime: "",
        endTime: "",
        location: "",
        maxCapacity: "",
        employeeId: "",
        athleteIds: [],
        notes: "",
      });
    }
    setErrors({});
  }, [classData, isOpen]);

  /**
   * Validar formulario
   */
  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "El título es requerido";
    }

    if (!formData.classDate) {
      newErrors.classDate = "La fecha es requerida";
    } else {
      const selectedDate = new Date(formData.classDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        newErrors.classDate = "No se puede programar una clase en fecha pasada";
      }
    }

    if (!formData.startTime) {
      newErrors.startTime = "La hora de inicio es requerida";
    }

    if (!formData.endTime) {
      newErrors.endTime = "La hora de fin es requerida";
    }

    if (formData.startTime && formData.endTime) {
      const [startHour, startMin] = formData.startTime.split(":").map(Number);
      const [endHour, endMin] = formData.endTime.split(":").map(Number);
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;

      if (startMinutes >= endMinutes) {
        newErrors.endTime =
          "La hora de fin debe ser posterior a la hora de inicio";
      }
    }

    if (!formData.employeeId) {
      newErrors.employeeId = "El profesor es requerido";
    }

    if (formData.maxCapacity && formData.maxCapacity < 1) {
      newErrors.maxCapacity = "La capacidad debe ser mayor a 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Manejar cambios en el formulario
   */
  const handleChange = (e) => {
    const { name, value, type } = e.target;

    if (type === "number") {
      setFormData((prev) => ({
        ...prev,
        [name]: value === "" ? "" : parseInt(value),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // Limpiar error del campo
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  /**
   * Manejar selección de deportistas
   */
  const handleAthleteSelection = (athleteId) => {
    setFormData((prev) => ({
      ...prev,
      athleteIds: prev.athleteIds.includes(athleteId)
        ? prev.athleteIds.filter((id) => id !== athleteId)
        : [...prev.athleteIds, athleteId],
    }));
  };

  /**
   * Manejar envío del formulario
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const submitData = {
        ...formData,
        maxCapacity: formData.maxCapacity || null,
      };

      if (classData) {
        await updateClass(classData.id, submitData);
      } else {
        await createClass(submitData);
      }

      onSuccess();
    } catch (error) {
      console.error("Error saving class:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {classData ? "Editar Clase" : "Nueva Clase"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {loadingData ? (
          <div className="p-8">
            <LoadingSpinner />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Información básica */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Información Básica
                </h3>

                {/* Título */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Título *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.title ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="Ej: Clase de Inglés Básico"
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                  )}
                </div>

                {/* Descripción */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Descripción de la clase..."
                  />
                </div>

                {/* Profesor */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Profesor *
                  </label>
                  <select
                    name="employeeId"
                    value={formData.employeeId}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.employeeId ? "border-red-300" : "border-gray-300"
                    }`}
                  >
                    <option value="">Seleccionar profesor</option>
                    {employees.map((employee) => (
                      <option key={employee.id} value={employee.id}>
                        {employee.user.firstName} {employee.user.lastName}
                      </option>
                    ))}
                  </select>
                  {errors.employeeId && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.employeeId}
                    </p>
                  )}
                </div>
              </div>

              {/* Fecha y horario */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Fecha y Horario
                </h3>

                {/* Fecha */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha *
                  </label>
                  <input
                    type="date"
                    name="classDate"
                    value={formData.classDate}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.classDate ? "border-red-300" : "border-gray-300"
                    }`}
                  />
                  {errors.classDate && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.classDate}
                    </p>
                  )}
                </div>

                {/* Horarios */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hora de inicio *
                    </label>
                    <input
                      type="time"
                      name="startTime"
                      value={formData.startTime}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.startTime ? "border-red-300" : "border-gray-300"
                      }`}
                    />
                    {errors.startTime && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.startTime}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hora de fin *
                    </label>
                    <input
                      type="time"
                      name="endTime"
                      value={formData.endTime}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.endTime ? "border-red-300" : "border-gray-300"
                      }`}
                    />
                    {errors.endTime && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.endTime}
                      </p>
                    )}
                  </div>
                </div>

                {/* Ubicación */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ubicación
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: Aula 101, Salón principal"
                  />
                </div>

                {/* Capacidad máxima */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Capacidad máxima
                  </label>
                  <input
                    type="number"
                    name="maxCapacity"
                    value={formData.maxCapacity}
                    onChange={handleChange}
                    min="1"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.maxCapacity ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="Número máximo de deportistas"
                  />
                  {errors.maxCapacity && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.maxCapacity}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Deportistas */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2 mb-4">
                <Users className="h-5 w-5" />
                Deportistas Asignadas
              </h3>

              <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-md">
                {athletes.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    No hay deportistas disponibles
                  </div>
                ) : (
                  <div className="p-4 space-y-2">
                    {athletes.map((athlete) => (
                      <label
                        key={athlete.id}
                        className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={formData.athleteIds.includes(athlete.id)}
                          onChange={() => handleAthleteSelection(athlete.id)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">
                            {athlete.user.firstName} {athlete.user.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {athlete.user.email}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <p className="mt-2 text-sm text-gray-600">
                Deportistas seleccionadas: {formData.athleteIds.length}
                {formData.maxCapacity && ` / ${formData.maxCapacity}`}
              </p>
            </div>

            {/* Notas */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notas adicionales
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Notas o instrucciones especiales..."
              />
            </div>

            {/* Botones */}
            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading && <LoadingSpinner size="sm" />}
                {classData ? "Actualizar" : "Crear"} Clase
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ClassFormModal;
