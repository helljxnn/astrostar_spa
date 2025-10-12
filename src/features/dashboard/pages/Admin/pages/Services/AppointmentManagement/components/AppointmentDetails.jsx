import React from 'react';
import moment from 'moment';
import 'moment/locale/es';
import { motion, AnimatePresence } from 'framer-motion';
import { showConfirmAlert, showSuccessAlert } from '../../../../../../../../shared/utils/alerts';
import Swal from 'sweetalert2';
import { FaCheckCircle, FaTimes } from 'react-icons/fa';

// Estas opciones deberían idealmente venir de una fuente compartida o una API.
// Por ahora, las mantenemos aquí para que el componente sea autónomo.
const specialtyOptions = [
    { value: "psicologia", label: "Psicología Deportiva" },
    { value: "fisioterapia", label: "Fisioterapia" },
    { value: "nutricion", label: "Nutrición" },
    { value: "medicina", label: "Medicina Deportiva" },
];

const getSpecialtyLabel = (value) => {
    const option = specialtyOptions.find(opt => opt.value === value);
    return option ? option.label : 'No especificada';
};

const getAthleteName = (athleteId, athleteList) => {
    const athlete = athleteList.find(a => a.id === athleteId);
    return athlete ? `${athlete.nombres} ${athlete.apellidos}` : 'Desconocido';
};

/**
 * Componente para mostrar los detalles de una cita utilizando el modal genérico ViewDetails.
 *
 * @param {object} props - Propiedades del componente.
 * @param {boolean} props.isOpen - Controla si el modal está visible.
 * @param {function} props.onClose - Función para cerrar el modal.
 * @param {object} props.appointmentData - Los datos de la cita a mostrar.
 * @param {Array<object>} props.athleteList - Lista de atletas para resolver nombres.
 */

const AppointmentDetails = ({ isOpen, onClose, appointmentData, athleteList = [], onCancelAppointment, onMarkAsCompleted }) => {
    if (!appointmentData) return null;

    // Configuración de detalles
    const details = [
        { label: "Deportista", value: getAthleteName(appointmentData.athlete, athleteList) },
        { label: "Especialidad", value: getSpecialtyLabel(appointmentData.specialty) },
        { label: "Especialista", value: appointmentData.specialist },
        { label: "Fecha", value: moment(appointmentData.start).format('dddd, D [de] MMMM [de] YYYY') },
        { label: "Hora", value: moment(appointmentData.start).format('h:mm a') },
        { label: "Descripción / Motivo", value: appointmentData.description },
        { label: "Estado de la cita", value: appointmentData.status === 'cancelled' ? 'Cancelada' : (appointmentData.status === 'completed' ? 'Completada' : 'Activa') }
    ];

    // Añadir condicionalmente el motivo de cancelación o la conclusión
    if (appointmentData.status === 'cancelled') {
        details.push({
            label: "Motivo de cancelación", value: appointmentData.cancelReason || 'No especificado'
        });
    } else if (appointmentData.status === 'completed') {
        details.push({
            label: "Conclusión de la cita", value: appointmentData.conclusion || 'No registrada'
        });
    }

    // Animaciones
    const backdropVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
    };
    const modalVariants = {
        hidden: { scale: 0.9, opacity: 0, y: 50 },
        visible: { scale: 1, opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } },
        exit: { scale: 0.9, opacity: 0, y: 30, transition: { duration: 0.2 } },
    };

    // Lógica para cancelar cita: solo delega a onCancelAppointment
    const handleCancelAppointment = async () => {
        if (onCancelAppointment) {
            await onCancelAppointment(appointmentData);
            onClose();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                >
                    <motion.div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        variants={backdropVariants}
                        onClick={onClose}
                    />
                    <motion.div
                        variants={modalVariants}
                        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
                    >
                        {/* Header */}
                        <div className="sticky top-0 bg-white rounded-t-2xl border-b border-gray-200 p-6 z-10">
                            <button type="button" onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full">✕</button>
                            <h2 className="text-3xl font-bold bg-gradient-to-r from-primary-purple to-primary-blue bg-clip-text text-transparent text-center">Detalles de la Cita</h2>
                        </div>

                        {/* Body */}
                        <div className="p-8 space-y-5 flex-grow">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5 ">
                                {details.map(({ label, value }) => (
                                    <div key={label} className="py-2">
                                        <p className="text-sm font-semibold text-gray-500 mb-1">{label}</p>
                                        <p className="text-base text-gray-800 break-words">{value !== null && value !== undefined && value !== '' ? value : 'N/A'}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="sticky bottom-0 bg-white rounded-b-2xl border-t border-gray-200 p-6 flex justify-between items-center gap-4">
                            {appointmentData.status === 'active' && (
                                <>
                                    <button
                                        onClick={handleCancelAppointment}
                                        className="flex items-center gap-2 px-6 py-3 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-all duration-200 font-semibold"
                                    >
                                        <FaTimes /> Anular Cita
                                    </button>
                                    <button
                                        onClick={() => onMarkAsCompleted(appointmentData)}
                                        className="flex items-center gap-2 px-6 py-3 bg-green-100 text-green-700 rounded-xl hover:bg-green-200 transition-all duration-200 font-semibold"
                                    >
                                        <FaCheckCircle /> Marcar como Completada
                                    </button>
                                </>
                            )}
                            <div className="flex-grow" /> {/* Empuja el botón de cerrar a la derecha si los otros no están */}
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 transition-all duration-200 font-medium"
                            >
                                Cerrar
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default AppointmentDetails;