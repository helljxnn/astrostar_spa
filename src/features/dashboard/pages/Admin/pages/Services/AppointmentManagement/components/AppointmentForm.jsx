import React, { useEffect } from "react";
import Form from "../../../../../../../../shared/components/form";
import { FormField } from "../../../../../../../../shared/components/FormField";
import {
    useAppointmentValidation,
    appointmentValidationRules,
} from "../hooks/useAppointmentValidation";
import { showErrorAlert } from "../../../../../../../../shared/utils/alerts";
import moment from "moment";
import { useAuth } from "../../../../../../../../shared/contexts/authContext";

const initialAppointmentValues = {
    title: "",
    description: "",
    date: "",
    time: "",
    athleteId: "",
    specialtyId: "",
    specialistId: "",
};

/**
 * Form component for creating or editing appointments.
 *
 * @param {object} props - Component props.
 * @param {boolean} props.isOpen - Controls if the modal is visible.
 * @param {function} props.onClose - Function to close the modal.
 * @param {function} props.onSave - Function executed when saving the appointment.
 * @param {object} [props.initialData] - Initial data for the form, used for pre-filling.
 * @param {Array} props.athleteList - List of athletes.
 * @param {Array} props.specialtyOptions - List of available specialties.
 * @param {object} props.specialistOptions - Object mapping specialties to specialists.
 */
const AppointmentForm = ({
    isOpen, onClose, onSave, initialData,
    athleteList = [],
    specialtyOptions = [],
    specialistOptions = {}
}) => {
    const {
        values,
        errors,
        touched,
        handleChange,
        handleBlur,
        validateAllFields,
        resetForm,
        setValues,
    } = useAppointmentValidation(initialAppointmentValues, appointmentValidationRules);
    const { user } = useAuth();
    const isAthlete = user?.role?.name === 'Deportista';

    useEffect(() => {
        if (isOpen) {
            const baseValues = {
                ...initialAppointmentValues,
                // Si el usuario es un atleta, su ID se selecciona automáticamente
                athleteId: isAthlete ? user.id : "",
            };

            if (initialData && initialData.start) {
                // Pre-fill form if a calendar slot was selected
                setValues({
                    ...baseValues,
                    date: moment(initialData.start).format("YYYY-MM-DD"),
                    time: moment(initialData.start).format("HH:mm"),
                });
            } else {
                // For manual creation or editing, reset to default
                resetForm();
            }
        } else {
            resetForm(); // Clean up form when closing
        }
    }, [isOpen, initialData, resetForm, setValues, isAthlete, user?.id]);

    const handleFormSubmit = () => {
        if (validateAllFields()) {
            onSave(values);
            onClose(); // Close modal after saving
        } else {
            showErrorAlert("Validation Error", "Please complete all required fields correctly.");
        }
    };

    const availableSpecialists = specialistOptions[values.specialtyId] || [];

    return (
        <Form
            isOpen={isOpen}
            onClose={onClose}
            onSubmit={handleFormSubmit}
            title={"Crear Nueva Cita"}
            submitText={"Agendar Cita"}
        >
            <div className="space-y-4">
                {/* Campo de Atleta: Oculto si el usuario es un atleta */}
                {!isAthlete && (
                    <FormField
                        label="Atleta"
                        name="athleteId"
                        type="select"
                        options={athleteList.map(a => ({ value: a.id, label: `${a.nombres} ${a.apellidos}` }))}
                        value={values.athleteId}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.athleteId && errors.athleteId}
                        required
                    />
                )}

                <FormField
                    label="Título de la Cita"
                    name="title"
                    type="text"
                    value={values.title}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.title && errors.title}
                    required
                    placeholder="Ej: Consulta de seguimiento"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        label="Tipo de Especialidad"
                        name="specialtyId"
                        type="select"
                        options={specialtyOptions}
                        value={values.specialtyId}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.specialtyId && errors.specialtyId}
                        required
                    />
                    <FormField
                        label="Especialista"
                        name="specialistId"
                        type="select"
                        options={availableSpecialists}
                        value={values.specialistId}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.specialistId && errors.specialistId}
                        required
                        disabled={!values.specialtyId} // Deshabilitado hasta que se elija especialidad
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        label="Fecha"
                        name="date"
                        type="date"
                        value={values.date}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.date && errors.date}
                        required
                    />
                    <FormField
                        label="Hora"
                        name="time"
                        type="time"
                        value={values.time}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.time && errors.time}
                        required
                    />
                </div>

                <FormField
                    label="Descripción / Razón"
                    name="description"
                    type="textarea"
                    value={values.description}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.description && errors.description}
                    placeholder="Detalles adicionales sobre la cita..."
                />
            </div>
        </Form>
    );
};

export default AppointmentForm;
