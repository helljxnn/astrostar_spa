# 📋 Guía de Integración - Módulo de Materiales Deportivos

## 📌 Propósito de este Documento

Este documento explica cómo integrar el módulo de **Materiales Deportivos** con los módulos de **Eventos** y **Donaciones**. Está diseñado para que el equipo de desarrollo pueda implementar estas integraciones de forma consistente y profesional.

---

## 🎯 Contexto General del Módulo de Materiales

### ¿Qué es el Módulo de Materiales?

El módulo de Materiales Deportivos gestiona el inventario de implementos deportivos de la fundación con un sistema de **inventario dual**:

- **Inventario Fundación**: Stock general de la fundación
- **Inventario Eventos**: Stock destinado exclusivamente para eventos

### Conceptos Clave

1. **Material**: Un tipo de implemento deportivo (ej: Balones, Conos, Camisetas)
2. **Categoría**: Clasificación de materiales (ej: Implementos Técnicos de Campo)
3. **Stock**: Cantidad disponible en cada inventario
4. **Movimiento**: Registro de entrada/salida/transferencia/baja
5. **Reservación**: Stock asignado a un evento pero no descontado aún

---

## 📊 Arquitectura del Sistema de Materiales

### Flujo de Stock

```
┌─────────────────────────────────────────────────────────────┐
│                    INGRESO DE MATERIALES                     │
│  (Compra, Donación, Ajuste)                                 │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
        ┌────────────────────────────┐
        │   INVENTARIO FUNDACIÓN     │
        │   (Stock General)          │
        └────────┬───────────────────┘
                 │
                 │ Transferencia
                 │
                 ▼
        ┌────────────────────────────┐
        │   INVENTARIO EVENTOS       │
        │   (Stock para Eventos)     │
        └────────┬───────────────────┘
                 │
                 │ Asignación/Reserva
                 │
                 ▼
        ┌────────────────────────────┐
        │   EVENTO ESPECÍFICO        │
        │   (Stock Reservado)        │
        └────────┬───────────────────┘
                 │
                 │ Al Finalizar Evento
                 │
                 ▼
        ┌────────────────────────────┐
        │   DESCUENTO DEFINITIVO     │
        │   (Stock se consume)       │
        └────────────────────────────┘
```


---

## 🔗 INTEGRACIÓN 1: Módulo de EVENTOS

### Estado Actual

✅ **Backend**: Completamente implementado
✅ **Componentes Frontend**: Creados pero no integrados
⚠️ **Pendiente**: Integrar componentes en las vistas de eventos

### Componentes Disponibles

#### 1. `AssignMaterialModal.jsx`
**Ubicación**: `src/features/dashboard/pages/Admin/pages/SportsMaterials/Materials/components/`

**Propósito**: Asignar materiales a un evento (reservar stock)

**Props**:
```javascript
{
  isOpen: boolean,
  onClose: function,
  eventoId: number,
  onSave: async function
}
```

**Uso**:
```jsx
import AssignMaterialModal from 'path/to/AssignMaterialModal';

<AssignMaterialModal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  eventoId={evento.id}
  onSave={handleSaveMaterial}
/>
```

#### 2. `EventMaterialsSection.jsx`
**Ubicación**: `src/features/dashboard/pages/Admin/pages/SportsMaterials/Materials/components/`

**Propósito**: Mostrar lista de materiales asignados a un evento

**Props**:
```javascript
{
  eventoId: number,
  eventoNombre: string,
  eventoEstado: string
}
```

**Uso**:
```jsx
import EventMaterialsSection from 'path/to/EventMaterialsSection';

<EventMaterialsSection
  eventoId={evento.id}
  eventoNombre={evento.nombre}
  eventoEstado={evento.estado}
/>
```

### Servicio Disponible

#### `EventMaterialsService.js`
**Ubicación**: `src/features/dashboard/pages/Admin/pages/SportsMaterials/Materials/services/`

**Métodos disponibles**:

