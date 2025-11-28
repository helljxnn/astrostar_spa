import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaArrowLeft } from "react-icons/fa";
import TeamsService from "../../../TemporaryTeams/services/TeamsService";
import { showSuccessAlert, showErrorAlert } from "../../../../../../../../../shared/utils/alerts";

const EventRegistrationFormModal = ({ isOpen, onClose, eventName, participantType }) => {
  console.log('🎯 EventRegistrationFormModal renderizado:', { isOpen, eventName, participantType });
  
  const isTeamType = participantType === "Equipos";
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTeams, setSelectedTeams] = useState([]);
  const [teamType, setTeamType] = useState('Fundacion');
  const [searchTerm, setSearchTerm] = useState('');

  const loadTeams = async () => {
    console.log('📥 Cargando equipos...', { teamType });
    setLoading(true);
    try {
      const response = await TeamsService.getTeams({ 
        status: 'Active', 
        teamType: teamType,
        limit: 100 
      });
      console.log('✅ Respuesta de equipos:', response);
      if (response.success) {
        setTeams(response.data || []);
      }
    } catch (error) {
      console.error('❌ Error cargando equipos:', error);
      showErrorAlert('Error', 'No se pudieron cargar los equipos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('🔄 useEffect ejecutado:', { isOpen, isTeamType, teamType });
    if (isOpen && isTeamType) {
      loadTeams();
    }
  }, [isOpen, isTeamType, teamType]);

  // Si no es tipo equipos, mostrar mensaje temporal
  if (!isOpen) {
    console.log('❌ Modal cerrado, no renderizar');
    return null;
  }
  
  console.log('🔍 Verificando tipo de participante:', { isTeamType, participantType });
  
  if (!isTeamType) {
    console.log('⚠️ No es tipo equipos, mostrando mensaje de desarrollo');

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

  const handleSave = () => {
    showSuccessAlert('Equipos inscritos', `Se inscribieron ${selectedTeams.length} equipos`);
    onClose();
  };

  const filteredTeams = teams.filter(team => 
    team.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (team.category && team.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  console.log('🎨 Renderizando modal de equipos:', { teams: teams.length, filteredTeams: filteredTeams.length, loading });

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
              <h2 className="text-2xl font-bold">Inscribir {participantType}</h2>
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

        <div className="flex-1 overflow-auto p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">⏳</div>
              <p className="text-gray-600">Cargando equipos...</p>
            </div>
          ) : filteredTeams.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">{searchTerm ? '🔍' : '📋'}</div>
              <p className="text-gray-600">{searchTerm ? 'No se encontraron equipos' : 'No hay equipos disponibles'}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTeams.map((team, index) => {
                if (!team || !team.id) {
                  console.error('❌ Equipo inválido en índice:', index, team);
                  return null;
                }
                const isSelected = selectedTeams.find(t => t.id === team.id);
                return (
                  <div
                    key={team.id}
                    onClick={() => handleToggleTeam(team)}
                    className={`p-5 border-2 rounded-xl cursor-pointer transition-all hover:shadow-md ${
                      isSelected ? 'border-primary-purple bg-purple-50 shadow-sm' : 'border-gray-200 hover:border-primary-purple/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-bold text-gray-900 text-lg">{team.name}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            teamType === 'Fundacion' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                          }`}>
                            {teamType === 'Fundacion' ? 'Fundación' : 'Temporal'}
                          </span>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-gray-600 flex items-center gap-2">
                            <span className="font-medium">Categoría:</span>
                            <span className="px-2 py-0.5 bg-gray-100 rounded text-gray-700">{team.category}</span>
                          </p>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Entrenador:</span> {team.coach || 'Sin asignar'}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-3">
                        <span className="bg-indigo-100 text-indigo-800 px-4 py-2 rounded-lg text-sm font-semibold">
                          {team._count?.members || 0} miembros
                        </span>
                        <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${
                          isSelected ? 'bg-primary-purple border-primary-purple' : 'border-gray-300'
                        }`}>
                          {isSelected && (
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="p-6 border-t-2 border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-primary-purple text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg">
                {selectedTeams.length}
              </div>
              <div>
                <p className="font-semibold text-gray-900">
                  {selectedTeams.length} {selectedTeams.length === 1 ? 'equipo seleccionado' : 'equipos seleccionados'}
                </p>
                <p className="text-sm text-gray-600">
                  {selectedTeams.length === 0 ? 'Selecciona al menos un equipo' : 'Listos para inscribir'}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={selectedTeams.length === 0}
                className="px-8 py-3 bg-gradient-to-r from-primary-blue to-primary-purple text-white rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-all"
              >
                Inscribir Equipos
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default EventRegistrationFormModal;
