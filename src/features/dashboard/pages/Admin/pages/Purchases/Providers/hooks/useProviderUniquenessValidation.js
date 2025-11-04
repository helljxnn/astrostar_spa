import { useState, useEffect, useRef } from 'react';
import providersService from '../services/ProvidersService.js';

export const useProviderUniquenessValidation = (currentProviderId = null) => {
  const [validations, setValidations] = useState({
    nit: { isChecking: false, isDuplicate: false, message: '', isAvailable: false, backendValidated: false },
    razonSocial: { isChecking: false, isDuplicate: false, message: '', isAvailable: false, backendValidated: false },
    correo: { isChecking: false, isDuplicate: false, message: '', isAvailable: false, backendValidated: false },
    contactoPrincipal: { isChecking: false, isDuplicate: false, message: '', isAvailable: false, backendValidated: false }
  });

  const [allProviders, setAllProviders] = useState([]);
  const [providersLoaded, setProvidersLoaded] = useState(false);
  const debounceTimers = useRef({});

  // Cargar todos los proveedores una sola vez al inicializar (para fallback)
  useEffect(() => {
    const loadAllProviders = async () => {
      try {
        const response = await providersService.getProviders({ limit: 1000 });
        if (response.success) {
          setAllProviders(response.data);
          setProvidersLoaded(true);
          console.log('📋 Loaded providers for fallback:', response.data.length);
        }
      } catch (error) {
        console.error('Error loading providers:', error);
        setProvidersLoaded(true);
      }
    };

    loadAllProviders();
  }, []);

  const validateField = async (field, value, tipoEntidad = 'juridica') => {
    // Limpiar validación si el valor es muy corto
    const minLength = field === 'nit' ? 8 : (field === 'razonSocial' ? 3 : 2);
    if (!value || value.trim().length < minLength) {
      setValidations(prev => ({
        ...prev,
        [field]: {
          isChecking: false,
          isDuplicate: false,
          message: '',
          isAvailable: false,
          backendValidated: false
        }
      }));
      return;
    }

    const trimmedValue = value.trim();
    console.log(`🔍 Validating ${field}:`, trimmedValue, 'excludeId:', currentProviderId, 'tipoEntidad:', tipoEntidad);

    try {
      setValidations(prev => ({ 
        ...prev, 
        [field]: {
          ...prev[field],
          isChecking: true,
          backendValidated: false
        }
      }));

      // Usar el endpoint específico para validación
      let response;
      switch (field) {
        case 'nit':
          response = await providersService.checkNitAvailability(trimmedValue, currentProviderId, tipoEntidad);
          break;
        case 'razonSocial':
          // Para persona natural, validar como nombre
          if (tipoEntidad === 'natural') {
            response = await providersService.checkContactAvailability(trimmedValue, currentProviderId);
          } else {
            response = await providersService.checkBusinessNameAvailability(trimmedValue, currentProviderId, tipoEntidad);
          }
          break;
        case 'correo':
          response = await providersService.checkEmailAvailability(trimmedValue, currentProviderId);
          break;
        case 'contactoPrincipal':
          response = await providersService.checkContactAvailability(trimmedValue, currentProviderId);
          break;
        default:
          return;
      }

      console.log(`📡 ${field.toUpperCase()} API Response:`, response);
      
      if (response.success) {
        setValidations(prev => ({
          ...prev,
          [field]: {
            isChecking: false,
            isDuplicate: !response.data.available,
            message: response.data.available ? '' : response.data.message,
            isAvailable: response.data.available,
            backendValidated: true // Marcar como validado por backend
          }
        }));
      }
    } catch (error) {
      console.error(`❌ Error validating ${field}:`, error);
      // En caso de error, no mostramos validación visual
      setValidations(prev => ({
        ...prev,
        [field]: {
          isChecking: false,
          isDuplicate: false,
          message: '',
          isAvailable: false,
          backendValidated: false
        }
      }));
    }
  };

  const debouncedValidateField = (field, value, tipoEntidad = 'juridica') => {
    // Limpiar timer anterior
    if (debounceTimers.current[field]) {
      clearTimeout(debounceTimers.current[field]);
    }

    // Si el valor es muy corto, validar inmediatamente
    const minLength = field === 'nit' ? 8 : (field === 'razonSocial' ? 3 : 2);
    if (!value || value.trim().length < minLength) {
      validateField(field, value, tipoEntidad);
      return;
    }

    // Mostrar estado de verificación inmediatamente
    setValidations(prev => ({ 
      ...prev, 
      [field]: {
        ...prev[field],
        isChecking: true,
        isDuplicate: false,
        isAvailable: false,
        backendValidated: false
      }
    }));

    // Debounce para mejor UX
    debounceTimers.current[field] = setTimeout(() => {
      validateField(field, value, tipoEntidad);
    }, 400);
  };

  // Función para recargar proveedores (útil después de crear/editar)
  const reloadProviders = async () => {
    try {
      const response = await providersService.getProviders({ limit: 1000 });
      if (response.success) {
        setAllProviders(response.data);
      }
    } catch (error) {
      console.error('Error reloading providers:', error);
    }
  };

  // Limpiar timers al desmontar
  useEffect(() => {
    return () => {
      Object.values(debounceTimers.current).forEach(timer => {
        if (timer) clearTimeout(timer);
      });
    };
  }, []);

  return {
    validations,
    validateField: debouncedValidateField,
    reloadProviders,
    clearValidation: (field) => setValidations(prev => ({
      ...prev,
      [field]: {
        isChecking: false,
        isDuplicate: false,
        message: '',
        isAvailable: false,
        backendValidated: false
      }
    })),
    clearAllValidations: () => setValidations({
      nit: { isChecking: false, isDuplicate: false, message: '', isAvailable: false, backendValidated: false },
      razonSocial: { isChecking: false, isDuplicate: false, message: '', isAvailable: false, backendValidated: false },
      correo: { isChecking: false, isDuplicate: false, message: '', isAvailable: false, backendValidated: false },
      contactoPrincipal: { isChecking: false, isDuplicate: false, message: '', isAvailable: false, backendValidated: false }
    })
  };
};