```javascript
// Obtener materiales asignados a un evento
await eventMaterialsService.getEventMaterials(eventoId);

// Asignar material a un evento
await eventMaterialsService.assignMaterial(eventoId, {
  materialId: number,
  cantidad: number,
  observaciones: string
});

// Liberar material de un evento
await eventMaterialsService.releaseMaterial(eventoId, materialId);

// Actualizar cantidad asignada
await eventMaterialsService.updateAssignment(eventoId, materialId, {
  cantidad: number,
  observaciones: string
});
```


### Pasos para Integrar en Eventos

#### Paso 1: Agregar Pestaña de Materiales en Vista de Evento

En el componente de detalle/edición de evento, agregar una nueva pestaña:

```jsx
// En tu componente de Evento (ej: EventDetail.jsx)
import { useState } from 'react';
import EventMaterialsSection from '../SportsMaterials/Materials/components/EventMaterialsSection';

const EventDetail = ({ evento }) => {
  const [activeTab, setActiveTab] = useState('info'); // 'info', 'teams', 'materials'

  return (
    <div>
      {/* Pestañas */}
      <div className="tabs">
        <button onClick={() => setActiveTab('info')}>Información</button>
        <button onClick={() => setActiveTab('teams')}>Equipos</button>
        <button onClick={() => setActiveTab('materials')}>Materiales</button>
      </div>

      {/* Contenido */}
      {activeTab === 'info' && <EventInfo evento={evento} />}
      {activeTab === 'teams' && <EventTeams evento={evento} />}
      {activeTab === 'materials' && (
        <EventMaterialsSection
          eventoId={evento.id}
          eventoNombre={evento.nombre}
          eventoEstado={evento.estado}
        />
      )}
    </div>
  );
};
```

#### Paso 2: Validaciones Importantes

**Al finalizar un evento**:
```javascript
// Antes de cambiar estado a "Finalizado"
const materialsResponse = await eventMaterialsService.getEventMaterials(eventoId);

if (materialsResponse.success && materialsResponse.data.length > 0) {
  // Mostrar confirmación
  const confirm = await showConfirmAlert(
    'Finalizar Evento',
    `Este evento tiene ${materialsResponse.data.length} materiales asignados. Al finalizar, el stock se descontará definitivamente. ¿Continuar?`
  );
  
  if (!confirm.isConfirmed) return;
}

// Proceder a finalizar evento
```

**Al cancelar un evento**:
```javascript
// El stock reservado se liberará automáticamente
// El backend maneja esto en el endpoint de cancelación
```

#### Paso 3: Endpoints del Backend

