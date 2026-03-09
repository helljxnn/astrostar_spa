import { motion } from "framer-motion";
import {
  FaTimes,
  FaIdCard,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaBirthdayCake,
  FaUser,
  FaBriefcase,
} from "react-icons/fa";

const DetailItem = ({ icon, label, value }) => (
  <div className="flex items-start gap-2.5 p-2.5 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
    <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-white rounded-lg text-primary-purple shadow-sm">
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs font-medium text-gray-500 mb-0.5">{label}</p>
      <p className="text-sm font-semibold text-gray-800 break-words">
        {value || "No especificado"}
      </p>
    </div>
  </div>
);

const ViewProfileModal = ({ isOpen, onClose, user }) => {
  if (!isOpen) return null;

  // Función para formatear el rol
  const formatRole = (role) => {
    if (!role) return "No especificado";

    // Si el rol es un objeto con name
    if (typeof role === "object" && role?.name) {
      return role.name
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    }

    // Si el rol es un string
    if (typeof role === "string") {
      return role
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    }

    return "No especificado";
  };

  // Función para obtener el nombre del tipo de documento
  const getDocumentTypeName = () => {
    if (user?.documentType?.name) {
      return user.documentType.name;
    }
    if (user?.tipoDocumento) {
      return user.tipoDocumento;
    }
    return "No especificado";
  };

  // Función para obtener el nombre completo
  const getFullName = () => {
    const firstName = user?.firstName || user?.nombre || "";
    const middleName = user?.middleName || user?.segundoNombre || "";
    const lastName = user?.lastName || user?.apellido || "";
    const secondLastName = user?.secondLastName || user?.segundoApellido || "";

    return `${firstName} ${middleName} ${lastName} ${secondLastName}`
      .replace(/\s+/g, " ")
      .trim();
  };

  // Función para obtener la inicial del nombre
  const getInitial = () => {
    const firstName = user?.firstName || user?.nombre;
    return firstName ? firstName.charAt(0).toUpperCase() : "U";
  };

  // Función para formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return "No especificado";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Función para calcular edad
  const calculateAge = (birthDate) => {
    if (!birthDate) return "No especificado";
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }
    return age >= 0 ? `${age} años` : "No especificado";
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] sm:max-h-[95vh] overflow-y-auto relative"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white rounded-t-2xl border-b border-gray-200 p-3 sm:p-4 z-10">
          <button
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
            onClick={onClose}
          >
            <FaTimes size={18} />
          </button>
          <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary-purple to-primary-blue bg-clip-text text-transparent text-center">
            Perfil de Usuario
          </h2>
        </div>

        {/* Body */}
        <div className="p-3 sm:p-4 md:p-6">
          <div className="flex flex-col items-center mb-4">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt="Avatar"
                className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-purple to-primary-blue flex items-center justify-center text-white font-bold text-3xl mb-2">
                {getInitial()}
              </div>
            )}
            <h3 className="text-lg font-bold text-gray-800">{getFullName()}</h3>
            <p className="text-sm text-gray-500">
              {formatRole(user?.role || user?.rol)}
            </p>
          </div>

          {/* Grid de dos columnas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Columna Izquierda */}
            <div className="space-y-4">
              {/* Información Personal */}
              <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-sm">
                <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                  <div className="w-1 h-4 bg-gradient-to-b from-primary-purple to-primary-blue rounded-full"></div>
                  Información Personal
                </h4>
                <div className="space-y-1.5">
                  <DetailItem
                    icon={<FaUser size={16} />}
                    label="Primer Nombre"
                    value={user?.firstName || user?.nombre || "No especificado"}
                  />
                  <DetailItem
                    icon={<FaUser size={16} />}
                    label="Segundo Nombre"
                    value={
                      user?.middleName ||
                      user?.segundoNombre ||
                      "No especificado"
                    }
                  />
                  <DetailItem
                    icon={<FaUser size={16} />}
                    label="Primer Apellido"
                    value={
                      user?.lastName || user?.apellido || "No especificado"
                    }
                  />
                  <DetailItem
                    icon={<FaUser size={16} />}
                    label="Segundo Apellido"
                    value={
                      user?.secondLastName ||
                      user?.segundoApellido ||
                      "No especificado"
                    }
                  />
                  <DetailItem
                    icon={<FaBirthdayCake size={16} />}
                    label="Fecha de Nacimiento"
                    value={formatDate(user?.birthDate || user?.fechaNacimiento)}
                  />
                  <DetailItem
                    icon={<FaBirthdayCake size={16} />}
                    label="Edad"
                    value={
                      user?.age
                        ? `${user.age} años`
                        : calculateAge(user?.birthDate || user?.fechaNacimiento)
                    }
                  />
                </div>
              </div>
            </div>

            {/* Columna Derecha */}
            <div className="space-y-4">
              {/* Información de Contacto */}
              <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-sm">
                <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                  <div className="w-1 h-4 bg-gradient-to-b from-primary-purple to-primary-blue rounded-full"></div>
                  Información de Contacto
                </h4>
                <div className="space-y-1.5">
                  <DetailItem
                    icon={<FaEnvelope size={16} />}
                    label="Correo Electrónico"
                    value={user?.email || user?.correo || "No especificado"}
                  />
                  <DetailItem
                    icon={<FaPhone size={16} />}
                    label="Teléfono"
                    value={
                      user?.phoneNumber || user?.telefono || "No especificado"
                    }
                  />
                  <DetailItem
                    icon={<FaMapMarkerAlt size={16} />}
                    label="Dirección"
                    value={
                      user?.address || user?.direccion || "No especificado"
                    }
                  />
                </div>
              </div>

              {/* Información de Identificación */}
              <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-sm">
                <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                  <div className="w-1 h-4 bg-gradient-to-b from-primary-purple to-primary-blue rounded-full"></div>
                  Información de Identificación
                </h4>
                <div className="space-y-1.5">
                  <DetailItem
                    icon={<FaIdCard size={16} />}
                    label="Tipo de Documento"
                    value={getDocumentTypeName()}
                  />
                  <DetailItem
                    icon={<FaIdCard size={16} />}
                    label="Número de Documento"
                    value={
                      user?.identification ||
                      user?.identificacion ||
                      "No especificado"
                    }
                  />
                  <DetailItem
                    icon={<FaBriefcase size={16} />}
                    label="Rol en el Sistema"
                    value={formatRole(user?.role || user?.rol)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 border-t border-gray-200 p-3 sm:p-4 flex justify-center">
          <motion.button
            onClick={onClose}
            className="px-6 sm:px-8 py-2 bg-primary-purple text-white rounded-xl hover:bg-primary-blue transition-colors font-medium shadow-md"
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
