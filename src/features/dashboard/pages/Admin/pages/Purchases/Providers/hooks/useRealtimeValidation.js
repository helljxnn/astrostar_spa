import { useState, useCallback, useRef, useEffect } from 'react';
import providersService from '../services/ProvidersService';

export const useRealtimeValidation = (providerToEdit = null) => {
  const [availabilityErrors, setAvailabilityErrors] = useState({});
  const [checkingFields, setCheckingFields] = useState({
    nit: false,
    razonSocial: false
  });
  const debounceTimers = useRef({});
  const abortControllers = useRef({});

  const clearAvailabilityError = useCallback((fieldName) => {
    setAvailabilityErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  }, []);

  const setAvailabilityError = useCallback((fieldName, message) => {
    setAvailabilityErrors(prev => ({
      ...prev,
      [fieldName]: message
    }));
  }, []);

  const checkNitAvailability = useCallback(async (nit, tipoEntidad) => {
    if (!nit || nit.trim().length < 8) {
      clearAvailabilityError('nit');
      setCheckingFields(prev => ({ ...prev, nit: false }));
      return;
    }

    const cleanedNit = nit.replace(/[.\-\s]/g, '');
    
    if (!/^\d{8,15}$/.test(cleanedNit)) {
      clearAvailabilityError('nit');
      setCheckingFields(prev => ({ ...prev, nit: false }));
      return;
    }

    if (abortControllers.current.nit) {
      abortControllers.current.nit.abort();
    }

    abortControllers.current.nit = new AbortController();

    setCheckingFields(prev => ({ ...prev, nit: true }));

    try {
      const excludeId = providerToEdit?.id ? parseInt(providerToEdit.id) : null;
      
      const response = await providersService.checkNitAvailability(
        cleanedNit,
        excludeId,
        tipoEntidad,
        { signal: abortControllers.current.nit.signal }
      );

      if (response.success) {
        if (!response.available) {
          setAvailabilityError('nit', response.message);
        } else {
          clearAvailabilityError('nit');
        }
      } else {
        console.error('Error in response:', response);
        clearAvailabilityError('nit');
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error checking NIT:', error);
        clearAvailabilityError('nit');
      }
    } finally {
      setCheckingFields(prev => ({ ...prev, nit: false }));
    }
  }, [providerToEdit, clearAvailabilityError, setAvailabilityError]);

  const checkBusinessNameAvailability = useCallback(async (businessName, tipoEntidad) => {
    if (!businessName || businessName.trim().length < 3) {
      clearAvailabilityError('razonSocial');
      setCheckingFields(prev => ({ ...prev, razonSocial: false }));
      return;
    }

    if (abortControllers.current.razonSocial) {
      abortControllers.current.razonSocial.abort();
    }

    abortControllers.current.razonSocial = new AbortController();

    setCheckingFields(prev => ({ ...prev, razonSocial: true }));

    try {
      const excludeId = providerToEdit?.id ? parseInt(providerToEdit.id) : null;
      
      const response = await providersService.checkBusinessNameAvailability(
        businessName.trim(),
        excludeId,
        tipoEntidad,
        { signal: abortControllers.current.razonSocial.signal }
      );

      if (response.success) {
        if (!response.available) {
          setAvailabilityError('razonSocial', response.message);
        } else {
          clearAvailabilityError('razonSocial');
        }
      } else {
        console.error('Error in response:', response);
        clearAvailabilityError('razonSocial');
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error checking business name:', error);
        clearAvailabilityError('razonSocial');
      }
    } finally {
      setCheckingFields(prev => ({ ...prev, razonSocial: false }));
    }
  }, [providerToEdit, clearAvailabilityError, setAvailabilityError]);

  const debouncedCheckNit = useCallback((nit, tipoEntidad) => {
    if (debounceTimers.current.nit) {
      clearTimeout(debounceTimers.current.nit);
    }

    debounceTimers.current.nit = setTimeout(() => {
      checkNitAvailability(nit, tipoEntidad);
    }, 500);
  }, [checkNitAvailability]);

  const debouncedCheckBusinessName = useCallback((businessName, tipoEntidad) => {
    if (debounceTimers.current.razonSocial) {
      clearTimeout(debounceTimers.current.razonSocial);
    }

    debounceTimers.current.razonSocial = setTimeout(() => {
      checkBusinessNameAvailability(businessName, tipoEntidad);
    }, 500);
  }, [checkBusinessNameAvailability]);

  const resetAvailabilityErrors = useCallback(() => {
    setAvailabilityErrors({});
    setCheckingFields({ nit: false, razonSocial: false });
    
    Object.values(debounceTimers.current).forEach(timer => {
      if (timer) clearTimeout(timer);
    });
    debounceTimers.current = {};

    Object.values(abortControllers.current).forEach(controller => {
      if (controller) controller.abort();
    });
    abortControllers.current = {};
  }, []);

  useEffect(() => {
    return () => {
      Object.values(debounceTimers.current).forEach(timer => {
        if (timer) clearTimeout(timer);
      });
      Object.values(abortControllers.current).forEach(controller => {
        if (controller) controller.abort();
      });
    };
  }, []);

  return {
    availabilityErrors,
    checkingFields,
    setCheckingFields,
    debouncedCheckNit,
    debouncedCheckBusinessName,
    clearAvailabilityError,
    resetAvailabilityErrors
  };
};