**Base URL**: `/api/events/:eventoId/materials`

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/events/:eventoId/materials` | Obtener materiales del evento |
| POST | `/api/events/:eventoId/materials` | Asignar material al evento |
| PUT | `/api/events/:eventoId/materials/:materialId` | Actualizar asignación |
| DELETE | `/api/events/:eventoId/materials/:materialId` | Liberar material |

**Ejemplo de Request (Asignar Material)**:
```json
POST /api/events/123/materials
{
  "materialId": 5,
  "cantidad": 10,
  "observaciones": "Para torneo infantil"
}
```

**Ejemplo de Response**:
```json
{
  "success": true,
  "message": "Material asignado correctamente",
  "data": {
    "id": 1,
    "eventoId": 123,
    "materialId": 5,
    "materialNombre": "Balones #5",
    "cantidad": 10,
    "stockReservado": 10,
    "observaciones": "Para torneo infantil"
  }
}
```


### Reglas de Negocio - Eventos

1. **Solo se pueden asignar materiales del Inventario de Eventos**
2. **El stock se RESERVA pero NO se descuenta** al asignar
3. **El stock se DESCUENTA definitivamente** cuando el evento se finaliza
4. **El stock se LIBERA** si el evento se cancela
5. **No se puede eliminar un evento** que tenga materiales asignados sin liberarlos primero
6. **No se puede asignar más cantidad** de la disponible en stock de eventos

### Flujo Completo - Eventos

```
1. Usuario crea evento → Estado: "Programado"
2. Usuario asigna materiales → Stock se RESERVA
3. Evento se realiza → Estado: "En Curso"
4. Evento termina → Usuario marca como "Finalizado"
5. Sistema descuenta stock definitivamente
6. Materiales quedan registrados en historial del evento
```

### Casos Especiales

**¿Qué pasa si se cancela un evento con materiales asignados?**
- El stock reservado se libera automáticamente
- Los materiales vuelven a estar disponibles para otros eventos
- Queda registro en el historial de que fueron asignados y liberados

**¿Se puede modificar la cantidad después de asignar?**
- Sí, mientras el evento no esté finalizado
- Se puede aumentar (si hay stock disponible) o disminuir

**¿Se puede eliminar un evento con materiales?**
- No directamente
- Primero se deben liberar todos los materiales
- Luego se puede eliminar el evento

---

## 🎁 INTEGRACIÓN 2: Módulo de DONACIONES

### Estado Actual

❌ **Backend**: NO implementado
❌ **Frontend**: NO implementado
⚠️ **Requiere**: Desarrollo completo de la integración

### Objetivo

Permitir que cuando se registre una donación de tipo "Implementación deportiva", se puedan especificar materiales concretos y que automáticamente se registre el ingreso en el inventario.

### Arquitectura Propuesta

```
┌─────────────────────────────────────┐
│   Usuario registra Donación        │
│   Tipo: "En especie"                │
│   Clase: "Implementación deportiva" │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│   Selecciona Materiales             │
│   - Balones #5: 10 unidades         │
│   - Conos: 20 unidades              │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│   Sistema guarda Donación           │
│   + Crea Ingreso de Materiales      │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│   Stock se incrementa               │
│   Inventario: FUNDACION             │
│   Origen: DONACION                  │
└─────────────────────────────────────┘
```


### Cambios Necesarios en el Backend

#### 1. Modificar Tabla `movimientos_materiales`

Agregar campo para identificar el origen del ingreso:

```sql
ALTER TABLE movimientos_materiales 
ADD COLUMN tipo_ingreso VARCHAR(50) DEFAULT 'COMPRA';

