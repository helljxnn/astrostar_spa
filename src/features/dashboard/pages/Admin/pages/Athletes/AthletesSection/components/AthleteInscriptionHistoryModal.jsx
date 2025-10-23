import React, { useState, useMemo } from "react";
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
} from "react-icons/fa";

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

  return (
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
};

const InscriptionHistoryModal = ({ isOpen, onClose, athlete, guardians }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedComprobante, setSelectedComprobante] = useState(null);
  const itemsPerPage = 5;

  if (!isOpen) return null;
  if (!athlete) {
    console.error("Athlete is undefined in InscriptionHistoryModal");
    return null;
  }

  // Validar datos críticos
  const safeAthlete = athlete || {};
  const safeInscriptions = Array.isArray(safeAthlete.inscripciones) 
    ? safeAthlete.inscripciones 
    : [];

  const calculateAge = () => {
    if (!safeAthlete?.fechaNacimiento) return 0;
    try {
      const birthDate = new Date(safeAthlete.fechaNacimiento);
      const today = new Date();
      if (isNaN(birthDate.getTime())) return 0;

      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ) {
        age--;
      }
      return age;
    } catch (error) {
      return 0;
    }
  };

  const guardian = Array.isArray(guardians) 
    ? guardians.find((g) => String(g?.id) === String(safeAthlete?.acudiente))
    : null;

  const age = calculateAge();

  // Ordenar inscripciones por fecha - CON MÁS VALIDACIONES
  const sortedInscriptions = useMemo(() => {
    if (!safeInscriptions || !Array.isArray(safeInscriptions)) {
      return [];
    }
    
    try {
      return [...safeInscriptions].sort((a, b) => {
        const dateA = new Date(a?.fechaConcepto || a?.fechaInscripcion || 0);
        const dateB = new Date(b?.fechaConcepto || b?.fechaInscripcion || 0);
        return dateB - dateA;
      });
    } catch (error) {
      console.error("Error sorting inscriptions:", error);
      return safeInscriptions;
    }
  }, [safeInscriptions]);

  // BUSCADOR GENERAL
  const filteredInscriptions = useMemo(() => {
    if (!searchTerm.trim()) {
      return [...sortedInscriptions];
    }

    const search = searchTerm.toLowerCase();
    return sortedInscriptions.filter((inscription) => {
      if (!inscription) return false;
      
      // Buscar en todos los campos relevantes
      const searchableFields = [
        inscription.concepto,
        inscription.categoria,
        inscription.estado,
        inscription.estadoAnterior,
        inscription.tipo,
        formatDateTime(inscription.fechaInscripcion),
        formatDateTime(inscription.fechaConcepto)
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

  const currentInscription = sortedInscriptions[0] || {};
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

  return (
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
            Historial de Inscripciones
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
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <p className="text-xs text-gray-500 mb-1">Edad actual</p>
                  <p className="text-2xl font-bold text-gray-900">{age} años</p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <p className="text-xs text-gray-500 mb-1">Categoría actual</p>
                  <p className="text-xl font-bold text-gray-900">
                    {safeAthlete.categoria || "Sin asignar"}
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
                    <p className="text-sm font-bold text-gray-900">
                      {currentInscription?.estado || "Sin estado"}
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
                  placeholder="Buscar por concepto, categoría, estado, tipo, fechas..."
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

            {/* Timeline de Inscripciones */}
            {filteredInscriptions.length > 0 ? (
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
                  <FaHistory className="text-primary-purple" />
                  Registros ({filteredInscriptions.length})
                </h3>

                <div className="space-y-4">
                  {paginatedInscriptions.map((inscription, index) => {
                    if (!inscription) return null;
                    
                    const globalIndex = sortedInscriptions.findIndex(
                      (i) => i?.id === inscription?.id
                    );
                    const isFirst = globalIndex === 0;
                    const isCambioEstado = inscription.tipo === "cambio_estado";
                    const isRenovacion = inscription.tipo === "renovacion";
                    const tieneComprobante = inscription.comprobantePago; 

                    return (
                      <motion.div
                        key={inscription.id || index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`relative border rounded-xl p-5 bg-white ${
                          isFirst
                            ? "border-primary-purple border-2 shadow-md"
                            : "border-gray-200"
                        }`}
                      >
                        {isFirst && (
                          <div className="absolute -top-3 left-4">
                            <span className="px-3 py-1 bg-primary-purple text-white text-xs font-semibold rounded-full shadow">
                              ACTUAL
                            </span>
                          </div>
                        )}

                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 mt-1">
                            {getStateIcon(inscription.estado)}
                          </div>

                          <div className="flex-1 space-y-3">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                              <div className="flex items-center gap-3">
                                <h4 className="text-lg font-bold text-gray-900">
                                  {inscription.estado}
                                </h4>
                                <span
                                  className={`px-2 py-1 rounded-md text-xs font-medium border ${getStateBadgeColor(
                                    inscription.estado
                                  )}`}
                                >
                                  {inscription.estado}
                                </span>
                              </div>

                              <div className="flex items-center gap-2">
                                {isCambioEstado && (
                                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded border border-blue-300 font-medium">
                                    Cambio de estado
                                  </span>
                                )}
                                {isRenovacion && (
                                  <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded border border-gray-300">
                                    Renovación
                                  </span>
                                )}
                                {!isCambioEstado && !isRenovacion && (
                                  <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded border border-gray-300">
                                    Inscripción inicial
                                  </span>
                                )}
                                
                                {/* Mini botón para ver comprobante */}
                                {tieneComprobante && (
                                  <motion.button
                                    onClick={() => setSelectedComprobante(inscription.comprobantePago)}
                                    className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded border border-green-300 hover:bg-green-200 transition-colors font-medium group relative"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    title="Ver comprobante de pago"
                                  >
                                    <FaFileImage size={10} />
                                    <FaExpand size={8} />
                                    {/* Tooltip */}
                                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                      Ver comprobante
                                    </div>
                                  </motion.button>
                                )}
                              </div>
                            </div>

                            {isCambioEstado && inscription.estadoAnterior && (
                              <div className="flex items-center gap-2 bg-blue-50 rounded-lg p-3 border border-blue-200">
                                <span className="text-sm text-gray-600">
                                  Cambió de:
                                </span>
                                <span
                                  className={`px-2 py-1 rounded text-xs font-medium ${getStateBadgeColor(
                                    inscription.estadoAnterior
                                  )}`}
                                >
                                  {inscription.estadoAnterior}
                                </span>
                                <FaArrowRight className="text-blue-500" size={12} />
                                <span
                                  className={`px-2 py-1 rounded text-xs font-medium ${getStateBadgeColor(
                                    inscription.estado
                                  )}`}
                                >
                                  {inscription.estado}
                                </span>
                              </div>
                            )}

                            {inscription.concepto && (
                              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                <p className="text-sm font-semibold text-gray-700 mb-1">
                                  {isCambioEstado ? "Motivo del cambio:" : "Concepto:"}
                                </p>
                                <p className="text-gray-900">{inscription.concepto}</p>
                              </div>
                            )}

                            {/* Sección de comprobante si existe */}
                            {tieneComprobante && (
                              <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <FaReceipt className="text-green-600" size={16} />
                                    <div>
                                      <p className="text-sm font-semibold text-green-700 mb-1">
                                        Comprobante de pago:
                                      </p>
                                      <p className="text-xs text-green-600">
                                        {inscription.comprobantePago.nombreArchivo}
                                      </p>
                                      <p className="text-xs text-green-500 mt-1">
                                        Subido: {new Date(inscription.comprobantePago.fechaSubida).toLocaleDateString('es-ES')} • 
                                        Tamaño: {formatFileSize(inscription.comprobantePago.tamaño)}
                                      </p>
                                    </div>
                                  </div>
                                  <motion.button
                                    onClick={() => setSelectedComprobante(inscription.comprobantePago)}
                                    className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                  >
                                    <FaExpand size={12} />
                                    Ver Comprobante
                                  </motion.button>
                                </div>
                              </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                <p className="text-xs font-semibold text-gray-600 mb-1 flex items-center gap-1">
                                  <FaCalendarAlt size={10} />
                                  Fecha de inscripción:
                                </p>
                                <p className="text-sm text-gray-900 font-medium">
                                  {formatDateTime(inscription.fechaInscripcion)}
                                </p>
                                {inscription.estado === "Vigente" && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    Vence:{" "}
                                    {new Date(
                                      new Date(inscription.fechaInscripcion).setFullYear(
                                        new Date(inscription.fechaInscripcion).getFullYear() +
                                          1
                                      )
                                    ).toLocaleDateString("es-ES")}
                                  </p>
                                )}
                              </div>

                              {inscription.fechaConcepto && (
                                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                  <p className="text-xs font-semibold text-gray-600 mb-1 flex items-center gap-1">
                                    <FaClock size={10} />
                                    Fecha del registro:
                                  </p>
                                  <p className="text-sm text-gray-900 font-medium">
                                    {formatDateTime(inscription.fechaConcepto)}
                                  </p>
                                </div>
                              )}
                            </div>

                            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                              <p className="text-xs font-semibold text-gray-600 mb-1">
                                Categoría:
                              </p>
                              <p className="text-sm text-gray-900 font-medium">
                                {inscription.categoria}
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
            ) : (
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
            )}           
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
};

export default InscriptionHistoryModal;