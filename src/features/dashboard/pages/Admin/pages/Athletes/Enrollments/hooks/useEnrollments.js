import { useState, useEffect, useCallback } from "react";
import EnrollmentsService from "../services/EnrollmentsService";
import InscriptionsService from "../services/InscriptionsService";
import GuardiansService from "../../AthletesSection/services/GuardiansService";
import {
  showSuccessAlert,
  showErrorAlert,
} from "../../../../../../../../shared/utils/alerts";

export const useEnrollments = () => {
  const [athletes, setAthletes] = useState([]);
  const [inscriptions, setInscriptions] = useState([]);
  const [guardians, setGuardians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
  });
  const [referenceData, setReferenceData] = useState({
    documentTypes: [],
    guardianDocumentTypes: [],
    sportsCategories: []
  });

  // Cargar datos de referencia
  const loadReferenceData = useCallback(async () => {
    try {
      const AthletesService = (await import("../../AthletesSection/services/AthletesService.js")).default;
      const apiClient = (await import("../../../../../../../../shared/services/apiClient.js")).default;
      
      // Cargar tipos de documento para deportistas
      const athletesDocTypesResponse = await AthletesService.getDocumentTypes();
      
      // Cargar TODOS los tipos de documento para acudientes
      const allDocTypesResponse = await apiClient.get("/document-types");
      
      // Cargar categorías deportivas
      const categoriesResponse = await apiClient.get("/sports-categories");

      setReferenceData({
        documentTypes: athletesDocTypesResponse.success ? athletesDocTypesResponse.data : [],
        guardianDocumentTypes: allDocTypesResponse.data || [],
        sportsCategories: categoriesResponse.data || []
      });
    } catch (error) {
      console.error("Error cargando datos de referencia:", error);
    }
  }, []);

  // Cargar datos iniciales
  const loadData = useCallback(async (page = 1, silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
      }

      // Cargar deportistas con matrículas
      const athletesResult = await EnrollmentsService.getAll({
        pageSize: pagination.pageSize,
      });

      // Cargar inscripciones pendientes del landing
      console.log("🔍 Intentando cargar inscripciones pendientes...");
      const inscriptionsResult = await InscriptionsService.getAll({
        estado: "PENDIENTE", // En mayúsculas para coincidir con el enum del backend
      });
      console.log("📦 Respuesta de inscripciones:", inscriptionsResult);

      // NO cargamos todos los acudientes aquí
      // Se cargarán bajo demanda cuando el usuario busque

      if (athletesResult.success) {
        setAthletes(athletesResult.data || []);
        setPagination((prev) => ({
          ...prev,
          page,
          total: athletesResult.data?.length || 0,
          totalPages: Math.ceil(
            (athletesResult.data?.length || 0) / prev.pageSize
          ),
        }));
      }

      if (inscriptionsResult.success) {
        console.log("✅ Inscripciones cargadas exitosamente:", inscriptionsResult.data);
        console.log("📊 Total de inscripciones:", inscriptionsResult.data.length);
        
        // Ver qué valores de estado hay
        const estados = inscriptionsResult.data.map(i => i.estado);
        console.log("🔍 Estados encontrados:", [...new Set(estados)]);
        
        // Filtrar solo las pendientes en el frontend
        const pendingInscriptions = (inscriptionsResult.data || []).filter(
          (inscription) => 
            inscription.estado === "PENDIENTE" || 
            inscription.estado === "Pendiente" || 
            inscription.estado === "pendiente"
        );
        console.log("📋 Inscripciones pendientes filtradas:", pendingInscriptions.length);
        
        setInscriptions(pendingInscriptions);
      } else {
        console.error("❌ Error cargando inscripciones:", inscriptionsResult.error);
        setInscriptions([]);
      }
    } catch (error) {
      console.error("Error loading enrollments data:", error);
      if (!silent) {
        showErrorAlert("Error", "No se pudieron cargar los datos");
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, [pagination.pageSize]);

  // Buscar acudientes bajo demanda
  const searchGuardians = async (searchTerm) => {
    try {
      if (!searchTerm || searchTerm.length < 2) {
        setGuardians([]);
        return;
      }

      const result = await GuardiansService.searchGuardians(searchTerm, 20);
      
      if (result.success) {
        setGuardians(result.data || []);
      }
    } catch (error) {
      console.error("Error searching guardians:", error);
    }
  };

  useEffect(() => {
    loadReferenceData();
    loadData();
  }, []);

  // Crear matrícula desde pre-inscripción
  const createEnrollment = async (enrollmentData, preRegistrationId) => {
    try {
      const result = await EnrollmentsService.createEnrollment(enrollmentData);

      if (result.success) {
        // Actualizar estado de inscripción a "matriculada"
        if (preRegistrationId) {
          await InscriptionsService.updateStatus(
            preRegistrationId,
            "MATRICULADA"
          );
        }

        showSuccessAlert(
          "Matrícula creada",
          "La deportista ha sido matriculada exitosamente"
        );
        await loadData(pagination.page);
        return result.data;
      } else {
        showErrorAlert("Error", result.error || "No se pudo crear la matrícula");
        return null;
      }
    } catch (error) {
      console.error("Error creating enrollment:", error);
      showErrorAlert("Error", "Ocurrió un error al crear la matrícula");
      return null;
    }
  };

  // Actualizar matrícula
  const updateEnrollment = async (id, enrollmentData) => {
    try {
      const result = await EnrollmentsService.updateEnrollment(
        id,
        enrollmentData
      );

      if (result.success) {
        showSuccessAlert(
          "Matrícula actualizada",
          "Los cambios se guardaron correctamente"
        );
        await loadData(pagination.page);
        return true;
      } else {
        showErrorAlert(
          "Error",
          result.error || "No se pudo actualizar la matrícula"
        );
        return false;
      }
    } catch (error) {
      console.error("Error updating enrollment:", error);
      showErrorAlert("Error", "Ocurrió un error al actualizar la matrícula");
      return false;
    }
  };

  // Eliminar deportista
  const deleteAthlete = async (id) => {
    try {
      const result = await EnrollmentsService.delete(id);

      if (result.success) {
        showSuccessAlert(
          "Deportista eliminada",
          "La deportista ha sido eliminada correctamente"
        );
        await loadData(pagination.page);
        return true;
      } else {
        showErrorAlert(
          "Error",
          result.error || "No se pudo eliminar la deportista"
        );
        return false;
      }
    } catch (error) {
      console.error("Error deleting athlete:", error);
      showErrorAlert("Error", "Ocurrió un error al eliminar la deportista");
      return false;
    }
  };

  // Rechazar inscripción
  const rejectInscription = async (id) => {
    try {
      const result = await InscriptionsService.updateStatus(
        id,
        "RECHAZADA" // En mayúsculas para coincidir con el enum del backend
      );

      if (result.success) {
        showSuccessAlert(
          "Inscripción rechazada",
          "La inscripción ha sido rechazada"
        );
        await loadData(pagination.page);
        return true;
      } else {
        showErrorAlert(
          "Error",
          result.error || "No se pudo rechazar la inscripción"
        );
        return false;
      }
    } catch (error) {
      console.error("Error rejecting inscription:", error);
      showErrorAlert(
        "Error",
        "Ocurrió un error al rechazar la inscripción"
      );
      return false;
    }
  };

  // Cambiar página
  const changePage = (newPage) => {
    loadData(newPage);
  };

  // Refrescar datos
  const refresh = (silent = false) => {
    loadData(pagination.page, silent);
  };

  return {
    athletes,
    inscriptions,
    guardians,
    loading,
    pagination,
    referenceData,
    createEnrollment,
    updateEnrollment,
    deleteAthlete,
    rejectInscription,
    changePage,
    refresh,
    searchGuardians,
  };
};
