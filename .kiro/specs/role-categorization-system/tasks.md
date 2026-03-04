# Plan de Implementación - Sistema de Categorización de Roles

## Fase 1: Fundamentos y Utilidades

- [ ] 1. Crear configuración centralizada de categorías de roles
  - Crear archivo `src/shared/constants/roleCategories.js` con categorías y palabras clave
  - Definir constantes para TRAINER, ADMIN, ATHLETE, GUARDIAN
  - Mapear palabras clave en español e inglés para cada categoría
  - _Requirements: 2.1, 2.2_

- [ ] 2. Implementar servicio de categorización automática
  - Crear `src/shared/services/roleCategorizer.js`
  - Implementar función `categorizeRole()` que detecte categoría por palabras clave
  - Implementar función `normalizeText()` para limpiar y normalizar texto
  - Manejar casos edge: texto vacío, null, undefined
  - _Requirements: 3.1, 3.2, 3.3_

- [ ]* 2.1 Escribir tests unitarios para RoleCategorizer
  - Test para normalización de texto con acentos, espacios, mayúsculas
  - Test para detección de categorías con diferentes variaciones de nombres
  - Test para casos edge y manejo de errores
  - _Requirements: 3.1, 3.2, 3.3_

- [ ] 3. Crear utilidad de filtrado por categoría
  - Crear `src/shared/utils/roleFilter.js`
  - Implementar `filterUsersByRoleCategory()` con doble verificación
  - Agregar fallback a detección automática si no hay categoría asignada
  - Mantener retrocompatibilidad con método anterior
  - _Requirements: 1.3, 5.1, 5.2_

- [ ]* 3.1 Escribir property tests para filtrado de roles
  - **Property 1: Categorización consistente**
  - **Validates: Requirements 1.2, 3.1**
  - **Property 2: Filtrado inclusivo**  
  - **Validates: Requirements 1.3, 5.2**

## Fase 2: Integración con Sistema Existente

- [ ] 4. Actualizar TeamsService para usar nuevo sistema
  - Modificar `getTrainers()` para usar `filterUsersByRoleCategory(users, 'trainer')`
  - Mantener filtro anterior como fallback durante transición
  - Agregar logging para monitorear efectividad del nuevo sistema
  - _Requirements: 1.2, 1.3, 5.1_

- [ ]* 4.1 Escribir tests de integración para TeamsService
  - Test que verifique que entrenadores con diferentes nombres de rol sean incluidos
  - Test de retrocompatibilidad con roles sin categoría
  - Test de fallback cuando falla detección automática
  - _Requirements: 1.3, 5.1, 5.2_

- [ ] 5. Crear hook para gestión de categorías de roles
  - Crear `src/shared/hooks/useRoleCategories.js`
  - Implementar funciones para obtener, asignar y actualizar categorías
  - Agregar cache para mejorar performance
  - _Requirements: 2.1, 2.3_

- [ ] 6. Checkpoint - Verificar funcionamiento básico
  - Ensure all tests pass, ask the user if questions arise.

## Fase 3: Interfaz de Usuario

- [ ] 7. Agregar campo de categorías al formulario de roles
  - Modificar `RoleModal.jsx` para incluir selector de categorías
  - Crear componente `CategorySelector` con checkboxes múltiples
  - Implementar validación: al menos una categoría debe estar seleccionada
  - _Requirements: 1.1, 1.4_

- [ ] 8. Crear herramienta de detección automática de categorías
  - Agregar botón "Detectar automáticamente" en formulario de roles
  - Mostrar sugerencias basadas en el nombre del rol
  - Permitir confirmación/modificación manual de sugerencias
  - _Requirements: 3.1, 3.4_

- [ ]* 8.1 Escribir tests para componentes de UI
  - Test para CategorySelector con múltiples selecciones
  - Test para detección automática y sugerencias
  - Test para validación de formulario
  - _Requirements: 1.1, 3.1, 3.4_

## Fase 4: Backend y Migración

- [ ] 9. Actualizar modelo de datos en backend
  - Agregar campo `categories` tipo JSON a tabla `roles`
  - Crear migración de base de datos
  - Actualizar validaciones del modelo Role
  - _Requirements: 4.1, 4.2_

- [ ] 10. Implementar endpoints para gestión de categorías
  - Crear endpoint `PUT /roles/:id/categories` para actualizar categorías
  - Crear endpoint `GET /roles/categories` para obtener categorías disponibles
  - Agregar validación de categorías válidas
  - _Requirements: 1.1, 2.1_

- [ ] 11. Crear servicio de migración automática
  - Crear `MigrationService` que analice roles existentes
  - Implementar detección automática masiva con reporte
  - Crear endpoint `POST /roles/migrate-categories` para ejecutar migración
  - Generar reporte de roles categorizados vs pendientes
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ]* 11.1 Escribir property test para migración
  - **Property 5: Migración sin pérdida de datos**
  - **Validates: Requirements 4.1, 4.4**

## Fase 5: Monitoreo y Optimización

- [ ] 12. Implementar sistema de logging y monitoreo
  - Agregar logs cuando se usa fallback a método anterior
  - Crear métricas de efectividad del nuevo sistema
  - Implementar alertas para roles sin categoría detectada
  - _Requirements: 2.4, 5.4, 5.5_

- [ ] 13. Crear herramienta de administración de categorías
  - Crear página de administración para revisar roles sin categoría
  - Implementar interfaz para asignación manual masiva
  - Agregar estadísticas de cobertura de categorización
  - _Requirements: 4.3, 4.4_

- [ ]* 13.1 Escribir tests de performance
  - Test de carga para filtrado con grandes volúmenes de usuarios
  - Test de cache para hook de categorías
  - Test de tiempo de respuesta para detección automática
  - _Requirements: 2.3_

## Fase 6: Documentación y Despliegue

- [ ] 14. Crear documentación para administradores
  - Guía de uso del nuevo sistema de categorías
  - Instrucciones para migración de roles existentes
  - Troubleshooting para casos comunes
  - _Requirements: 4.4, 5.5_

- [ ] 15. Checkpoint final - Verificar sistema completo
  - Ensure all tests pass, ask the user if questions arise.
  - Verificar que todos los filtros de roles usen el nuevo sistema
  - Confirmar retrocompatibilidad con datos existentes
  - Validar performance en ambiente de producción

## Notas de Implementación

- **Prioridad Alta**: Fases 1-2 (solución inmediata al problema actual)
- **Prioridad Media**: Fases 3-4 (mejoras de UX y persistencia)  
- **Prioridad Baja**: Fases 5-6 (optimización y documentación)

- **Rollback Plan**: Mantener método anterior como fallback durante toda la implementación
- **Testing**: Cada fase incluye tests específicos marcados con *
- **Performance**: Implementar cache y optimizaciones desde el inicio