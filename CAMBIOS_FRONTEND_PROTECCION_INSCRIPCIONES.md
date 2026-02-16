# Cambios Frontend - Protección de Inscripciones al Editar Eventos

## Resumen de Implementación

Se implementó un sistema de protección que verifica y alerta al usuario cuando al editar las categorías de un evento se van a eliminar inscripciones existentes.

## Archivos Modificados

### 1. `services/eventsService.js`

**Nuevo método agregado:**

```javascript
async checkAffectedRegistrations(eventId, categoryIds) {
  try {
    const response = await apiClient.post(
      `${this.endpoint}/${eventId}/check-affected-registrations`,
      { categoryIds }
    );
    return response;
  } catch (error) {
    throw error;
  }
}
```

**Funcionalidad:**

- Llama al endpoint del backend para verificar inscripciones afectadas
- Recibe el ID del evento y las nuevas categorías
- Retorna información sobre equipos y deportistas que serían eliminados

---

### 2. `hooks/useEvents.js`

**Método `updateEvent` modificado:**

**Antes:**

```javascript
const updateEvent = useCallback(
  async (id, eventData) => {
    setLoading(true);
    try {
      const backendData = transformEventToBackend(eventData);
      const response = await eventsService.update(id, backendData);
      // ... resto del código
    }
  },
  [loadEvents],
);
```

**Después:**

```javascript
const updateEvent = useCallback(
  async (id, eventData, originalCategoryIds = []) => {
    setLoading(true);
    try {
      const backendData = transformEventToBackend(eventData);

      // 1. Verificar si las categorías cambiaron
      const newCategoryIds = backendData.categoryIds || [];
      const categoriesChanged = !arraysEqual(
        originalCategoryIds.sort((a, b) => a - b),
        newCategoryIds.sort((a, b) => a - b)
      );

      // 2. Si cambiaron, verificar inscripciones afectadas
      if (categoriesChanged && newCategoryIds.length > 0) {
        const checkResult = await eventsService.checkAffectedRegistrations(
          id,
          newCategoryIds
        );

        // 3. Si hay inscripciones afectadas, mostrar alerta
        if (checkResult.success && checkResult.data.hasAffectedRegistrations) {
          // Construir mensaje HTML con detalles
          // Mostrar alerta de confirmación con SweetAlert2
          // Si el usuario cancela, retornar sin actualizar
        }
      }

      // 4. Proceder con la actualización
      const response = await eventsService.update(id, backendData);
      // ... resto del código
    }
  },
  [loadEvents],
);
```

**Nueva función auxiliar agregada:**

```javascript
const arraysEqual = (a, b) => {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
};
```

**Características:**

- ✅ Compara categorías originales vs nuevas
- ✅ Solo verifica si las categorías cambiaron
- ✅ Muestra alerta detallada con SweetAlert2
- ✅ Lista equipos y deportistas afectados
- ✅ Permite cancelar la operación
- ✅ Importa SweetAlert2 dinámicamente

---

### 3. `components/eventManage/EventsCalendar.jsx`

**Método `handleSaveEvent` modificado:**

**Antes:**

```javascript
const handleSaveEvent = useCallback(
  async (newEventData) => {
    try {
      const transformedData = transformFormDataForBackend(newEventData);
      if (isNew) {
        await onCreateEvent(transformedData);
      } else {
        await onUpdateEvent(transformedData.id, transformedData);
      }
      setIsModalOpen(false);
    } catch (error) {
      // ...
    }
  },
  [isNew, onCreateEvent, onUpdateEvent],
);
```

**Después:**

```javascript
const handleSaveEvent = useCallback(
  async (newEventData) => {
    try {
      const transformedData = transformFormDataForBackend(newEventData);
      if (isNew) {
        await onCreateEvent(transformedData);
      } else {
        // Pasar las categorías originales para verificar cambios
        const originalCategoryIds = selectedEvent?.categoryIds || [];
        await onUpdateEvent(
          transformedData.id,
          transformedData,
          originalCategoryIds,
        );
      }
      setIsModalOpen(false);
    } catch (error) {
      // ...
    }
  },
  [isNew, onCreateEvent, onUpdateEvent, selectedEvent],
);
```

**Cambios:**

- ✅ Extrae `categoryIds` del evento seleccionado
- ✅ Pasa las categorías originales a `onUpdateEvent`
- ✅ Agrega `selectedEvent` a las dependencias del useCallback

---

### 4. `EventsDashboard.jsx`

