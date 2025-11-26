import React, { useEffect, useState } from 'react';
import { useRegistrations } from '../hooks/useRegistrations';

/**
 * Componente para listar las inscripciones de un evento
 * 
 * Props:
 * - eventId: ID del evento
 * - eventName: Nombre del evento (opcional)
 * - onRegistrationUpdate: Callback cuando se actualiza una inscripción
 */
const EventRegistrationsList = ({ eventId, eventName = '', onRegistrationUpdate }) => {
  const {
    loading,
    registrations,
    fetchEventRegistrations,
    updateStatus,
    cancelRegistration,
  } = useRegistrations();

  const [statusFilter, setStatusFilter] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState(null);

  useEffect(() => {
    if (eventId) {
      loadRegistrations();
    }
  }, [eventId, statusFilter]);

  const loadRegistrations = async () => {
    await fetchEventRegistrations(eventId, statusFilter || null);
  };

  const handleStatusChange = async (registrationId, newStatus) => {
    const result = await updateStatus(registrationId, newStatus);
    if (result.success) {
      loadRegistrations();
      if (onRegistrationUpdate) {
        onRegistrationUpdate();
      }
    }
  };

  const handleCancelClick = (registration) => {
    setSelectedRegistration(registration);
    setShowConfirmDialog(true);
  };

  const handleConfirmCancel = async () => {
    if (selectedRegistration) {
      const result = await cancelRegistration(selectedRegistration.id);
      if (result.success) {
        loadRegistrations();
        if (onRegistrationUpdate) {
          onRegistrationUpdate();
        }
      }
    }
    setShowConfirmDialog(false);
    setSelectedRegistration(null);
  };

  const getStatusBadgeClass = (status) => {
    const statusClasses = {
      Registered: 'badge-info',
      Confirmed: 'badge-success',
      Cancelled: 'badge-danger',
      Attended: 'badge-primary',
    };
    return statusClasses[status] || 'badge-secondary';
  };

  const getStatusLabel = (status) => {
    const statusLabels = {
      Registered: 'Registrado',
      Confirmed: 'Confirmado',
      Cancelled: 'Cancelado',
      Attended: 'Asistió',
    };
    return statusLabels[status] || status;
  };

  if (loading && registrations.length === 0) {
    return <div className="loading">Cargando inscripciones...</div>;
  }

  return (
    <div className="event-registrations-list">
      <div className="list-header">
        <h3>
          Inscripciones {eventName && `- ${eventName}`}
          <span className="badge">{registrations.length}</span>
        </h3>

        {/* Filtro por estado */}
        <div className="filters">
          <label htmlFor="statusFilter">Filtrar por estado:</label>
          <select
            id="statusFilter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            disabled={loading}
          >
            <option value="">Todos</option>
            <option value="Registered">Registrado</option>
            <option value="Confirmed">Confirmado</option>
            <option value="Cancelled">Cancelado</option>
            <option value="Attended">Asistió</option>
          </select>
        </div>
      </div>

      {registrations.length === 0 ? (
        <div className="empty-state">
          <p>No hay inscripciones {statusFilter && `con estado "${getStatusLabel(statusFilter)}"`}</p>
        </div>
      ) : (
        <div className="registrations-table">
          <table>
            <thead>
              <tr>
                <th>Equipo</th>
                <th>Miembros</th>
                <th>Estado</th>
                <th>Fecha de Inscripción</th>
                <th>Notas</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {registrations.map((registration) => (
                <tr key={registration.id}>
                  <td>
                    <strong>{registration.team?.name || 'N/A'}</strong>
                    {registration.team?.category && (
                      <div className="team-category">{registration.team.category}</div>
                    )}
                  </td>
                  <td className="text-center">
                    {registration.team?._count?.members || 0}
                  </td>
                  <td>
                    <span className={`badge ${getStatusBadgeClass(registration.status)}`}>
                      {getStatusLabel(registration.status)}
                    </span>
                  </td>
                  <td>
                    {new Date(registration.registrationDate).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td>
                    {registration.notes ? (
                      <span title={registration.notes}>
                        {registration.notes.length > 50
                          ? `${registration.notes.substring(0, 50)}...`
                          : registration.notes}
                      </span>
                    ) : (
                      <span className="text-muted">Sin notas</span>
                    )}
                  </td>
                  <td>
                    <div className="action-buttons">
                      {registration.status === 'Registered' && (
                        <button
                          onClick={() => handleStatusChange(registration.id, 'Confirmed')}
                          disabled={loading}
                          className="btn-sm btn-success"
                          title="Confirmar"
                        >
                          ✓ Confirmar
                        </button>
                      )}
                      {registration.status === 'Confirmed' && (
                        <button
                          onClick={() => handleStatusChange(registration.id, 'Attended')}
                          disabled={loading}
                          className="btn-sm btn-primary"
                          title="Marcar como asistido"
                        >
                          ✓ Asistió
                        </button>
                      )}
                      {registration.status !== 'Cancelled' && (
                        <button
                          onClick={() => handleCancelClick(registration)}
                          disabled={loading}
                          className="btn-sm btn-danger"
                          title="Cancelar inscripción"
                        >
                          ✕ Cancelar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Diálogo de confirmación */}
      {showConfirmDialog && (
        <div className="modal-overlay">
          <div className="modal-dialog">
            <h4>Confirmar Cancelación</h4>
            <p>
              ¿Está seguro que desea cancelar la inscripción del equipo{' '}
              <strong>{selectedRegistration?.team?.name}</strong>?
            </p>
            <div className="modal-actions">
              <button
                onClick={() => {
                  setShowConfirmDialog(false);
                  setSelectedRegistration(null);
                }}
                className="btn-secondary"
              >
                No, mantener
              </button>
              <button onClick={handleConfirmCancel} className="btn-danger">
                Sí, cancelar inscripción
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventRegistrationsList;
