import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaPlus, FaTimes, FaUsers, FaUser, FaTrash } from "react-icons/fa";
import { showConfirmAlert, showSuccessAlert, showErrorAlert } from "../../../../../../../shared/utils/alerts";

// Datos quemados para equipos
const mockTeams = [
  { id: 1, name: "Águilas Doradas", category: "Sub 15", members: 12 },
  { id: 2, name: "Leones FC", category: "Sub 17", members: 15 },
  { id: 3, name: "Tigres Unidos", category: "Sub 13", members: 10 },
  { id: 4, name: "Panteras Negras", category: "Sub 15", members: 14 },
  { id: 5, name: "Halcones Rojos", category: "Sub 17", members: 13 },
];

// Datos quemados para deportistas
const mockAthletes = [
  { id: 1, name: "María González", category: "Sub 15", age: 14, sport: "Fútbol" },
  { id: 2, name: "Carlos Rodríguez", category: "Sub 17", age: 16, sport: "Baloncesto" },
  { id: 3, name: "Ana Martínez", category: "Sub 13", age: 12, sport: "Voleibol" },
  { id: 4, name: "Luis Pérez", category: "Sub 15", age: 15, sport: "Fútbol" },
  { id: 5, name: "Sofia López", category: "Sub 17", age: 17, sport: "Atletismo" },
  { id: 6, name: "Diego Hernández", category: "Sub 13", age: 13, sport: "Natación" },
  { id: 7, name: "Valentina Castro", category: "Sub 15", age: 14, sport: "Gimnasia" },
  { id: 8, name: "Andrés Morales", category: "Sub 17", age: 16, sport: "Tenis" },
];

// Sistema global para simular inscripciones persistentes
const getGlobalInscriptions = () => {
  if (typeof window !== 'undefined' && window.globalInscriptions) {
    return window.globalInscriptions;
  }
  // Inicializar si no existe
  const initial = {
    teams: [mockTeams[0], mockTeams[1]], // Primeros 2 equipos inscritos por defecto
    athletes: [mockAthletes[0], mockAthletes[1]], // Primeros 2 deportistas inscritos por defecto
  };
  if (typeof window !== 'undefined') {
    window.globalInscriptions = initial;
  }
  return initial;
};

