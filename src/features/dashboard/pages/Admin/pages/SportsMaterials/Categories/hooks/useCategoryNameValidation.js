import { useState, useRef, useCallback } from 'react';
import categoriesService from '../../shared/services/CategoriesService';

export const useCategoryNameValidation = (currentCategoryId = null) => {
  const [nameValidation, setNameValidation] = useState({
    isChecking: false,
    isDuplicate: false,
    message: '',
    isAvailable: false,
  });

  const debounceTimer = useRef(null);

  const validateNameRemote = useCallback(
    async (nombre) => {
      const trimmed = String(nombre || '').trim();
      
      if (trimmed.length < 3) {
        return { available: false, message: 'Debe tener mínimo 3 caracteres' };
      }

      try {
        const res = await categoriesService.checkCategoryExists(trimmed, currentCategoryId);
        
        if (res && res.success !== undefined) {
          // Si available es true, el nombre está disponible
          // Si available es false, el nombre ya existe
          const available = res.available !== false;
          return {
            available,
            message: available ? 'Nombre disponible' : `El nombre "${nombre}" ya existe`,
          };
        }
        
        return { available: true, message: 'Nombre disponible' };
      } catch (err) {
        console.error('Error validando nombre:', err);
        return { available: true, message: '' };
      }
    },
    [currentCategoryId]
  );

  const validateCategoryName = (value) => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    const trimmed = String(value || '').trim();

    if (!trimmed || trimmed.length < 3) {
      setNameValidation({
        isChecking: false,
        isDuplicate: trimmed.length > 0 && trimmed.length < 3,
        message: trimmed.length > 0 && trimmed.length < 3 ? 'Debe tener mínimo 3 caracteres' : '',
        isAvailable: false,
      });
      return;
    }

    setNameValidation((p) => ({ 
      ...p, 
      isChecking: true, 
      isDuplicate: false, 
      message: '', 
      isAvailable: false 
    }));

    debounceTimer.current = setTimeout(async () => {
      const result = await validateNameRemote(value);
      setNameValidation({
        isChecking: false,
        isDuplicate: !result.available,
        message: result.message,
        isAvailable: result.available,
      });
    }, 500);
  };

  const resetNameValidation = () => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
      debounceTimer.current = null;
    }
    setNameValidation({ 
      isChecking: false, 
      isDuplicate: false, 
      message: '', 
      isAvailable: false 
    });
  };

  return {
    nameValidation,
    validateCategoryName,
    resetNameValidation,
  };
};

export default useCategoryNameValidation;
