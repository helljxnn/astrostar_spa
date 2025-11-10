import React, { useEffect } from "react";
import Form from "../../../../../../../../shared/components/form";
import { FormField } from "../../../../../../../../shared/components/FormField";
import {
    useAppointmentValidation,
    appointmentValidationRules,
} from "../hooks/useAppointmentValidation";
import { showErrorAlert } from "../../../../../../../../shared/utils/alerts";
import moment from "moment";

const initialAppointmentValues = {
    title: "",
    description: "",
    date: "",
    time: "",
};

/**
 * Form component for creating or editing appointments.
 *
 * @param {object} props - Component props.
 * @param {boolean} props.isOpen - Controls if the modal is visible.
 * @param {function} props.onClose - Function to close the modal.
 * @param {function} props.onSave - Function executed when saving the appointment.
 * @param {object} [props.initialData] - Initial data for the form, used for pre-filling.
 */
const AppointmentForm = ({ isOpen, onClose, onSave, initialData }) => {
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

    useEffect(() => {
        if (isOpen) {
            if (initialData && initialData.start) {
                // Pre-fill form if a calendar slot was selected
                setValues({
                    ...initialAppointmentValues,
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
    }, [isOpen, initialData, resetForm, setValues]);

    const handleFormSubmit = () => {
        if (validateAllFields()) {
            onSave(values);
            onClose(); // Close modal after saving
        } else {
            showErrorAlert("Validation Error", "Please complete all required fields correctly.");
        }
    };

    return (
        <Form
            isOpen={isOpen}
            onClose={onClose}
            onSubmit={handleFormSubmit}
            title={"Create New Appointment"}
            submitText={"Schedule Appointment"}
        >
            <FormField
                label="Title"
                name="title"
                type="text"
                value={values.title}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.title && errors.title}
                required
                placeholder="e.g., Team Meeting"
            />
            <FormField
                label="Description / Reason"
                name="description"
                type="textarea"
                value={values.description}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.description && errors.description}
                required
                placeholder="e.g., Discuss weekly progress"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                    label="Date"
                    name="date"
                    type="date"
                    value={values.date}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.date && errors.date}
                    required
                />
                <FormField
                    label="Time"
                    name="time"
                    type="time"
                    value={values.time}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.time && errors.time}
                    required
                />
            </div>
        </Form>
    );
};

export default AppointmentForm;
