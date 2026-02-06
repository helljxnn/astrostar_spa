import React, { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { Plus, Filter } from "lucide-react";
import { showSuccessAlert } from "../../../../../../../shared/utils/alerts";
import Swal from "sweetalert2";
import AppointmentForm from "./components/AppointmentForm";
import SearchInput from "../../../../../../../shared/components/SearchInput";
import AppointmentDetails from "./components/AppointmentDetails";
import { BaseCalendar, CalendarReportGenerator } from "../../../../../../../shared/components/Calendar";


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
        status: 'active', // Estado inicial para que los botones se muestren
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

// Opciones para el filtro de especialistas, aplanando la estructura.
const allSpecialistOptions = Object.values(specialistOptions).flat();

// Paleta de colores para cada especialidad
const specialtyColors = {
    psicologia: '#EAB308',   // Amarillo
    fisioterapia: '#22C55E', // Verde
    nutricion: '#3B82F6',    // Azul
    medicina: '#EF4444',     // Rojo
};

function Appointments() {
    const [appointments, setAppointments] = useState(sampleAppointments);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [initialSlot, setInitialSlot] = useState(null); // Para guardar la fecha seleccionada
    const [searchTerm, setSearchTerm] = useState(""); // Estado para el término de búsqueda
    const [showFilters, setShowFilters] = useState(false);
    const [selectedFilters, setSelectedFilters] = useState({
        specialty: "",
        specialist: "",
        status: "",
    });


    // Obtiene la etiqueta de la especialidad a partir de su valor
    const getSpecialtyLabel = (value) => {
        const option = specialtyOptions.find(opt => opt.value === value);
        return option ? option.label : 'No especificada';
    };

    const handleFiltersChange = (nextFilters) => {
        setSelectedFilters(prev => ({ ...prev, ...nextFilters }));
    };

    const appointmentEvents = useMemo(() => {
        return appointments.map((appointment) => {
            const startDate = appointment.start ? new Date(appointment.start) : null;
            const endDate = appointment.end ? new Date(appointment.end) : null;
            const date = startDate ? startDate.toISOString().split("T")[0] : "";
            const time = startDate ? startDate.toTimeString().slice(0, 5) : "";
            const athlete = sampleAthletes.find(a => a.id === appointment.athlete);
            const athleteName = athlete ? `${athlete.nombres} ${athlete.apellidos}` : "Deportista";
            const specialtyLabel = getSpecialtyLabel(appointment.specialty);
            const backgroundColor = specialtyColors[appointment.specialty] || "#B595FF";

            return {
                id: appointment.id,
                title: appointment.title || `Cita: ${athleteName}`,
                date,
                time,
                start: startDate,
                end: endDate,
                status: appointment.status,
                specialty: appointment.specialty,
                specialist: appointment.specialist,
                athleteName,
                description: appointment.description,
                backgroundColor,
                borderColor: backgroundColor,
                extendedProps: {
                    ...appointment,
                    athleteName,
                    specialtyLabel,
                },
            };
        });
    }, [appointments]);

    const filters = [
        {
            id: "specialty",
            label: "Especialidad",
            field: "specialty",
            options: specialtyOptions,
        },
        {
            id: "specialist",
            label: "Especialista",
            field: "specialist",
            options: allSpecialistOptions,
        },
        {
            id: "status",
            label: "Estado",
            field: "status",
            options: [
                { value: "active", label: "Activa" },
                { value: "completed", label: "Completada" },
                { value: "cancelled", label: "Cancelada" },
            ],
        },
    ];

    const handleSelectAppointment = (appointment) => {
        const appointmentData = appointment?.extendedProps || appointment;
        if (appointmentData?.specialty) {
            setSelectedAppointment(appointmentData);
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
        setInitialSlot(null); // Limpiamos cualquier fecha previa al abrir manualmente
        setIsCreateModalOpen(true);
    };

    const handleCloseCreateModal = () => {
        setIsCreateModalOpen(false);
        setInitialSlot(null); // Limpiamos la fecha al cerrar
    };

    const handleDateSelect = useCallback((selectedDate) => {
        setInitialSlot({ start: selectedDate });
        setIsCreateModalOpen(true);
    }, []);

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
            specialty: formValues.specialty, // Asegurarse de que el ID del deportista sea un número
            specialist: formValues.specialist,
            athlete: formValues.athlete,
            status: 'active', // Por defecto activa
            cancelReason: '',
        };

        setAppointments(prevAppointments => [...prevAppointments, newAppointment]);
        showSuccessAlert("¡Cita Creada!", "La nueva cita ha sido agendada correctamente.");
        // El modal se cierra desde el propio AppointmentForm
    };

    const handleMarkAsCompleted = async (appointmentToComplete) => {
        const { value: conclusion } = await Swal.fire({
            title: 'Conclusión de la Cita',
            input: 'textarea',
            inputLabel: 'Por favor, registre la conclusión o los resultados de la cita',
            inputPlaceholder: 'Escribe la conclusión aquí...',
            inputAttributes: {
                'aria-label': 'Conclusión de la cita'
            },
            showCancelButton: true,
            confirmButtonText: 'Guardar y Completar',
            cancelButtonText: 'Volver',
            customClass: {
                confirmButton: 'bg-primary-purple text-white font-bold px-6 py-2 rounded-lg mr-2',
                cancelButton: 'bg-primary-blue text-white font-bold px-6 py-2 rounded-lg',
            },
            buttonsStyling: false,
            inputValidator: (value) => {
                if (!value) {
                    return 'Debes ingresar una conclusión para completar la cita.';
                }
            }
        });

        if (conclusion) {
            setAppointments(prev =>
                prev.map(a =>
                    a.id === appointmentToComplete.id ? { ...a, status: 'completed', conclusion: conclusion } : a
                )
            );
            showSuccessAlert("¡Cita Completada!", "La cita ha sido marcada como completada y se ha guardado la conclusión.");
            handleCloseViewModal(); // Cierra el modal de detalles después de la acción
        }
    };

    const renderEvent = (event, variant) => {
        const color = event.backgroundColor || "#B595FF";
        if (variant === "grid") {
            return (
                <div
                    className="p-1 rounded text-black text-xs cursor-pointer hover:opacity-80"
                    style={{ backgroundColor: color }}
                >
                    <div className="font-medium truncate text-xs leading-tight">
                        {event.title}
                    </div>
                </div>
            );
        }
        return <span>{event.title}</span>;
    };

    const renderSidebarItem = (event, actions) => {
        const specialtyLabel =
            event.extendedProps?.specialtyLabel || getSpecialtyLabel(event.specialty);
        return (
            <div className="space-y-2">
                <div>
                    <h4 className="font-medium text-gray-800 text-sm mb-1">
                        {event.title}
                    </h4>
                    <div className="space-y-1 text-xs text-gray-600">
                        {event.time && (
                            <div className="flex items-center gap-1">
                                <span className="text-xs font-medium">Hora:</span>
                                {event.time}
                            </div>
                        )}
                        {event.specialist && (
                            <div className="flex items-center gap-1">
                                <span className="text-xs font-medium">Especialista:</span>
                                {event.specialist}
                            </div>
                        )}
                        {specialtyLabel && (
                            <div className="flex items-center gap-1">
                                <span className="text-xs font-medium">Especialidad:</span>
                                {specialtyLabel}
                            </div>
                        )}
                        {event.athleteName && (
                            <div className="flex items-center gap-1">
                                <span className="text-xs font-medium">Deportista:</span>
                                {event.athleteName}
                            </div>
                        )}
                    </div>
                </div>

                {actions.length > 0 && (
                    <div className="flex gap-1 flex-wrap pt-2 border-t border-gray-100">
                        {actions.map((action, actionIndex) => (
                            <button
                                key={actionIndex}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    action.onClick(event);
                                }}
                                className="flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors text-[#B595FF] hover:bg-[#9BE9FF] hover:text-white"
                            >
                                {action.icon && <action.icon className="h-3 w-3" />}
                                {action.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-6 p-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Gestión de Citas</h1>
                    <p className="text-gray-500 mt-1">
                        Visualiza, crea y gestiona las citas
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                    <div className="w-full sm:w-auto">
                        <SearchInput
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Buscar citas..."
                            className="min-w-[200px]"
                        />
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                        <motion.button
                            onClick={handleOpenCreateModal}
                            className="flex items-center gap-2 px-4 py-2 bg-[#B595FF] text-white rounded-lg font-medium hover:bg-[#9BE9FF] transition-all duration-300"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Plus className="h-4 w-4" />
                            <span>Crear</span>
                        </motion.button>
                        <motion.button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center gap-2 px-4 py-2 border-2 border-gray-200 rounded-lg font-medium hover:border-[#B595FF] transition-all duration-300 ${showFilters
                                ? "bg-[#B595FF] text-white border-[#B595FF]"
                                : "text-gray-700 hover:text-[#B595FF]"}`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Filter className="h-4 w-4" />
                            <span className="hidden sm:inline">Filtros</span>
                        </motion.button>
                        <CalendarReportGenerator
                            events={appointmentEvents}
                            title="Reportes"
                            entityName="citas"
                            reportTypes={["pdf", "excel"]}
                            showDateFilter={true}
                            customFields={[
                                { key: "specialist", label: "Especialista" },
                                { key: "specialty", label: "Especialidad" },
                                { key: "athleteName", label: "Deportista" },
                                { key: "status", label: "Estado" },
                            ]}
                        />
                    </div>
                </div>
            </div>

            {showFilters && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">Filtros</h3>
                        <button
                            onClick={() => setShowFilters(false)}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            x
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filters.map((filter) => (
                            <div key={filter.id} className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    {filter.label}
                                </label>
                                <select
                                    value={selectedFilters[filter.id] || ""}
                                    onChange={(e) => handleFiltersChange({ [filter.id]: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B595FF] focus:border-transparent"
                                >
                                    <option value="">Todos</option>
                                    {filter.options.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        ))}
                    </div>

                    {(selectedFilters.specialty || selectedFilters.specialist || selectedFilters.status) && (
                        <div className="mt-4">
                            <button
                                onClick={() => setSelectedFilters({ specialty: "", specialist: "", status: "" })}
                                className="text-xs font-semibold text-gray-600 px-3 py-1 rounded-full border border-gray-200 hover:bg-gray-100 transition"
                            >
                                Limpiar filtros
                            </button>
                        </div>
                    )}
                </motion.div>
            )}

            <BaseCalendar
                variant="custom"
                events={appointmentEvents}
                onEventClick={handleSelectAppointment}
                onCreate={handleOpenCreateModal}
                onDateSelect={handleDateSelect}
                renderEvent={renderEvent}
                renderSidebarItem={renderSidebarItem}
                title="Calendario de Citas"
                showHeader={false}
                showCreateButton={false}
                showReportButton={false}
                showSearch={false}
                showFilters={false}
                createButtonText="Crear Cita"
                reportButtonText="Reportes de Citas"
                searchTerm={searchTerm}
                searchPlaceholder="Buscar citas..."
                searchFields={["title", "specialist", "specialty", "athleteName", "description"]}
                filters={filters}
                selectedFilters={selectedFilters}
                onFiltersChange={handleFiltersChange}
                viewTypes={["month", "week", "day"]}
                defaultView="month"
                sidebarTitle="Citas Programadas"
                sidebarEmptyText="No hay citas programadas"
                colorScheme="events"
                className="appointments-calendar"
            />
            {/* Modal para Crear Cita */}
            <AppointmentForm
                isOpen={isCreateModalOpen}
                onClose={handleCloseCreateModal}
                onSave={handleCreateSubmit}
                initialData={initialSlot} // Pasamos la fecha seleccionada al formulario
                athleteList={sampleAthletes} // Pasar la lista de deportistas
            />
            <AppointmentDetails
                isOpen={isViewModalOpen}
                onClose={handleCloseViewModal}
                appointmentData={selectedAppointment}
                athleteList={sampleAthletes}
                onMarkAsCompleted={handleMarkAsCompleted}
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

