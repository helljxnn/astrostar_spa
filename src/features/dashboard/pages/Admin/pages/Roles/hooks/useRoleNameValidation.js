import { useState, useEffect, useRef } from 'react';
import rolesService from '../services/rolesService';

export const useRoleNameValidation = (currentRoleId = null) => {
  const [nameValidation, setNameValidation] = useState({
    isChecking: false,
    isDuplicate: false,
    message: '',
    existingRoleName: '',
    isAvailable: false
  });

  const [allRoles, setAllRoles] = useState([]);
  const [rolesLoaded, setRolesLoaded] = useState(false);
  const debounceTimer = useRef(null);

  // Cargar todos los roles una sola vez al inicializar (para fallback)
  useEffect(() => {
    const loadAllRoles = async () => {
      try {
        const response = await rolesService.getAllRoles({ limit: 100 });
        if (response.success) {
          setAllRoles(response.data);
          setRolesLoaded(true);

        }
      } catch (error) {
        console.error('Error loading roles:', error);
        setRolesLoaded(true); // Marcar como cargado aunque haya error
      }
    };

    loadAllRoles();
  }, []);

  const validateRoleName = async (name) => {
    // Limpiar validación si el nombre es muy corto
    if (!name || name.trim().length < 2) {
      setNameValidation({
        isChecking: false,
        isDuplicate: false,
        message: '',
        existingRoleName: '',
        isAvailable: false
      });
      return;
    }

    const trimmedName = name.trim();


    try {
      // Usar el endpoint específico para validación
      const response = await rolesService.checkRoleNameAvailability(trimmedName, currentRoleId);

      
      if (response.success) {
        if (response.data.available) {

          setNameValidation({
            isChecking: false,
            isDuplicate: false,
            message: '',
            existingRoleName: '',
            isAvailable: true
          });
        } else {

          setNameValidation({
            isChecking: false,
            isDuplicate: true,
            message: response.data.message,
            existingRoleName: response.data.existingRole || '',
            isAvailable: false
          });
        }
      }
    } catch (error) {
      console.error('❌ Error validating role name:', error);
      // Fallback a validación local si falla el endpoint
      if (rolesLoaded) {
        const existingRole = allRoles.find(role => 
          role.name.toLowerCase() === trimmedName.toLowerCase() && 
          role.id !== currentRoleId
        );

        if (existingRole) {

          setNameValidation({
            isChecking: false,
            isDuplicate: true,
            message: `El nombre "${trimmedName}" ya está en uso.`,
            existingRoleName: existingRole.name,
            isAvailable: false
          });
        } else {

          setNameValidation({
            isChecking: false,
            isDuplicate: false,
            message: '',
            existingRoleName: '',
            isAvailable: true
          });
        }
      }
    }
  };

  const debouncedValidateRoleName = (name) => {
    // Limpiar timer anterior
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Si el nombre es muy corto, validar inmediatamente
    if (!name || name.trim().length < 2) {
      validateRoleName(name);
      return;
    }

    // Mostrar estado de verificación inmediatamente
    setNameValidation(prev => ({ 
      ...prev, 
      isChecking: true,
      isDuplicate: false,
      isAvailable: false
    }));

    // Debounce más corto para mejor UX
    debounceTimer.current = setTimeout(() => {
      validateRoleName(name);
    }, 300); // Reducido a 300ms para ser más rápido
  };

  // Función para recargar roles (útil después de crear/editar)
  const reloadRoles = async () => {
    try {
      const response = await rolesService.getAllRoles({ limit: 100 });
      if (response.success) {
        setAllRoles(response.data);
      }
    } catch (error) {
      console.error('Error reloading roles:', error);
    }
  };

  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  return {
    nameValidation,
    validateRoleName: debouncedValidateRoleName,
    reloadRoles,
    clearValidation: () => setNameValidation({
      isChecking: false,
      isDuplicate: false,
      message: '',
      existingRoleName: '',
      isAvailable: false
    })
  };
};