import { useState, useCallback } from 'react';
import materialsService from '../services/MaterialsService';

export const useMaterialNameValidation = (materialId = null) => {
  const [nameValidation, setNameValidation] = useState({
    isChecking: false,
    isDuplicate: false,
    isAvailable: false,
    message: '',
  });

  const validateMaterialName = useCallback(
    async (nombre, currentCategoriaId = null) => {
      if (!nombre || nombre.trim().length < 3) {
        setNameValidation({
          isChecking: false,
          isDuplicate: false,
          isAvailable: false,
          message: '',
        });
        return { available: true, message: '' };
      }

      // Si no hay categoría seleccionada, no validar aún
      const catId = currentCategoriaId;
      if (!catId) {
        setNameValidation({
          isChecking: false,
          isDuplicate: false,
          isAvailable: false,
          message: '',
        });
        return { available: true, message: '' };
      }

      setNameValidation({
        isChecking: true,
        isDuplicate: false,
        isAvailable: false,
        message: 'Verificando disponibilidad...',
      });

      try {
        const response = await materialsService.checkNameAvailability(
          nombre.trim(),
          catId,
          materialId
        );

        if (response.success) {
          // El backend puede devolver 'exists' o 'available'
          const exists = response.data?.exists || response.exists || false;
          const available = response.data?.available !== undefined 
            ? response.data.available 
            : (response.available !== undefined ? response.available : !exists);

          if (exists || !available) {
            setNameValidation({
              isChecking: false,
              isDuplicate: true,
              isAvailable: false,
              message: response.message || 'Este nombre ya está en uso en esta categoría',
            });
            return { available: false, message: response.message || 'Este nombre ya está en uso en esta categoría' };
          } else {
            setNameValidation({
              isChecking: false,
              isDuplicate: false,
              isAvailable: true,
              message: 'Nombre disponible',
            });
            return { available: true, message: 'Nombre disponible' };
          }
        }

        return { available: true, message: '' };
      } catch (err) {
        console.error('Error validando nombre:', err);
        setNameValidation({
          isChecking: false,
          isDuplicate: false,
          isAvailable: false,
          message: '',
        });
        return { available: true, message: '' };
      }
    },
    [materialId]
  );

  const resetNameValidation = useCallback(() => {
    setNameValidation({
      isChecking: false,
      isDuplicate: false,
      isAvailable: false,
      message: '',
    });
  }, []);

  return {
    nameValidation,
    validateMaterialName,
    resetNameValidation,
  };
};
