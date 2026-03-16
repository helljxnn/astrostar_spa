# Sistema de Categorización de Roles - Documento de Diseño

## Overview

El sistema implementará un mecanismo de categorización de roles que permita identificar usuarios por función (entrenador, administrador, deportista) independientemente del nombre exacto del rol. Esto resolverá la fragilidad actual donde "Entrenador" ≠ "Entrenador Deportivo".

## Architecture

### Componentes principales:
1. **RoleCategories**: Configuración centralizada de categorías
2. **RoleCategorizer**: Servicio que asigna categorías automáticamente
3. **RoleFilter**: Utilidad que filtra usuarios por categoría
4. **MigrationService**: Migra roles existentes al nuevo sistema

## Components and Interfaces

### 1. RoleCategories (Configuración)
```javascript
// src/shared/constants/roleCategories.js
export const ROLE_CATEGORIES = {
  TRAINER: 'trainer',
  ADMIN: 'admin', 
  ATHLETE: 'athlete',
  GUARDIAN: 'guardian',
  EMPLOYEE: 'employee'
};

export const ROLE_KEYWORDS = {
  [ROLE_CATEGORIES.TRAINER]: [
    'entrenador', 'trainer', 'coach', 'instructor',
    'deportivo', 'técnico'
  ],
  [ROLE_CATEGORIES.ADMIN]: [
    'admin', 'administrador', 'gerente', 'director'
  ],
  [ROLE_CATEGORIES.ATHLETE]: [
    'deportista', 'athlete', 'jugador'
  ],
  [ROLE_CATEGORIES.GUARDIAN]: [
    'acudiente', 'guardian', 'padre', 'tutor'
  ]
};
```

### 2. RoleCategorizer (Servicio)
```javascript
// src/shared/services/roleCategorizer.js
class RoleCategorizer {
  static categorizeRole(roleName) {
    // Normalizar texto
    const normalized = this.normalizeText(roleName);
    
    // Buscar coincidencias por palabras clave
    for (const [category, keywords] of Object.entries(ROLE_KEYWORDS)) {
      if (keywords.some(keyword => normalized.includes(keyword))) {
        return category;
      }
    }
    
    return null; // Sin categoría detectada
  }
  
  static normalizeText(text) {
    return text.toLowerCase()
      .trim()
      .replace(/\s+/g, ' ')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, ''); // Remover acentos
  }
}
```

### 3. RoleFilter (Utilidad)
```javascript
// src/shared/utils/roleFilter.js
export const filterUsersByRoleCategory = (users, category) => {
  return users.filter(user => {
    const userRole = user.role?.name || user.rol;
    if (!userRole) return false;
    
    // Método 1: Verificar si el rol tiene categoría asignada
    if (user.role?.categories?.includes(category)) {
      return true;
    }
    
    // Método 2: Fallback - categorización automática
    const detectedCategory = RoleCategorizer.categorizeRole(userRole);
    return detectedCategory === category;
  });
};
```

## Data Models

### Extensión del modelo Role (Backend)
```sql
-- Agregar campo categories a la tabla roles
ALTER TABLE roles ADD COLUMN categories JSON DEFAULT '[]';

-- Ejemplos de datos:
-- Rol "Entrenador": categories = ["trainer"]
-- Rol "Entrenador Deportivo": categories = ["trainer"] 
-- Rol "Admin General": categories = ["admin"]
-- Rol "Deportista Sub-17": categories = ["athlete"]
```

### Modelo Frontend
```typescript
interface Role {
  id: string;
  name: string;
  categories: string[]; // Nueva propiedad
  permissions: object;
  createdAt: string;
  updatedAt: string;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Categorización consistente
*For any* role name, if it contains trainer keywords, then categorizeRole should return "trainer" category
**Validates: Requirements 1.2, 3.1**

### Property 2: Filtrado inclusivo
*For any* user list and category, filterUsersByRoleCategory should include all users whose roles match that category either by explicit assignment or automatic detection
**Validates: Requirements 1.3, 5.2**

### Property 3: Normalización de texto
*For any* text input with variations in case, spaces, or accents, normalizeText should produce consistent output
**Validates: Requirements 3.2, 3.3**

### Property 4: Retrocompatibilidad
*For any* existing role without categories, the system should still function using the fallback method
**Validates: Requirements 5.1, 5.3**

### Property 5: Migración sin pérdida de datos
*For any* existing role, after migration it should maintain its original functionality plus gain new categorization
**Validates: Requirements 4.1, 4.4**

## Error Handling

### Casos de error manejados:
1. **Rol sin categoría**: Usar detección automática como fallback
2. **Categoría inexistente**: Devolver lista vacía, registrar warning
3. **Texto malformado**: Normalizar antes de procesar
4. **Fallo en migración**: Mantener funcionalidad anterior
5. **Conflictos de categoría**: Permitir selección manual

### Estrategias de recuperación:
- Fallback a método anterior si falla el nuevo sistema
- Logs detallados para debugging
- Validación de datos antes de procesamiento
- Transacciones para operaciones críticas

## Testing Strategy

### Unit Tests:
- Normalización de texto con diferentes inputs
- Detección de categorías por palabras clave
- Filtrado de usuarios por categoría
- Manejo de casos edge (roles vacíos, null, undefined)

### Property-Based Tests:
- **Property 1**: Categorización consistente - generar roles aleatorios con palabras clave conocidas
- **Property 2**: Filtrado inclusivo - verificar que todos los usuarios relevantes sean incluidos
- **Property 3**: Normalización - probar con variaciones de texto aleatorias
- **Property 4**: Retrocompatibilidad - verificar que roles sin categoría sigan funcionando
- **Property 5**: Migración - verificar que no se pierdan datos durante la migración

### Integration Tests:
- Flujo completo: crear rol → asignar categoría → filtrar usuarios
- Migración de roles existentes
- Interacción con base de datos
- API endpoints para gestión de categorías

La implementación será incremental:
1. Crear utilidades de categorización (frontend)
2. Actualizar filtros existentes para usar nuevo sistema
3. Agregar campo categories al backend
4. Implementar migración de datos
5. Crear interfaz para gestión de categorías