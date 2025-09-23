import React, { useState, useMemo } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "moment/locale/es"; // Importar localización en español para moment
import { motion, AnimatePresence } from "framer-motion";
import { SiGoogleforms } from "react-icons/si";

import Form from "../../../../../../../shared/components/form";
import { FormField } from "../../../../../../../shared/components/FormField";
import {
    useAppointmentValidation,
    appointmentValidationRules,
} from "./hooks/useAppointmentValidation";
import { showSuccessAlert, showErrorAlert } from "../../../../../../../shared/utils/alerts";

// Configurar moment para que use español globalmente en este componente
moment.locale("es");

// El localizer le dice a react-big-calendar cómo manejar las fechas
const localizer = momentLocalizer(moment);

// Datos de ejemplo para las citas. En una app real, esto vendría de una API.
const sampleEvents = [
    {
        id: 1,
        title: "Reunión de equipo",
        start: new Date(new Date().setDate(new Date().getDate() - 2)), // Hace 2 días
        end: new Date(new Date().setDate(new Date().getDate() - 2)),
        allDay: true,
        type: 'reunion',
    },
    {
        id: 2,
        title: "Entrenamiento",
        start: new Date(), // Hoy
        end: new Date(new Date().setHours(new Date().getHours() + 2)), // Dura 2 horas
        type: 'entrenamiento',
    },
    {
        id: 3,
        title: "Cita con Psicología - Deportista X",
        start: new Date(new Date().setDate(new Date().getDate() + 1)), // Mañana
        end: new Date(new Date().setDate(new Date().getDate() + 1)),
        type: 'cita',
    },
];

// Datos de ejemplo para los formularios
const specialtyOptions = [
    { value: "psicologia", label: "Psicología Deportiva" },
    { value: "fisioterapia", label: "Fisioterapia" },
    { value: "nutricion", label: "Nutrición" },
    { value: "medicina", label: "Medicina Deportiva" },
];

const specialistOptions = {
    psicologia: [
        { value: "Dra. Ana Pérez", label: "Dra. Ana Pérez" },
        { value: "Dr. Juan Gómez", label: "Dr. Juan Gómez" },
    ],
    fisioterapia: [
        { value: "Lic. Carlos Ruiz", label: "Lic. Carlos Ruiz" },
    ],
    nutricion: [
        { value: "Lic. María Fernández", label: "Lic. María Fernández" },
    ],
    medicina: [
        { value: "Dr. Luis Martínez", label: "Dr. Luis Martínez" },
    ],
};

