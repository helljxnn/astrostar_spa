import { useState, useCallback, useRef } from 'react';
import AthletesService from '../../features/dashboard/pages/Admin/pages/Athletes/AthletesSection/services/AthletesService';
import InscriptionsService from '../../features/dashboard/pages/Admin/pages/Athletes/Enrollments/services/InscriptionsService';

/**
 * Hook para validar email duplicado en tiempo real
 * @param {number|null} excludeUserId - ID del usuario a excluir de la validación (para modo edición)
 * @param {boolean} checkInscriptions - Si debe verificar también en inscripciones pendientes
 * @param {boolean} skipAthleteCheck - Si debe omitir verificación de atletas (modo público)
 * @returns {Object} Estado y funciones de validación
 */
export const useEmailValidation = (
  excludeUserId = null,
  checkInscriptions = false,
  skipAthleteCheck = false
) => {
  const [isChecking, setIsChecking] = useState(false);
  const [emailExists, setEmailExists] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');
  const debounceTimerRef = useRef(null);

  const validateEmailDebounced = useCallback((email, delay = 500) => {
    // Limpiar timer anterior
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Validar formato básico - si no es válido, no hacer llamada al backend
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailExists(false);
      setValidationMessage('');
      setIsChecking(false);
      return;
    }

    setIsChecking(true);

    debounceTimerRef.current = setTimeout(async () => {
      try {
        // Verificar en deportistas matriculados (solo si aplica)
        if (!skipAthleteCheck) {
          const athleteResult = await AthletesService.checkEmailAvailability(email, excludeUserId);

          if (!athleteResult.available) {
            setEmailExists(true);
            setValidationMessage('Este email ya está matriculado en la fundación');
            setIsChecking(false);
            return;
          }
        }

        // Si checkInscriptions es true, también verificar en inscripciones pendientes
        if (checkInscriptions) {
          const inscriptionResult = await InscriptionsService.checkEmailExists(email);
          
          if (inscriptionResult.exists) {
            setEmailExists(true);
            setValidationMessage(inscriptionResult.message || 'Este email ya tiene una inscripción pendiente');
            setIsChecking(false);
            return;
          }
        }

        // Si llegamos aquí, el email está disponible
        setEmailExists(false);
        setValidationMessage('');
      } catch {
        // Error silencioso - no mostrar en consola para evitar ruido
        setEmailExists(false);
        setValidationMessage('');
      } finally {
        setIsChecking(false);
      }
    }, delay);
  }, [excludeUserId, checkInscriptions, skipAthleteCheck]);

  const clearValidation = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    setIsChecking(false);
    setEmailExists(false);
    setValidationMessage('');
  }, []);

  return {
    isChecking,
    emailExists,
    validationMessage,
    validateEmailDebounced,
    clearValidation,
  };
};

