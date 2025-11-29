import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaArrowLeft } from "react-icons/fa";
import TeamsService from "../../../TemporaryTeams/services/TeamsService";
import RegistrationsService from "../../services/RegistrationsService";
import { showSuccessAlert, showErrorAlert } from "../../../../../../../../../shared/utils/alerts";

const EventRegistrationFormModal = ({ 
  isOpen, 
  onClose, 
  eventName, 
  participantType,
  mode = 'register', // 'register' o 'edit'
  initialSelectedTeams = [], // Equipos ya inscritos (para modo editar)
  eventId = null, // ID del evento
  onSuccess = null // Callback para ejecutar después de inscribir exitosamente
}) => {
  const isTeamType = participantType === "Equipos";
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTeams, setSelectedTeams] = useState(initialSelectedTeams);
  const [initialTeams, setInitialTeams] = useState([]); // Guardar equipos iniciales para comparar
  const [teamType, setTeamType] = useState('Fundacion');
  const [searchTerm, setSearchTerm] = useState('');

  const loadTeams = async () => {
    setLoading(true);
    try {
      const response = await TeamsService.getTeams({ 
        status: 'Active', 
        teamType: teamType,
        limit: 100 
      });
      if (response.success) {
        setTeams(response.data || []);
      }
    } catch (error) {
      console.error('Error cargando equipos:', error);
      showErrorAlert('Error', 'No se pudieron cargar los equipos');
    } finally {
      setLoading(false);
    }
  };

  const loadRegisteredTeams = async () => {
    if (!eventId || mode !== 'edit') return;
    
    setLoading(true);
    try {
      const response = await RegistrationsService.getEventRegistrations(eventId);
      
      if (response.success && response.data) {
        const registeredTeams = response.data
          .filter(reg => reg.team)
          .map(reg => ({
            ...reg.team,
            registrationId: reg.id,
          }));
        
        setSelectedTeams(registeredTeams);
        setInitialTeams(registeredTeams); // Guardar como equipos iniciales para comparar
      }
    } catch (error) {
      console.error('Error cargando equipos inscritos:', error);
      showErrorAlert('Error', 'No se pudieron cargar los equipos inscritos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && isTeamType) {
      loadTeams();
    }
  }, [isOpen, isTeamType, teamType]);

  useEffect(() => {
    if (isOpen && mode === 'edit' && eventId && isTeamType) {
      setTimeout(() => {
        loadRegisteredTeams();
      }, 200);
    }
  }, [isOpen, mode, eventId, isTeamType]);

  if (!isOpen) return null;
  
  if (!isTeamType) {

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center"
        >
          <div className="text-6xl mb-4">🚧</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Funcionalidad en desarrollo</h2>
          <p className="text-gray-600 mb-6">
            La inscripción de {participantType.toLowerCase()} estará disponible próximamente.
          </p>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gradient-to-r from-primary-blue to-primary-purple text-white rounded-lg hover:shadow-lg font-semibold transition-all"
          >
            Entendido
          </button>
        </motion.div>
      </div>
    );
  }

  const handleToggleTeam = (team) => {
    setSelectedTeams(prev => {
      const exists = prev.find(t => t.id === team.id);
      return exists ? prev.filter(t => t.id !== team.id) : [...prev, team];
    });
  };

  const handleSave = async () => {
    if (!eventId) {
      showErrorAlert('Error', 'No se pudo identificar el evento');
      return;
    }

    if (selectedTeams.length === 0) {
      showErrorAlert('Error', 'Debes seleccionar al menos un equipo');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'edit') {
        // En modo editar: detectar cambios
        const initialIds = initialTeams.map(t => t.id);
        const currentIds = selectedTeams.map(t => t.id);
        
        // Equipos nuevos a inscribir
        const teamsToAdd = selectedTeams.filter(t => !initialIds.includes(t.id));
        
        // Equipos a quitar (cancelar inscripción)
        const teamsToRemove = initialTeams.filter(t => !currentIds.includes(t.id));

        // Cancelar inscripciones de equipos quitados
        if (teamsToRemove.length > 0) {
          for (const team of teamsToRemove) {
            if (team.registrationId) {
              await RegistrationsService.cancelRegistration(team.registrationId);
            }
          }
        }

        // Inscribir equipos nuevos
        if (teamsToAdd.length > 0) {
          const teamIdsToAdd = teamsToAdd.map(t => t.id);
          await RegistrationsService.registerMultipleTeams(eventId, teamIdsToAdd);
        }

        showSuccessAlert(
          'Cambios guardados', 
          `Se actualizó la inscripción: ${teamsToAdd.length} agregados, ${teamsToRemove.length} removidos`
        );
        if (onSuccess) onSuccess();
        onClose();
      } else {
        // Modo inscribir: inscribir todos los seleccionados
        const teamIds = selectedTeams.map(team => team.id);
        const result = await RegistrationsService.registerMultipleTeams(eventId, teamIds);

        if (result.success) {
          showSuccessAlert('Equipos inscritos', result.message || `Se inscribieron ${selectedTeams.length} equipos exitosamente`);
          if (onSuccess) onSuccess();
          onClose();
        } else {
          showErrorAlert('Error', result.error || 'No se pudieron inscribir los equipos');
        }
      }
    } catch (error) {
      console.error('Error al guardar inscripciones:', error);
      showErrorAlert('Error', 'Ocurrió un error al guardar las inscripciones');
    } finally {
      setLoading(false);
    }
  };

  // Función para normalizar texto (quitar tildes y convertir a minúsculas)
  const normalizeText = (text) => {
    if (!text) return '';
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  };

  const filteredTeams = teams.filter(team => {
    const normalizedSearch = normalizeText(searchTerm);
    const normalizedName = normalizeText(team.name);
    const normalizedCategory = normalizeText(team.category);
    
    return normalizedName.includes(normalizedSearch) || 
           normalizedCategory.includes(normalizedSearch);
  });

  // Contar equipos seleccionados por tipo
  const selectedByType = selectedTeams.reduce((acc, team) => {
    const type = team.teamType || teamType;
    if (type === 'Fundacion') {
      acc.fundacion++;
    } else {
      acc.temporal++;
    }
    return acc;
  }, { fundacion: 0, temporal: 0 });

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        <div className="bg-gradient-to-r from-primary-purple to-primary-blue p-6 text-white">
          <div className="flex items-center gap-4">
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
              <FaArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-2xl font-bold">
                {mode === 'edit' ? 'Editar' : 'Inscribir'} {participantType}
              </h2>
              <p className="text-blue-100 mt-1">Evento: {eventName}</p>
            </div>
          </div>
        </div>

        <div className="border-b border-gray-200 bg-white">
          <div className="flex">
            <button
              onClick={() => setTeamType('Fundacion')}
              className={`flex-1 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                teamType === 'Fundacion'
                  ? 'border-primary-purple text-primary-purple bg-purple-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              Equipos de la Fundación
            </button>
            <button
              onClick={() => setTeamType('Temporal')}
              className={`flex-1 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                teamType === 'Temporal'
                  ? 'border-primary-purple text-primary-purple bg-purple-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              Equipos Temporales
            </button>
          </div>
        </div>

        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar por nombre o categoría..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-purple focus:border-transparent"
            />
            <svg className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6 bg-gray-50">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-primary-purple/30 border-t-primary-purple rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="w-8 h-8 text-primary-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-gray-600 mt-4 font-medium">Cargando equipos...</p>
              <p className="text-gray-400 text-sm mt-1">Por favor espera un momento</p>
            </div>
          ) : filteredTeams.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {searchTerm ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  )}
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchTerm ? 'No se encontraron equipos' : 'No hay equipos disponibles'}
              </h3>
              <p className="text-gray-500 text-sm text-center max-w-sm">
                {searchTerm 
                  ? 'Intenta con otros términos de búsqueda o cambia de pestaña'
                  : `No hay equipos ${teamType === 'Fundacion' ? 'de la fundación' : 'temporales'} disponibles en este momento`
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {filteredTeams.map((team, index) => {
                if (!team || !team.id) return null;
                const isSelected = selectedTeams.find(t => t.id === team.id);
                return (
                  <motion.div
                    key={team.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.02 }}
                    onClick={() => handleToggleTeam(team)}
                    className={`relative bg-white rounded-lg cursor-pointer transition-all duration-200 overflow-hidden ${
                      isSelected 
                        ? 'ring-2 ring-primary-purple shadow-md' 
                        : 'border border-gray-200 hover:border-primary-purple/50 hover:shadow-sm'
                    }`}
                  >
                    {/* Barra lateral de color */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1 transition-all ${
                      isSelected ? 'bg-primary-purple' : 'bg-gray-200'
                    }`} />
                    
                    <div className="p-2.5 pl-3.5">
                      <div className="flex items-center justify-between gap-2">
                        {/* Información del equipo */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-1">
                            <h3 className="font-bold text-gray-900 text-sm truncate">{team.name}</h3>
                            <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold flex-shrink-0">
                              {team.category || 'Sin categoría'}
                            </span>
                          </div>
                          
                          {/* Detalles en dos líneas para mejor legibilidad */}
                          <div className="flex flex-col gap-0.5 text-xs text-gray-600">
                            <span className="flex items-center gap-1 truncate">
                              <span className="font-medium">Entrenador:</span>
                              <span className="truncate">{team.coach || 'Sin asignar'}</span>
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="font-medium">Miembros:</span>
                              <span className="font-semibold text-indigo-600">{team._count?.members || 0}</span>
                            </span>
                          </div>
                        </div>
                        
                        {/* Checkbox de selección */}
                        <div className="flex-shrink-0">
                          <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                            isSelected 
                              ? 'bg-primary-purple border-primary-purple' 
                              : 'border-gray-300 hover:border-primary-purple'
                          }`}>
                            {isSelected && (
                              <motion.svg 
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="w-3.5 h-3.5 text-white" 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </motion.svg>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 bg-white shadow-lg">
          <div className="flex items-center justify-between gap-4">
            {/* Contador de selección */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center font-bold text-xl transition-all ${
                  selectedTeams.length > 0 
                    ? 'bg-primary-purple text-white shadow-lg' 
                    : 'bg-gray-100 text-gray-400'
                }`}>
                  {selectedTeams.length}
                </div>
                {selectedTeams.length > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center"
                  >
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </motion.div>
                )}
              </div>
              <div className="flex-1">
                <p className="font-bold text-gray-900 text-lg">
                  {selectedTeams.length} {selectedTeams.length === 1 ? 'equipo' : 'equipos'}
                </p>
                <div className="flex items-center gap-3">
                  <p className="text-sm text-gray-500">
                    {selectedTeams.length === 0 ? 'Selecciona al menos un equipo' : 'Listos para inscribir al evento'}
                  </p>
                  {selectedTeams.length > 0 && (
                    <div className="flex items-center gap-2">
                      {selectedByType.fundacion > 0 && (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                          {selectedByType.fundacion} Fundación
                        </span>
                      )}
                      {selectedByType.temporal > 0 && (
                        <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold">
                          {selectedByType.temporal} Temporal{selectedByType.temporal > 1 ? 'es' : ''}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Botones de acción */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold transition-all hover:scale-105 active:scale-95"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={selectedTeams.length === 0}
                className={`px-8 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${
                  selectedTeams.length === 0
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-primary-purple text-white hover:bg-primary-blue hover:shadow-xl hover:scale-105 active:scale-95'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mode === 'edit' ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  )}
                </svg>
                {mode === 'edit' ? 'Guardar Cambios' : 'Inscribir'} {selectedTeams.length > 0 && `(${selectedTeams.length})`}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default EventRegistrationFormModal;
