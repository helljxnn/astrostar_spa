import React from 'react';
import moment from 'moment';
import 'moment/locale/en-gb'; // Use English locale
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheckCircle, FaTimes } from 'react-icons/fa';

/**
 * Component to display the details of an appointment in a modal.
 *
 * @param {object} props - Component props.
 * @param {boolean} props.isOpen - Controls if the modal is visible.
 * @param {function} props.onClose - Function to close the modal.
 * @param {object} props.appointmentData - The data of the appointment to display.
 * @param {function} props.onCancelAppointment - Function to handle appointment cancellation.
 * @param {function} props.onMarkAsCompleted - Function to handle marking appointment as completed.
 */
const AppointmentDetails = ({ isOpen, onClose, appointmentData, onCancelAppointment, onMarkAsCompleted }) => {
    if (!appointmentData) return null;

    // Format details for display
    const details = [
        { label: "Title", value: appointmentData.title },
        { label: "Date", value: moment(appointmentData.start).format('dddd, MMMM Do YYYY') },
        { label: "Time", value: moment(appointmentData.start).format('h:mm a') },
        { label: "Description / Reason", value: appointmentData.description },
        { label: "Status", value: appointmentData.status }
    ];

    if (appointmentData.status === 'CANCELLED') {
        details.push({
            label: "Cancellation Reason", value: appointmentData.cancellationReason || 'Not specified'
        });
    } else if (appointmentData.status === 'COMPLETED') {
        details.push({
            label: "Conclusion", value: appointmentData.conclusion || 'Not recorded'
        });
    }

    // Animation variants
    const backdropVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
    };
    const modalVariants = {
        hidden: { scale: 0.9, opacity: 0, y: 50 },
        visible: { scale: 1, opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } },
        exit: { scale: 0.9, opacity: 0, y: 30, transition: { duration: 0.2 } },
    };

    const handleCancelClick = async () => {
        if (onCancelAppointment) {
            await onCancelAppointment(appointmentData);
            // The parent component will close the modal upon success
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
                            <h2 className="text-3xl font-bold bg-gradient-to-r from-primary-purple to-primary-blue bg-clip-text text-transparent text-center">Appointment Details</h2>
                        </div>

                        {/* Body */}
                        <div className="p-8 space-y-5 flex-grow">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5 ">
                                {details.map(({ label, value }) => (
                                    <div key={label} className="py-2">
                                        <p className="text-sm font-semibold text-gray-500 mb-1">{label}</p>
                                        <p className="text-base text-gray-800 break-words">{value || 'N/A'}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="sticky bottom-0 bg-white rounded-b-2xl border-t border-gray-200 p-6 flex justify-between items-center gap-4">
                            {appointmentData.status === 'SCHEDULED' && (
                                <>
                                    <button
                                        onClick={handleCancelClick}
                                        className="flex items-center gap-2 px-6 py-3 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-all duration-200 font-semibold"
                                    >
                                        <FaTimes /> Cancel Appointment
                                    </button>
                                    <button
                                        onClick={() => onMarkAsCompleted(appointmentData)}
                                        className="flex items-center gap-2 px-6 py-3 bg-green-100 text-green-700 rounded-xl hover:bg-green-200 transition-all duration-200 font-semibold"
                                    >
                                        <FaCheckCircle /> Mark as Completed
                                    </button>
                                </>
                            )}
                            <div className="flex-grow" />
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 transition-all duration-200 font-medium"
                            >
                                Close
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default AppointmentDetails;
