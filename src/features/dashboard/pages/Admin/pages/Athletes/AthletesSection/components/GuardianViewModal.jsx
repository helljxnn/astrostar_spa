"use client"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FaTimes, FaEdit, FaEye, FaTrash } from "react-icons/fa"
import { FormField } from "../../../../../../../../shared/components/FormField"
import { showSuccessAlert, showErrorAlert, showDeleteAlert } from "../../../../../../../../shared/utils/alerts.js"

// Mapeo de parentesco del backend (inglés) al frontend (español)
const parentescoBackendToFrontend = {
  'Mother': 'Madre',
  'Father': 'Padre',
  'Grandparent': 'Abuelo/a',
  'Uncle_Aunt': 'Tío/a',
  'Sibling': 'Hermano/a',
  'Cousin': 'Primo/a',
  'Legal_Guardian': 'Tutor/a Legal',
  'Neighbor': 'Vecino/a',
  'Family_Friend': 'Amigo/a de la familia',
  'Other': 'Otro'
};

// Función para convertir parentesco
const convertirParentesco = (parentesco) => {
  if (!parentesco) return "N/A";
  return parentescoBackendToFrontend[parentesco] || parentesco;
};

const GuardianViewModal = ({ isOpen, onClose, guardian, athletes, onEdit, onDelete, onRemove, currentAthleteId, referenceData = { documentTypes: [] } }) => {
  const [activeTab, setActiveTab] = useState("view")
  const [isProcessing, setIsProcessing] = useState(false)
  const [editForm, setEditForm] = useState({
    nombreCompleto: "",
    tipoDocumento: "",
    identificacion: "",
    telefono: "",
    correo: "",
    direccion: ""
  })

  // Calcular si el deportista actual es menor de edad
  const isCurrentAthleteMinor = () => {
    if (!currentAthleteId || !athletes) return false;
    const currentAthlete = athletes.find(a => a.id === currentAthleteId);
    if (!currentAthlete) return false;
    
    // Buscar la fecha de nacimiento en diferentes campos posibles
    const birthDateStr = currentAthlete.birthDate || currentAthlete.fechaNacimiento;
    if (!birthDateStr) return false;
    
    const today = new Date();
    const birthDate = new Date(birthDateStr);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
return age < 18;
  };

  // Determinar si mostrar "Eliminar" o "Remover"
  const shouldShowRemove = athletes && athletes.length > 1;
  const shouldShowDelete = athletes && athletes.length === 1;

  useEffect(() => {
    if (guardian && isOpen && referenceData.documentTypes) {
      // Si tipoDocumento es un ID numérico, usarlo directamente
      // Si es un string (nombre antiguo), buscar el ID correspondiente
      let documentTypeId = guardian.tipoDocumento || "";
      
      // Si no es un número, buscar el ID por nombre
      if (documentTypeId && isNaN(documentTypeId)) {
        const docType = referenceData.documentTypes.find(
          dt => dt.name?.toLowerCase() === documentTypeId.toLowerCase() ||
                dt.label?.toLowerCase() === documentTypeId.toLowerCase()
        );
        if (docType) {
          documentTypeId = docType.id;
        }
      }
      
      setEditForm({
        nombreCompleto: guardian.nombreCompleto || "",
        tipoDocumento: documentTypeId,
        identificacion: guardian.identificacion || "",
        telefono: guardian.telefono || "",
        correo: guardian.correo || "",
        direccion: guardian.direccion || guardian.address || ""
      })
    }
  }, [guardian, isOpen, referenceData.documentTypes])

  useEffect(() => {
    if (!isOpen) {
      setActiveTab("view")
      setIsProcessing(false)
    }
  }, [isOpen])

  const handleEditFormChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSaveEdit = async () => {
    if (!editForm.nombreCompleto?.trim()) {
      showErrorAlert("Campo requerido", "El nombre completo es obligatorio")
      return
    }
    if (!editForm.identificacion?.trim()) {
      showErrorAlert("Campo requerido", "El número de documento es obligatorio")
      return
    }

    setIsProcessing(true)
    try {
      // Enviar tanto 'direccion' como 'address' para compatibilidad con el backend
      const updatedData = { 
        ...guardian, 
        ...editForm,
        address: editForm.direccion // Asegurar que el backend reciba el campo 'address'
      };
      await onEdit(updatedData)
      showSuccessAlert("Acudiente actualizado", "Los cambios se guardaron correctamente")
      setActiveTab("view")
    } catch (error) {
      showErrorAlert("Error", error.message || "No se pudo actualizar el acudiente")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDeleteGuardian = async () => {
    const isMinor = isCurrentAthleteMinor();
    
    // Si es menor de edad, preguntar si desea asignar uno nuevo
    if (isMinor) {
      const result = await showDeleteAlert(
        "Deportista menor de edad",
        "Esta deportista es menor de edad y el acudiente es obligatorio. ¿Desea eliminar este acudiente y asignar uno nuevo?",
        { 
          confirmButtonText: "Sí, eliminar y asignar nuevo",
          cancelButtonText: "Cancelar"
        }
      );
      
      if (result.isConfirmed) {
        setIsProcessing(true);
        try {
          await onDelete(guardian, true); // true indica que necesita asignar nuevo acudiente
        } finally {
          setIsProcessing(false);
        }
      }
    } else {
      // Si es mayor de edad, eliminar directamente
      const result = await showDeleteAlert(
        "¿Eliminar acudiente?",
        `Se eliminará a ${guardian.nombreCompleto}. Esta acción no se puede deshacer.`
      );
      
      if (result.isConfirmed) {
        setIsProcessing(true);
        try {
          await onDelete(guardian, false);
        } finally {
          setIsProcessing(false);
        }
      }
    }
  };

  const handleRemoveGuardian = async () => {
    const isMinor = isCurrentAthleteMinor();
    
    if (isMinor) {
      const result = await showDeleteAlert(
        "Deportista menor de edad",
        "Esta deportista es menor de edad y el acudiente es obligatorio. ¿Desea remover este acudiente y asignar uno nuevo?",
        { 
          confirmButtonText: "Sí, remover y asignar nuevo",
          cancelButtonText: "Cancelar"
        }
      );
      
      if (result.isConfirmed) {
        setIsProcessing(true);
        try {
          await onRemove(guardian, currentAthleteId, true);
        } catch (error) {
          console.error('❌ Error removiendo acudiente:', error);
        } finally {
          setIsProcessing(false);
        }
      }
    } else {
      const result = await showDeleteAlert(
        "¿Remover acudiente?",
        `Se removerá a ${guardian.nombreCompleto} de esta deportista. El acudiente seguirá asignado a otras deportistas.`
      );
      
      if (result.isConfirmed) {
        setIsProcessing(true);
        try {
          await onRemove(guardian, currentAthleteId, false);
        } finally {
          setIsProcessing(false);
        }
      }
    }
  };

  if (!isOpen || !guardian) return null

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
            disabled={isProcessing}
          >
            <FaTimes size={18} />
          </button>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary-purple to-primary-blue bg-clip-text text-transparent text-center mb-3">
            Gestión de Acudiente
          </h2>
          <p className="text-center text-gray-600">
            <span className="font-semibold text-gray-800">{guardian.nombreCompleto}</span>
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-gray-50 border-b border-gray-200">
          <div className="flex justify-center gap-2 p-3">
            <motion.button
              onClick={() => setActiveTab("view")}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                activeTab === "view"
                  ? "bg-primary-blue text-white shadow-lg"
                  : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
              }`}
              disabled={isProcessing}
              whileHover={{ scale: activeTab === "view" ? 1 : 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FaEye size={16} />
              Ver Detalles
            </motion.button>

            <motion.button
              onClick={() => setActiveTab("edit")}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                activeTab === "edit"
                  ? "bg-primary-blue text-white shadow-lg"
                  : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
              }`}
              disabled={isProcessing}
              whileHover={{ scale: activeTab === "edit" ? 1 : 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FaEdit size={16} />
              Editar Acudiente
            </motion.button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {activeTab === "view" && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
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
                    {athletes && athletes.length > 0 
                      ? convertirParentesco(athletes[0].parentesco)
                      : "N/A"}
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

                {/* Correo */}
                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.4 }}
                >
                  <label className="text-sm font-medium text-gray-600">Correo Electrónico</label>
                  <p className="text-gray-900 p-2 bg-gray-50 rounded-lg border border-gray-200 min-h-[42px] break-all">
                    {guardian.correo || "N/A"}
                  </p>
                </motion.div>

                {/* Dirección */}
                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.4 }}
                >
                  <label className="text-sm font-medium text-gray-600">Dirección</label>
                  <p className="text-gray-900 p-2 bg-gray-50 rounded-lg border border-gray-200 min-h-[42px]">
                    {guardian.direccion || guardian.address || "N/A"}
                  </p>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "edit" && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2 border-b border-gray-200 pb-3">
                <FaEdit className="text-primary-purple" />
                Editar Información del Acudiente
              </h3>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="md:col-span-2 lg:col-span-3">
                    <FormField
                      label="Nombre Completo"
                      name="nombreCompleto"
                      type="text"
                      value={editForm.nombreCompleto}
                      onChange={(e) => handleEditFormChange("nombreCompleto", e.target.value)}
                      required
                    />
                  </div>

                  <FormField
                    label="Tipo de Documento"
                    name="tipoDocumento"
                    type="select"
                    options={referenceData.documentTypes.map((type) => ({
                      value: type.id,
                      label: type.name || type.label,
                    }))}
                    value={editForm.tipoDocumento}
                    onChange={(e) => handleEditFormChange("tipoDocumento", e.target.value)}
                    required
                  />

                  <FormField
                    label="Número de Documento"
                    name="identificacion"
                    type="text"
                    value={editForm.identificacion}
                    onChange={(e) => handleEditFormChange("identificacion", e.target.value)}
                    required
                  />

                  <FormField
                    label="Teléfono"
                    name="telefono"
                    type="text"
                    value={editForm.telefono}
                    onChange={(e) => handleEditFormChange("telefono", e.target.value)}
                  />

                  <FormField
                    label="Correo Electrónico"
                    name="correo"
                    type="email"
                    value={editForm.correo}
                    onChange={(e) => handleEditFormChange("correo", e.target.value)}
                  />

                  <FormField
                    label="Dirección"
                    name="direccion"
                    type="text"
                    value={editForm.direccion}
                    onChange={(e) => handleEditFormChange("direccion", e.target.value)}
                  />
                </div>

                <div className="flex justify-end pt-4 border-t border-gray-200">
                  <motion.button
                    onClick={handleSaveEdit}
                    disabled={isProcessing}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-blue text-white rounded-lg shadow hover:bg-primary-purple transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isProcessing ? "Guardando..." : "Guardar Cambios"}
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Información del Sistema */}
        {activeTab === "view" && (guardian.createdAt || guardian.updatedAt) && (
          <motion.div
            className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.4 }}
          >
            <h4 className="text-sm font-semibold text-gray-800 mb-3">
              Información del Sistema
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {guardian.createdAt && (
                <div>
                  <label className="text-xs font-medium text-gray-600">Fecha de Creación:</label>
                  <p className="text-sm text-gray-900 mt-1">
                    {new Date(guardian.createdAt).toLocaleDateString("es-CO", {
                      year: "numeric",
                      month: "long",
                      day: "numeric"
                    })}
                  </p>
                </div>
              )}
              {guardian.updatedAt && (
                <div>
                  <label className="text-xs font-medium text-gray-600">Última Actualización:</label>
                  <p className="text-sm text-gray-900 mt-1">
                    {new Date(guardian.updatedAt).toLocaleDateString("es-CO", {
                      year: "numeric",
                      month: "long",
                      day: "numeric"
                    })}
                  </p>
                </div>
              )}
              {guardian.statusAssignedAt && (
                <div>
                  <label className="text-xs font-medium text-gray-600">Estado Asignado:</label>
                  <p className="text-sm text-gray-900 mt-1">
                    {new Date(guardian.statusAssignedAt).toLocaleDateString("es-CO", {
                      year: "numeric",
                      month: "long",
                      day: "numeric"
                    })}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>

    {/* Footer */}
    <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
      <div className="flex justify-between items-center">
        {/* Botón Eliminar/Remover */}
        <div>
          {shouldShowDelete && (
            <motion.button
              onClick={handleDeleteGuardian}
              disabled={isProcessing}
              className="flex items-center gap-2 px-6 py-3 bg-red-400 text-white rounded-xl hover:bg-red-500 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FaTrash size={14} />
              {isProcessing ? "Procesando..." : "Eliminar Acudiente"}
            </motion.button>
          )}
          {shouldShowRemove && (
            <motion.button
              onClick={handleRemoveGuardian}
              disabled={isProcessing}
              className="flex items-center gap-2 px-6 py-3 bg-orange-400 text-white rounded-xl hover:bg-orange-500 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FaTrash size={14} />
              {isProcessing ? "Procesando..." : "Remover Acudiente"}
            </motion.button>
          )}
        </div>

        {/* Botón Cerrar */}
        <motion.button
          onClick={onClose}
          disabled={isProcessing}
          className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium disabled:opacity-50"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Cerrar
        </motion.button>
      </div>
    </div>
  </motion.div>
</motion.div>
  )
}

export default GuardianViewModal