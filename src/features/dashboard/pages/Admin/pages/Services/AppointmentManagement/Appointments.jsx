import React, { useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "moment/locale/es"; // Importar localización en español para moment

// Configurar moment para que use español globalmente en este componente
moment.locale("es");

// El localizer le dice a react-big-calendar cómo manejar las fechas
const localizer = momentLocalizer(moment);

// Datos de ejemplo para las citas. En una app real, esto vendría de una API.
const sampleEvents = [
    {
        id: 1,
        title: "Reunión de equipo - Proyecto AstroStar",
        start: new Date(new Date().setDate(new Date().getDate() - 2)), // Hace 2 días
        end: new Date(new Date().setDate(new Date().getDate() - 2)),
        allDay: true,
        type: 'reunion',
    },
    {
        id: 2,
        title: "Entrenamiento Categoría Infantil",
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

function Appointments() {
    const [events, setEvents] = useState(sampleEvents);

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

    return (
        <div className="w-full h-auto grid grid-rows-[auto_1fr] relative p-4">
            {/* Cabecera */}
            <div id="header" className="w-full h-auto p-4">
                <h1 className="text-5xl font-bold text-gray-800">Gestión de Citas</h1>
                <p className="text-gray-500 mt-2">
                    Visualiza, crea y gestiona las citas y eventos de la fundación.
                </p>
            </div>

            {/* Cuerpo con el Calendario */}
            <div id="body" className="w-full h-full p-4 bg-white rounded-2xl shadow-lg">
                <div className="h-[75vh]"> {/* Contenedor con altura definida */}
                    <Calendar localizer={localizer} events={events} startAccessor="start" endAccessor="end" style={{ height: '100%' }} eventPropGetter={eventPropGetter} messages={messages} views={['month', 'week', 'day', 'agenda']} />
                </div>
            </div>
        </div>
    );
}

export default Appointments;