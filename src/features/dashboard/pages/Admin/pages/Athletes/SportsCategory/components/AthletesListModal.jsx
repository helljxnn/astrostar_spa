// ================================
// ================================
import { 
  FaTimes, 
  FaUser, 
  FaEnvelope, 
  FaCalendarAlt,
  FaIdCard
} from "react-icons/fa";
import { MdSports } from "react-icons/md";

const AthletesListModal = ({ isOpen, onClose, category, athletes }) => {
  if (!isOpen || !category) return null;

  const getAgeRangeColor = () => {
    const min = category.EdadMinima;
    const max = category.EdadMaxima;
    
    if (min <= 12) return "bg-green-100 text-green-800";
    if (min <= 17) return "bg-blue-100 text-blue-800";
    if (min <= 35) return "bg-purple-100 text-purple-800";
    return "bg-orange-100 text-orange-800";
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header del Modal */}
        <div className="bg-gradient-to-r from-primary-blue to-primary-purple text-white p-6">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <div className="bg-white bg-opacity-20 p-3 rounded-full">
                <MdSports size={32} />
              </div>
              <div>
                <h2 className="text-2xl font-bold">
                  Deportistas - {category.Nombre}
                </h2>
                <div className="flex items-center gap-4 mt-2 text-white text-opacity-90">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getAgeRangeColor()} text-gray-800`}>
                    {category.EdadMinima} - {category.EdadMaxima} años
                  </span>
                  <span className="text-sm">
                    {athletes.length} {athletes.length === 1 ? 'deportista' : 'deportistas'}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors p-2"
            >
              <FaTimes size={24} />
            </button>
          </div>
        </div>

        {/* Contenido del Modal */}
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          {athletes.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <FaUser size={32} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                No hay deportistas registradas
              </h3>
              <p className="text-gray-500">
                Aún no se han registrado deportistas en la categoría "{category.Nombre}"
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              {/* Encabezado de la tabla */}
              <div className="bg-gray-50 px-6 py-3 border-b">
                <div className="grid grid-cols-6 gap-4 text-sm font-semibold text-gray-700">
                  <div>Nombre Completo</div>
                  <div>Tipo Documento</div>
                  <div>N° Identificación</div>
                  <div>Edad</div>
                  <div>Correo Electrónico</div>
                  <div>Categoría</div>
                </div>
              </div>

              {/* Filas de datos */}
              <div className="divide-y divide-gray-200">
                {athletes.map((athlete, index) => (
                  <div 
                    key={athlete.id} 
                    className={`px-6 py-4 hover:bg-gray-50 transition-colors ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                    }`}
                  >
                    <div className="grid grid-cols-6 gap-4 text-sm">
                      {/* Nombre Completo */}
                      <div className="flex items-center gap-2">
                        <FaUser className="text-primary-blue w-4 h-4 flex-shrink-0" />
                        <span className="font-medium text-gray-800">
                          {athlete.nombre} {athlete.apellido}
                        </span>
                      </div>

                      {/* Tipo de Documento */}
                      <div className="flex items-center gap-2">
                        <FaIdCard className="text-gray-500 w-4 h-4" />
                        <span className="text-gray-700">
                          {athlete.tipoDocumento || 'CC'}
                        </span>
                      </div>

                      {/* Número de Identificación */}
                      <div className="text-gray-700 font-mono">
                        {athlete.documento}
                      </div>

                      {/* Edad */}
                      <div className="flex items-center gap-2">
                        <FaCalendarAlt className="text-primary-purple w-4 h-4" />
                        <span className="text-gray-700">
                          {athlete.edad} años
                        </span>
                      </div>

                      {/* Correo Electrónico */}
                      <div className="flex items-center gap-2">
                        <FaEnvelope className="text-green-600 w-4 h-4" />
                        <span className="text-blue-600 hover:text-blue-800 cursor-pointer truncate">
                          {athlete.email}
                        </span>
                      </div>

                      {/* Categoría */}
                      <div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAgeRangeColor()}`}>
                          {athlete.categoria}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Estadísticas */}
          {athletes.length > 0 && (
            <div className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  Total de deportistas en {category.Nombre}:
                </span>
                <span className="font-semibold text-primary-blue text-lg">
                  {athletes.length}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer del Modal */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-purple transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default AthletesListModal;