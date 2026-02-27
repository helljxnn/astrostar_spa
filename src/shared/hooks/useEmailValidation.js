import { useState, useCallback, useRef } from 'react';
import AthletesService from '../../features/dashboard/pages/Admin/pages/Athletes/AthletesSection/services/AthletesService';

/**
 * Hook para validar email duplicado en tiempo real
 * @param {number|null} excludeUserId - ID del usuario a excluir de la validación (para modo edición)
 * @returns {Object} Estado y funciones de validación
 */
export const useEmailValidation = (excludeUserId = null) => {
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
        const result = await AthletesService.checkEmailAvailability(email, excludeUserId);

        if (!result.available) {
          setEmailExists(true);
          setValidationMessage('Este email ya está registrado');
        } else {
          setEmailExists(false);
          setValidationMessage('');
        }
      } catch (error) {
        // Error silencioso - no mostrar en consola para evitar ruido
        setEmailExists(false);
        setValidationMessage('');
      } finally {
        setIsChecking(false);
      }
    }, delay);
  }, [excludeUserId]);

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
