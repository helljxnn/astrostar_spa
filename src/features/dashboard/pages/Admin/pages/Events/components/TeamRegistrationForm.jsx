import React, { useState, useEffect } from 'react';
import { useRegistrations } from '../hooks/useRegistrations';

/**
 * Formulario para inscribir equipos a eventos
 * 
 * Props:
 * - events: Array de eventos disponibles
 * - teams: Array de equipos disponibles
 * - onSuccess: Callback cuando la inscripción es exitosa
 * - preselectedEventId: ID del evento preseleccionado (opcional)
 * - preselectedTeamId: ID del equipo preseleccionado (opcional)
 */
const TeamRegistrationForm = ({
  events = [],
  teams = [],
  onSuccess,
  preselectedEventId = null,
  preselectedTeamId = null,
}) => {
  const { registerTeam, loading } = useRegistrations();

  const [formData, setFormData] = useState({
    serviceId: preselectedEventId || '',
    teamId: preselectedTeamId || '',
    sportsCategoryId: '',
    notes: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (preselectedEventId) {
      setFormData((prev) => ({ ...prev, serviceId: preselectedEventId }));
    }
    if (preselectedTeamId) {
      setFormData((prev) => ({ ...prev, teamId: preselectedTeamId }));
    }
  }, [preselectedEventId, preselectedTeamId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Limpiar error del campo
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.serviceId) {
      newErrors.serviceId = 'Debe seleccionar un evento';
    }

    if (!formData.teamId) {
      newErrors.teamId = 'Debe seleccionar un equipo';
    }

    if (formData.notes && formData.notes.length > 500) {
      newErrors.notes = 'Las notas no pueden exceder 500 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    // Preparar datos para enviar
    const dataToSend = {
      serviceId: parseInt(formData.serviceId),
      teamId: parseInt(formData.teamId),
    };

    if (formData.sportsCategoryId) {
      dataToSend.sportsCategoryId = parseInt(formData.sportsCategoryId);
    }

    if (formData.notes.trim()) {
      dataToSend.notes = formData.notes.trim();
    }

    const result = await registerTeam(dataToSend);

    if (result.success) {
      // Limpiar formulario
      setFormData({
        serviceId: preselectedEventId || '',
        teamId: preselectedTeamId || '',
        sportsCategoryId: '',
        notes: '',
      });
      setErrors({});

      // Llamar callback de éxito
      if (onSuccess) {
        onSuccess(result.data);
      }
    }
  };

  const handleReset = () => {
    setFormData({
      serviceId: preselectedEventId || '',
      teamId: preselectedTeamId || '',
      sportsCategoryId: '',
      notes: '',
    });
    setErrors({});
  };

  // Filtrar eventos activos (no cancelados ni finalizados)
  const activeEvents = events.filter(
    (event) => event.status === 'Programado' || event.status === 'Pausado'
  );

  // Filtrar equipos activos
  const activeTeams = teams.filter((team) => team.status === 'Active');

  return (
    <div className="team-registration-form">
      <h3>Inscribir Equipo a Evento</h3>

      <form onSubmit={handleSubmit}>
        {/* Selector de Evento */}
        <div className="form-group">
          <label htmlFor="serviceId">
            Evento <span className="required">*</span>
          </label>
          <select
            id="serviceId"
            name="serviceId"
            value={formData.serviceId}
            onChange={handleChange}
            disabled={loading || !!preselectedEventId}
            className={errors.serviceId ? 'error' : ''}
          >
            <option value="">Seleccione un evento</option>
            {activeEvents.map((event) => (
              <option key={event.id} value={event.id}>
                {event.name} - {new Date(event.startDate).toLocaleDateString()}
              </option>
            ))}
          </select>
          {errors.serviceId && <span className="error-message">{errors.serviceId}</span>}
        </div>

        {/* Selector de Equipo */}
        <div className="form-group">
          <label htmlFor="teamId">
            Equipo <span className="required">*</span>
          </label>
          <select
            id="teamId"
            name="teamId"
            value={formData.teamId}
            onChange={handleChange}
            disabled={loading || !!preselectedTeamId}
            className={errors.teamId ? 'error' : ''}
          >
            <option value="">Seleccione un equipo</option>
            {activeTeams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name} {team.category ? `- ${team.category}` : ''}
              </option>
            ))}
          </select>
          {errors.teamId && <span className="error-message">{errors.teamId}</span>}
        </div>

        {/* Categoría Deportiva (Opcional) */}
        <div className="form-group">
          <label htmlFor="sportsCategoryId">Categoría Deportiva (Opcional)</label>
          <select
            id="sportsCategoryId"
            name="sportsCategoryId"
            value={formData.sportsCategoryId}
            onChange={handleChange}
            disabled={loading}
          >
            <option value="">Sin categoría específica</option>
            {/* Aquí puedes agregar las categorías deportivas disponibles */}
          </select>
        </div>

        {/* Notas */}
        <div className="form-group">
          <label htmlFor="notes">Notas (Opcional)</label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            disabled={loading}
            placeholder="Información adicional sobre la inscripción..."
            rows="4"
            maxLength="500"
            className={errors.notes ? 'error' : ''}
          />
          <small>
            {formData.notes.length}/500 caracteres
          </small>
          {errors.notes && <span className="error-message">{errors.notes}</span>}
        </div>

        {/* Botones */}
        <div className="form-actions">
          <button
            type="button"
            onClick={handleReset}
            disabled={loading}
            className="btn-secondary"
          >
            Limpiar
          </button>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Inscribiendo...' : 'Inscribir Equipo'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TeamRegistrationForm;
