# Debug - Protección de Inscripciones

## Problema Reportado

1. Al quitar una categoría que tiene equipos inscritos, NO aparece la alerta
2. Al cambiar o quitar una categoría, se borran TODOS los equipos inscritos

## Correcciones Aplicadas

### 1. Función `arraysEqual` movida antes del `useCallback`

**Problema:** La función estaba definida después del `useCallback` que la usaba, causando que no estuviera disponible.

**Solución:** Movida antes de `updateEvent` para que esté disponible cuando se necesite.

### 2. Logs de Debug Agregados

Se agregaron logs en consola para rastrear el flujo:

```javascript
console.log("🔍 DEBUG - Verificando cambios de categorías:");
console.log("  Original categoryIds:", originalCategoryIds);
console.log("  Nuevas categoryIds:", backendData.categoryIds);
console.log("  Categorías cambiaron:", categoriesChanged);
```

### 3. Corrección en comparación de arrays

**Antes:**

```javascript
const categoriesChanged = !arraysEqual(
  originalCategoryIds.sort((a, b) => a - b),
  newCategoryIds.sort((a, b) => a - b),
);
```

**Problema:** Modificaba los arrays originales al ordenarlos.

**Después:**

```javascript
const originalSorted = [...originalCategoryIds].sort((a, b) => a - b);
const newSorted = [...newCategoryIds].sort((a, b) => a - b);
const categoriesChanged = !arraysEqual(originalSorted, newSorted);
```

**Solución:** Crea copias de los arrays antes de ordenarlos.

## Cómo Verificar que Funciona

### Paso 1: Abrir Consola del Navegador

1. Presiona F12 en el navegador
2. Ve a la pestaña "Console"
3. Deja la consola abierta mientras pruebas

### Paso 2: Editar un Evento

1. Abre un evento que tenga equipos inscritos
2. Edita las categorías (quita una que tenga equipos)
3. Guarda

### Paso 3: Verificar Logs en Consola

Deberías ver algo como:

```
🔍 DEBUG - Verificando cambios de categorías:
  Original categoryIds: [1, 2, 3]
  Nuevas categoryIds: [1, 3]
  Categorías cambiaron: true
  ✅ Verificando inscripciones afectadas...
  Resultado de verificación: {success: true, data: {...}}
  ⚠️ Inscripciones afectadas encontradas: 5
```

### Paso 4: Verificar Alerta

Si hay inscripciones afectadas, debe aparecer una alerta de SweetAlert2 con:

- Título: "⚠️ Advertencia: Inscripciones Afectadas"
- Lista de equipos afectados
- Lista de deportistas afectados
- Botones: "Cancelar" y "Sí, continuar"

## Posibles Problemas y Soluciones

### Problema 1: No aparecen logs en consola

**Causa:** El código no se está ejecutando.

**Verificar:**

1. ¿Se guardó el archivo?
2. ¿Se recargó la aplicación?
3. ¿Hay errores en consola?

**Solución:** Recargar la página con Ctrl+F5 (recarga forzada).

---

### Problema 2: Logs muestran "Categorías cambiaron: false"

**Causa:** Las categorías originales no se están pasando correctamente.

**Verificar en consola:**

```
Original categoryIds: []  ← PROBLEMA: está vacío
Nuevas categoryIds: [1, 3]
```

**Solución:** Verificar que `selectedEvent.categoryIds` tenga datos cuando se abre el modal de edición.

**Dónde verificar:**

- `EventsCalendar.jsx` línea ~440: `categoryIds: dashboardEvent.categoryIds || []`
- `EventsDashboard.jsx` línea ~110: `const originalCategoryIds = selectedEvent?.categoryIds || []`

---

### Problema 3: Logs muestran "No se verifican inscripciones"

**Causa:** La condición no se cumple.

**Verificar:**

```javascript
if (categoriesChanged && newCategoryIds.length > 0)
```

**Posibles razones:**

- `categoriesChanged` es `false` (categorías no cambiaron)
- `newCategoryIds.length` es 0 (no hay categorías nuevas)

---

### Problema 4: Error al llamar `checkAffectedRegistrations`

**Causa:** El endpoint del backend no está disponible o hay un error.

**Verificar en consola:**

```
❌ Error en updateEvent: Error: ...
```

**Solución:**

