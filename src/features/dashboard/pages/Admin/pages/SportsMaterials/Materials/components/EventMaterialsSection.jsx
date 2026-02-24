import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FaTrash, FaCheckCircle } from 'react-icons/fa';
import AssignMaterialModal from './AssignMaterialModal';
import { showSuccessAlert, showErrorAlert, showDeleteAlert } from '../../../../../../../../shared/utils/alerts';
import { formatStock } from '../../../../../../../../shared/utils/numberFormat';
import eventMaterialsService from '../services/EventMaterialsService';

const EventMaterialsSection = ({ eventoId, eventoEstado }) => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);

  useEffect(() => {
    if (eventoId) {
      loadMaterials();
    }
  }, [eventoId]);

  const loadMaterials = async () => {
    try {
      setLoading(true);
      const response = await eventMaterialsService.getEventMaterials(eventoId);
      
      if (response.success) {
        setMaterials(response.data || []);
      }
    } catch (error) {
      console.error('Error al cargar materiales del evento:', error);
      setMaterials([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (data) => {
    try {
      const response = await eventMaterialsService.assignMaterial(eventoId, data);
      
      if (response.success) {
        showSuccessAlert(
          'Material Asignado',
          `Se asignaron ${data.cantidad} unidades correctamente al evento.`
        );
        loadMaterials();
        return true;
      } else {
        showErrorAlert('Error', response.message || 'No se pudo asignar el material');
        return false;
      }
    } catch (error) {
      console.error('Error al asignar material:', error);
      showErrorAlert('Error', error.message || 'Error al asignar material al evento');
      return false;
    }
  };

  const handleRemove = async (assignmentId, materialNombre, cantidad) => {
    const confirmResult = await showDeleteAlert(
      '¿Eliminar asignación?',
      `Se liberarán ${cantidad} unidades de "${materialNombre}" (volverán a estar disponibles para otros eventos).`,
      { confirmButtonText: 'Sí, eliminar', cancelButtonText: 'Cancelar' }
    );

    if (!confirmResult.isConfirmed) return;

    try {
      const response = await eventMaterialsService.removeAssignment(eventoId, assignmentId);
      
      if (response.success) {
        showSuccessAlert(
          'Asignación Eliminada',
          `Se liberaron ${cantidad} unidades de "${materialNombre}".`
        );
        loadMaterials();
      } else {
        showErrorAlert('Error', response.message || 'No se pudo eliminar la asignación');
      }
    } catch (error) {
      console.error('Error al eliminar asignación:', error);
      showErrorAlert('Error', error.message || 'Error al eliminar la asignación');
    }
  };

  const handleFinalizeEvent = async () => {
    if (materials.length === 0) {
      showErrorAlert('Sin materiales', 'No hay materiales asignados para finalizar');
      return;
    }

    const confirmResult = await showDeleteAlert(
      '¿Finalizar Evento?',
      `Se ejecutará la salida real de ${materials.length} material(es). El stock se descontará definitivamente y no se podrán hacer cambios posteriores.`,
      { 
        confirmButtonText: 'Sí, finalizar evento', 
        cancelButtonText: 'Cancelar',
        icon: 'warning'
      }
    );

    if (!confirmResult.isConfirmed) return;

    try {
      const response = await eventMaterialsService.finalizeEvent(eventoId);
      
      if (response.success) {
        showSuccessAlert(
          'Evento Finalizado',
          'Se ejecutó la salida de materiales correctamente. El stock ha sido descontado.'
        );
        loadMaterials();
        // Recargar página o actualizar estado del evento
        window.location.reload();
      } else {
        showErrorAlert('Error', response.message || 'No se pudo finalizar el evento');
      }
    } catch (error) {
      console.error('Error al finalizar evento:', error);
      showErrorAlert('Error', error.message || 'Error al finalizar el evento');
    }
  };

  const isEventFinalized = eventoEstado === 'FINALIZADO' || eventoEstado === 'Finalizado';

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mt-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            Materiales del Evento
          </h3>
          {materials.length > 0 && !isEventFinalized && (
            <p className="text-sm text-amber-600 mt-1">
              ⓘ {materials.length} material(es) reservado(s) - Pendiente de salida
            </p>
          )}
          {materials.length > 0 && isEventFinalized && (
            <p className="text-sm text-green-600 mt-1">
              ✓ Salida ejecutada - Stock descontado
            </p>
          )}
        </div>
        <div className="flex gap-2">
          {!isEventFinalized && materials.length > 0 && (
            <button
              onClick={handleFinalizeEvent}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition-colors"
            >
              <FaCheckCircle /> Finalizar Evento
            </button>
          )}
          <button
            onClick={() => setAssignModalOpen(true)}
            disabled={isEventFinalized}
            className={`px-4 py-2 rounded-lg shadow transition-colors ${
              isEventFinalized
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-primary-blue text-white hover:bg-primary-purple'
            }`}
          >
            + Asignar Material
          </button>
        </div>
      </div>

      {/* Mensaje si evento finalizado */}
      {isEventFinalized && (
        <div className="mb-4 p-3 bg-green-100 border border-green-300 rounded-lg">
          <p className="text-sm text-green-700 font-medium">
            ✓ Este evento está finalizado. La salida de materiales fue ejecutada y el stock descontado.
          </p>
          <p className="text-xs text-green-600 mt-1">
            No se pueden asignar o eliminar materiales de eventos finalizados.
          </p>
        </div>
      )}

      {/* Mensaje si hay materiales pendientes */}
      {!isEventFinalized && materials.length > 0 && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-300 rounded-lg">
          <p className="text-sm text-amber-700">
            <strong>Materiales Reservados:</strong> Los materiales están comprometidos pero el stock físico NO ha sido descontado aún.
          </p>
          <p className="text-xs text-amber-600 mt-1">
            Haz clic en "Finalizar Evento" para ejecutar la salida real y descontar el stock definitivamente.
          </p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-blue"></div>
          <p className="mt-2 text-gray-600">Cargando materiales...</p>
        </div>
      )}

      {/* Tabla de materiales */}
      {!loading && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Material
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cantidad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha Asignación
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuario
                </th>
                {!isEventFinalized && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {materials.length === 0 ? (
                <tr>
                  <td
                    colSpan={isEventFinalized ? 4 : 5}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    No hay materiales asignados a este evento
                  </td>
                </tr>
              ) : (
                materials.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {item.material?.nombre || 'N/A'}
                      </div>
                      {item.material?.categoria && (
                        <div className="text-xs text-gray-500">
                          {item.material.categoria}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatStock(item.cantidad)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(item.fechaAsignacion).toLocaleDateString('es-CO', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {item.createdByName || 'Sistema'}
                      </div>
                    </td>
                    {!isEventFinalized && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() =>
                            handleRemove(
                              item.id,
                              item.material?.nombre || 'Material',
                              item.cantidad
                            )
                          }
                          className="text-red-600 hover:text-red-800 transition-colors p-2 rounded-full hover:bg-red-50"
                          title="Eliminar asignación"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de asignación */}
      <AssignMaterialModal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        eventoId={eventoId}
        onSave={handleAssign}
      />
    </div>
  );
};

EventMaterialsSection.propTypes = {
  eventoId: PropTypes.number.isRequired,
  eventoEstado: PropTypes.string.isRequired,
};

export default EventMaterialsSection;
