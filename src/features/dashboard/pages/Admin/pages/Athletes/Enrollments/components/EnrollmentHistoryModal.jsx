import React, { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaTimes,
  FaHistory,
  FaCheckCircle,
  FaPauseCircle,
  FaClock,
  FaUserCircle,
  FaCalendarAlt,
  FaArrowRight,
  FaInfoCircle,
  FaSearch,
  FaChevronLeft,
  FaChevronRight,
  FaFileImage,
  FaExpand,
  FaReceipt,
  FaSpinner,
} from "react-icons/fa";
import { calculateAge } from "../../../../../../../../shared/utils/dateUtils";
import EnrollmentsService from "../services/EnrollmentsService";

// Helpers para iconos y colores
const getStateIcon = (state) => {
  switch (state) {
    case "Vigente":
      return <FaCheckCircle className="text-green-600" size={18} />;
    case "Suspendida":
      return <FaPauseCircle className="text-orange-600" size={18} />;
    case "Vencida":
      return <FaClock className="text-gray-600" size={18} />;
    default:
      return <FaCheckCircle className="text-gray-400" size={18} />;
  }
};

const getStateBadgeColor = (state) => {
  switch (state) {
    case "Vigente":
      return "bg-green-50 text-green-700 border-green-200";
    case "Suspendida":
      return "bg-orange-50 text-orange-700 border-orange-200";
    case "Vencida":
      return "bg-gray-50 text-gray-700 border-gray-200";
    default:
      return "bg-gray-50 text-gray-600 border-gray-200";
  }
};

const formatDateTime = (dateString) => {
  if (!dateString) return "Fecha no disponible";

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Fecha inválida";

    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (error) {
    return "Error en fecha";
  }
};