-- Valores posibles: 'COMPRA', 'DONACION', 'TRANSFERENCIA', 'AJUSTE'
```

#### 2. Modificar Tabla `donaciones`

Agregar relación con materiales:

```sql
-- Opción 1: Tabla intermedia (RECOMENDADO)
CREATE TABLE donaciones_materiales (
  id SERIAL PRIMARY KEY,
  donacion_id INTEGER REFERENCES donaciones(id) ON DELETE CASCADE,
  material_id INTEGER REFERENCES materiales(id),
  cantidad INTEGER NOT NULL CHECK (cantidad > 0),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Opción 2: Campo JSON en donaciones (más simple pero menos normalizado)
ALTER TABLE donaciones 
ADD COLUMN materiales_donados JSONB;
```

#### 3. Crear Endpoint para Registrar Donación con Materiales

**Ruta**: `POST /api/donations/with-materials`

**Request Body**:
```json
{
  "donacion": {
    "donorSponsorId": 5,
    "type": "En especie",
    "goodClass": "Implementacion deportiva",
    "program": "Escuelas deportivas",
    "donationAt": "2024-02-20T10:00:00",
    "notes": "Donación de implementos deportivos"
  },
  "materiales": [
    {
      "materialId": 3,
      "cantidad": 10,
      "observaciones": "Balones nuevos"
    },
    {
      "materialId": 7,
      "cantidad": 20,
      "observaciones": "Conos de entrenamiento"
    }
  ]
}
```

**Lógica del Endpoint**:
```javascript
// Pseudocódigo
async function createDonationWithMaterials(req, res) {
  const { donacion, materiales } = req.body;
  
  // Iniciar transacción
  const transaction = await db.transaction();
  
  try {
    // 1. Crear la donación
    const nuevaDonacion = await Donacion.create(donacion, { transaction });
    
    // 2. Por cada material donado
    for (const material of materiales) {
      // 2.1 Registrar en donaciones_materiales
      await DonacionMaterial.create({
        donacionId: nuevaDonacion.id,
        materialId: material.materialId,
        cantidad: material.cantidad
      }, { transaction });
      
      // 2.2 Crear movimiento de ingreso
      await MovimientoMaterial.create({
        materialId: material.materialId,
        tipoMovimiento: 'Entrada',
        cantidad: material.cantidad,
        inventarioDestino: 'FUNDACION',
        tipoIngreso: 'DONACION',
        donacionId: nuevaDonacion.id, // Vincular con donación
        observaciones: material.observaciones,
        stockAnterior: materialActual.stockFundacion,
        stockNuevo: materialActual.stockFundacion + material.cantidad
      }, { transaction });
      
      // 2.3 Actualizar stock del material
      await Material.increment('stockFundacion', {
        by: material.cantidad,
        where: { id: material.materialId },
        transaction
      });
    }
    
    // Confirmar transacción
    await transaction.commit();
    
    return res.json({
      success: true,
      message: 'Donación registrada con materiales',
      data: nuevaDonacion
    });
    
  } catch (error) {
    // Revertir transacción
    await transaction.rollback();
    throw error;
  }
}
```


### Cambios Necesarios en el Frontend

#### 1. Modificar `DonationsForm.jsx`

Agregar sección para seleccionar materiales cuando el tipo sea "Implementación deportiva":

```jsx
// Agregar al estado del formulario
const [selectedMaterials, setSelectedMaterials] = useState([]);
const [showMaterialsSection, setShowMaterialsSection] = useState(false);

// Mostrar sección de materiales si es implementación deportiva
useEffect(() => {
  const shouldShow = 
    form.type === 'En especie' && 
    form.goodClass === 'Implementacion deportiva';
  setShowMaterialsSection(shouldShow);
  
  if (!shouldShow) {
    setSelectedMaterials([]);
  }
}, [form.type, form.goodClass]);

// En el JSX, después de la sección de goodClass
{showMaterialsSection && (
  <div className="materials-section">
    <h3>Materiales Donados</h3>
    <button 
      type="button"
      onClick={() => setIsMaterialModalOpen(true)}
    >
      + Agregar Material
    </button>
    
    {/* Lista de materiales seleccionados */}
    <div className="materials-list">
      {selectedMaterials.map((item, index) => (
        <div key={index} className="material-item">
          <span>{item.materialNombre}</span>
          <span>Cantidad: {item.cantidad}</span>
          <button onClick={() => removeMaterial(index)}>
            Eliminar
          </button>
        </div>
      ))}
    </div>
  </div>
)}
```

#### 2. Crear Componente `DonationMaterialSelector.jsx`

**Ubicación**: `src/features/dashboard/pages/Admin/pages/Donations/Donations/components/`

```jsx
import { useState, useEffect } from 'react';
import SearchableSelect from 'path/to/SearchableSelect';
import materialsService from 'path/to/MaterialsService';

const DonationMaterialSelector = ({ isOpen, onClose, onAdd }) => {
  const [materials, setMaterials] = useState([]);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [cantidad, setCantidad] = useState('');
  const [observaciones, setObservaciones] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadMaterials();
    }
  }, [isOpen]);

  const loadMaterials = async () => {
    const response = await materialsService.getMaterials({ 
      estado: 'Activo',
      limit: 1000 
    });
    if (response.success) {
      setMaterials(response.data);
    }
  };

  const handleAdd = () => {
    if (!selectedMaterial || !cantidad || cantidad <= 0) {
      return;
    }

    onAdd({
      materialId: selectedMaterial.id,
      materialNombre: selectedMaterial.nombre,
      cantidad: parseInt(cantidad),
      observaciones: observaciones.trim()
    });

    // Limpiar y cerrar
    setSelectedMaterial(null);
    setCantidad('');
    setObservaciones('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Agregar Material Donado</h2>
        
        <SearchableSelect
          label="Material"
          options={materials.map(m => ({
            value: m.id,
            label: m.nombre
          }))}
          value={selectedMaterial?.id}
          onChange={(name, value) => {
            const material = materials.find(m => m.id === value);
            setSelectedMaterial(material);
          }}
        />

        <input
          type="number"
          placeholder="Cantidad"
          value={cantidad}
          onChange={(e) => setCantidad(e.target.value)}
          min="1"
        />

        <textarea
          placeholder="Observaciones (opcional)"
          value={observaciones}
          onChange={(e) => setObservaciones(e.target.value)}
        />

        <div className="modal-actions">
          <button onClick={onClose}>Cancelar</button>
          <button onClick={handleAdd}>Agregar</button>
        </div>
      </div>
    </div>
  );
};

