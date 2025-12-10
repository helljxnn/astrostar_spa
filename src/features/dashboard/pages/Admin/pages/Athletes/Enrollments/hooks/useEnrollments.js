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
      
      // Cargar TODOS los tipos de documento
      const allDocTypesResponse = await apiClient.get("/document-types");
      
      // Filtrar tipos de documento para acudientes (excluir Tarjeta de Identidad)
      const guardianDocTypes = (allDocTypesResponse.data || []).filter(
        (docType) => !docType.label?.toLowerCase().includes("tarjeta de identidad")
      );
      
      // Cargar categorías deportivas
      const categoriesResponse = await apiClient.get("/sports-categories");

      setReferenceData({
        documentTypes: athletesDocTypesResponse.success ? athletesDocTypesResponse.data : [],
        guardianDocumentTypes: guardianDocTypes,
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

      // Procesar matrículas vencidas automáticamente
      try {
        await EnrollmentsService.processExpiredEnrollments();
      } catch (error) {
        console.error("Error procesando matrículas vencidas:", error);
        // No mostramos error al usuario, es un proceso silencioso
      }

      // Cargar deportistas con matrículas
      const athletesResult = await EnrollmentsService.getAll({
        pageSize: pagination.pageSize,
      });

      // Cargar todas las inscripciones (Pendiente, Procesada, Rechazada)
      const inscriptionsResult = await InscriptionsService.getAll({
        // Sin filtro de estado - muestra todas las inscripciones
      });

      // NO cargamos todos los acudientes aquí
      // Se cargarán bajo demanda cuando el usuario busque

      if (athletesResult.success) {
        console.log('📊 [useEnrollments] Deportistas cargadas:', athletesResult.data?.length);
        console.log('📊 [useEnrollments] Datos:', athletesResult.data);
        setAthletes(athletesResult.data || []);
        setPagination((prev) => ({
          ...prev,
          page,
          total: athletesResult.data?.length || 0,
          totalPages: Math.ceil(
            (athletesResult.data?.length || 0) / prev.pageSize
          ),
        }));
      } else {
        console.log('❌ [useEnrollments] Error al cargar deportistas:', athletesResult.error);
      }

      if (inscriptionsResult.success) {
        console.log('📋 [useEnrollments] Todas las inscripciones:', inscriptionsResult.data);
        
        // Crear un Set con los documentos de deportistas ya matriculados
        const enrolledDocuments = new Set(
          (athletesResult.data || []).map(athlete => 
            athlete.numeroDocumento || athlete.identification
          ).filter(Boolean)
        );
        
        console.log('📋 [useEnrollments] Documentos de deportistas matriculados:', Array.from(enrolledDocuments));
        
        // Filtrar solo las pendientes Y que NO tengan deportista matriculado
        const pendingInscriptions = (inscriptionsResult.data || []).filter(
          (inscription) => {
            const estado = (inscription.estado || "").toUpperCase();
            const isPending = estado === "PENDIENTE";
            const documento = inscription.numeroDocumento;
            const isAlreadyEnrolled = enrolledDocuments.has(documento);
            
            console.log(`📋 [useEnrollments] Inscripción ${inscription.nombres}: estado="${inscription.estado}" -> isPending=${isPending}, documento=${documento}, isAlreadyEnrolled=${isAlreadyEnrolled}`);
            
            return isPending && !isAlreadyEnrolled;
          }
        );
        
        console.log('📋 [useEnrollments] Inscripciones pendientes filtradas:', pendingInscriptions.length);
        setInscriptions(pendingInscriptions);
      } else {
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
      console.log('🔍 [useEnrollments] Buscando acudientes con término:', searchTerm);
      
      // Si el searchTerm está vacío, cargar todos los acudientes (útil después de crear uno nuevo)
      if (!searchTerm || searchTerm.length === 0) {
        console.log('🔍 [useEnrollments] Cargando todos los acudientes...');
        const result = await GuardiansService.getAll();
        console.log('🔍 [useEnrollments] Resultado getAll:', result);
        if (result.success) {
          console.log('✅ [useEnrollments] Acudientes cargados:', result.data.length);
          setGuardians(result.data || []);
        } else {
          console.log('❌ [useEnrollments] Error al cargar acudientes');
          setGuardians([]);
        }
        return;
      }

      // Si tiene menos de 2 caracteres pero no está vacío, no buscar
      if (searchTerm.length < 2) {
        setGuardians([]);
        return;
      }

      console.log('🔍 [useEnrollments] Buscando con searchGuardians...');
      const result = await GuardiansService.searchGuardians(searchTerm, 20);
      console.log('🔍 [useEnrollments] Resultado búsqueda:', result);
      
      if (result.success) {
        console.log('✅ [useEnrollments] Acudientes encontrados:', result.data.length);
        setGuardians(result.data || []);
      } else {
        console.log('❌ [useEnrollments] Error en búsqueda');
        setGuardians([]);
      }
    } catch (error) {
      console.error("❌ [useEnrollments] Error searching guardians:", error);
      setGuardians([]);
    }
  };

  useEffect(() => {
    loadReferenceData();
    loadData();
    // Cargar todos los acudientes al inicio
    searchGuardians("");
  }, []);

  // Crear matrícula desde pre-inscripción
  const createEnrollment = async (enrollmentData, preRegistrationId) => {
    try {
      console.log("📝 [createEnrollment] Iniciando creación de matrícula...");
      console.log("📝 [createEnrollment] enrollmentData:", enrollmentData);
      console.log("📝 [createEnrollment] preRegistrationId:", preRegistrationId);
      console.log("📝 [createEnrollment] Tipo de preRegistrationId:", typeof preRegistrationId);
      
      // Pasar el preRegistrationId al servicio
      const result = await EnrollmentsService.createEnrollment(enrollmentData, preRegistrationId);

      if (result.success) {
        console.log("✅ [createEnrollment] Matrícula creada exitosamente");
        console.log("📧 [createEnrollment] Email enviado:", result.emailSent);
        console.log("🔑 [createEnrollment] Contraseña temporal:", result.temporaryPassword);
        
        showSuccessAlert(
          "Matrícula creada",
          "La deportista ha sido matriculada exitosamente"
        );
        
        console.log("🔄 [createEnrollment] Recargando datos...");
        await loadData(pagination.page);
        
        // 🚀 ELIMINACIÓN POST-CARGA: Remover la inscripción del estado local DESPUÉS de recargar
        // Esto asegura que incluso si el backend no actualizó el estado, no se muestre
        if (preRegistrationId) {
          console.log("🗑️ [createEnrollment] Eliminando inscripción del estado local después de recargar...");
          setInscriptions(prevInscriptions => 
            prevInscriptions.filter(inscription => inscription.id !== preRegistrationId)
          );
          console.log("✅ [createEnrollment] Inscripción eliminada del estado local");
        }
        
        // Retornar toda la información incluyendo credenciales
        return {
          data: result.data,
          emailSent: result.emailSent,
          temporaryPassword: result.temporaryPassword
        };
      } else {
        console.error("❌ [createEnrollment] Error al crear matrícula:", result.error);
        showErrorAlert("Error", result.error || "No se pudo crear la matrícula");
        return null;
      }
    } catch (error) {
      console.error("❌ [createEnrollment] Excepción:", error);
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
        // 🚀 ELIMINACIÓN INSTANTÁNEA: Remover la inscripción del estado local inmediatamente
        console.log("🗑️ [rejectInscription] Eliminando inscripción del estado local instantáneamente...");
        setInscriptions(prevInscriptions => 
          prevInscriptions.filter(inscription => inscription.id !== id)
        );
        console.log("✅ [rejectInscription] Inscripción eliminada del estado local");
        
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
