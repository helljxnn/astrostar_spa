import { useState, useCallback } from 'react';
import { registrationsService } from '../services/registrationsService';
import { toast } from 'react-toastify';

/**
 * Hook personalizado para gestionar inscripciones de equipos a eventos
 */
export const useRegistrations = () => {
  const [loading, setLoading] = useState(false);
  const [registrations, setRegistrations] = useState([]);
  const [registration, setRegistration] = useState(null);
  const [stats, setStats] = useState(null);

  /**
   * Inscribir equipo a evento
   */
  const registerTeam = useCallback(async (data) => {
    setLoading(true);
    try {
      const response = await registrationsService.registerTeamToEvent(data);
      toast.success(response.message || 'Equipo inscrito exitosamente');
      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage = error.message || 'Error al inscribir equipo';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Obtener inscripciones de un evento
   */
  const fetchEventRegistrations = useCallback(async (serviceId, status = null) => {
    setLoading(true);
    try {
      const response = await registrationsService.getEventRegistrations(serviceId, status);
      setRegistrations(response.data.registrations || []);
      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage = error.message || 'Error al obtener inscripciones';
      toast.error(errorMessage);
      setRegistrations([]);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Obtener inscripciones de un equipo
   */
  const fetchTeamRegistrations = useCallback(async (teamId, status = null) => {
    setLoading(true);
    try {
      const response = await registrationsService.getTeamRegistrations(teamId, status);
      setRegistrations(response.data.registrations || []);
      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage = error.message || 'Error al obtener inscripciones';
      toast.error(errorMessage);
      setRegistrations([]);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Obtener inscripción por ID
   */
  const fetchRegistrationById = useCallback(async (id) => {
    setLoading(true);
    try {
      const response = await registrationsService.getRegistrationById(id);
      setRegistration(response.data);
      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage = error.message || 'Error al obtener inscripción';
      toast.error(errorMessage);
      setRegistration(null);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Actualizar estado de inscripción
   */
  const updateStatus = useCallback(async (id, status, notes = null) => {
    setLoading(true);
    try {
      const response = await registrationsService.updateRegistrationStatus(id, status, notes);
      toast.success(response.message || 'Estado actualizado exitosamente');
      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage = error.message || 'Error al actualizar estado';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Cancelar inscripción
   */
  const cancelRegistration = useCallback(async (id) => {
    setLoading(true);
    try {
      const response = await registrationsService.cancelRegistration(id);
      toast.success(response.message || 'Inscripción cancelada exitosamente');
      return { success: true };
    } catch (error) {
      const errorMessage = error.message || 'Error al cancelar inscripción';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Obtener estadísticas
   */
  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const response = await registrationsService.getRegistrationStats();
      setStats(response.data);
      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage = error.message || 'Error al obtener estadísticas';
      toast.error(errorMessage);
      setStats(null);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    registrations,
    registration,
    stats,
    registerTeam,
    fetchEventRegistrations,
    fetchTeamRegistrations,
    fetchRegistrationById,
    updateStatus,
    cancelRegistration,
    fetchStats,
  };
};

export default useRegistrations;
