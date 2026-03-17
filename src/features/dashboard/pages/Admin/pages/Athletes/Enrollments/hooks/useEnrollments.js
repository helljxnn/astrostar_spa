import { useState, useEffect, useCallback } from "react";
import EnrollmentsService from "../services/EnrollmentsService";
import InscriptionsService from "../services/InscriptionsService";
import GuardiansService from "../../AthletesSection/services/GuardiansService";
import { PAGINATION_CONFIG } from "../../../../../../../../shared/constants/paginationConfig.js";
import {
  showSuccessAlert,
  showErrorAlert,
} from "../../../../../../../../shared/utils/alerts.js";

export const useEnrollments = () => {
  const [athletes, setAthletes] = useState([]);
  const [inscriptions, setInscriptions] = useState([]);
  const [guardians, setGuardians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: PAGINATION_CONFIG.DEFAULT_PAGE,
    pageSize: PAGINATION_CONFIG.ROWS_PER_PAGE,
    total: 0,
    totalPages: 0,
  });
  const [searchFilters, setSearchFilters] = useState({ 
    search: "", 
    estado: "",
    dateFrom: "",
    dateTo: "",
    vencimiento: ""
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

  // Cargar datos (búsqueda por nombre completo y documento en backend) - OPTIMIZADO
  const loadData = useCallback(async (page = 1, silent = false, filtersOverride = null, options = {}) => {
    const f = filtersOverride ?? searchFilters;
    const { includeInscriptions = false } = options;
    try {
      if (!silent) setLoading(true);

      // Procesar matrículas vencidas solo una vez por sesión
      if (!silent && !sessionStorage.getItem('expiredEnrollmentsProcessed')) {
        try {
          await EnrollmentsService.processExpiredEnrollments();
          sessionStorage.setItem('expiredEnrollmentsProcessed', 'true');
        } catch (error) {
          console.error("Error procesando matrículas vencidas:", error);
        }
      }

      const athletesResult = await EnrollmentsService.getAll({
        page,
        pageSize: pagination.pageSize,
        search: (f.search || "").trim() || undefined,
        estado: f.estado || undefined,
        dateFrom: f.dateFrom || undefined,
        dateTo: f.dateTo || undefined,
        vencimiento: f.vencimiento || undefined,
      });

      // Cargar inscripciones solo cuando se solicita (evita limpiar estado en silent)
      let inscriptionsResult = null;
      if (!silent || includeInscriptions) {
        inscriptionsResult = await InscriptionsService.getAll({
          // Sin filtro de estado - muestra todas las inscripciones
        });
      }

      if (athletesResult.success) {
        const list = athletesResult.data || [];
        const total = athletesResult.total ?? list.length;
        setAthletes(list);
        setPagination((prev) => ({
          ...prev,
          page,
          total,
          totalPages: Math.max(1, Math.ceil(total / prev.pageSize)),
          hasNext: page < Math.ceil(total / prev.pageSize),
          hasPrev: page > 1,
        }));
      } else {
        setAthletes([]);
      }

      if (inscriptionsResult && inscriptionsResult.success) {
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
            // Solo mostrar si está pendiente Y NO está matriculado
            return isPending && !isAlreadyEnrolled;
          }
        );
        setInscriptions(pendingInscriptions);
      } else if (inscriptionsResult && !inscriptionsResult.success) {
        setInscriptions([]);
      }
    } catch (error) {
      console.error("Error loading enrollments data:", error);
      if (!silent) {
        showErrorAlert("Error", "No se pudieron cargar los datos");
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, [pagination.pageSize]);

  // Buscar acudientes bajo demanda - OPTIMIZADO
  const searchGuardians = async (searchTerm) => {
    try {
      // Si el searchTerm está vacío, cargar solo algunos acudientes recientes
      if (!searchTerm || searchTerm.length === 0) {
        const result = await GuardiansService.getGuardiansWithAthleteInfo({ limit: 20 }); // Usar método con info de deportistas
        if (result.success) {
          // Si necesita enriquecimiento, obtener datos de deportistas
          let enrichedData = result.data || [];
          if (result.needsEnrichment) {
            enrichedData = await enrichGuardiansWithAthleteInfo(result.data || []);
          }
          
          setGuardians(enrichedData);
        }
        return;
      }

      // Si hay término de búsqueda, usar búsqueda específica
      if (searchTerm.length >= 2) {
        const result = await GuardiansService.searchGuardiansWithAthleteInfo(searchTerm, 15); // Usar método con info de deportistas
        if (result.success) {
          // Si necesita enriquecimiento, obtener datos de deportistas
          let enrichedData = result.data || [];
          if (result.needsEnrichment) {
            enrichedData = await enrichGuardiansWithAthleteInfo(result.data || []);
          }
          
          setGuardians(enrichedData);
        }
      } else {
        setGuardians([]);
      }
    } catch (error) {
      console.error("Error buscando acudientes:", error);
      setGuardians([]);
    }
  };

  // Función para enriquecer acudientes con información de deportistas
  const enrichGuardiansWithAthleteInfo = async (guardians) => {
    try {
      // Obtener todos los deportistas para calcular la información
      const AthletesService = (await import("../../AthletesSection/services/AthletesService.js")).default;
      const athletesResult = await AthletesService.getAll();
      
      if (!athletesResult.success) {
        console.warn("No se pudieron obtener los deportistas para enriquecer");
        return guardians;
      }
      
      const allAthletes = athletesResult.data || [];
      
      return guardians.map(guardian => {
        // Encontrar deportistas asignados a este acudiente
        const guardianAthletes = allAthletes.filter(athlete => 
          athlete.acudiente === guardian.nombreCompleto || 
          athlete.guardianId === guardian.id ||
          athlete.guardian?.id === guardian.id
        );
        
        const totalAthletes = guardianAthletes.length;
        
        // Calcular deportistas menores de edad
        const minorAthletes = guardianAthletes.filter(athlete => {
          if (athlete.fechaNacimiento || athlete.birthDate) {
            const birthDate = athlete.fechaNacimiento || athlete.birthDate;
            const today = new Date();
            const birth = new Date(birthDate);
            let age = today.getFullYear() - birth.getFullYear();
            const monthDiff = today.getMonth() - birth.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
              age--;
            }
            return age < 18;
          }
          return false;
        });
        
        const minorAthletesCount = minorAthletes.length;
        const hasMinorAthletes = minorAthletesCount > 0;
        const minorAthletesNames = minorAthletes.map(a => a.nombreCompleto || `${a.firstName} ${a.lastName}`);
        
        return {
          ...guardian,
          totalAthletes,
          minorAthletes: minorAthletesCount,
          hasMinorAthletes,
          minorAthletesNames
        };
      });
    } catch (error) {
      console.error("Error enriqueciendo datos de acudientes:", error);
      return guardians;
    }
  };

  useEffect(() => {
    loadReferenceData();
    loadData();
    // NO cargar todos los acudientes al inicio - se cargarán bajo demanda cuando el usuario busque
  }, []);

  // Crear matrícula desde pre-inscripción
  const createEnrollment = async (enrollmentData, preRegistrationId) => {
    try {
      // Usar el preRegistrationId que viene en los datos si existe, sino usar el parámetro
      const finalPreRegistrationId = enrollmentData.preRegistrationId || preRegistrationId;
      
      // ⏳ NO ELIMINAR TODAVÍA - Esperar confirmación del backend
      
      // Pasar el preRegistrationId al servicio
      const result = await EnrollmentsService.createEnrollment(enrollmentData, finalPreRegistrationId);

      if (result.success) {
        // ✅ AHORA SÍ: Eliminar la inscripción del estado local DESPUÉS del éxito
        if (finalPreRegistrationId) {
          setInscriptions(prevInscriptions => {
            const filtered = prevInscriptions.filter(inscription => inscription.id !== finalPreRegistrationId);
            return filtered;
          });
        }
        
        showSuccessAlert(
          "Matrícula creada",
          "La deportista ha sido matriculada exitosamente"
        );
        
        // Ir a la primera página para ver la nueva matrícula
        await loadData(1);
        
        // Retornar toda la información incluyendo credenciales
        return {
          data: result.data,
          emailSent: result.emailSent,
          temporaryPassword: result.temporaryPassword
        };
      } else {
        // ❌ NO ELIMINAR - La inscripción permanece en el estado
        
        // Mensaje más específico para errores de timeout
        let errorTitle = "Error al crear matrícula";
        let errorMessage = result.error || "No se pudo crear la matrícula";
        
        if (result.error && result.error.includes('servidor está procesando')) {
          errorTitle = "Servidor ocupado";
          errorMessage = result.error + "\n\n💡 Tip: Espera unos segundos e intenta nuevamente.";
        }
        
        showErrorAlert(errorTitle, errorMessage);
        return null;
      }
    } catch (error) {
      console.error("❌ [createEnrollment] Excepción:", error);
      
      // ❌ NO ELIMINAR - La inscripción permanece en el estado
      
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

  const changePage = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
    loadData(newPage, false, searchFilters);
  };

  const refresh = (silent = false, options = {}) => {
    loadData(pagination.page, silent, null, options);
  };

  /** Aplica búsqueda y filtros (llamar con debounce). */
  const applyFilters = useCallback(
    (search = "", estado = "", dateFrom = "", dateTo = "", vencimiento = "") => {
      const next = {
        search: String(search ?? "").trim(),
        estado: String(estado ?? "").trim(),
        dateFrom: String(dateFrom ?? "").trim(),
        dateTo: String(dateTo ?? "").trim(),
        vencimiento: String(vencimiento ?? "").trim(),
      };

      // Evitar recargas innecesarias si los filtros no cambiaron realmente
      setSearchFilters((prev) => {
        if (
          prev.search === next.search &&
          prev.estado === next.estado &&
          prev.dateFrom === next.dateFrom &&
          prev.dateTo === next.dateTo &&
          prev.vencimiento === next.vencimiento
        ) {
          return prev;
        }
        return next;
      });

      loadData(1, false, next);
    },
    [loadData]
  );

  // Agregar inscripción al estado local instantáneamente (sin esperar al backend)
  const addInscriptionToState = useCallback((newInscription) => {
    setInscriptions(prev => {
      // Verificar que no exista ya (por si acaso)
      const exists = prev.some(i => i.id === newInscription.id || i.identification === newInscription.identification);
      if (exists) {
        return prev;
      }
      return [newInscription, ...prev];
    });
  }, []);

  // Actualizar email de inscripción en el estado local instantáneamente
  const updateInscriptionEmailInState = useCallback((identification, newEmail) => {
    setInscriptions(prev => {
      const updated = prev.map(inscription => {
        if (inscription.identification === identification) {
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
    searchFilters,
    createEnrollment,
    updateEnrollment,
    deleteAthlete,
    rejectInscription,
    changePage,
    refresh,
    applyFilters,
    searchGuardians,
    addInscriptionToState,
    updateInscriptionEmailInState,
  };
};

