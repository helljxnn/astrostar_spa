import { useState, useCallback } from "react";
import RegistrationsService from "../EventsSection/services/RegistrationsService";
import { toast } from "react-toastify";

/**
 * Hook personalizado para gestionar inscripciones de equipos a eventos
 */
export const useRegistrations = () => {
  const [loading, setLoading] = useState(false);
  const [registrations, setRegistrations] = useState([]);
  const [registration, setRegistration] = useState(null);

  /**
   * Inscribir múltiples equipos a evento
   */
  const registerMultipleTeams = useCallback(
    async (serviceId, teamIds, notes = "") => {
      setLoading(true);
      try {
        const response = await RegistrationsService.registerMultipleTeams(
          serviceId,
          teamIds,
          notes,
        );
        if (response.success) {
          toast.success(response.message || "Equipos inscritos exitosamente");
          return { success: true, data: response.data };
        } else {
          toast.error(response.error || "Error al inscribir equipos");
          return { success: false, error: response.error };
        }
      } catch (error) {
        const errorMessage = error.message || "Error al inscribir equipos";
        toast.error(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  /**
   * Obtener inscripciones de un evento
   */
  const fetchEventRegistrations = useCallback(
    async (serviceId, status = "") => {
      setLoading(true);
      try {
        const response = await RegistrationsService.getEventRegistrations(
          serviceId,
          status,
        );
        setRegistrations(response.data || []);
        return { success: response.success, data: response.data };
      } catch (error) {
        const errorMessage = error.message || "Error al obtener inscripciones";
        toast.error(errorMessage);
        setRegistrations([]);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  /**
   * Obtener equipos disponibles filtrados por categorías del evento
   */
  const fetchTeamsByEventCategories = useCallback(async (serviceId) => {
    setLoading(true);
    try {
      const response =
        await RegistrationsService.getTeamsByEventCategories(serviceId);
      return { success: response.success, data: response.data };
    } catch (error) {
      const errorMessage =
        error.message || "Error al obtener equipos disponibles";
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
      const response = await RegistrationsService.cancelRegistration(id);
      if (response.success) {
        toast.success(response.message || "Inscripción cancelada exitosamente");
        return { success: true };
      } else {
        toast.error(response.error || "Error al cancelar inscripción");
        return { success: false, error: response.error };
      }
    } catch (error) {
      const errorMessage = error.message || "Error al cancelar inscripción";
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    registrations,
    registration,
    registerMultipleTeams,
    fetchEventRegistrations,
    fetchTeamsByEventCategories,
    cancelRegistration,
  };
};

export default useRegistrations;