export default DonationMaterialSelector;
```


#### 3. Crear Servicio `DonationMaterialsService.js`

**Ubicación**: `src/features/dashboard/pages/Admin/pages/Donations/Donations/services/`

```javascript
import apiClient from 'path/to/apiClient';

class DonationMaterialsService {
  constructor() {
    this.endpoint = '/donations';
  }

  async createDonationWithMaterials(donationData, materials) {
    const payload = {
      donacion: donationData,
      materiales: materials
    };

    try {
      const response = await apiClient.post(
        `${this.endpoint}/with-materials`, 
        payload
      );
      return response;
    } catch (error) {
      console.error('Error al crear donación con materiales:', error);
      throw error;
    }
  }

  async getDonationMaterials(donationId) {
    try {
      const response = await apiClient.get(
        `${this.endpoint}/${donationId}/materials`
      );
      return response;
    } catch (error) {
      console.error('Error al obtener materiales de donación:', error);
      throw error;
    }
  }
}

export default new DonationMaterialsService();
```

#### 4. Modificar el Submit del Formulario

```jsx
const handleSubmit = async (e) => {
  e.preventDefault();
  
  try {
    setSubmitting(true);

    // Si tiene materiales, usar endpoint especial
    if (selectedMaterials.length > 0) {
      const response = await donationMaterialsService.createDonationWithMaterials(
        form,
        selectedMaterials
      );
      
      if (response.success) {
        showSuccessAlert(
          'Donación Registrada',
          `Se registró la donación con ${selectedMaterials.length} materiales. El stock se actualizó automáticamente.`
        );
        navigate('/admin/donations');
      }
    } else {
      // Flujo normal sin materiales
      const response = await donationsService.createDonation(form);
      // ... resto del código
    }
  } catch (error) {
    showErrorAlert('Error', error.message);
  } finally {
    setSubmitting(false);
  }
};
```

### Reglas de Negocio - Donaciones

1. **Solo donaciones "En especie" de clase "Implementación deportiva"** pueden tener materiales
2. **Los materiales se ingresan al Inventario FUNDACION** (no a Eventos)
3. **El ingreso se registra con tipo_ingreso = 'DONACION'**
4. **Se vincula el movimiento con la donación** para trazabilidad
5. **Si se cancela/elimina la donación**, se debe decidir:
   - Opción A: No permitir eliminar si ya tiene materiales ingresados
   - Opción B: Crear movimiento de "Ajuste negativo" para revertir

### Validaciones Importantes

```javascript
// Antes de guardar
if (selectedMaterials.length > 0) {
  // Validar que todos tengan cantidad > 0
  const invalid = selectedMaterials.some(m => m.cantidad <= 0);
  if (invalid) {
    showErrorAlert('Error', 'Todas las cantidades deben ser mayores a 0');
    return;
  }

  // Validar que no haya materiales duplicados
  const ids = selectedMaterials.map(m => m.materialId);
  const hasDuplicates = ids.length !== new Set(ids).size;
  if (hasDuplicates) {
    showErrorAlert('Error', 'No puedes agregar el mismo material dos veces');
    return;
  }
}
```


---

## 📚 Recursos y Componentes Compartidos

### Servicios Disponibles

#### `MaterialsService.js`
**Ubicación**: `src/features/dashboard/pages/Admin/pages/SportsMaterials/Materials/services/`

Métodos útiles para las integraciones:
```javascript
// Obtener lista de materiales activos
await materialsService.getMaterials({ estado: 'Activo', limit: 1000 });

