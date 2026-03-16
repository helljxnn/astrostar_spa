/**
 * Hook personalizado para validar documentos en tiempo real
 * Verifica si un documento ya está registrado en el sistema o en inscripciones pendientes
 * 
 * Características:
 * - Debounce de 400ms para evitar llamadas excesivas
 * - Cache de resultados para optimizar rendimiento
 * - Validación combinada: deportistas registrados + inscripciones pendientes
 * - Estados claros: isChecking, exists, message
 * - Reutilizable en múltiples componentes
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import AthletesService from '../../features/dashboard/pages/Admin/pages/Athletes/AthletesSection/services/AthletesService';
import InscriptionsService from '../../features/dashboard/pages/Admin/pages/Athletes/Enrollments/services/InscriptionsService';

export const useDocumentValidation = (excludeUserId = null, skipInscriptionCheck = false) => {
  const [isChecking, setIsChecking] = useState(false);
  const [documentExists, setDocumentExists] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');
  
  // Cache para evitar consultas repetidas
  const cacheRef = useRef(new Map());
  const debounceTimerRef = useRef(null);

  /**
   * Validar documento contra el backend
   * Verifica tanto en deportistas registrados como en inscripciones pendientes
   */
  const validateDocument = useCallback(async (document, minLength = 6) => {
    // Limpiar espacios y validar longitud mínima
    const cleanDocument = document?.toString().trim();
    
    if (!cleanDocument || cleanDocument.length < minLength) {
      setDocumentExists(false);
      setValidationMessage('');
      setIsChecking(false);
      return { exists: false, message: '' };
    }

    // Verificar cache
    const cacheKey = `${cleanDocument}_${excludeUserId || 'new'}_${skipInscriptionCheck ? 'noInscription' : 'withInscription'}`;
    if (cacheRef.current.has(cacheKey)) {
      const cached = cacheRef.current.get(cacheKey);
      console.log('✅ [useDocumentValidation] Usando resultado en cache:', cached);
      setDocumentExists(cached.exists);
      setValidationMessage(cached.message);
      setIsChecking(false); // Importante: marcar como no checking cuando viene del cache
      return cached;
    }

    console.log('🔍 [useDocumentValidation] Validando documento (no en cache):', cleanDocument);
    console.log('🔍 [useDocumentValidation] skipInscriptionCheck:', skipInscriptionCheck);
    setIsChecking(true);

    try {
      // Timeout de 10 segundos para evitar loader infinito
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 10000)
      );

      // Verificar en paralelo: deportistas registrados + inscripciones pendientes (si no se debe saltar)
      const checks = [
        AthletesService.checkIdentificationAvailability(cleanDocument, excludeUserId)
      ];
      
      // Solo verificar inscripciones si NO se debe saltar la verificación
      if (!skipInscriptionCheck) {
        checks.push(InscriptionsService.checkDocumentExists(cleanDocument));
      }

      const results = await Promise.race([
        Promise.all(checks),
        timeoutPromise
      ]);

      const athleteCheck = results[0];
      const inscriptionCheck = skipInscriptionCheck ? null : results[1];

      console.log('🔍 [useDocumentValidation] Resultado atleta:', athleteCheck);
      console.log('🔍 [useDocumentValidation] Resultado inscripción:', inscriptionCheck);

      let exists = false;
      let message = '';

      // Prioridad 1: Ya está registrado como deportista (matriculado)
      if (athleteCheck && !athleteCheck.available) {
        exists = true;
        // Forzar mensaje simple y consistente
        message = 'Este documento ya está matriculado';
        console.log('✅ [useDocumentValidation] Documento MATRICULADO detectado');
      }
      // Prioridad 2: Ya tiene una inscripción pendiente (del landing)
      // IMPORTANTE: Solo si NO está matriculado, NO se saltó la verificación, y el backend de inscripciones respondió correctamente
      else if (!skipInscriptionCheck && inscriptionCheck && inscriptionCheck.exists && inscriptionCheck.success !== false) {
        exists = true;
        // Forzar mensaje simple y consistente
        message = 'Este documento ya está inscrito';
        console.log('✅ [useDocumentValidation] Documento INSCRITO detectado');
      } else {
        console.log('✅ [useDocumentValidation] Documento DISPONIBLE');
      }

      // Guardar en cache
      const result = { exists, message };
      console.log('💾 [useDocumentValidation] Guardando en cache:', cacheKey, result);
      cacheRef.current.set(cacheKey, result);

      setDocumentExists(exists);
      setValidationMessage(message);

      return result;
    } catch (error) {
      console.error('❌ [useDocumentValidation] Error:', error);
      // En caso de error o timeout, permitir continuar (fail-safe)
      setDocumentExists(false);
      setValidationMessage('');
      return { exists: false, message: '' };
    } finally {
      setIsChecking(false);
    }
  }, [excludeUserId, skipInscriptionCheck]);

  /**
   * Validar documento con debounce
   * Espera 400ms después de que el usuario deje de escribir
   */
  const validateDocumentDebounced = useCallback((document, minLength = 6) => {
    // Limpiar timer anterior
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Limpiar espacios
    const cleanDocument = document?.toString().trim();

    // Si no cumple longitud mínima, limpiar estado inmediatamente
    if (!cleanDocument || cleanDocument.length < minLength) {
      setDocumentExists(false);
      setValidationMessage('');
      setIsChecking(false);
      return;
    }

    // Mostrar estado de carga
    setIsChecking(true);

    // Crear nuevo timer
    debounceTimerRef.current = setTimeout(() => {
      validateDocument(cleanDocument, minLength);
    }, 400); // 400ms de debounce
  }, [validateDocument]);

  /**
   * Limpiar validación
   */
  const clearValidation = useCallback(() => {
    setDocumentExists(false);
    setValidationMessage('');
    setIsChecking(false);
    
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
  }, []);

  /**
   * Limpiar cache
   */
  const clearCache = useCallback(() => {
    cacheRef.current.clear();
  }, []);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return {
    isChecking,
    documentExists,
    validationMessage,
    validateDocument,
    validateDocumentDebounced,
    clearValidation,
    clearCache,
  };
};