// Modal para ver comprobante completo
const ComprobanteModal = ({ comprobante, onClose }) => {
  if (!comprobante) return null;

  const modalContent = (
    <motion.div
      className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[60] p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="relative max-w-4xl max-h-[90vh] w-full"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors p-2 z-10"
          onClick={onClose}
        >
          <FaTimes size={24} />
        </button>
        
        <div className="bg-white rounded-lg overflow-hidden shadow-2xl">
          <div className="relative">
            <img
              src={comprobante.url}
              alt="Comprobante de pago"
              className="w-full h-auto max-h-[70vh] object-contain bg-gray-100"
            />
          </div>
          <div className="p-4 bg-gray-50 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <FaReceipt className="text-primary-purple" />
                  Comprobante de Pago
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {comprobante.nombreArchivo}
                </p>
              </div>
              <div className="text-right text-xs text-gray-500">
                <p>Subido: {new Date(comprobante.fechaSubida).toLocaleDateString('es-ES')}</p>
                <p>Tamaño: {(comprobante.tamaño / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );

  return createPortal(modalContent, document.body);
};

const EnrollmentHistoryModal = ({ isOpen, onClose, athlete, guardians }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedComprobante, setSelectedComprobante] = useState(null);
  const [enrollmentHistory, setEnrollmentHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const itemsPerPage = 5;

  // Cargar historial de matrículas cuando se abre el modal
  useEffect(() => {
    if (isOpen && athlete?.id) {
      loadEnrollmentHistory();
    }
  }, [isOpen, athlete?.id]);

  const loadEnrollmentHistory = async () => {
    if (!athlete?.id) return;
    
    setLoading(true);
    try {
      const result = await EnrollmentsService.getAthleteEnrollmentHistory(athlete.id);
      if (result.success) {
        setEnrollmentHistory(result.data || []);
      } else {
        console.error("Error cargando historial:", result.error);
        setEnrollmentHistory([]);
      }
    } catch (error) {
      console.error("Error cargando historial:", error);
      setEnrollmentHistory([]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;
  if (!athlete) {
    console.error("Athlete is undefined in InscriptionHistoryModal");
    return null;
  }

  // Validar datos críticos
  const safeAthlete = athlete || {};
  
  // Usar el historial cargado desde el backend (ya viene con estados corregidos)
  const safeInscriptions = Array.isArray(enrollmentHistory) 
    ? enrollmentHistory 
    : [];

  // El backend ya maneja la lógica de estados correctos, no necesitamos procesamiento adicional

  // Calcular edad usando la utilidad centralizada
  const age = safeAthlete?.fechaNacimiento ? calculateAge(safeAthlete.fechaNacimiento) : 0;

  const guardian = Array.isArray(guardians) 
    ? guardians.find((g) => String(g?.id) === String(safeAthlete?.acudiente))
    : null;

  // Ordenar matrículas - ACTUAL PRIMERO, luego las anteriores por fecha (más reciente a más antigua)
  const sortedInscriptions = useMemo(() => {
    if (!safeInscriptions || !Array.isArray(safeInscriptions)) {
      return [];
    }
    
    try {
      return [...safeInscriptions].sort((a, b) => {
        // Primero la matrícula vigente
        if (a.estado === "Vigente" && b.estado !== "Vigente") return -1;
        if (b.estado === "Vigente" && a.estado !== "Vigente") return 1;
        
        // Luego ordenar por fecha de creación (más reciente primero)
        const dateA = new Date(a?.createdAt || 0);
        const dateB = new Date(b?.createdAt || 0);
        return dateB - dateA; // Más reciente primero
      });
    } catch (error) {
      console.error("Error sorting enrollments:", error);
      return safeInscriptions;
    }
  }, [safeInscriptions]);

  // BUSCADOR MEJORADO - Incluye búsqueda por fechas formateadas
  const filteredInscriptions = useMemo(() => {
    if (!searchTerm.trim()) {
      return [...sortedInscriptions];
    }

    const search = searchTerm.toLowerCase();
    return sortedInscriptions.filter((enrollment) => {
      if (!enrollment) return false;
      
      // Buscar en campos reales de matrícula incluyendo fechas formateadas
      const searchableFields = [
        enrollment.estado,
        enrollment.athlete?.user?.firstName,
        enrollment.athlete?.user?.lastName,
        enrollment.athlete?.user?.identification,
        // Fechas en múltiples formatos para mejor búsqueda
        enrollment.createdAt ? new Date(enrollment.createdAt).toLocaleDateString('es-ES') : null,
        enrollment.createdAt ? new Date(enrollment.createdAt).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }) : null,
        enrollment.fechaInicio ? new Date(enrollment.fechaInicio).toLocaleDateString('es-ES') : null,
        enrollment.fechaInicio ? new Date(enrollment.fechaInicio).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }) : null,
        enrollment.fechaVencimiento ? new Date(enrollment.fechaVencimiento).toLocaleDateString('es-ES') : null,
        enrollment.fechaVencimiento ? new Date(enrollment.fechaVencimiento).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }) : null,
        // Años para búsqueda por año
        enrollment.createdAt ? new Date(enrollment.createdAt).getFullYear().toString() : null,
        enrollment.fechaInicio ? new Date(enrollment.fechaInicio).getFullYear().toString() : null,
        enrollment.fechaVencimiento ? new Date(enrollment.fechaVencimiento).getFullYear().toString() : null,
        // Meses para búsqueda por mes
        enrollment.createdAt ? new Date(enrollment.createdAt).toLocaleDateString('es-ES', { month: 'long' }) : null,
        enrollment.fechaInicio ? new Date(enrollment.fechaInicio).toLocaleDateString('es-ES', { month: 'long' }) : null,
        enrollment.fechaVencimiento ? new Date(enrollment.fechaVencimiento).toLocaleDateString('es-ES', { month: 'long' }) : null
      ];

      return searchableFields.some(field => 
        field && String(field).toLowerCase().includes(search)
      );
    });
  }, [sortedInscriptions, searchTerm]);

  // Paginación
  const totalPages = Math.ceil(filteredInscriptions.length / itemsPerPage);
  const paginatedInscriptions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredInscriptions.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredInscriptions, currentPage]);

  // Reset de página cuando cambia la búsqueda
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // La matrícula actual es la que tiene estado "Vigente" (el backend ya maneja esto correctamente)
  const currentInscription = sortedInscriptions.find(enrollment => enrollment.estado === "Vigente") || 
                            sortedInscriptions[sortedInscriptions.length - 1] || {};
  const totalInscriptions = sortedInscriptions.length;

  const handleClearSearch = () => {
    setSearchTerm("");
    setCurrentPage(1);
  };

  // Función para formatear tamaño de archivo
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const modalContent = (
    <motion.div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[90vh] overflow-hidden relative flex flex-col"
        initial={{ scale: 0.8, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: 50 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white rounded-t-2xl border-b border-gray-200 p-6 z-10">
          <button
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
            onClick={onClose}
          >
            <FaTimes size={18} />
          </button>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary-purple to-primary-blue bg-clip-text text-transparent text-center mb-3">
            Historial de Matrículas
          </h2>
          <div className="flex items-center justify-center gap-2 text-gray-600">
            <FaUserCircle className="text-primary-purple" size={20} />
            <span className="font-semibold text-gray-800">
              {safeAthlete.nombres} {safeAthlete.apellidos}
            </span>
            {guardian && (
              <span className="text-sm text-gray-500">
                · Acudiente: {guardian.nombreCompleto}
              </span>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Información Resumida */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <p className="text-xs text-gray-500 mb-1">Renovaciones</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Math.max(0, totalInscriptions - 1)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {totalInscriptions > 1 ? "Ha renovado su matrícula" : "Sin renovaciones"}
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <p className="text-xs text-gray-500 mb-1">Total de registros</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {totalInscriptions}
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <p className="text-xs text-gray-500 mb-1">Estado actual</p>
                  <div className="flex items-center gap-2 mt-1">
                    {getStateIcon(currentInscription?.estado)}
                    <p className="text-xl font-bold text-gray-900">
                      {currentInscription?.estado === "Pending_Payment" ? "Pendiente de Pago" : currentInscription?.estado || "Sin estado"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 🔍 BUSCADOR SIMPLIFICADO */}
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <FaSearch className="text-primary-purple" />
                <h3 className="text-lg font-semibold text-gray-800">
                  Buscar en Historial
                </h3>
              </div>

              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar por estado, nombre, documento, fechas (ej: 2024, marzo, vigente)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-purple focus:border-primary-purple transition-all"
                />
                <FaSearch className="absolute left-3 top-4 text-gray-400" size={16} />
                {searchTerm && (
                  <button
                    onClick={handleClearSearch}
                    className="absolute right-3 top-4 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <FaTimes size={14} />
                  </button>
                )}
              </div>

              {searchTerm && (
                <div className="mt-2 text-sm text-gray-600">
                  <span className="font-medium">{filteredInscriptions.length}</span> registros encontrados
                  {filteredInscriptions.length !== sortedInscriptions.length && (
                    <span> de {sortedInscriptions.length}</span>
                  )}
                </div>
              )}
            </div>

            {/* Timeline de Matrículas */}
            {!loading && filteredInscriptions.length > 0 ? (
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
                  <FaHistory className="text-primary-purple" />
                  Historial de Matrículas ({filteredInscriptions.length})
                </h3>

                <div className="space-y-4">
                  {paginatedInscriptions.map((enrollment, index) => {
                    if (!enrollment) return null;
                    
                    // La matrícula actual es la que tiene estado "Vigente"
                    const isActive = enrollment.estado === "Vigente";
                    const isPending = enrollment.estado === "Pending_Payment";
                    const isExpired = enrollment.estado === "Vencida";

                    // Determinar si es la matrícula inicial (la más antigua por fecha de creación)
                    const isInitialEnrollment = sortedInscriptions.length > 0 && 
                      enrollment.id === sortedInscriptions
                        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))[0]?.id;

                    return (
                      <motion.div
                        key={enrollment.id || index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`relative border rounded-xl p-5 bg-white ${
                          isActive
                            ? "border-primary-purple border-2 shadow-md"
                            : "border-gray-200"
                        }`}
                      >
                        {isActive && (
                          <div className="absolute -top-3 left-4">
                            <span className="px-3 py-1 bg-primary-purple text-white text-xs font-semibold rounded-full shadow">
                              ACTUAL
                            </span>
                          </div>
                        )}

                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 mt-1">
                            {getStateIcon(enrollment.estado)}
                          </div>

                          <div className="flex-1 space-y-3">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                              <div className="flex items-center gap-3">
                                <h4 className="text-lg font-bold text-gray-900">
                                  Matrícula {isActive ? "Actual" : "Anterior"}
                                </h4>
                                <span
                                  className={`px-2 py-1 rounded-md text-xs font-medium border ${getStateBadgeColor(
                                    enrollment.estado
                                  )}`}
                                >
                                  {enrollment.estado === "Pending_Payment" ? "Pendiente de Pago" : enrollment.estado}
                                </span>
                                {/* Indicador de tipo de matrícula - CORREGIDO */}
                                <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700 border border-gray-300">
                                  {isInitialEnrollment ? "Matrícula inicial" : "Renovación"}
                                </span>
                              </div>

                              <div className="text-xs text-gray-500">
                                Creada: {new Date(enrollment.createdAt).toLocaleDateString('es-ES')}
                              </div>
                            </div>

                            {/* Información principal de la matrícula - DISEÑO SIMPLIFICADO */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div className="bg-gray-50 rounded-lg p-3">
                                <p className="text-xs font-semibold text-gray-600 mb-1 flex items-center gap-1">
                                  <FaCalendarAlt size={10} />
                                  Fecha de creación:
                                </p>
                                <p className="text-sm text-gray-900 font-medium">
                                  {new Date(enrollment.createdAt).toLocaleDateString('es-ES', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })}
                                </p>
                              </div>

                              {enrollment.fechaInicio && (
                                <div className="bg-gray-50 rounded-lg p-3">
                                  <p className="text-xs font-semibold text-gray-600 mb-1 flex items-center gap-1">
                                    <FaCheckCircle size={10} />
                                    Fecha de activación:
                                  </p>
                                  <p className="text-sm text-gray-900 font-medium">
                                    {new Date(enrollment.fechaInicio).toLocaleDateString('es-ES', {
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric'
                                    })}
                                  </p>
                                </div>
                              )}

                              {enrollment.fechaVencimiento && (
                                <div className="bg-gray-50 rounded-lg p-3">
                                  <p className="text-xs font-semibold text-gray-600 mb-1 flex items-center gap-1">
                                    <FaClock size={10} />
                                    Fecha de vencimiento:
                                  </p>
                                  <p className="text-sm text-gray-900 font-medium">
                                    {new Date(enrollment.fechaVencimiento).toLocaleDateString('es-ES', {
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric'
                                    })}
                                  </p>
                                </div>
                              )}

                              <div className="bg-gray-50 rounded-lg p-3">
                                <p className="text-xs font-semibold text-gray-600 mb-1">
                                  Estado:
                                </p>
                                <div className="flex items-center gap-2">
                                  {getStateIcon(enrollment.estado)}
                                  <p className="text-sm text-gray-900 font-medium">
                                    {enrollment.estado === "Pending_Payment" ? "Pendiente de Pago" : enrollment.estado}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Información del deportista */}
                            <div className="bg-gray-50 rounded-lg p-3">
                              <p className="text-xs font-semibold text-gray-600 mb-1">
                                Deportista:
                              </p>
                              <p className="text-sm text-gray-900 font-medium">
                                {enrollment.athlete?.user?.firstName} {enrollment.athlete?.user?.lastName}
                              </p>
                              <p className="text-xs text-gray-600 mt-1">
                                Documento: {enrollment.athlete?.user?.identification}
                              </p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Paginación */}
                {totalPages > 1 && (
                  <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">
                    <div className="text-sm text-gray-600">
                      Página {currentPage} de {totalPages}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        <FaChevronLeft size={12} />
                        Anterior
                      </button>
                      <button
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        Siguiente
                        <FaChevronRight size={12} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : !loading ? (
              <div className="text-center py-16 bg-gray-50 rounded-lg border border-gray-200">
                <FaSearch className="mx-auto text-gray-300 mb-3" size={48} />
                {searchTerm ? (
                  <>
                    <p className="text-gray-600 font-medium mb-2">
                      No se encontraron registros para "{searchTerm}"
                    </p>
                    <button
                      onClick={handleClearSearch}
                      className="mt-4 px-4 py-2 bg-primary-purple text-white rounded-lg hover:opacity-90 transition-all"
                    >
                      Limpiar búsqueda
                    </button>
                  </>
                ) : (
                  <p className="text-gray-600 font-medium">
                    No hay registros de inscripciones disponibles
                  </p>
                )}
              </div>
            ) : null}           
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
          <div className="flex justify-end">
            <motion.button
              onClick={onClose}
              className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Cerrar
            </motion.button>
          </div>
        </div>

        {/* Modal para ver comprobante */}
        <AnimatePresence>
          {selectedComprobante && (
            <ComprobanteModal
              comprobante={selectedComprobante}
              onClose={() => setSelectedComprobante(null)}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );

  return createPortal(modalContent, document.body);
};

export default EnrollmentHistoryModal;

