import React from "react";
import { motion } from "framer-motion";
import { FaTimes, FaUserCircle, FaIdCard, FaEnvelope, FaPhone, FaBriefcase } from "react-icons/fa";

const DetailItem = ({ icon, label, value }) => (
    <div className="flex items-start gap-4 py-3">
        <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full text-primary-purple">
            {icon}
        </div>
        <div>
            <p className="text-sm font-medium text-gray-500">{label}</p>
            <p className="text-md font-semibold text-gray-800 break-words">{value || 'No especificado'}</p>
        </div>
    </div>
);

const ViewProfileModal = ({ isOpen, onClose, user }) => {
    if (!isOpen) return null;

    // Función para formatear el rol
    const formatRole = (role) => {
        if (!role) return "No especificado";
        return role.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    return (
        <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <motion.div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto relative"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
                {/* Header */}
                <div className="sticky top-0 bg-white rounded-t-2xl border-b border-gray-200 p-6 z-10">
                    <button
                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
                        onClick={onClose}
                    >
                        <FaTimes size={18} />
                    </button>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-primary-purple to-primary-blue bg-clip-text text-transparent text-center">
                        Perfil de Usuario
                    </h2>
                </div>

                {/* Body */}
                <div className="p-6">
                    <div className="flex flex-col items-center mb-6">
                        {user?.avatar ? (
                            <img src={user.avatar} alt="Avatar" className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg" />
                        ) : (
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-purple to-primary-blue flex items-center justify-center text-white font-bold text-4xl mb-3">
                                {user?.nombre ? user.nombre.charAt(0).toUpperCase() : 'U'}
                            </div>
                        )}
                        <h3 className="text-xl font-bold text-gray-800">{`${user?.nombre || ''} ${user?.apellido || ''}`}</h3>
                        <p className="text-gray-500">{formatRole(user?.rol)}</p>
                    </div>

                    <div className="divide-y divide-gray-200">
                        <DetailItem icon={<FaIdCard />} label="Tipo de Documento" value={user?.tipoDocumento || 'No especificado'} />
                        <DetailItem icon={<FaIdCard />} label="Número de Documento" value={user?.identificacion || 'No especificado'} />
                        <DetailItem icon={<FaEnvelope />} label="Correo Electrónico" value={user?.correo || 'No especificado'} />
                        <DetailItem icon={<FaPhone />} label="Teléfono" value={user?.telefono || 'No especificado'} />
                    </div>
                </div>

                {/* Footer */}
                <div className="flex-shrink-0 border-t border-gray-200 p-4 flex justify-center">
                    <motion.button
                        onClick={onClose}
                        className="px-8 py-2.5 bg-gradient-to-r from-primary-purple to-primary-blue text-white rounded-xl hover:opacity-90 transition font-medium"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        Cerrar
                    </motion.button>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default ViewProfileModal;