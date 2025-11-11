import "react-big-calendar/lib/css/react-big-calendar.css";
import "./styles/AppointmentCalendar.css";
import React, { useState, useMemo, useCallback, useEffect } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import { SiGoogleforms } from "react-icons/si";
import { showSuccessAlert, showErrorAlert } from "../../../../../../../shared/utils/alerts";
import Swal from 'sweetalert2';
import AppointmentForm from "./components/AppointmentForm";
import SearchInput from "../../../../../../../shared/components/SearchInput";
import AppointmentDetails from "./components/AppointmentDetails";
import { useAuth } from "../../../../../../../shared/contexts/authContext"; // Importar el hook de autenticación
import apiClient from "../../../../../../../shared/services/apiClient"; // 1. Importar apiClient directamente

// Set moment to use English locale
moment.locale("en");

const localizer = momentLocalizer(moment);

// Mock data - will be replaced by API calls
const specialtyOptions = [
    { value: "psicologia", label: "Sport Psychology" },
    { value: "fisioterapia", label: "Physiotherapy" },
    { value: "nutricion", label: "Nutrition" },
    { value: "medicina", label: "Sport Medicine" },
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

const sampleAthletes = [
    { id: 101, nombres: "John", apellidos: "Doe" },
    { id: 102, nombres: "Jane", apellidos: "Smith" },
    { id: 103, nombres: "Peter", apellidos: "Jones" },
];

const specialtyColors = {
    psicologia: '#EAB308',
    fisioterapia: '#22C55E',
    nutricion: '#3B82F6',
    medicina: '#EF4444',
};

function Appointments() {
    const [appointments, setAppointments] = useState([]);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [initialSlot, setInitialSlot] = useState(null);
    const [view, setView] = useState("month");
    const [date, setDate] = useState(new Date());
    const [searchTerm, setSearchTerm] = useState("");
    const { user } = useAuth(); // Obtener el usuario autenticado

    // ==================================================
    // Lógica de API movida directamente al componente
    // ==================================================
    const appointmentAPI = {
        getAll: () => apiClient.get("/appointments"),
        create: (data) => apiClient.post("/appointments", data),
        cancel: (id, reason) => apiClient.patch(`/appointments/${id}/cancel`, { reason }),
    };
    // ==================================================

    const fetchAppointments = useCallback(async () => {
        try {
            // 2. Usar el objeto appointmentAPI
            const response = await appointmentAPI.getAll();
            const formattedAppointments = response.data.map(apt => ({
                ...apt,
                start: moment(`${moment(apt.date).format("YYYY-MM-DD")}T${apt.time}`).toDate(),
                end: moment(apt.end).toDate(),
            }));
            setAppointments(formattedAppointments);
        } catch (error) {
            showErrorAlert("Error fetching appointments.");
        }
    }, []);

    useEffect(() => {
        fetchAppointments();
    }, [fetchAppointments]);

    const appointmentPropGetter = (event) => {
        const backgroundColor = specialtyColors[event.specialty] || '#6D28D9';
        let className = 'rbc-event-custom';
        const style = {
            backgroundColor,
            borderRadius: "5px",
            color: "white",
            border: "0px",
            display: "block",
        };

        if (event.status === 'CANCELLED') {
            className += ' event-cancelled';
        }
        if (event.status === 'COMPLETED') {
            className += ' event-completed';
        }
        return { className, style };
    };

    const messages = {
        allDay: 'All Day',
        previous: 'Previous',
        next: 'Next',
        today: 'Today',
        month: 'Month',
        week: 'Week',
        day: 'Day',
        agenda: 'Agenda',
        date: 'Date',
        time: 'Time',
        event: 'Appointment',
        noEventsInRange: 'There are no appointments in this range.',
        showMore: total => `+ See more (${total})`
    };

    const handleNavigate = (action) => {
        if (action === 'TODAY') setDate(new Date());
        else setDate(moment(date).add(action === 'PREV' ? -1 : 1, view).toDate());
    };

    const getSpecialtyLabel = (value) => {
        const option = specialtyOptions.find(opt => opt.value === value);
        return option ? option.label : 'Not specified';
    };

    const filteredAppointments = useMemo(() => {
        const term = searchTerm.toLowerCase();
        if (!term) return appointments;

        return appointments.filter(appointment => {
            const title = (appointment.title || '').toLowerCase();
            const description = (appointment.description || '').toLowerCase();
            return title.includes(term) || description.includes(term);
        });
    }, [appointments, searchTerm]);

    const handleSelectAppointment = (appointment) => {
        setSelectedAppointment(appointment);
        setIsViewModalOpen(true);
    };

    const handleCloseViewModal = () => {
        setIsViewModalOpen(false);
        setTimeout(() => setSelectedAppointment(null), 300);
    };

    const handleOpenCreateModal = () => {
        setInitialSlot(null);
        setIsCreateModalOpen(true);
    };

    const handleCloseCreateModal = () => {
        setIsCreateModalOpen(false);
        setInitialSlot(null);
    };

    const handleSelectSlot = useCallback((slotInfo) => {
        setInitialSlot(slotInfo);
        setIsCreateModalOpen(true);
    }, []);

    const handleCreateSubmit = async (formValues) => {
        try {
            // Si el usuario es un atleta, su ID se usa automáticamente
            const athleteId = user.role.name === 'Deportista' ? user.id : formValues.athleteId;
            if (!athleteId) {
                showErrorAlert("Validation Error", "An athlete must be selected.");
                return;
            }

            const newAppointment = {
                title: formValues.title, // Título de la cita
                description: formValues.description, // Descripción
                start: moment(`${formValues.date}T${formValues.time}`).toISOString(), // Fecha y hora de inicio en formato ISO
                end: moment(`${formValues.date}T${formValues.time}`).add(1, 'hour').toISOString(), // Asumiendo 1 hora de duración
                athleteId: parseInt(athleteId), // ID del atleta
                specialistId: parseInt(formValues.specialistId), // ID del especialista
                specialtyId: parseInt(formValues.specialtyId), // ID de la especialidad
            };

            // 3. Usar el objeto appointmentAPI
            await appointmentAPI.create(newAppointment);
            showSuccessAlert("Appointment Created!", "The new appointment has been scheduled successfully.");
            fetchAppointments(); // Refetch appointments
            handleCloseCreateModal();
        } catch (error) {
            showErrorAlert("Error creating appointment.");
        }
    };

    const handleCancelAppointment = async (appointmentToCancel) => {
        const { value: reason } = await Swal.fire({
            title: 'Reason for cancellation',
            input: 'textarea', // El backend espera un 'reason'
            inputLabel: 'Please state the reason for cancellation',
            inputPlaceholder: 'Enter the reason here...',
            showCancelButton: true,
            confirmButtonText: 'Cancel Appointment',
            cancelButtonText: 'Back',
            customClass: {
                confirmButton: 'bg-red-600 text-white font-bold px-6 py-2 rounded-lg mr-2',
                cancelButton: 'bg-gray-400 text-white font-bold px-6 py-2 rounded-lg',
            },
            buttonsStyling: false,
            inputValidator: (value) => {
                if (!value) {
                    return 'You must enter a reason.';
                }
            }
        });

        if (reason) {
            try {
                // 4. Usar el objeto appointmentAPI, pasando el 'reason'
                await appointmentAPI.cancel(appointmentToCancel.id, reason);
                showSuccessAlert("Appointment Cancelled!", "The appointment has been successfully cancelled.");
                fetchAppointments(); // Refetch
                handleCloseViewModal();
            } catch (error) {
                showErrorAlert(error.message || "Error cancelling appointment.");
            }
        }
    };

    // Placeholder for now, can be implemented later
    const handleMarkAsCompleted = async (appointmentToComplete) => {
        showSuccessAlert("Completed!", "Appointment marked as completed.");
        handleCloseViewModal();
    };

    return (
        <div className="w-full h-auto grid grid-rows-[auto_1fr] relative p-4">
            <div id="header" className="w-full h-auto p-4 flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-bold text-gray-800">Appointment Management</h1>
                    <p className="text-gray-500 mt-2">
                        Visualize, create, and manage appointments.
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="hidden sm:flex items-center justify-center bg-gray-100 rounded-lg p-1 border border-gray-200">
                        <button
                            onClick={() => handleNavigate('PREV')}
                            className="px-3 py-2 rounded-md text-sm font-semibold text-gray-600 hover:bg-gray-200 transition-colors"
                        >
                            &lt;
                        </button>
                        <button
                            onClick={() => handleNavigate('TODAY')}
                            className="px-3 py-2 rounded-md text-sm font-semibold text-gray-600 hover:bg-gray-200 transition-colors"
                        >
                            Today
                        </button>
                        <span className="px-4 py-2 text-base font-semibold text-gray-700 w-40 text-center">
                            {moment(date).format('MMMM YYYY')}
                        </span>
                        <button
                            onClick={() => handleNavigate('NEXT')}
                            className="px-3 py-2 rounded-md text-sm font-semibold text-gray-600 hover:bg-gray-200 transition-colors"
                        >
                            &gt;
                        </button>
                    </div>
                    <div className="hidden sm:flex items-center bg-gray-100 rounded-lg p-1 border border-gray-200">
                        <button
                            onClick={() => setView('month')}
                            className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${view === 'month' ? 'bg-white text-primary-purple shadow-sm' : 'text-gray-600 hover:bg-gray-200'}`}
                        >
                            Month
                        </button>
                        <button
                            onClick={() => setView('week')}
                            className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${view === 'week' ? 'bg-white text-primary-purple shadow-sm' : 'text-gray-600 hover:bg-gray-200'}`}
                        >
                            Week
                        </button>
                        <button
                            onClick={() => setView('day')}
                            className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${view === 'day' ? 'bg-white text-primary-purple shadow-sm' : 'text-gray-600 hover:bg-gray-200'}`}
                        >
                            Day
                        </button>
                    </div>
                    <button onClick={handleOpenCreateModal} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-purple to-primary-blue text-white rounded-lg shadow hover:opacity-90 transition whitespace-nowrap">
                        Create Appointment <SiGoogleforms size={20} />
                    </button>
                </div>
            </div>

            <div id="body" className="w-full h-full p-4 bg-white rounded-2xl shadow-lg">
                <div className="w-full flex justify-end mb-4">
                    <SearchInput
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search..."
                    />
                </div>
                <div className="h-[50vh]">
                    <Calendar
                        localizer={localizer}
                        events={filteredAppointments}
                        startAccessor="start"
                        endAccessor="end"
                        style={{ height: '100%' }}
                        eventPropGetter={appointmentPropGetter}
                        messages={messages}
                        views={['month', 'week', 'day', 'agenda']}
                        date={date}
                        onNavigate={setDate}
                        onSelectEvent={handleSelectAppointment}
                        view={view}
                        selectable={true}
                        onDrillDown={() => { }}
                        onSelectSlot={handleSelectSlot}
                        onView={setView}
                        toolbar={false}
                    />
                </div>
            </div>

            <AppointmentForm
                isOpen={isCreateModalOpen}
                onClose={handleCloseCreateModal}
                onSave={handleCreateSubmit}
                initialData={initialSlot}
                specialtyOptions={specialtyOptions}
                specialistOptions={specialistOptions}
                athleteList={sampleAthletes}
            />
            <AppointmentDetails
                isOpen={isViewModalOpen}
                onClose={handleCloseViewModal}
                appointmentData={selectedAppointment}
                athleteList={sampleAthletes}
                onMarkAsCompleted={handleMarkAsCompleted}
                onCancelAppointment={handleCancelAppointment}
            />
        </div>
    );
}

export default Appointments;
