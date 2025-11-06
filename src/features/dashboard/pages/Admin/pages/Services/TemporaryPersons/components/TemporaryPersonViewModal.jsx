import { motion } from "framer-motion";

const TemporaryPersonViewModal = ({
  isOpen,
  onClose,
  person,
  referenceData = { documentTypes: [] },
}) => {
  if (!isOpen || !person) return null;

  // Función para obtener el nombre del tipo de documento
  const getDocumentTypeName = (id) => {
    const docType = referenceData.documentTypes.find(dt => dt.id === id);
    return docType ? docType.name : 'No especificado';
  };

  // Función para traducir estados
  const translateStatus = (status) => {
    const statusMap = {
      'Active': 'Activo',
      'Inactive': 'Inactivo'
    };
    return statusMap[status] || status;
  };

  // Función para traducir tipo de persona
  const translatePersonType = (personType) => {
    const typeMap = {
      'Deportista': 'Deportista',
      'Entrenador': 'Entrenador',
      'Participante': 'Participante'
    };
    return typeMap[personType] || personType;
  };

  // Función para formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'No especificado';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Componente para campo de solo lectura
  const ReadOnlyField = ({ label, value, delay = 0 }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="form-field space-y-1"
    >
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="w-full p-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-700 min-h-[48px] flex items-center">
        {value || 'No especificado'}
      </div>
    </motion.div>
  );

  return (
    <motion.div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      style={{ zIndex: 9999 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="modal-container bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] relative flex flex-col overflow-hidden"
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
            ✕
          </button>
          <h2 className="text-xl font-bold bg-gradient-to-r from-primary-purple to-primary-blue bg-clip-text text-transparent text-center">
            Ver Persona Temporal
          </h2>
        </div>

        {/* Body */}
        <div className="modal-body flex-1 overflow-y-auto p-3 relative">
          <div className="form-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 relative">
            
            {/* Tipo Documento */}
            <ReadOnlyField
              label="Tipo de Documento"
              value={getDocumentTypeName(person.documentTypeId)}
              delay={0.1}
            />

            {/* Identificación */}
            <ReadOnlyField
              label="Número de Documento"
              value={person.identification}
              delay={0.2}
            />

            {/* Primer Nombre */}
            <ReadOnlyField
              label="Primer Nombre"
              value={person.firstName}
              delay={0.3}
            />

            {/* Apellido */}
            <ReadOnlyField
              label="Apellido"
              value={person.lastName}
              delay={0.35}
            />

            {/* Correo */}
            <ReadOnlyField
              label="Correo Electrónico"
              value={person.email}
              delay={0.4}
            />

            {/* Teléfono */}
            <ReadOnlyField
              label="Número Telefónico"
              value={person.phone}
              delay={0.45}
            />

            {/* Dirección */}
            <ReadOnlyField
              label="Dirección"
              value={person.address}
              delay={0.5}
            />

            {/* Fecha de Nacimiento */}
            <ReadOnlyField
              label="Fecha de Nacimiento"
              value={formatDate(person.birthDate)}
              delay={0.55}
            />

            {/* Edad */}
            <ReadOnlyField
              label="Edad"
              value={(() => {
                if (person.age) return `${person.age} años`;
                if (!person.birthDate) return 'No especificado';
                const today = new Date();
                const birth = new Date(person.birthDate);
                let age = today.getFullYear() - birth.getFullYear();
                const monthDiff = today.getMonth() - birth.getMonth();
                if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
                  age--;
                }
                return age >= 0 ? `${age} años` : 'No especificado';
              })()}
              delay={0.6}
            />

            {/* Equipo - Solo para Deportista y Entrenador */}
            {(person.personType === 'Deportista' || person.personType === 'Entrenador') && (
              <ReadOnlyField
                label="Equipo"
                value={person.team || '(no asignado)'}
                delay={0.65}
              />
            )}

            {/* Categoría - Solo para Deportista y Entrenador */}
            {(person.personType === 'Deportista' || person.personType === 'Entrenador') && (
              <ReadOnlyField
                label="Categoría"
                value={person.category || '(no asignado)'}
                delay={0.67}
              />
            )}

            {/* Tipo de Persona */}
            <ReadOnlyField
              label="Tipo de Persona"
              value={translatePersonType(person.personType)}
              delay={0.7}
            />

            {/* Estado */}
            <ReadOnlyField
              label="Estado"
              value={translateStatus(person.status)}
              delay={0.75}
            />

          </div>

          {/* Información adicional */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="mt-6 p-4 bg-gray-50 rounded-xl"
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Información del Sistema</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium text-gray-600">Fecha de Creación:</span>
                <p className="text-gray-800">{formatDate(person.createdAt)}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Última Actualización:</span>
                <p className="text-gray-800">{formatDate(person.updatedAt)}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 border-t border-gray-200 p-3">
          <div className="flex justify-center">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-purple transition-colors font-medium"
            >
              Cerrar
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default TemporaryPersonViewModal;