**Método `handleSave` modificado:**

**Antes:**

```javascript
const handleSave = async (eventData) => {
  try {
    if (isNew) {
      await createEvent(eventData);
    } else {
      await updateEvent(eventData.id, eventData);
    }
    setIsModalOpen(false);
    setRefreshTrigger((prev) => prev + 1);
  } catch (error) {
    // ...
  }
};
```

**Después:**

```javascript
const handleSave = async (eventData) => {
  try {
    if (isNew) {
      await createEvent(eventData);
    } else {
      // Pasar las categorías originales para verificar cambios
      const originalCategoryIds = selectedEvent?.categoryIds || [];
      await updateEvent(eventData.id, eventData, originalCategoryIds);
    }
    setIsModalOpen(false);
    setRefreshTrigger((prev) => prev + 1);
  } catch (error) {
    // ...
  }
};
```

**Cambios:**

- ✅ Extrae `categoryIds` del evento seleccionado
- ✅ Pasa las categorías originales a `updateEvent`

---

## Flujo de Usuario

### Escenario 1: Editar evento sin cambiar categorías

1. Usuario abre modal de edición
2. Modifica nombre, fecha, etc. (sin tocar categorías)
3. Guarda
4. ✅ Se actualiza sin mostrar alerta

### Escenario 2: Editar evento agregando categorías

1. Usuario abre modal de edición
2. Agrega nuevas categorías (sin quitar existentes)
3. Guarda
4. ✅ Se actualiza sin mostrar alerta (no hay inscripciones afectadas)

### Escenario 3: Editar evento quitando categorías SIN inscripciones

1. Usuario abre modal de edición
2. Quita una o más categorías
3. Guarda
4. Backend verifica: no hay inscripciones en esas categorías
5. ✅ Se actualiza sin mostrar alerta

### Escenario 4: Editar evento quitando categorías CON inscripciones

1. Usuario abre modal de edición
2. Quita categoría "PreJuvenil"
3. Guarda
4. Frontend llama a `checkAffectedRegistrations`
5. Backend responde: 3 equipos y 5 deportistas afectados
6. ⚠️ Se muestra alerta de confirmación:

```
⚠️ Advertencia: Inscripciones Afectadas

Se eliminarán las siguientes categorías: PreJuvenil

Esto afectará a 8 inscripción(es):

📋 Equipos (3):
  • Invitados PreJuvenil - PreJuvenil
  • Visitantes PreJuvenil - PreJuvenil
  • Astrostar PreJuvenil - PreJuvenil

👤 Deportistas (5):
  • María García - PreJuvenil
  • Juan Pérez - PreJuvenil
  • Ana López - PreJuvenil
  • Carlos Ruiz - PreJuvenil
  • Laura Martínez - PreJuvenil

⚠️ Esta acción no se puede deshacer

[Cancelar] [Sí, continuar]
```

7a. Si usuario cancela:

- ❌ No se actualiza el evento
- Modal permanece abierto
- Puede corregir o cerrar

7b. Si usuario confirma:

- ✅ Se actualiza el evento
- Se eliminan solo las 8 inscripciones de PreJuvenil
- Se mantienen las inscripciones de otras categorías
- Modal se cierra
- Calendario se actualiza

---

## Ejemplo de Alerta (HTML generado)

```html
<div class="text-left">
  <p class="mb-3">
    Se eliminarán las siguientes categorías:
    <strong class="text-red-600">PreJuvenil</strong>
  </p>

  <p class="mb-3">
    Esto afectará a <strong class="text-red-600">8</strong> inscripción(es):
  </p>

  <div class="mb-3">
    <p class="font-semibold text-gray-700">📋 Equipos (3):</p>
    <ul class="list-disc pl-5 text-sm">
      <li>
        Invitados PreJuvenil - <span class="text-gray-600">PreJuvenil</span>
      </li>
      <li>
        Visitantes PreJuvenil - <span class="text-gray-600">PreJuvenil</span>
      </li>
      <li>
        Astrostar PreJuvenil - <span class="text-gray-600">PreJuvenil</span>
      </li>
    </ul>
  </div>

  <div class="mb-3">
    <p class="font-semibold text-gray-700">👤 Deportistas (5):</p>
    <ul class="list-disc pl-5 text-sm">
      <li>María García - <span class="text-gray-600">PreJuvenil</span></li>
      <li>Juan Pérez - <span class="text-gray-600">PreJuvenil</span></li>
      <li>Ana López - <span class="text-gray-600">PreJuvenil</span></li>
      <li>Carlos Ruiz - <span class="text-gray-600">PreJuvenil</span></li>
      <li>Laura Martínez - <span class="text-gray-600">PreJuvenil</span></li>
    </ul>
  </div>

  <p class="mt-4 text-red-600 font-semibold">
    ⚠️ Esta acción no se puede deshacer
  </p>
</div>
```

