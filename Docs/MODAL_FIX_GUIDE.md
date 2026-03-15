# Guía: Cómo Arreglar Modales que se Sobreponen con el Sidebar

## El Problema

Los modales que se renderizan dentro del árbol DOM del dashboard quedan "atrapados" en un **contexto de apilamiento (stacking context)** creado por el contenedor `dashboard-main-content` que tiene `position: relative` y `z-index: 1`.

Esto hace que el sidebar (z-index: 30 en desktop, 46 en móvil) aparezca por encima de los modales, sin importar qué tan alto sea el z-index del modal.

## Jerarquía de Z-Index

Para evitar conflictos, la aplicación usa la siguiente jerarquía:

- `z-1`: Contenido principal (dashboard-main-content)
- `z-30`: Sidebar en desktop
- `z-40`: Overlay del sidebar en móvil
- `z-46`: Sidebar en móvil (por encima del overlay)
- `z-50`: Modales (siempre por encima de todo)

Los modales SIEMPRE deben usar `z-50` y renderizarse con Portal para estar por encima del sidebar tanto en desktop como en móvil.

## La Solución: React Portal

Usar `createPortal` de React DOM para renderizar el modal directamente en `document.body`, escapando del contexto de apilamiento.

## Cómo Aplicar la Solución

### Paso 1: Importar createPortal

```javascript
import { createPortal } from "react-dom";
```

### Paso 2: Modificar el return del componente

**ANTES:**

```javascript
const MiModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6">{/* Contenido del modal */}</div>
    </div>
  );
};
```

**DESPUÉS:**

```javascript
const MiModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6">{/* Contenido del modal */}</div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
```

## Ejemplo Completo

```javascript
import { createPortal } from "react-dom";
import { motion } from "framer-motion";

const ProductModal = ({ isOpen, onClose, product }) => {
  if (!isOpen) return null;

  const modalContent = (
    <motion.div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6">
        <h2>Detalles del Producto</h2>
        {/* Contenido */}
        <button onClick={onClose}>Cerrar</button>
      </div>
    </motion.div>
  );

  return createPortal(modalContent, document.body);
};

export default ProductModal;
```

## Modales Ya Arreglados ✅

### Materiales (9 modales)

- ✅ CategoryModal.jsx
- ✅ CategoryViewModal.jsx
- ✅ MaterialModal.jsx
- ✅ MaterialViewModal.jsx
- ✅ TransferModal.jsx
- ✅ AssignMaterialModal.jsx
- ✅ MaterialDischargeModal.jsx
- ✅ MovementModal.jsx
- ✅ MovementViewModal.jsx

### Proveedores (2 modales)

- ✅ ProviderModal.jsx
- ✅ ProviderViewModal.jsx

### Roles (2 modales)

- ✅ RoleModal.jsx (ya usaba Portal)
- ✅ RoleDetailModal.jsx

### Empleados (1 modal)

- ✅ EmployeeViewModal.jsx

### Personas Temporales (2 modales)

- ✅ TemporaryPersonModal.jsx
- ✅ TemporaryPersonViewModal.jsx

### Matrículas (3 modales)

- ✅ EnrollmentHistoryModal.jsx
- ✅ EnrollmentManagementModal.jsx
- ✅ RenewEnrollmentModal.jsx

### Equipos (3 modales)

- ✅ TemporaryTeamModal.jsx
- ✅ TemporaryTeamViewModal.jsx
- ✅ SelectionModal.jsx

### Deportistas (2 modales)

- ✅ AthleteModal.jsx
- ✅ GuardianModal.jsx

### Deportistas - Ver Detalles (2 modales)

- ✅ AthleteViewModal.jsx
- ✅ GuardianViewModal.jsx

### Usuarios (1 modal)

- ✅ UserViewModal.jsx

**Total: 27 modales arreglados**

## Notas Importantes

1. **No necesitas cambiar el z-index**: Con Portal, un z-index de 50 es suficiente
2. **Funciona con Framer Motion**: Portal es compatible con AnimatePresence
3. **No afecta el comportamiento**: El modal funciona exactamente igual, solo se renderiza en otro lugar del DOM
4. **Es la práctica recomendada**: React recomienda usar Portal para modales en su documentación oficial

## Verificación

Después de aplicar el fix, verifica que:

1. El modal aparece por encima del sidebar
2. El modal funciona correctamente en móvil y desktop
3. Las animaciones siguen funcionando
4. El overlay cubre toda la pantalla

## Recursos

- [Documentación oficial de React Portals](https://react.dev/reference/react-dom/createPortal)
- [CSS Stacking Context (MDN)](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_positioned_layout/Understanding_z-index/Stacking_context)