1. Verificar que el backend esté corriendo
2. Verificar que la ruta esté correcta: `POST /api/events/:id/check-affected-registrations`
3. Verificar logs del backend

---

### Problema 5: Alerta no aparece aunque hay inscripciones

**Causa:** `checkResult.data.hasAffectedRegistrations` es `false`.

**Verificar en consola:**

```
Resultado de verificación: {
  success: true,
  data: {
    hasAffectedRegistrations: false,  ← PROBLEMA
    affectedTeams: [],
    affectedAthletes: [],
    totalAffected: 0
  }
}
```

**Causa posible:** El backend no está encontrando las inscripciones.

**Verificar en backend:**

1. ¿Los equipos tienen el campo `category` con el nombre correcto?
2. ¿Las categorías deportivas tienen el campo `nombre` correcto?
3. ¿La comparación es case-sensitive?

---

### Problema 6: Se borran todos los equipos

**Causa:** El backend está eliminando todas las inscripciones en lugar de solo las afectadas.

**Verificar en logs del backend:**

```
🗑️ Eliminando inscripciones de categorías removidas del evento 5: PreJuvenil
✅ Eliminados 3 equipos y 5 deportistas de categorías removidas
```

Si no ves estos logs, el código del backend no se está ejecutando correctamente.

**Verificar en `events.repository.js`:**

- Método `update()` línea ~490
- Debe tener el código que identifica categorías removidas
- Debe eliminar solo inscripciones de esas categorías

---

## Checklist de Verificación

### Frontend

- [ ] Archivo `useEvents.js` tiene la función `arraysEqual` ANTES de `updateEvent`
- [ ] Método `updateEvent` recibe 3 parámetros: `(id, eventData, originalCategoryIds)`
- [ ] `EventsCalendar.jsx` pasa `originalCategoryIds` al llamar `onUpdateEvent`
- [ ] `EventsDashboard.jsx` pasa `originalCategoryIds` al llamar `updateEvent`
- [ ] Logs de debug aparecen en consola al editar evento
- [ ] SweetAlert2 está instalado (`npm list sweetalert2`)

### Backend

- [ ] Archivo `events.repository.js` tiene método `checkAffectedRegistrations`
- [ ] Archivo `events.repository.js` método `update` identifica categorías removidas
- [ ] Archivo `events.repository.js` método `update` elimina solo inscripciones afectadas
- [ ] Archivo `events.services.js` tiene método `checkAffectedRegistrations`
- [ ] Archivo `events.controller.js` tiene método `checkAffectedRegistrations`
- [ ] Archivo `events.routes.js` tiene ruta `POST /:id/check-affected-registrations`
- [ ] Backend está corriendo sin errores

### Base de Datos

- [ ] Tabla `teams` tiene campo `category` con valores correctos
- [ ] Tabla `sports_categories` tiene campo `nombre` con valores correctos
- [ ] Los valores de `teams.category` coinciden con `sports_categories.nombre`
- [ ] Hay inscripciones en la tabla `participants` con `type = 'Team'`

---

## Comando para Verificar Datos en BD

```sql
-- Ver equipos y sus categorías
SELECT id, name, category, teamType, status FROM teams WHERE status = 'Active';

-- Ver categorías deportivas
SELECT id, nombre FROM sports_categories;

-- Ver inscripciones de equipos
SELECT
  p.id,
  p.serviceId,
  t.name as teamName,
  t.category as teamCategory,
  p.status
FROM participants p
JOIN teams t ON p.teamId = t.id
WHERE p.type = 'Team';

-- Ver categorías de un evento específico
SELECT
  s.id as eventId,
  s.name as eventName,
  sc.nombre as categoryName
FROM service s
JOIN service_sports_categories ssc ON s.id = ssc.serviceId
JOIN sports_categories sc ON ssc.sportsCategoryId = sc.id
WHERE s.id = 1; -- Cambiar por el ID del evento
```

---

## Próximos Pasos

1. **Abrir consola del navegador** (F12)
2. **Editar un evento** que tenga equipos inscritos
3. **Quitar una categoría** que tenga equipos
4. **Guardar** y observar los logs
5. **Reportar** qué logs aparecen en consola
6. **Capturar** cualquier error que aparezca

Con esta información podremos identificar exactamente dónde está el problema.
