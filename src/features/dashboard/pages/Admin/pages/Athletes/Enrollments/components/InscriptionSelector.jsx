import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaTimes,
  FaSearch,
  FaUserPlus,
  FaCalendarAlt,
  FaIdCard,
  FaPhone,
  FaEnvelope,
  FaBirthdayCake,
} from "react-icons/fa";

const InscriptionSelector = ({
  isOpen,
  onClose,
  inscriptions = [],
  onSelect,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  // Filtrar inscripciones
  const filteredInscriptions = useMemo(() => {
    if (!searchTerm.trim()) return inscriptions;

    const search = searchTerm.toLowerCase();
    return inscriptions.filter((inscription) => {
      const searchableFields = [
        inscription.nombres,
        inscription.apellidos,
        inscription.numeroDocumento,
        inscription.correo,
        inscription.telefono,
      ];

      return searchableFields.some(
        (field) => field && String(field).toLowerCase().includes(search)
      );
    });
  }, [inscriptions, searchTerm]);

  const handleSelect = (inscription) => {
    onSelect(inscription);
    setSearchTerm("");
  };

  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden relative flex flex-col"
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
            Seleccionar Inscripción
          </h2>
          <p className="text-center text-gray-600 text-sm">
            Busca y selecciona una deportista inscrita desde el landing para matricular
          </p>
        </div>

        {/* Buscador */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar por nombre, documento, correo o teléfono..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-purple focus:border-primary-purple transition-all"
              autoFocus
            />
            <FaSearch
              className="absolute left-4 top-4 text-gray-400"
              size={16}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-4 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FaTimes size={14} />
              </button>
            )}
          </div>
          {searchTerm && (
            <div className="mt-2 text-sm text-gray-600">
              <span className="font-medium">
                {filteredInscriptions.length}
              </span>{" "}
              resultado(s) encontrado(s)
            </div>
          )}
        </div>

        {/* Lista de inscripciones */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredInscriptions.length > 0 ? (
            <div className="space-y-3">
              {filteredInscriptions.map((inscription, index) => (
                <motion.div
                  key={inscription.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white border border-gray-200 rounded-xl p-5 hover:border-primary-purple hover:shadow-md transition-all cursor-pointer"
                  onClick={() => handleSelect(inscription)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary-purple/10 p-2 rounded-lg">
                          <FaUserPlus className="text-primary-purple" size={20} />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">
                            {inscription.nombres} {inscription.apellidos}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Inscrita el{" "}
                            {new Date(
                              inscription.fechaPreRegistro || inscription.createdAt
                            ).toLocaleDateString("es-ES")}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <FaIdCard className="text-gray-400" size={14} />
                          <span className="font-medium">
                            {inscription.tipoDocumento}:
                          </span>
                          <span>{inscription.numeroDocumento}</span>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <FaBirthdayCake className="text-gray-400" size={14} />
                          <span>
                            {new Date(
                              inscription.fechaNacimiento
                            ).toLocaleDateString("es-ES")}
                          </span>
                        </div>

                        {inscription.telefono && (
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <FaPhone className="text-gray-400" size={14} />
                            <span>{inscription.telefono}</span>
                          </div>
                        )}

                        {inscription.correo && (
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <FaEnvelope className="text-gray-400" size={14} />
                            <span className="truncate">{inscription.correo}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <motion.button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelect(inscription);
                      }}
                      className="ml-4 px-4 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-purple transition-colors text-sm font-medium whitespace-nowrap"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Seleccionar
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <FaSearch className="mx-auto text-gray-300 mb-3" size={48} />
              {searchTerm ? (
                <>
                  <p className="text-gray-600 font-medium mb-2">
                    No se encontraron resultados para "{searchTerm}"
                  </p>
                  <button
                    onClick={() => setSearchTerm("")}
                    className="mt-4 px-4 py-2 bg-primary-purple text-white rounded-lg hover:opacity-90 transition-all"
                  >
                    Limpiar búsqueda
                  </button>
                </>
              ) : (
                <p className="text-gray-600 font-medium">
                  No hay inscripciones pendientes
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Total de inscripciones:{" "}
              <span className="font-semibold">{inscriptions.length}</span>
            </p>
            <motion.button
              onClick={onClose}
              className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-medium"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Cancelar
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default InscriptionSelector;