// Obtener detalle de un material
await materialsService.getMaterialById(materialId);

// Verificar stock disponible
const material = await materialsService.getMaterialById(materialId);
const stockDisponible = material.stockEventos - material.stockEventosReservado;
```

#### `CategoriesService.js`
**Ubicación**: `src/features/dashboard/pages/Admin/pages/SportsMaterials/shared/services/`

```javascript
// Obtener categorías activas
await categoriesService.getActiveCategories();
```

### Componentes Reutilizables

#### `SearchableSelect`
**Ubicación**: `src/shared/components/SearchableSelect.jsx`

Selector con búsqueda, ideal para seleccionar materiales:
```jsx
<SearchableSelect
  name="materialId"
  options={materials.map(m => ({
    value: m.id,
    label: `${m.nombre} (Stock: ${m.stockEventos})`
  }))}
  value={selectedMaterialId}
  onChange={handleMaterialChange}
  placeholder="Buscar material..."
  loading={loadingMaterials}
/>
```

#### `FormField`
**Ubicación**: `src/shared/components/FormField.jsx`

Campo de formulario con validaciones:
```jsx
<FormField
  label="Cantidad"
  name="cantidad"
  type="number"
  value={cantidad}
  onChange={handleChange}
  error={errors.cantidad}
  touched={touched.cantidad}
  required
  min="1"
/>
```

### Utilidades

#### `formatStock()`
**Ubicación**: `src/shared/utils/numberFormat.js`

Formatea números de stock con separadores de miles:
```javascript
import { formatStock } from 'path/to/numberFormat';

formatStock(1000); // "1,000"
formatStock(50);   // "50"
```

#### `showSuccessAlert()`, `showErrorAlert()`, `showConfirmAlert()`
**Ubicación**: `src/shared/utils/alerts.js`

Alertas con SweetAlert2:
```javascript
import { showSuccessAlert, showErrorAlert, showConfirmAlert } from 'path/to/alerts';

// Éxito
showSuccessAlert('Título', 'Mensaje de éxito');

// Error
showErrorAlert('Error', 'Mensaje de error');

// Confirmación
const result = await showConfirmAlert(
  '¿Estás seguro?',
  'Esta acción no se puede deshacer'
);
if (result.isConfirmed) {
  // Usuario confirmó
}
```

---

## 🔍 Endpoints del Backend - Referencia Completa

### Materiales

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/materials` | Listar materiales |
| GET | `/api/materials/:id` | Obtener material por ID |
| POST | `/api/materials` | Crear material |
| PUT | `/api/materials/:id` | Actualizar material |
| DELETE | `/api/materials/:id` | Eliminar material |
| POST | `/api/materials/:id/transfer` | Transferir stock |
| POST | `/api/materials/:id/discharge` | Registrar baja |

### Movimientos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/materials/movements` | Listar movimientos |
| POST | `/api/materials/movements` | Crear ingreso |
| GET | `/api/materials/:id/history` | Historial de un material |

### Eventos (Materiales)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/events/:id/materials` | Materiales del evento |
| POST | `/api/events/:id/materials` | Asignar material |
| PUT | `/api/events/:id/materials/:materialId` | Actualizar asignación |
| DELETE | `/api/events/:id/materials/:materialId` | Liberar material |

### Donaciones (A implementar)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/donations/with-materials` | Crear donación con materiales |
| GET | `/api/donations/:id/materials` | Materiales de una donación |


---

## ✅ Checklist de Implementación

### Para Integración con EVENTOS

