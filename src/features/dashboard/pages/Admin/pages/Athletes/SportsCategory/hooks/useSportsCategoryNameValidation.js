  import { useState, useEffect, useRef } from 'react';
  import sportsCategoriesService from '../services/sportsCategoriesService';

  export const useSportsCategoryNameValidation = (currentCategoryId = null) => {
    const [nameValidation, setNameValidation] = useState({
      isChecking: false,
      isDuplicate: false,
      message: '',
      existingCategoryName: '',
      isAvailable: false
    });

    const [allCategories, setAllCategories] = useState([]);
    const [categoriesLoaded, setCategoriesLoaded] = useState(false);
    const debounceTimer = useRef(null);

    // Cargar todas las categorías una sola vez al inicializar (para fallback)
    useEffect(() => {
      const loadAllCategories = async () => {
        try {
          const response = await sportsCategoriesService.getAllSportsCategories({ limit: 1000 });
          if (response.success) {
            setAllCategories(response.data);
            setCategoriesLoaded(true);
            console.log('📋 Loaded sports categories for fallback:', response.data.length);
          }
        } catch (error) {
          console.error('Error loading sports categories:', error);
          setCategoriesLoaded(true); // Marcar como cargado aunque haya error
        }
      };

      loadAllCategories();
    }, []);

    const validateCategoryName = async (nombre) => {
      // Limpiar validación si el nombre es muy corto
      if (!nombre || nombre.trim().length < 3) {
        setNameValidation({
          isChecking: false,
          isDuplicate: false,
          message: '',
          existingCategoryName: '',
          isAvailable: false
        });
        return;
      }

      const trimmedName = nombre.trim();
      console.log('🔍 Validating category name:', trimmedName, 'excludeId:', currentCategoryId);

      try {
        // Usar el endpoint específico para validación
        const response = await sportsCategoriesService.checkCategoryNameAvailability(trimmedName, currentCategoryId);
        console.log('📡 API Response:', response);
        
        if (response.success) {
          if (response.data.available) {
            console.log('✅ Name is available');
            setNameValidation({
              isChecking: false,
              isDuplicate: false,
              message: '',
              existingCategoryName: '',
              isAvailable: true
            });
          } else {
            console.log('❌ Name is not available:', response.data.message);
            setNameValidation({
              isChecking: false,
              isDuplicate: true,
              message: response.data.message,
              existingCategoryName: response.data.existingCategory || '',
              isAvailable: false
            });
          }
        }
      } catch (error) {
        console.error('❌ Error validating category name:', error);
        // Fallback a validación local si falla el endpoint
        if (categoriesLoaded) {
          const existingCategory = allCategories.find(category => 
            category.nombre.toLowerCase() === trimmedName.toLowerCase() && 
            category.id !== currentCategoryId
          );

          if (existingCategory) {
            console.log('🔄 Fallback: Name exists locally');
            setNameValidation({
              isChecking: false,
              isDuplicate: true,
              message: `El nombre "${trimmedName}" ya está en uso.`,
              existingCategoryName: existingCategory.nombre,
              isAvailable: false
            });
          } else {
            console.log('🔄 Fallback: Name available locally');
            setNameValidation({
              isChecking: false,
              isDuplicate: false,
              message: '',
              existingCategoryName: '',
              isAvailable: true
            });
          }
        }
      }
    };

    const debouncedValidateCategoryName = (nombre) => {
      // Limpiar timer anterior
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      // Si el nombre es muy corto, validar inmediatamente
      if (!nombre || nombre.trim().length < 3) {
        validateCategoryName(nombre);
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
        validateCategoryName(nombre);
      }, 300); // 300ms para ser más rápido
    };

    // Función para recargar categorías (útil después de crear/editar)
    const reloadCategories = async () => {
      try {
        const response = await sportsCategoriesService.getAllSportsCategories({ limit: 1000 });
        if (response.success) {
          setAllCategories(response.data);
        }
      } catch (error) {
        console.error('Error reloading categories:', error);
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
      validateCategoryName: debouncedValidateCategoryName,
      reloadCategories,
      clearValidation: () => setNameValidation({
        isChecking: false,
        isDuplicate: false,
        message: '',
        existingCategoryName: '',
        isAvailable: false
      })
    };
  };