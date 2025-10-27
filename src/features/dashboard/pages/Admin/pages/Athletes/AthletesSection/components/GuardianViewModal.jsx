"use client"
import { motion, AnimatePresence } from "framer-motion"
import { FaTimes, FaUser } from "react-icons/fa"

const GuardianViewModal = ({ isOpen, onClose, guardian, athletes }) => {
  if (!isOpen || !guardian) return null
  const guardianAthletes = athletes.filter((a) => String(a.acudiente) === String(guardian.id))

  const getStateColor = (state) => {
    switch (state?.toLowerCase()) {
      case "activo":
        return "text-primary-purple font-semibold"
      case "inactivo":
        return "text-red-600 font-semibold"
      default:
        return "text-gray-600 font-semibold"
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden relative flex flex-col"
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            {/* Header */}
            <div className="flex-shrink-0 bg-white rounded-t-2xl border-b border-gray-200 p-3 relative">
              <button
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-full"
                onClick={onClose}
              >
                <FaTimes size={18} />
              </button>
              <h2 className="text-xl font-bold bg-gradient-to-r from-primary-purple to-primary-blue bg-clip-text text-transparent text-center">
                Detalles del Acudiente
              </h2>
              <p className="text-center text-gray-600 mt-2">
                Información completa de:{" "}
                <span className="font-semibold text-primary-purple">{guardian.nombreCompleto}</span>
              </p>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-3">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {/* Nombre Completo */}
                <motion.div
                  className="space-y-2 md:col-span-2 lg:col-span-3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.4 }}
                >
                  <label className="text-sm font-medium text-gray-600">Nombre Completo</label>
                  <p className="text-gray-900 p-2 bg-gray-50 rounded-lg border border-gray-200 min-h-[42px]">
                    {guardian.nombreCompleto || "N/A"}
                  </p>
                </motion.div>

                {/* Tipo de Documento */}
                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                >
                  <label className="text-sm font-medium text-gray-600">Tipo de Documento</label>
                  <p className="text-gray-900 p-2 bg-gray-50 rounded-lg border border-gray-200 min-h-[42px]">
                    {guardian.tipoDocumento
                      ? guardian.tipoDocumento === "cedula"
                        ? "Cédula de Ciudadanía"
                        : guardian.tipoDocumento === "tarjeta_identidad"
                          ? "Tarjeta de Identidad"
                          : guardian.tipoDocumento === "cedula_extranjeria"
                            ? "Cédula de Extranjería"
                            : guardian.tipoDocumento === "pasaporte"
                              ? "Pasaporte"
                              : guardian.tipoDocumento
                      : "N/A"}
                  </p>
                </motion.div>

                {/* Identificación */}
                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                >
                  <label className="text-sm font-medium text-gray-600">Número de Documento</label>
                  <p className="text-gray-900 font-mono p-2 bg-gray-50 rounded-lg border border-gray-200 min-h-[42px]">
                    {guardian.identificacion || "N/A"}
                  </p>
                </motion.div>

                {/* Parentesco */}
                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.4 }}
                >
                  <label className="text-sm font-medium text-gray-600">Parentesco</label>
                  <p className="text-gray-900 p-2 bg-gray-50 rounded-lg border border-gray-200 min-h-[42px]">
                    {guardian.parentesco || "N/A"}
                  </p>
                </motion.div>

                {/* Teléfono */}
                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.4 }}
                >
                  <label className="text-sm font-medium text-gray-600">Teléfono</label>
                  <p className="text-gray-900 p-2 bg-gray-50 rounded-lg border border-gray-200 min-h-[42px]">
                    {guardian.telefono || "N/A"}
                  </p>
                </motion.div>

                {/* Estado */}
                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.4 }}
                >
                  <label className="text-sm font-medium text-gray-600">Estado</label>
                  <p className="text-gray-900 p-2 bg-gray-50 rounded-lg border border-gray-200 min-h-[42px]">
                    {guardian.estado || "N/A"}
                  </p>
                </motion.div>

                {/* Correo */}
                <motion.div
                  className="space-y-2 md:col-span-2 lg:col-span-3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.4 }}
                >
                  <label className="text-sm font-medium text-gray-600">Correo Electrónico</label>
                  <p className="text-gray-900 p-2 bg-gray-50 rounded-lg border border-gray-200 min-h-[42px] break-all">
                    {guardian.correo || "N/A"}
                  </p>
                </motion.div>

                {/* Dirección */}
                {guardian.direccion && (
                  <motion.div
                    className="space-y-2 md:col-span-2 lg:col-span-3"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.4 }}
                  >
                    <label className="text-sm font-medium text-gray-600">Dirección</label>
                    <p className="text-gray-900 p-2 bg-gray-50 rounded-lg border border-gray-200 min-h-[42px]">
                      {guardian.direccion}
                    </p>
                  </motion.div>
                )}

                {/* Deportistas Asociados */}
                <motion.div
                  className="md:col-span-2 lg:col-span-3 space-y-2 mt-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9, duration: 0.4 }}
                >
                  <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                    <FaUser className="text-primary-purple" />
                    Deportistas Asociados ({guardianAthletes.length})
                  </label>

                  {guardianAthletes.length > 0 ? (
                    <div className="space-y-2">
                      {guardianAthletes.map((athlete, idx) => (
                        <motion.div
                          key={athlete.id}
                          className="p-3 bg-white rounded-lg border border-gray-200 hover:shadow-sm transition-shadow duration-200"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 1 + idx * 0.1, duration: 0.3 }}
                        >
                          <p className="font-semibold text-gray-900 text-base mb-2">
                            {athlete.nombres} {athlete.apellidos}
                          </p>
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <span className="text-gray-600 font-medium">Documento:</span>
                              <p className="text-gray-900 font-mono mt-1">{athlete.numeroDocumento}</p>
                            </div>
                            <div>
                              <span className="text-gray-600 font-medium">Categoría:</span>
                              <p className="text-gray-900 mt-1">{athlete.categoria || "N/A"}</p>
                            </div>
                            <div>
                              <span className="text-gray-600 font-medium">Parentesco:</span>
                              <p className="text-primary-purple font-semibold mt-1">{athlete.parentesco || "N/A"}</p>
                            </div>
                            <div>
                              <span className="text-gray-600 font-medium">Estado:</span>
                              <p className={`mt-1 ${getStateColor(athlete.estado)}`}>{athlete.estado || "N/A"}</p>
                            </div>
                            <div>
                              <span className="text-gray-600 font-medium">Inscripción:</span>
                              <p className="text-gray-900 mt-1">{athlete.estadoInscripcion || "N/A"}</p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                      <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm text-blue-700 text-center">
                          Total de deportistas: <span className="font-semibold">{guardianAthletes.length}</span>
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-500">No hay deportistas asociados</p>
                    </div>
                  )}
                </motion.div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 border-t border-gray-200 p-3">
              <div className="flex justify-center">
                <button
                  onClick={onClose}
                  className="px-5 py-2 bg-primary-blue text-white rounded-lg hover:opacity-90 transition"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default GuardianViewModal