import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaArrowLeft, 
  FaUsers, 
  FaUserTie, 
  FaSearch,
  FaTrophy,
  FaUserFriends,
  FaChartBar
} from "react-icons/fa";

// Sistema global de inscripciones
const getGlobalInscriptions = () => {
  if (typeof window !== "undefined" && window.globalInscriptions) {
    return window.globalInscriptions;
  }
  // Inicializar con datos de ejemplo si no existe
  const initial = {
    teams: [
      { 
        id: 1, 
        name: "Águilas Doradas", 
        nombre: "Águilas Doradas",
        category: "Sub 15", 
        categoria: "Sub 15",
        members: 12,
        cantidadDeportistas: 12,
        teamType: "Fundacion" 
      },
      { 
        id: 6, 
        name: "Estrellas del Sur", 
        nombre: "Estrellas del Sur",
        category: "Sub 15", 
        categoria: "Sub 15",
        members: 11,
        cantidadDeportistas: 11,
        teamType: "Temporal" 
      },
    ],
    athletes: []
  };
  if (typeof window !== "undefined") {
    window.globalInscriptions = initial;
  }
  return initial;
};

const ViewRegistrationsModal = ({ 
  isOpen, 
  onClose, 
  eventName, 
  participantType 
}) => {
  const isTeamType = participantType === "Equipos";
  const [selectedSection, setSelectedSection] = useState(isTeamType ? "fundacion" : "deportistas");
  const [searchTerm, setSearchTerm] = useState("");

  if (!isOpen) return null;

  const globalInscriptions = getGlobalInscriptions();
  
  // Obtener datos según el tipo
  const allItems = isTeamType 
    ? globalInscriptions.teams.map(team => ({
        id: team.id,
        nombre: team.name || team.nombre || 'Sin nombre',
        categoria: team.category || team.categoria || 'Sin categoría',
        miembros: team.members || team.cantidadDeportistas || 0,
        teamType: team.teamType || "Fundacion",
      }))
    : globalInscriptions.athletes.map(athlete => ({
        id: athlete.id,
        nombre: athlete.name || athlete.nombre || 'Sin nombre',
        categoria: athlete.category || athlete.categoria || 'Sin categoría',
        edad: athlete.age || athlete.edad || 0,
      }));

  // Filtrar por sección (fundación o temporal)
  const filteredBySection = isTeamType
    ? allItems.filter(item => 
        selectedSection === "fundacion" 
          ? item.teamType === "Fundacion" 
          : item.teamType === "Temporal"
      )
    : allItems;

  // Filtrar por búsqueda
  const filteredItems = useMemo(() => {
    if (!searchTerm) return filteredBySection;
    return filteredBySection.filter(item =>
      item.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.categoria.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [filteredBySection, searchTerm]);

  // Estadísticas
  const stats = {
    total: allItems.length,
    fundacion: isTeamType ? allItems.filter(i => i.teamType === "Fundacion").length : 0,
    temporal: isTeamType ? allItems.filter(i => i.teamType === "Temporal").length : 0,
    totalMiembros: isTeamType ? allItems.reduce((sum, i) => sum + (i.miembros || 0), 0) : allItems.length,
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-purple to-primary-blue p-6 text-white">
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <FaArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">
                {isTeamType ? "Equipos Inscritos" : "Deportistas Inscritos"}
              </h2>
              <p className="text-blue-100 mt-1">Evento: {eventName}</p>
            </div>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="p-6 bg-gradient-to-br from-purple-50 to-blue-50 border-b">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl p-4 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <FaTrophy className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </motion.div>

            {isTeamType && (
              <>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white rounded-xl p-4 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <FaUsers className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Fundación</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.fundacion}</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white rounded-xl p-4 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <FaUserTie className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Temporales</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.temporal}</p>
                    </div>
                  </div>
                </motion.div>
              </>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-xl p-4 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <FaUserFriends className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">
                    {isTeamType ? "Miembros" : "Participantes"}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalMiembros}</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Tabs y Búsqueda */}
        <div className="border-b bg-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4">
            {/* Tabs */}
            {isTeamType && (
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedSection("fundacion")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    selectedSection === "fundacion"
                      ? "bg-primary-purple text-white shadow-md"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <FaUsers className="w-4 h-4" />
                  Fundación
                </button>
                <button
                  onClick={() => setSelectedSection("temporales")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    selectedSection === "temporales"
                      ? "bg-primary-purple text-white shadow-md"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <FaUserTie className="w-4 h-4" />
                  Temporales
                </button>
              </div>
            )}

            {/* Búsqueda */}
            <div className="relative flex-1 md:max-w-md">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-purple focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Lista de inscritos */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <p className="text-gray-500 text-lg">No se encontraron resultados</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredItems.map((item, index) => (
                <motion.div
                  key={`${item.id}-${selectedSection}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-shadow"
                >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-lg mb-1">
                          {item.nombre}
                        </h3>
                        <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                          {item.categoria}
                        </span>
                      </div>
                      {isTeamType && item.teamType === "Temporal" && selectedSection === "fundacion" && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                          Temporal
                        </span>
                      )}
                    </div>

                    {isTeamType ? (
                      <div className="flex items-center gap-2 text-gray-600 mt-3">
                        <FaUserFriends className="w-4 h-4" />
                        <span className="text-sm">{item.miembros} miembros</span>
                      </div>
                    ) : (
                      <div className="text-gray-600 text-sm mt-2">
                        {item.edad} años
                      </div>
                    )}
                  </motion.div>
                ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 flex justify-between items-center">
          <p className="text-sm text-gray-600">
            Mostrando {filteredItems.length} de {filteredBySection.length} {isTeamType ? "equipos" : "deportistas"}
          </p>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ViewRegistrationsModal;