- [ ] **Backend**
  - [x] Endpoints de asignación implementados
  - [x] Lógica de reserva de stock
  - [x] Lógica de descuento al finalizar evento
  - [x] Lógica de liberación al cancelar evento

- [ ] **Frontend**
  - [ ] Importar `EventMaterialsSection` en vista de evento
  - [ ] Agregar pestaña "Materiales" en detalle de evento
  - [ ] Importar `AssignMaterialModal` 
  - [ ] Conectar botón "Asignar Material" con modal
  - [ ] Agregar validación al finalizar evento
  - [ ] Agregar validación al cancelar evento
  - [ ] Probar flujo completo: asignar → finalizar → verificar stock

### Para Integración con DONACIONES

- [ ] **Backend**
  - [ ] Crear/modificar tabla `donaciones_materiales`
  - [ ] Agregar campo `tipo_ingreso` a `movimientos_materiales`
  - [ ] Crear endpoint `POST /api/donations/with-materials`
  - [ ] Implementar lógica de transacción
  - [ ] Crear endpoint `GET /api/donations/:id/materials`
  - [ ] Agregar validaciones de negocio

- [ ] **Frontend**
  - [ ] Crear componente `DonationMaterialSelector`
  - [ ] Modificar `DonationsForm` para mostrar sección de materiales
  - [ ] Crear servicio `DonationMaterialsService`
  - [ ] Modificar submit para usar endpoint con materiales
  - [ ] Agregar validaciones de materiales duplicados
  - [ ] Agregar validaciones de cantidades
  - [ ] Mostrar materiales en vista de detalle de donación
  - [ ] Probar flujo completo: crear donación → verificar stock

---

## 🚨 Consideraciones Importantes

### Seguridad

1. **Validar permisos**: Solo usuarios con permisos de materiales pueden asignar/modificar
2. **Validar stock**: Siempre verificar disponibilidad antes de asignar
3. **Transacciones**: Usar transacciones de BD para operaciones múltiples
4. **Auditoría**: Todos los movimientos quedan registrados con usuario y fecha

### Performance

1. **Paginación**: Al listar materiales, usar paginación si hay muchos
2. **Caché**: Considerar cachear lista de materiales activos
3. **Índices**: Asegurar índices en tablas relacionadas

### UX

1. **Feedback visual**: Mostrar loading states durante operaciones
2. **Mensajes claros**: Explicar qué pasará con el stock
3. **Confirmaciones**: Pedir confirmación en operaciones críticas
4. **Validaciones en tiempo real**: Validar stock disponible al escribir cantidad

### Testing

1. **Probar con stock insuficiente**: ¿Qué pasa si no hay stock?
2. **Probar cancelación de evento**: ¿Se libera el stock correctamente?
3. **Probar eliminación de donación**: ¿Qué pasa con el stock ingresado?
4. **Probar concurrencia**: ¿Qué pasa si dos usuarios asignan el mismo material simultáneamente?

---

## 📞 Soporte y Contacto

Si tienes dudas durante la implementación:

1. **Revisa la documentación existente**:
   - `FLUJO_COMPLETO_MATERIALES.md`
   - `ARQUITECTURA_FINAL_MATERIALES.md`
   - `BACKEND_IMPLEMENTATION_GUIDE.md`

2. **Consulta el código de referencia**:
   - Componentes en `src/features/dashboard/pages/Admin/pages/SportsMaterials/`
   - Servicios en `services/` de cada módulo

3. **Prueba los endpoints** con Postman/Thunder Client antes de integrar

4. **Revisa los logs del backend** para debugging

---

## 📝 Notas Finales

- **No modifiques la lógica core de materiales** sin consultar
- **Mantén la consistencia** con los patrones existentes
- **Documenta cambios importantes** en este archivo
- **Haz commits atómicos** para facilitar revisión
- **Prueba en desarrollo** antes de pasar a producción

---

**Última actualización**: Febrero 2024  
**Versión**: 1.0  
**Autor**: Equipo de Desarrollo Astrostar