---

## Dependencias

### SweetAlert2

Se importa dinámicamente para no afectar el bundle inicial:

```javascript
const Swal = (await import("sweetalert2")).default;
```

**Configuración de la alerta:**

```javascript
await Swal.fire({
  title: "⚠️ Advertencia: Inscripciones Afectadas",
  html: htmlMessage,
  icon: "warning",
  showCancelButton: true,
  confirmButtonColor: "#d33",
  cancelButtonColor: "#3085d6",
  confirmButtonText: "Sí, continuar",
  cancelButtonText: "Cancelar",
  width: "600px",
  customClass: {
    popup: "swal-wide",
    htmlContainer: "text-left",
  },
});
```

---

## Ventajas de la Implementación

1. ✅ **No invasiva**: Solo se activa cuando las categorías cambian
2. ✅ **Informativa**: Muestra exactamente qué se va a eliminar
3. ✅ **Reversible**: Usuario puede cancelar en cualquier momento
4. ✅ **Eficiente**: Solo hace la verificación cuando es necesario
5. ✅ **Consistente**: Funciona igual desde calendario y dashboard
6. ✅ **Segura**: Doble validación (frontend y backend)
7. ✅ **Clara**: Mensajes descriptivos y bien formateados

---

## Testing Recomendado

### Caso 1: Sin cambios en categorías

- ✅ Editar nombre, fecha, ubicación
- ✅ Guardar
- ✅ Verificar que NO aparece alerta
- ✅ Verificar que se actualiza correctamente

### Caso 2: Agregar categorías

- ✅ Agregar nueva categoría
- ✅ Guardar
- ✅ Verificar que NO aparece alerta
- ✅ Verificar que se actualiza correctamente

### Caso 3: Quitar categoría sin inscripciones

- ✅ Quitar categoría que no tiene inscripciones
- ✅ Guardar
- ✅ Verificar que NO aparece alerta
- ✅ Verificar que se actualiza correctamente

### Caso 4: Quitar categoría con inscripciones

- ✅ Quitar categoría con inscripciones
- ✅ Guardar
- ✅ Verificar que APARECE alerta
- ✅ Verificar que muestra equipos correctos
- ✅ Verificar que muestra deportistas correctos
- ✅ Verificar conteo total

### Caso 5: Cancelar operación

- ✅ Quitar categoría con inscripciones
- ✅ Guardar
- ✅ Aparece alerta
- ✅ Click en "Cancelar"
- ✅ Verificar que NO se actualiza el evento
- ✅ Verificar que modal permanece abierto
- ✅ Verificar que NO se eliminan inscripciones

### Caso 6: Confirmar operación

- ✅ Quitar categoría con inscripciones
- ✅ Guardar
- ✅ Aparece alerta
- ✅ Click en "Sí, continuar"
- ✅ Verificar que se actualiza el evento
- ✅ Verificar que se eliminan SOLO inscripciones de esa categoría
- ✅ Verificar que se mantienen otras inscripciones
- ✅ Verificar que modal se cierra
- ✅ Verificar que calendario se actualiza

---

## Notas Técnicas

1. **Comparación de arrays**: Se usa una función auxiliar `arraysEqual` que ordena los arrays antes de comparar para evitar falsos positivos por diferente orden.

2. **Importación dinámica**: SweetAlert2 se importa solo cuando se necesita para no aumentar el bundle inicial.

3. **Manejo de errores**: Si la verificación falla, se muestra un error pero no se bloquea la actualización (el backend tiene su propia validación).

4. **Estado del modal**: Si el usuario cancela, el modal permanece abierto para que pueda corregir o intentar de nuevo.

5. **Actualización del calendario**: Después de una actualización exitosa, se recarga la lista de eventos para reflejar los cambios.

---

## Compatibilidad

- ✅ Compatible con eventos nuevos (no verifica categorías)
- ✅ Compatible con eventos sin categorías
- ✅ Compatible con eventos con múltiples categorías
- ✅ Compatible con inscripciones de equipos
- ✅ Compatible con inscripciones de deportistas
- ✅ Compatible con ambos tipos de inscripciones simultáneamente