function Appointments() {
    const [events, setEvents] = useState(sampleEvents);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);

    const {
        values,
        errors,
        touched,
        handleChange,
        handleBlur,
        validateAllFields,
        resetForm,
    } = useAppointmentValidation({
        specialty: "",
        specialist: "",
        description: "",
        date: "",
        time: "",
    }, appointmentValidationRules);

    // Función para dar estilo a los eventos del calendario según su tipo
    const eventPropGetter = (event) => {
        let style = {
            borderRadius: "5px",
            color: "white",
            border: "0px",
            display: "block",
            opacity: 0.85
        };
        // Usamos los colores de tu configuración de Tailwind
        switch (event.type) {
            case 'reunion':
                style.backgroundColor = '#8B5CF6'; // primary-purple
                break;
            case 'entrenamiento':
                style.backgroundColor = '#3B82F6'; // primary-blue
                break;
            case 'cita':
                style.backgroundColor = '#6D28D9'; // Un morado más oscuro para diferenciar
                break;
            default:
                style.backgroundColor = '#64748B'; // slate-500
                break;
        }
        return { style };
    };

    // Mensajes en español para el calendario
    const messages = {
        allDay: 'Todo el día',
        previous: 'Anterior',
        next: 'Siguiente',
        today: 'Hoy',
        month: 'Mes',
        week: 'Semana',
        day: 'Día',
        agenda: 'Agenda',
        date: 'Fecha',
        time: 'Hora',
        event: 'Evento',
        noEventsInRange: 'No hay eventos en este rango.',
        showMore: total => `+ Ver más (${total})`
    };

    const handleSelectEvent = (event) => {
        // Solo mostramos el modal de detalles para eventos de tipo 'cita'
        // que son los que creamos con el formulario y contienen los detalles.
        if (event.type === 'cita' && event.specialty) {
            setSelectedEvent(event);
            setIsViewModalOpen(true);
        }
        // Aquí se podría agregar lógica para otros tipos de eventos si se desea.
        // Por ejemplo, abrir un modal diferente para 'reunion' o 'entrenamiento'.
    };

    const handleCloseViewModal = () => {
        setIsViewModalOpen(false);
        // Pequeña demora para que la animación de salida se complete antes de limpiar los datos
        setTimeout(() => {
            setSelectedEvent(null);
        }, 300);
    };

    const handleOpenCreateModal = () => {
        setIsCreateModalOpen(true);
    };

    const handleCloseCreateModal = () => {
        setIsCreateModalOpen(false);
        resetForm();
    };

    const handleCreateSubmit = () => {
        if (!validateAllFields()) {
            showErrorAlert("Error de validación", "Por favor, complete todos los campos requeridos correctamente.");
            return;
        }

        // Combinar fecha y hora para crear objetos Date
        const startDateTime = new Date(`${values.date}T${values.time}`);
        // Suponemos que la cita dura 1 hora
        const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000);

        const newEvent = {
            id: Date.now(),
            title: `Cita: ${values.specialist}`,
            start: startDateTime,
            end: endDateTime,
            allDay: false,
            type: 'cita', // Se podría mapear desde la especialidad si se desea
            description: values.description,
            specialty: values.specialty,
            specialist: values.specialist,
        };

        setEvents(prevEvents => [...prevEvents, newEvent]);
        showSuccessAlert("¡Cita Creada!", "La nueva cita ha sido agendada correctamente.");
        handleCloseCreateModal();
    };

    // Filtra los especialistas disponibles según la especialidad seleccionada
    const availableSpecialists = useMemo(() => {
        if (values.specialty && specialistOptions[values.specialty]) {
            return specialistOptions[values.specialty];
        }
        return [];
    }, [values.specialty]);

    // Obtiene la etiqueta de la especialidad a partir de su valor
    const getSpecialtyLabel = (value) => {
        const option = specialtyOptions.find(opt => opt.value === value);
        return option ? option.label : 'No especificada';
    };

    // Variantes para la animación del modal (similar al componente Form)
    const backdropVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
    };

    const modalVariants = {
        hidden: { scale: 0.95, opacity: 0, y: 50 },
        visible: {
            scale: 1,
            opacity: 1,
            y: 0,
            transition: {
                type: "spring",
                damping: 25,
                stiffness: 300,
            },
        },
        exit: { scale: 0.9, opacity: 0, y: 30, transition: { duration: 0.2 } },
    };

    // Componente para mostrar un detalle en el modal de visualización
    const DetailItem = ({ label, value }) => (
        <div>
            <p className="text-sm font-medium text-gray-500">{label}</p>
            <p className="text-lg text-gray-800 break-words">{value || 'No especificado'}</p>
        </div>
    );
    return (
        <div className="w-full h-auto grid grid-rows-[auto_1fr] relative p-4">
            {/* Cabecera */}
            <div id="header" className="w-full h-auto p-4 flex justify-between items-center">
                <div>
                    <h1 className="text-5xl font-bold text-gray-800">Gestión de Citas</h1>
                    <p className="text-gray-500 mt-2">
                        Visualiza, crea y gestiona las citas
                    </p>
                </div>
                <button onClick={handleOpenCreateModal} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-blue text-white font-semibold shadow-lg hover:bg-primary-purple transition-colors">
                    Crear Cita <SiGoogleforms size={20} />
                </button>
            </div>

            {/* Cuerpo con el Calendario */}
            <div id="body" className="w-full h-full p-4 bg-white rounded-2xl shadow-lg">
                <div className="h-[75vh]"> {/* Contenedor con altura definida */}
                    <Calendar
                        localizer={localizer}
                        events={events}
                        startAccessor="start"
                        endAccessor="end"
                        style={{ height: '100%' }}
                        eventPropGetter={eventPropGetter}
                        messages={messages}
                        views={['month', 'week', 'day', 'agenda']}
                        onSelectEvent={handleSelectEvent}
                    />
                </div>
            </div>

            {/* Modal para Crear Cita */}
            <Form
                isOpen={isCreateModalOpen}
                onClose={handleCloseCreateModal}
                onSubmit={handleCreateSubmit}
                title="Crear Nueva Cita"
                submitText="Agendar Cita"
            >
                <FormField
                    label="Tipo de Especialidad"
                    name="specialty"
                    type="select"
                    options={specialtyOptions}
                    value={values.specialty}
                    onChange={handleChange}
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
            </Form>

            {/* Modal para Ver Detalles de la Cita */}
            <AnimatePresence>
                {isViewModalOpen && selectedEvent && (
                    <motion.div
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                    >
                        <motion.div
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            variants={backdropVariants}
                            onClick={handleCloseViewModal}
                        />
                        <motion.div
                            variants={modalVariants}
                            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
                        >
                            {/* Header */}
                            <div className="sticky top-0 bg-white rounded-t-2xl border-b border-gray-200 p-6 z-10">
                                <button type="button" onClick={handleCloseViewModal} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full">✕</button>
                                <h2 className="text-3xl font-bold bg-gradient-to-r from-primary-purple to-primary-blue bg-clip-text text-transparent text-center">
                                    Detalles de la Cita
                                </h2>
                            </div>

                            {/* Body */}
                            <div className="p-8 space-y-5">
                                <DetailItem label="Especialidad" value={getSpecialtyLabel(selectedEvent.specialty)} />
                                <DetailItem label="Especialista" value={selectedEvent.specialist} />
                                <DetailItem label="Fecha" value={moment(selectedEvent.start).format('dddd, D [de] MMMM [de] YYYY')} />
                                <DetailItem label="Hora" value={moment(selectedEvent.start).format('h:mm a')} />
                                <DetailItem label="Descripción / Motivo" value={selectedEvent.description} />
                            </div>

                            {/* Footer */}
                            <div className="flex justify-end p-6 border-t border-gray-200">
                                <button onClick={handleCloseViewModal} className="px-8 py-3 bg-gray-100 text-gray-800 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium">
                                    Cerrar
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default Appointments;