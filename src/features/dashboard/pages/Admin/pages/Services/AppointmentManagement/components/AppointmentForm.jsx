import React, { useMemo, useEffect } from "react";
import Form from "../../../../../../../../shared/components/form";
import { FormField } from "../../../../../../../../shared/components/FormField";
import {
    useAppointmentValidation,
    appointmentValidationRules,
} from "../hooks/useAppointmentValidation";
import { DatePickerField } from "../../../../../../../../shared/components/DatePickerField";
import { showErrorAlert } from "../../../../../../../../shared/utils/alerts";

// Datos de ejemplo para los formularios (pueden venir de una API en un caso real)
const specialtyOptions = [
    { value: "psicologia", label: "Psicología Deportiva" },
    { value: "fisioterapia", label: "Fisioterapia" },
    { value: "nutricion", label: "Nutrición" },
    { value: "medicina", label: "Medicina Deportiva" },
];

const specialistData = {
    psicologia: [
        { value: "Dra. Ana Pérez", label: "Dra. Ana Pérez", schedule: { days: [1, 2, 3, 4, 5], start: '08:00', end: '17:00' } }, // Lunes a Viernes, 8am - 5pm
        { value: "Dr. Juan Gómez", label: "Dr. Juan Gómez", schedule: { days: [1, 3, 5], start: '09:00', end: '18:00' } }, // Lunes, Miércoles, Viernes, 9am - 6pm
    ],
    fisioterapia: [
        { value: "Lic. Carlos Ruiz", label: "Lic. Carlos Ruiz", schedule: { days: [2, 4], start: '10:00', end: '19:00' } }, // Martes y Jueves, 10am - 7pm
    ],
    nutricion: [
        { value: "Lic. María Fernández", label: "Lic. María Fernández", schedule: { days: [1, 2, 3, 4, 5], start: '07:00', end: '15:00' } }, // Lunes a Viernes, 7am - 3pm
    ],
    medicina: [
        { value: "Dr. Luis Martínez", label: "Dr. Luis Martínez", schedule: { days: [6, 0], start: '08:00', end: '12:00' } }, // Sábados y Domingos, 8am - 12pm
    ],
};

// Se mueve fuera del componente para que sea una referencia estable.
const initialAppointmentValues = {
    specialty: "",
    specialist: "",
    start: null, // Unificamos fecha y hora en un solo campo 'start'
};

/**
 * Componente de formulario para crear o editar citas.
 *
 * @param {object} props - Propiedades del componente.
 * @param {boolean} props.isOpen - Controla si el modal está visible.
 * @param {function} props.onClose - Función para cerrar el modal.
 * @param {function} props.onSave - Función que se ejecuta al guardar la cita.
 * @param {Array<object>} props.athleteList - Lista de atletas disponibles para seleccionar.
 * @param {object} [props.initialData] - Datos iniciales para el formulario en modo edición.
 */
