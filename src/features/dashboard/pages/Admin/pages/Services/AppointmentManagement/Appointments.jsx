import "react-big-calendar/lib/css/react-big-calendar.css"; // Asegura que los estilos del calendario se carguen
import React, { useState, } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "moment/locale/es"; // Importar localización en español para moment
import { SiGoogleforms } from "react-icons/si";
import { showSuccessAlert, } from "../../../../../../../shared/utils/alerts";
import Swal from 'sweetalert2';
import AppointmentForm from "./components/AppointmentForm";
import AppointmentDetails from "./components/AppointmentDetails";
// Configurar moment para que use español globalmente en este componente
moment.locale("es");

// El localizer le dice a react-big-calendar cómo manejar las fechas
const localizer = momentLocalizer(moment);

// Datos de ejemplo para las citas. En una app real, esto vendría de una API.
const sampleAppointments = [
    {
        id: 1,
        title: "Cita con Psicología - Deportista X",
        start: new Date(new Date().setDate(new Date().getDate() + 1)), // Mañana
        end: new Date(new Date().setDate(new Date().getDate() + 1)),
        specialty: "psicologia",
        specialist: "Dra. Ana Pérez",
        description: "Revisión de avance con el deportista X.",
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

// Datos de ejemplo para los deportistas (en una app real, esto vendría de una API)
const sampleAthletes = [
    { id: 101, nombres: "Juan", apellidos: "Pérez" },
    { id: 102, nombres: "María", apellidos: "Gómez" },
    { id: 103, nombres: "Carlos", apellidos: "Rodríguez" },
];
function Appointments() {
    const [appointments, setAppointments] = useState(sampleAppointments);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [view, setView] = useState("month"); // Estado para controlar la vista actual del calendario


    // Función para dar estilo a las citas del calendario
    const appointmentPropGetter = (event) => {
        let style = {
            backgroundColor: '#6D28D9',
            borderRadius: "5px",
            color: "white",
            border: "0px",
            display: "block",
            opacity: 0.85
        };
        if (event.status === 'cancelled') {
            style = {
                ...style,
                backgroundColor: '#a3a3a3',
                color: '#e5e5e5',
                opacity: 0.5,
                textDecoration: 'line-through',
            };
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
        event: 'Cita',
        noEventsInRange: 'No hay citas en este rango.',
        showMore: total => `+ Ver más (${total})`
    };

    const handleSelectAppointment = (appointment) => {
        // Solo mostramos el modal de detalles para citas que tienen detalles.
        if (appointment.specialty) {
            setSelectedAppointment(appointment);
            setIsViewModalOpen(true);
        }
    };

    const handleCloseViewModal = () => {
        setIsViewModalOpen(false);
        // Pequeña demora para que la animación de salida se complete antes de limpiar los datos
        setTimeout(() => {
            setSelectedAppointment(null);
        }, 300);
    };

    const handleOpenCreateModal = () => {
        setIsCreateModalOpen(true);
    };

    const handleCloseCreateModal = () => {
        setIsCreateModalOpen(false);
    };

    const handleCreateSubmit = (formValues) => {
        // Combinar fecha y hora para crear objetos Date
        const startDateTime = new Date(`${formValues.date}T${formValues.time}`);
        const selectedAthlete = sampleAthletes.find(a => a.id === parseInt(formValues.athlete));
        const athleteName = selectedAthlete ? `${selectedAthlete.nombres} ${selectedAthlete.apellidos}` : 'Deportista Desconocido';

        // Suponemos que la cita dura 1 hora
        const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000);

        const newAppointment = {
            id: Date.now(),
            title: `Cita: ${athleteName} - ${formValues.specialist}`,
            start: startDateTime,
            end: endDateTime,
            allDay: false,
            description: formValues.description,
            specialty: formValues.specialty,
            specialist: formValues.specialist,
            athlete: formValues.athlete,
            status: 'active', // Por defecto activa
            cancelReason: '',
        };

        setAppointments(prevAppointments => [...prevAppointments, newAppointment]);
        showSuccessAlert("¡Cita Creada!", "La nueva cita ha sido agendada correctamente.");
        // El modal se cierra desde el propio AppointmentForm
    };

    // Obtiene la etiqueta de la especialidad a partir de su valor
    const getSpecialtyLabel = (value) => {
        const option = specialtyOptions.find(opt => opt.value === value);
        return option ? option.label : 'No especificada';
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
                <div className="flex items-center gap-4">
                    {/* Grupo de botones para las vistas del calendario */}
                    <div className="hidden sm:flex items-center bg-gray-100 rounded-lg p-1 border border-gray-200">
                        <button
                            onClick={() => setView('month')}
                            className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${view === 'month' ? 'bg-white text-primary-purple shadow-sm' : 'text-gray-600 hover:bg-gray-200'}`}
                        >
                            Mes
                        </button>
                        <button
                            onClick={() => setView('week')}
                            className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${view === 'week' ? 'bg-white text-primary-purple shadow-sm' : 'text-gray-600 hover:bg-gray-200'}`}
                        >
                            Semana
                        </button>
                        <button
                            onClick={() => setView('day')}
                            className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${view === 'day' ? 'bg-white text-primary-purple shadow-sm' : 'text-gray-600 hover:bg-gray-200'}`}
                        >
                            Día
                        </button>
                    </div>
                    <button onClick={handleOpenCreateModal} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-purple to-primary-blue text-white rounded-lg shadow hover:opacity-90 transition whitespace-nowrap">
                        Crear Cita <SiGoogleforms size={20} />
                    </button>
                </div>
            </div>

            {/* Cuerpo con el Calendario */}
            <div id="body" className="w-full h-full p-4 bg-white rounded-2xl shadow-lg">
                <div className="h-[50vh]"> {/* Altura flexible para que ocupe el espacio disponible */}
                    <Calendar
                        localizer={localizer}
                        events={appointments}
                        startAccessor="start"
                        endAccessor="end"
                        style={{ height: '100%' }}
                        eventPropGetter={appointmentPropGetter}
                        messages={messages}
                        views={['month', 'week', 'day', 'agenda']}
                        onSelectEvent={handleSelectAppointment}
                        view={view}
                        onView={setView}
                        toolbar={true}
                    />
                </div>
            </div>

            {/* Modal para Crear Cita */}
            <AppointmentForm
                isOpen={isCreateModalOpen}
                onClose={handleCloseCreateModal}
                onSave={handleCreateSubmit}
                athleteList={sampleAthletes} // Pasar la lista de deportistas
            />
            <AppointmentDetails
                isOpen={isViewModalOpen}
                onClose={handleCloseViewModal}
                appointmentData={selectedAppointment}
                athleteList={sampleAthletes}
                onCancelAppointment={async (appointment) => {
                    // Solo pedir motivo de cancelación
                    const { value: reason } = await Swal.fire({
                        title: 'Motivo de cancelación',
                        input: 'textarea',
                        inputLabel: 'Por favor, indique el motivo de la cancelación',
                        inputPlaceholder: 'Escribe el motivo aquí...',
                        inputAttributes: {
                            'aria-label': 'Motivo de cancelación'
                        },
                        showCancelButton: true,
                        confirmButtonText: 'Cancelar cita',
                        cancelButtonText: 'Volver',
                        customClass: {
                            confirmButton: 'bg-primary-purple text-white font-bold px-6 py-2 rounded-lg mr-2',
                            cancelButton: 'bg-primary-blue text-white font-bold px-6 py-2 rounded-lg',
                        },
                        buttonsStyling: false,
                        inputValidator: (value) => {
                            if (!value) {
                                return 'Debes ingresar un motivo';
                            }
                        }
                    });
                    if (reason) {
                        setAppointments(prev => prev.map(a => a.id === appointment.id ? { ...a, status: 'cancelled', cancelReason: reason } : a));
                    }
                }}
            />
        </div>
    );
}



export default Appointments;