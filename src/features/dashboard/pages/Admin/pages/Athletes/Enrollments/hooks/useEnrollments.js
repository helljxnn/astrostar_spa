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
      
      // Eliminar categorías duplicadas basándose en el nombre
      const uniqueCategories = (categoriesResponse.data || []).reduce((acc, category) => {
        const categoryName = category.name || category.nombre;
        // Solo agregar si no existe una categoría con el mismo nombre
        if (!acc.some(c => (c.name || c.nombre) === categoryName)) {
          acc.push(category);
        }
        return acc;
      }, []);

      setReferenceData({
        documentTypes: athletesDocTypesResponse.success ? athletesDocTypesResponse.data : [],
        guardianDocumentTypes: guardianDocTypes,
        sportsCategories: uniqueCategories
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
}

      if (inscriptionsResult.success) {
// Crear un Set con los documentos de deportistas ya matriculados
        const enrolledDocuments = new Set(
          (athletesResult.data || []).map(athlete => {
            const doc = athlete.identification || athlete.numeroDocumento;
return doc;
          }).filter(Boolean)
        );
// Filtrar solo las pendientes Y que NO tengan deportista matriculado
        const pendingInscriptions = (inscriptionsResult.data || []).filter(
          (inscription) => {
            const estado = (inscription.status || inscription.estado || "").toUpperCase();
            // Aceptar tanto "PENDING" (inglés del backend) como "PENDIENTE" (español)
            const isPending = estado === "PENDIENTE" || estado === "PENDING";
            const documento = inscription.identification || inscription.numeroDocumento;
            const isAlreadyEnrolled = enrolledDocuments.has(documento);
            
            const fullName = `${inscription.firstName || ""} ${inscription.middleName || ""} ${inscription.lastName || ""} ${inscription.secondLastName || ""}`.replace(/\s+/g, ' ').trim();
// Solo mostrar si está pendiente Y NO está matriculado
            return isPending && !isAlreadyEnrolled;
          }
        );
console.log('📋 [useEnrollments] IDs de inscripciones pendientes:', pendingInscriptions.map(i => i.id));
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
// Si el searchTerm está vacío, cargar todos los acudientes (útil después de crear uno nuevo)
      if (!searchTerm || searchTerm.length === 0) {
const result = await GuardiansService.getAll();
if (result.success) {
setGuardians(result.data || []);
        } else {
setGuardians([]);
        }
        return;
      }

      // Si tiene menos de 2 caracteres pero no está vacío, no buscar
      if (searchTerm.length < 2) {
        setGuardians([]);
        return;
      }
const result = await GuardiansService.searchGuardians(searchTerm, 20);
if (result.success) {
setGuardians(result.data || []);
      } else {
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
    // NO cargar todos los acudientes al inicio - se cargarán bajo demanda cuando el usuario busque
    // searchGuardians(""); // ❌ ELIMINADO - Esto causaba lentitud
  }, []);

  // Crear matrícula desde pre-inscripción
  const createEnrollment = async (enrollmentData, preRegistrationId) => {
    try {
console.log("📝 [createEnrollment] enrollmentData:", enrollmentData);
console.log("📝 [createEnrollment] preRegistrationId (en data):", enrollmentData.preRegistrationId);
      
      // Usar el preRegistrationId que viene en los datos si existe, sino usar el parámetro
      const finalPreRegistrationId = enrollmentData.preRegistrationId || preRegistrationId;
console.log("📝 [createEnrollment] Tipo de preRegistrationId:", typeof finalPreRegistrationId);
      
      // ⏳ NO ELIMINAR TODAVÍA - Esperar confirmación del backend
      
      // Pasar el preRegistrationId al servicio
      const result = await EnrollmentsService.createEnrollment(enrollmentData, finalPreRegistrationId);

      if (result.success) {
        console.log("✅ [createEnrollment] Matrícula creada exitosamente");
        console.log("📧 [createEnrollment] Email enviado:", result.emailSent);
        console.log("🔑 [createEnrollment] Contraseña temporal:", result.temporaryPassword);
        
        // ✅ AHORA SÍ: Eliminar la inscripción del estado local DESPUÉS del éxito
        if (finalPreRegistrationId) {
          console.log("🗑️ [createEnrollment] Eliminando inscripción del estado local tras éxito...");
          setInscriptions(prevInscriptions => {
            const filtered = prevInscriptions.filter(inscription => inscription.id !== finalPreRegistrationId);
            console.log("✅ [createEnrollment] Inscripciones restantes:", filtered.length);
            return filtered;
          });
        }
        
        showSuccessAlert(
          "Matrícula creada",
          "La deportista ha sido matriculada exitosamente"
        );
await loadData(pagination.page);
        
        // Retornar toda la información incluyendo credenciales
        return {
          data: result.data,
          emailSent: result.emailSent,
          temporaryPassword: result.temporaryPassword
        };
      } else {
        console.error("❌ [createEnrollment] Error al crear matrícula:", result.error);
        
        // ❌ NO ELIMINAR - La inscripción permanece en el estado
        console.log("⚠️ [createEnrollment] Inscripción NO eliminada debido al error");
        
        showErrorAlert("Error", result.error || "No se pudo crear la matrícula");
        return null;
      }
    } catch (error) {
      console.error("❌ [createEnrollment] Excepción:", error);
      
      // ❌ NO ELIMINAR - La inscripción permanece en el estado
      console.log("⚠️ [createEnrollment] Inscripción NO eliminada debido a excepción");
      
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
        "Rejected" // Valor del enum en inglés
      );

      if (result.success) {
        // 🚀 ELIMINACIÓN INSTANTÁNEA: Remover la inscripción del estado local inmediatamente
setInscriptions(prevInscriptions => 
          prevInscriptions.filter(inscription => inscription.id !== id)
        );
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

  // Agregar inscripción al estado local instantáneamente (sin esperar al backend)
  const addInscriptionToState = useCallback((newInscription) => {
    console.log("➕ [addInscriptionToState] Agregando inscripción al estado local:", newInscription);
    setInscriptions(prev => {
      // Verificar que no exista ya (por si acaso)
      const exists = prev.some(i => i.id === newInscription.id || i.identification === newInscription.identification);
      if (exists) {
        console.log("⚠️ [addInscriptionToState] La inscripción ya existe, no se agrega");
        return prev;
      }
      console.log("✅ [addInscriptionToState] Inscripción agregada al estado local");
      return [newInscription, ...prev];
    });
  }, []);

  // Actualizar email de inscripción en el estado local instantáneamente
  const updateInscriptionEmailInState = useCallback((identification, newEmail) => {
    console.log("📧 [updateInscriptionEmailInState] Actualizando email en estado local:", { identification, newEmail });
    setInscriptions(prev => {
      const updated = prev.map(inscription => {
        if (inscription.identification === identification) {
          console.log("✅ [updateInscriptionEmailInState] Email actualizado en estado local");
          return { ...inscription, email: newEmail };
        }
        return inscription;
      });
      return updated;
    });
  }, []);

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
    addInscriptionToState,
    updateInscriptionEmailInState,
  };
};