const EventInscriptionModal = ({ 
  isOpen, 
  onClose, 
  eventName, 
  participantType, 
  action = "register" 
}) => {
  // Obtener elementos inscritos desde el estado global
  const getInitialSelectedItems = () => {
    if (action === "editRegistrations" || action === "viewRegistrations") {
      const globalInscriptions = getGlobalInscriptions();
      const isTeamType = participantType === "Equipos";
      return isTeamType ? [...globalInscriptions.teams] : [...globalInscriptions.athletes];
    }
    return [];
  };

  const [selectedItems, setSelectedItems] = useState(getInitialSelectedItems());
  const [searchTerm, setSearchTerm] = useState("");

  // Reiniciar estado cuando cambie la acción o se abra el modal
  useEffect(() => {
    if (isOpen) {
      setSelectedItems(getInitialSelectedItems());
      setSearchTerm("");
    }
  }, [isOpen, action, participantType]);

  if (!isOpen) return null;

  const isTeamType = participantType === "Equipos";
  const mockData = isTeamType ? mockTeams : mockAthletes;

  // Filtrar datos según búsqueda
  const filteredData = mockData.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleItemToggle = (item) => {
    setSelectedItems(prev => {
      const exists = prev.find(selected => selected.id === item.id);
      if (exists) {
        return prev.filter(selected => selected.id !== item.id);
      } else {
        return [...prev, item];
      }
    });
  };

  const handleSave = async () => {
    try {
      if (action === "editRegistrations") {
        const result = await showConfirmAlert(
          "¿Guardar cambios?",
          "Se actualizarán las inscripciones seleccionadas."
        );
        if (!result.isConfirmed) return;
      }

      // Simular éxito/error
      const success = Math.random() > 0.1; // 90% de éxito
      
      if (!success) {
        throw new Error("Error simulado al guardar");
      }

      // Actualizar el estado global
      if (action === "editRegistrations") {
        const globalInscriptions = getGlobalInscriptions();
        const isTeamType = participantType === "Equipos";
        if (isTeamType) {
          globalInscriptions.teams = [...selectedItems];
        } else {
          globalInscriptions.athletes = [...selectedItems];
        }
      }

      console.log(`${action} - Selected ${participantType}:`, selectedItems);
      
      if (action === "editRegistrations") {
        showSuccessAlert(
          "Inscripciones actualizadas",
          "Los cambios se han guardado correctamente."
        );
      }
      
      onClose();
    } catch (error) {
      console.error("Error al guardar inscripciones:", error);
      showErrorAlert(
        "Error al guardar",
        "No se pudieron guardar los cambios. Intenta de nuevo."
      );
    }
  };

  const handleRemoveItem = async (item) => {
    try {
      const result = await showConfirmAlert(
        `¿Eliminar ${!isTeamType ? 'jugadora' : 'equipo'}?`,
        `Se eliminará a ${item.name} de las inscripciones.`
      );
      
      if (result.isConfirmed) {
        const newSelectedItems = selectedItems.filter(selected => selected.id !== item.id);
        setSelectedItems(newSelectedItems);
        
        // Actualizar el estado global inmediatamente
        const globalInscriptions = getGlobalInscriptions();
        if (isTeamType) {
          globalInscriptions.teams = newSelectedItems;
        } else {
          globalInscriptions.athletes = newSelectedItems;
        }
        
        showSuccessAlert(
          `${!isTeamType ? 'Jugadora' : 'Equipo'} eliminado`,
          `${item.name} ha sido eliminado de las inscripciones.`
        );
      }
    } catch (error) {
      console.error("Error al eliminar:", error);
      showErrorAlert(
        "Error al eliminar",
        "No se pudo eliminar el elemento. Intenta de nuevo."
      );
    }
  };

  const getTitle = () => {
    switch (action) {
      case "register":
        return `Inscribir ${participantType}`;
      case "editRegistrations":
        return `Editar ${participantType} Inscritos`;
      case "viewRegistrations":
        return `Ver ${participantType} Inscritos`;
      default:
        return `Gestionar ${participantType}`;
    }
  };

  const isViewMode = action === "viewRegistrations";

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-purple to-primary-blue p-4 sm:p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold">{getTitle()}</h2>
              <p className="text-blue-100 mt-1 text-sm sm:text-base">Evento: {eventName}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <FaTimes className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Search */}
        {!isViewMode && (
          <div className="p-6 border-b border-gray-200">
            <div className="relative">
              <input
                type="text"
                placeholder={`Buscar ${participantType.toLowerCase()}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-4 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-purple focus:border-transparent"
              />
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-4 sm:p-6 max-h-[50vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {filteredData.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 border-2 rounded-xl transition-all ${
                  isViewMode 
                    ? "border-gray-200 cursor-default" 
                    : selectedItems.find(selected => selected.id === item.id)
                      ? "border-primary-purple bg-purple-50 cursor-pointer"
                      : "border-gray-200 hover:border-gray-300 cursor-pointer"
                }`}
                onClick={() => !isViewMode && handleItemToggle(item)}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${
                    isTeamType ? "bg-blue-100 text-blue-600" : "bg-green-100 text-green-600"
                  }`}>
                    {isTeamType ? <FaUsers className="w-4 h-4" /> : <FaUser className="w-4 h-4" />}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">{item.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                      <span className="bg-gray-100 px-2 py-1 rounded-full">
                        {item.category}
                      </span>
                      {isTeamType ? (
                        <span>{item.members} miembros</span>
                      ) : (
                        <>
                          <span>{item.age} años</span>
                          <span>{item.sport}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!isViewMode && selectedItems.find(selected => selected.id === item.id) && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveItem(item);
                          }}
                          className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                          title="Eliminar"
                        >
                          <FaTrash className="w-3 h-3" />
                        </button>
                        <div className="w-6 h-6 bg-primary-purple text-white rounded-full flex items-center justify-center">
                          <FaPlus className="w-3 h-3 rotate-45" />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {filteredData.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <div className="text-4xl mb-4">🔍</div>
              <p>No se encontraron {participantType.toLowerCase()}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        {!isViewMode && (
          <div className="p-4 sm:p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-sm text-gray-600">
                {selectedItems.length} {participantType.toLowerCase()} seleccionados
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <button
                  onClick={onClose}
                  className="w-full sm:w-auto px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={selectedItems.length === 0}
                  className="w-full sm:w-auto px-6 py-2 bg-gradient-to-r from-primary-purple to-primary-blue text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {action === "register" ? "Inscribir" : "Guardar Cambios"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View mode footer */}
        {isViewMode && (
          <div className="p-4 sm:p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex justify-center">
              <button
                onClick={onClose}
                className="w-full sm:w-auto px-6 py-2 bg-gradient-to-r from-primary-purple to-primary-blue text-white rounded-lg hover:opacity-90 transition-opacity"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default EventInscriptionModal;