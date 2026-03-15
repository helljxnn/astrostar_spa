import { useState, useEffect, useCallback, useRef } from 'react';
import { PERFORMANCE_CONFIG } from '../constants/performanceConfig.js';

/**
 * Hook optimizado para búsquedas con debounce y gestión de estado
 * @param {Function} searchFunction - Función que ejecuta la búsqueda
 * @param {Object} options - Opciones de configuración
 * @returns {Object} Estado y funciones de búsqueda
 */
export const useOptimizedSearch = (searchFunction, options = {}) => {
  const {
    debounceDelay = PERFORMANCE_CONFIG.SEARCH_DEBOUNCE.GENERAL,
    minSearchLength = PERFORMANCE_CONFIG.DATA_LOADING.SEARCH_MIN_LENGTH,
    initialValue = '',
    onSearchStart,
    onSearchEnd,
    onError
  } = options;

  const [searchTerm, setSearchTerm] = useState(initialValue);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [error, setError] = useState(null);
  
  const debounceRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Función de búsqueda optimizada
  const executeSearch = useCallback(async (term) => {
    // Cancelar búsqueda anterior si existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Crear nuevo AbortController
    abortControllerRef.current = new AbortController();

    try {
      setIsSearching(true);
      setError(null);
      onSearchStart?.();

      const results = await searchFunction(term, {
        signal: abortControllerRef.current.signal
      });

      if (!abortControllerRef.current.signal.aborted) {
        setSearchResults(results || []);
        onSearchEnd?.(results);
      }
    } catch (err) {
      if (!abortControllerRef.current.signal.aborted) {
        console.error('Error en búsqueda optimizada:', err);
        setError(err.message);
        onError?.(err);
      }
    } finally {
      if (!abortControllerRef.current.signal.aborted) {
        setIsSearching(false);
      }
    }
  }, [searchFunction, onSearchStart, onSearchEnd, onError]);

  // Efecto para manejar el debounce
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Si el término es muy corto, limpiar resultados
    if (searchTerm.length < minSearchLength) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    // Configurar debounce
    debounceRef.current = setTimeout(() => {
      executeSearch(searchTerm);
    }, debounceDelay);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchTerm, debounceDelay, minSearchLength, executeSearch]);

  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Función para actualizar el término de búsqueda
  const updateSearchTerm = useCallback((newTerm) => {
    setSearchTerm(newTerm);
  }, []);

  // Función para limpiar la búsqueda
  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setSearchResults([]);
    setError(null);
    setIsSearching(false);
    
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  // Función para forzar búsqueda inmediata
  const forceSearch = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    executeSearch(searchTerm);
  }, [searchTerm, executeSearch]);

  return {
    searchTerm,
    searchResults,
    isSearching,
    error,
    updateSearchTerm,
    clearSearch,
    forceSearch,
    hasResults: searchResults.length > 0,
    isEmpty: searchTerm.length === 0
  };
};