const AppointmentForm = ({ isOpen, onClose, onSave, initialData, athleteList = [] }) => {
    const {
        // ... (existing destructuring)
        values,
        errors,
        touched,
        handleChange,
        handleBlur,
        validateAllFields,
        resetForm,
        setValues,
        setFieldValue,
    } = useAppointmentValidation(initialAppointmentValues, appointmentValidationRules);

    // Manejador personalizado para el cambio de especialidad
    const handleSpecialtyChange = (e) => {
        const { name, value } = e.target;
        // Actualiza la especialidad y resetea el especialista en un solo paso
        // para evitar re-renders intermedios que puedan causar problemas.
        setValues(prev => ({ ...prev, [name]: value, specialist: '' }));
    };

    // Obtiene el horario del especialista seleccionado
    const getSpecialistSchedule = (specialty, specialist) => {
        if (!specialty || !specialist) return null;
        const specialistInfo = specialistData[specialty]?.find(s => s.value === specialist);
        return specialistInfo ? specialistInfo.schedule : null;
    };

    const specialistSchedule = useMemo(() => getSpecialistSchedule(values.specialty, values.specialist), [values.specialty, values.specialist]);

    // Cargar datos iniciales si se proporciona initialData (para edición)
    useEffect(() => {
        if (isOpen) {
            if (initialData) { // Si es un slot de calendario o una cita para editar
                setValues(prev => ({
                    ...initialAppointmentValues, // Resetear primero
                    // Si es una cita existente, precarga sus datos
                    specialty: initialData.specialty || "",
                    specialist: initialData.specialist || "",
                    description: initialData.description || prev.description || "",
                    athlete: initialData.athlete || "",
                    // Si hay una fecha de inicio, la usamos, si no, es null
                    start: initialData.start ? new Date(initialData.start) : null,
                }));
            } else {
                resetForm();
            }
        } else if (!isOpen) { // Solo resetear si no está abierto
            resetForm(); // Limpiar el formulario al cerrar
        }
    }, [isOpen, initialData, resetForm, setValues]);

    // Efecto para limpiar fecha/hora si el especialista cambia y la selección actual es inválida
    useEffect(() => {
        if (specialistSchedule && values.start) {
            const selectedDay = values.start.getDay(); // getDay() es consistente
            const selectedTime = values.start.toTimeString().slice(0, 5);

            // Si el día o la hora no son válidos, resetea la fecha
            if (!specialistSchedule.days.includes(selectedDay) || selectedTime < specialistSchedule.start || selectedTime >= specialistSchedule.end) {
                setFieldValue('start', null);
            }
        }
    }, [specialistSchedule, values.start, setFieldValue]);

    const handleFormSubmit = () => {
        if (validateAllFields()) {
            // La validación ahora está implícita en el DatePicker, pero una última comprobación no hace daño.
            if (!values.start) {
                // Si la validación pasa pero 'start' es nulo, es un caso especial.
                // Esto puede ocurrir si el campo no se ha tocado pero es requerido.
                // Forzamos la validación en este campo para mostrar el error.
                handleBlur('start', null);
                showErrorAlert("Error de validación", "Debe seleccionar una fecha y hora válidas.");
                return;
            }

            const finalValues = {
                ...values,
                athlete: Number(values.athlete), // Asegurarse de que el ID del deportista sea un número
                date: values.start.toISOString().split('T')[0],
                time: values.start.toTimeString().slice(0, 5),
            };
            onSave(finalValues);
            onClose(); // Cerrar el modal después de guardar
        } else {
            showErrorAlert("Error de validación", "Por favor, complete todos los campos requeridos correctamente.");
        }
    };

    // Filtra los especialistas disponibles según la especialidad seleccionada
    const availableSpecialists = useMemo(() => {
        if (values.specialty && specialistData[values.specialty]) {
            return specialistData[values.specialty];
        }
        return [];
    }, [values.specialty]);

    // Función para filtrar las fechas en el calendario
    const filterDate = (date) => {
        if (!specialistSchedule) return true; // Si no hay horario, no deshabilitar
        const dayOfWeek = date.getDay();
        return specialistSchedule.days.includes(dayOfWeek);
    };

    return (
        <Form
            isOpen={isOpen}
            onClose={onClose}
            onSubmit={handleFormSubmit}
            title={initialData && initialData.id ? "Editar Cita" : "Crear Nueva Cita"}
            submitText={initialData && initialData.id ? "Guardar Cambios" : "Agendar Cita"}
        >
            <FormField
                label="Deportista"
                name="athlete"
                type="select"
                options={athleteList.map(athlete => ({ value: athlete.id, label: `${athlete.nombres} ${athlete.apellidos}` }))}
                value={values.athlete}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.athlete && errors.athlete}
                required
                placeholder="Seleccione un deportista"
            />
            <FormField
                label="Tipo de Especialidad"
                name="specialty"
                type="select"
                options={specialtyOptions}
                value={values.specialty}
                onChange={handleSpecialtyChange}
                onBlur={handleBlur}
                error={touched.specialty && errors.specialty}
                required
            />
            <FormField
                label="Especialista"
                name="specialist"
                type="select"
                options={availableSpecialists}
                value={values.specialist}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.specialist && errors.specialist}
                required
                disabled={!values.specialty}
                placeholder={!values.specialty ? "Seleccione una especialidad primero" : "Seleccione un especialista"}
            />
            <FormField
                label="Descripción / Motivo"
                name="description"
                type="textarea"
                value={values.description}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.description && errors.description}
                required
            />
            {/* Mensaje de horario del especialista */}
            {values.specialty && values.specialist && (() => {
                const specialistInfo = specialistData[values.specialty]?.find(s => s.value === values.specialist);
                if (!specialistInfo) return null;
                const { days, start, end } = specialistInfo.schedule;
                const dias = days.map(d => ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][d]).join(', ');
                return (
                    <div className="bg-gray-100 border border-gray-400 rounded-lg text-gray-800 font-medium mb-3 px-4 py-3 shadow-sm">
                        <span className="font-semibold">Horario del especialista seleccionado:</span><br />
                        <span className="text-gray-700">{dias} de {start} a {end}</span>
                        <div className="text-xs text-gray-600 mt-1">
                            Elija una fecha y hora dentro de este horario.
                        </div>
                    </div>
                );
            })()}
            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                <DatePickerField
                    label="Fecha y Hora de la Cita"
                    selected={values.start}
                    onChange={(date) => setFieldValue('start', date)}
                    filterDate={filterDate}
                    minTime={specialistSchedule?.start}
                    maxTime={specialistSchedule?.end}
                    disabled={!values.specialist}
                    error={touched.start && errors.start}
                    required
                />
            </div>
        </Form>
    );
};

export default AppointmentForm;