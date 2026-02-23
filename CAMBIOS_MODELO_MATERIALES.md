# Cambios en el Modelo de Gestión de Materiales Deportivos

## Resumen del Nuevo Modelo

Según las indicaciones del profesor, el sistema ahora maneja un **stock único** en la base de datos, donde la separación entre materiales para eventos y uso interno es solo **visual en el frontend**.

### Conceptos Clave:

1. **Stock Total**: Una sola columna en la BD que contiene todos los materiales
2. **Stock Reservado**: Materiales asignados a eventos (reserva virtual, NO baja del stock)
3. **Stock Disponible**: Stock Total - Stock Reservado (calculado en frontend)
4. **Finalización de Evento**: Solo al finalizar el evento se descuenta del stock lo que realmente se usó

---

## Cambios Implementados en el Frontend

### 1. Catálogo de Materiales (`MaterialsCatalog.jsx`)

**Cambios:**
- ✅ Tabla ahora muestra: "Stock Total", "Reservado", "Disponible"
- ✅ Cálculo de stock disponible: `stockTotal - stockReservado`
- ✅ Actualizado el reporte de exportación con las nuevas columnas

**Antes:**
```javascript
stockDisponible, stockEventos, stockTotal
```

**Ahora:**
```javascript
stockTotal (único en BD)
stockReservado (asignaciones a eventos)
stockDisponible (calculado: total - reservado)
```

---

### 2. Modal de Ingreso de Materiales (`MovementModal.jsx`)

**Cambios:**
- ✅ Agregado campo "Destino del Ingreso" con opciones:
  - `USO_INTERNO`: Material para uso de la fundación
  - `EVENTOS`: Material para asignar a evento específico
  
- ✅ Selector de evento (aparece solo si destino es EVENTOS)
- ✅ Validación: evento obligatorio si destino es EVENTOS
- ✅ Integración con servicio de eventos activos

**Flujo:**
1. Usuario ingresa material
2. Selecciona destino (Uso Interno o Eventos)
3. Si es Eventos, selecciona el evento específico
4. El material se suma al stock total
5. Si es para evento, se crea una "reserva" pero NO baja del stock

---

### 3. Modal de Vista de Material (`MaterialViewModal.jsx`)

**Cambios:**
- ✅ Visualización mejorada con colores:
  - **Stock Total** (azul): Total en inventario
  - **Reservado** (ámbar): Asignado a eventos
  - **Disponible** (verde): Libre para usar
  
- ✅ Nota explicativa sobre reservas de eventos

---

### 4. Servicio de Eventos (`eventsService.js`)

**Cambios:**
- ✅ Agregado método `getActiveEvents()` para obtener eventos activos
- ✅ Usado en el modal de movimientos para selección de eventos

---

## Pendiente: Cambios en el Backend

### 1. Modelo de Base de Datos

**Tabla `materiales`:**
```sql
-- ANTES (dos columnas separadas)
stockFundacion INT
stockEventos INT

-- AHORA (una sola columna)
stock INT  -- Stock total único
```

**Tabla `asignaciones_eventos` (nueva o modificar existente):**
```sql
CREATE TABLE asignaciones_eventos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  materialId INT,
  eventoId INT,
  cantidad INT,
  fechaAsignacion DATETIME,
  estado ENUM('RESERVADO', 'USADO', 'DEVUELTO'),
  cantidadUsada INT DEFAULT 0,
  cantidadDevuelta INT DEFAULT 0,
  observaciones TEXT,
  FOREIGN KEY (materialId) REFERENCES materiales(id),
  FOREIGN KEY (eventoId) REFERENCES eventos(id)
);
```

---

### 2. Endpoints a Modificar/Crear

#### **POST /api/materials/movements** (Modificar)
Debe manejar el campo `eventoId` cuando `destinoStock === 'EVENTOS'`:

```javascript
{
  materialId: 1,
  cantidad: 50,
  destinoStock: 'EVENTOS',  // o 'USO_INTERNO'
  eventoId: 5,  // solo si destinoStock === 'EVENTOS'
  fechaIngreso: '2026-02-23',
  proveedor: 2,
  observaciones: 'Material para torneo'
}
```

**Lógica:**
1. Sumar cantidad al `stock` del material
2. Si `destinoStock === 'EVENTOS'`:
   - Crear registro en `asignaciones_eventos` con estado 'RESERVADO'
   - NO restar del stock (solo es una reserva)

---

#### **GET /api/materials** (Modificar)
Debe retornar:

```javascript
{
  id: 1,
  nombre: 'Balón fútbol #5',
  categoria: 'Balones',
  stock: 100,  // Stock total en BD
  stockReservado: 30,  // Suma de asignaciones con estado 'RESERVADO'
  // stockDisponible se calcula en frontend: stock - stockReservado
  estado: 'Activo'
}
```

**Cálculo de `stockReservado`:**
```sql
SELECT SUM(cantidad) 
FROM asignaciones_eventos 
WHERE materialId = ? AND estado = 'RESERVADO'
```

---

#### **POST /api/events/:id/finalize** (Nuevo o modificar)
Al finalizar un evento, debe permitir indicar qué materiales se usaron:

```javascript
{
  eventoId: 5,
  materialesUsados: [
    { materialId: 1, cantidadUsada: 25, cantidadDevuelta: 5 },
    { materialId: 2, cantidadUsada: 10, cantidadDevuelta: 0 }
  ]
}
```

**Lógica:**
1. Para cada material:
   - Actualizar `asignaciones_eventos`:
     - `cantidadUsada`
     - `cantidadDevuelta`
     - `estado = 'USADO'`
   - Restar `cantidadUsada` del `stock` del material
   - La `cantidadDevuelta` vuelve a estar disponible (no se resta)

2. Validación: Si `cantidadUsada + cantidadDevuelta > cantidad asignada`, mostrar error

---

#### **GET /api/events/:id/materials** (Nuevo)
Obtener materiales asignados a un evento:

```javascript
{
  success: true,
  data: [
    {
      materialId: 1,
      materialNombre: 'Balón fútbol #5',
      cantidadAsignada: 30,
      cantidadUsada: 0,
      cantidadDevuelta: 0,
      estado: 'RESERVADO',
      fechaAsignacion: '2026-02-20'
    }
  ]
}
```

---

### 3. Validaciones Importantes

#### **Al asignar materiales a evento:**
```javascript
// Validar que haya stock disponible
const stockDisponible = material.stock - material.stockReservado;
if (cantidad > stockDisponible) {
  throw new Error(`Stock insuficiente. Disponible: ${stockDisponible}, Solicitado: ${cantidad}`);
}
```

#### **Al finalizar evento:**
```javascript
// Validar que las cantidades coincidan
const asignacion = await getAsignacion(eventoId, materialId);
if (cantidadUsada + cantidadDevuelta > asignacion.cantidad) {
  throw new Error('Las cantidades no coinciden con la asignación original');
}

// Validar que haya stock suficiente para descontar
if (material.stock < cantidadUsada) {
  throw new Error('Stock insuficiente para registrar el uso');
}
```

---

## Flujo Completo del Nuevo Sistema

### Escenario 1: Ingreso para Uso Interno
1. Usuario ingresa 100 balones
2. Selecciona destino: "Uso Interno"
3. Backend: `stock += 100`
4. Frontend muestra:
   - Stock Total: 100
   - Reservado: 0
   - Disponible: 100

---

### Escenario 2: Ingreso para Evento
1. Usuario ingresa 50 conos
2. Selecciona destino: "Asignar a Evento"
3. Selecciona evento: "Torneo Infantil 2026"
4. Backend:
   - `stock += 50`
   - Crea asignación: `{ materialId, eventoId, cantidad: 50, estado: 'RESERVADO' }`
5. Frontend muestra:
   - Stock Total: 50
   - Reservado: 50
   - Disponible: 0

---

### Escenario 3: Finalizar Evento
1. Usuario finaliza "Torneo Infantil 2026"
2. Indica que se usaron 40 conos y se devolvieron 10
3. Backend:
   - Actualiza asignación: `{ cantidadUsada: 40, cantidadDevuelta: 10, estado: 'USADO' }`
   - `stock -= 40` (solo lo usado)
4. Frontend muestra:
   - Stock Total: 10 (50 - 40)
   - Reservado: 0 (ya no está reservado)
   - Disponible: 10

---

### Escenario 4: Validación de Stock Insuficiente
1. Stock Total: 100, Reservado: 80, Disponible: 20
2. Usuario intenta asignar 30 a un evento
3. Backend valida: `30 > 20` → Error
4. Frontend muestra alerta: "Stock insuficiente. Disponible: 20, Solicitado: 30"

---

## Archivos Modificados

### Frontend:
- ✅ `src/features/dashboard/pages/Admin/pages/SportsMaterials/Materials/MaterialsCatalog.jsx`
- ✅ `src/features/dashboard/pages/Admin/pages/SportsMaterials/Materials/components/MaterialViewModal.jsx`
- ✅ `src/features/dashboard/pages/Admin/pages/SportsMaterials/MaterialsMovements/components/MovementModal.jsx`
- ✅ `src/features/dashboard/pages/Admin/pages/Events/services/eventsService.js`

### Backend (Pendiente):
- ⏳ Modelo `materiales`: cambiar a columna única `stock`
- ⏳ Crear/modificar tabla `asignaciones_eventos`
- ⏳ Modificar endpoint `POST /api/materials/movements`
- ⏳ Modificar endpoint `GET /api/materials` (incluir `stockReservado`)
- ⏳ Crear endpoint `POST /api/events/:id/finalize`
- ⏳ Crear endpoint `GET /api/events/:id/materials`
- ⏳ Agregar validaciones de stock disponible

---

## Próximos Pasos

1. **Coordinar con backend** para implementar los cambios en la BD
2. **Crear módulo de finalización de eventos** en el frontend
3. **Agregar alertas** cuando stock disponible sea bajo
4. **Implementar historial** de asignaciones por evento
5. **Testing** completo del flujo de reservas y finalizaciones

---

## Notas Importantes

- ⚠️ **No eliminar columnas antiguas** hasta confirmar que el nuevo modelo funciona
- ⚠️ **Migración de datos**: convertir `stockFundacion + stockEventos` a `stock` único
- ⚠️ **Eventos en curso**: manejar eventos que ya tienen materiales asignados en el modelo antiguo
- ⚠️ **Permisos**: verificar que los roles tengan permisos para finalizar eventos

---

**Fecha de implementación frontend:** 23 de febrero de 2026  
**Estado:** Frontend completado, pendiente backend
