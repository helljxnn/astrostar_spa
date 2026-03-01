# Optimizaciones y Validaciones Necesarias en el Backend

# Optimizaciones y Validaciones - Estado Actual

## ⚠️ PROBLEMA URGENTE: documentTypeId falta en el guardian

### Síntoma actual
El guardian que se envía desde el backend NO incluye `documentTypeId` ni `tipoDocumento`, por lo que el frontend muestra "N/A" en el tipo de documento.

### Objeto actual que llega del backend:
```javascript
{
  address: "Calle 123 #45-67, Bogotá",
  birthDate: "2000-02-01",
  email: "florecita@mailinator.com",
  firstName: "Monica",
  id: 2,
  identification: "1018271827",
  lastName: "María Sosa Calle",
  nombreCompleto: "Monica María Sosa Calle",
  phone: "3101234567"
  // ❌ FALTA: documentTypeId
  // ❌ FALTA: tipoDocumento
}
```

### Solución URGENTE en el backend

Actualizar el método `transformToFrontend` en `guardians.repository.js`:

**ANTES:**
```javascript
transformToFrontend(guardian) {
  return {
    id: guardian.id,
    nombreCompleto: `${guardian.firstName} ${guardian.lastName}`,
    firstName: guardian.firstName,
    lastName: guardian.lastName,
    identification: guardian.identification,
    email: guardian.email,
    phone: guardian.phone,
    address: guardian.address,
    birthDate: formatDateForInput(guardian.birthDate),
  };
}
```

**DESPUÉS:**
```javascript
transformToFrontend(guardian) {
  return {
    id: guardian.id,
    nombreCompleto: `${guardian.firstName} ${guardian.lastName}`,
    firstName: guardian.firstName,
    lastName: guardian.lastName,
    documentTypeId: guardian.documentTypeId,  // ⚠️ AGREGAR ESTO
    tipoDocumento: guardian.documentType?.name,  // ⚠️ AGREGAR ESTO
    identification: guardian.identification,
    email: guardian.email,
    phone: guardian.phone,
    address: guardian.address,
    birthDate: formatDateForInput(guardian.birthDate),
  };
}
```

### Verificar que el include esté correcto

En todos los métodos que devuelven guardians, asegurarse de incluir `documentType`:

```javascript
const guardian = await prisma.guardian.findUnique({
  where: { id },
  include: {
    documentType: true  // ⚠️ IMPORTANTE
  }
});
```

---

## ✅ PROBLEMAS RESUELTOS

### 1. ✅ Acudiente ahora aparece en la tabla de deportistas

**Estado:** RESUELTO por el backend

**Cambios implementados en el backend:**
- El método `transformToFrontend` ahora incluye el objeto completo del `guardian`
- El endpoint `GET /athletes` devuelve el guardian con todos sus datos

**Cambios implementados en el frontend:**
- Actualizado `Athletes.jsx` para priorizar el `guardian` que viene del backend
- Si el backend no envía el guardian, hace fallback a `getGuardianById()`

**Formato de respuesta del backend:**
```javascript
{
  id: 1,
  firstName: "Flor",
  lastName: "Castrillón",
  acudiente: 2,
  guardian: {
    id: 2,
    nombreCompleto: "Monica María Sosa Calle",
    firstName: "Monica",
    lastName: "María Sosa Calle",
    identification: "1018271827",
    documentTypeId: 1,  // ⚠️ IMPORTANTE: Incluir el ID del tipo de documento
    email: "florecita@mailinator.com",
    phone: "3101234567",
    address: "Calle 123 #45-67, Bogotá"
  }
}
```

**Nota:** El backend debe incluir `documentTypeId` en el guardian para que el frontend pueda mostrar el tipo de documento correctamente.

### 2. ✅ Eliminación de acudientes con validación de edad

**Estado:** RESUELTO por el backend

**Lógica implementada:**
- ✅ SÍ se puede eliminar si solo está asignado a deportistas mayores de 18 años
- ❌ NO se puede eliminar si está asignado a al menos una deportista menor de 18 años

**Método agregado en el backend:**
- `getMinorAthletes()` en `guardians.repository.js` - Calcula la edad de cada deportista
- Actualizado `deleteGuardian()` en `guardians.service.js` - Usa la nueva validación

## 🧪 Cómo Verificar que Todo Funciona

### Prueba 1: Acudiente aparece en la tabla
1. Recarga la página de deportistas (F5)
2. Busca a "Flor Castrillón"
3. En la columna "Acudiente" debería aparecer: **"Monica María Sosa Calle"** ✅

### Prueba 2: Eliminación de acudientes
1. Busca a "Monica María Sosa Calle" en el buscador de acudientes
2. Intenta eliminarla
3. Como está asignada a "Flor" (mayor de edad), debería permitir eliminarla ✅

### Prueba 3: Logs en la consola del navegador
Abre la consola del navegador y busca:
```
🔍 [useAthletes] Acudientes en deportistas: [
  { id: 1, nombre: "Flor", acudiente: 2, guardian: {...} }
]
```

Si ves `guardian: {...}` con datos, significa que el backend está funcionando correctamente.

---

## ⚠️ PROBLEMA CRÍTICO: Acudiente no aparece en la tabla de deportistas (OBSOLETO - YA RESUELTO)

### Síntoma actual
- En el buscador de acudientes dice: "Monica María Sosa Calle - 1018271827 • 1 deportista(s)"
- En la tabla de deportistas dice: "Flor Castrillón - Sin acudiente"
- **Esto significa que el frontend SÍ está contando la relación, pero el backend NO está devolviendo los datos del acudiente**

### Causa raíz
El endpoint `GET /athletes` NO está incluyendo la relación con `guardians` en la respuesta.

### Solución URGENTE

#### 1. Verificar el modelo Prisma
Asegúrate de que la relación está correctamente definida:

```prisma
model Athlete {
  id          Int       @id @default(autoincrement())
  userId      Int       @unique
  categoria   String
  acudiente   Int?      // ID del acudiente (puede ser null)
  parentesco  String?   // Relación con el acudiente
  
  // Relaciones
  user        User      @relation(fields: [userId], references: [id])
  guardian    Guardian? @relation(fields: [acudiente], references: [id])
  
  @@map("athletes")
}

model Guardian {
  id              Int       @id @default(autoincrement())
  nombreCompleto  String
  identificacion  String    @unique
  telefono        String?
  correo          String?
  direccion       String?
  
  // Relación inversa
  athletes        Athlete[]
  
  @@map("guardians")
}
```

#### 2. Modificar el endpoint GET /athletes

**ANTES (incorrecto):**
```javascript
const athletes = await prisma.athlete.findMany({
  include: {
    user: {
      include: {
        documentType: true
      }
    }
  }
});
```

**DESPUÉS (correcto):**
```javascript
const athletes = await prisma.athlete.findMany({
  include: {
    user: {
      include: {
        documentType: true
      }
    },
    guardian: true  // ⚠️ ESTO ES LO QUE FALTA
  }
});
```

#### 3. Verificar la respuesta del backend

La respuesta debe incluir el guardian:
```javascript
{
  id: 1,
  firstName: "Flor",
  lastName: "Castrillón",
  acudiente: 2,  // ID del acudiente
  parentesco: "Mother",
  guardian: {    // ⚠️ ESTO DEBE ESTAR PRESENTE
    id: 2,
    nombreCompleto: "Monica María Sosa Calle",
    identificacion: "1018271827",
    telefono: "3101234567",
    correo: "florecita@mailinator.com",
    direccion: "Calle 123 #45-67, Bogotá"
  }
}
```

#### 4. Logs para debugging en el backend

Agrega estos logs en el endpoint GET /athletes:

```javascript
router.get('/athletes', async (req, res) => {
  try {
    const athletes = await prisma.athlete.findMany({
      include: {
        user: {
          include: { documentType: true }
        },
        guardian: true
      }
    });
    
    console.log('📋 [GET /athletes] Total deportistas:', athletes.length);
    console.log('📋 [GET /athletes] Con acudiente:', athletes.filter(a => a.guardian).length);
    console.log('📋 [GET /athletes] Primer deportista:', {
      id: athletes[0]?.id,
      nombre: athletes[0]?.user?.firstName,
      acudiente: athletes[0]?.acudiente,
      guardian: athletes[0]?.guardian
    });
    
    return res.json({
      success: true,
      data: athletes,
      pagination: { /* ... */ }
    });
  } catch (error) {
    console.error('❌ [GET /athletes] Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
```

## 1. Problema: Acudiente no se guarda con la deportista

### Síntoma
Cuando se crea una matrícula con un acudiente asignado, el acudiente no aparece en la tabla de deportistas, aunque en la base de datos sí está registrado.

### Datos enviados desde el frontend
```javascript
{
  firstName: "Flor",
  lastName: "Castrillón",
  // ... otros campos
  acudiente: 2,  // ID del acudiente
  parentesco: "Mother"  // Parentesco en inglés
}
```

### Verificaciones necesarias en el backend

1. **Endpoint de creación de deportista** (`POST /athletes`)
   - Verificar que el campo `acudiente` se está guardando correctamente en la tabla `athletes`
   - Verificar que el campo `parentesco` se está guardando correctamente
   - Asegurarse de que la relación con la tabla `guardians` está correctamente configurada

2. **Endpoint de obtención de deportistas** (`GET /athletes`)
   - Verificar que se está haciendo el `include` de la relación con `guardians`
   - Ejemplo en Prisma:
   ```javascript
   const athletes = await prisma.athlete.findMany({
     include: {
       guardian: true,  // Incluir datos del acudiente
       user: {
         include: {
           documentType: true
         }
       }
     }
   });
   ```

3. **Formato de respuesta**
   - Asegurarse de que el acudiente se devuelve en el formato correcto:
   ```javascript
   {
     id: 1,
     firstName: "Flor",
     lastName: "Castrillón",
     acudiente: 2,  // ID del acudiente
     guardian: {    // Datos completos del acudiente
       id: 2,
       nombreCompleto: "Monica María Sosa Calle",
       identificacion: "1018271827",
       // ... otros campos
     }
   }
   ```

## 2. Optimización: Carga lenta de datos

### Problema
El loader se demora mucho al navegar entre tablas y al crear matrículas.

### Soluciones recomendadas

#### A. Paginación en el backend
```javascript
// Endpoint: GET /athletes?page=1&limit=10
const page = parseInt(req.query.page) || 1;
const limit = parseInt(req.query.limit) || 10;
const skip = (page - 1) * limit;

const [athletes, total] = await Promise.all([
  prisma.athlete.findMany({
    skip,
    take: limit,
    include: {
      guardian: true,
      user: {
        include: { documentType: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  }),
  prisma.athlete.count()
]);

return {
  success: true,
  data: athletes,
  pagination: {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    hasNext: page * limit < total,
    hasPrev: page > 1
  }
};
```

#### B. Índices en la base de datos
Agregar índices para mejorar las consultas:
```sql
-- Índice en el campo acudiente para búsquedas rápidas
CREATE INDEX idx_athletes_acudiente ON athletes(acudiente);

-- Índice en el campo identification para búsquedas por documento
CREATE INDEX idx_users_identification ON users(identification);

-- Índice en el campo email para búsquedas por correo
CREATE INDEX idx_users_email ON users(email);
```

#### C. Caché de datos de referencia
Los datos que no cambian frecuentemente (tipos de documento, categorías, etc.) deberían cachearse:
```javascript
// Usar un caché en memoria o Redis
const cache = new Map();

async function getDocumentTypes() {
  if (cache.has('documentTypes')) {
    return cache.get('documentTypes');
  }
  
  const types = await prisma.documentType.findMany();
  cache.set('documentTypes', types);
  
  // Invalidar caché después de 1 hora
  setTimeout(() => cache.delete('documentTypes'), 3600000);
  
  return types;
}
```

#### D. Lazy loading de acudientes
En lugar de cargar todos los acudientes al inicio, cargarlos solo cuando el usuario abre el buscador:
```javascript
// Endpoint: GET /guardians?search=monica
const search = req.query.search || '';

const guardians = await prisma.guardian.findMany({
  where: {
    OR: [
      { nombreCompleto: { contains: search, mode: 'insensitive' } },
      { identificacion: { contains: search } }
    ]
  },
  take: 20,  // Limitar a 20 resultados
  orderBy: { nombreCompleto: 'asc' }
});
```

#### E. Optimizar creación de matrícula
La creación de matrícula debería ser una transacción atómica:
```javascript
const result = await prisma.$transaction(async (tx) => {
  // 1. Crear usuario
  const user = await tx.user.create({
    data: {
      firstName: athleteData.firstName,
      lastName: athleteData.lastName,
      // ... otros campos
    }
  });
  
  // 2. Crear deportista con acudiente
  const athlete = await tx.athlete.create({
    data: {
      userId: user.id,
      categoria: athleteData.categoria,
      acudiente: athleteData.acudiente,  // ⚠️ IMPORTANTE: Guardar el acudiente
      parentesco: athleteData.parentesco,
      // ... otros campos
    }
  });
  
  // 3. Crear matrícula
  const enrollment = await tx.enrollment.create({
    data: {
      athleteId: athlete.id,
      // ... otros campos
    }
  });
  
  return { user, athlete, enrollment };
});
```

## 3. Validación: Eliminación de acudientes

### Regla de negocio
- **SÍ se puede eliminar** un acudiente si solo está asignado a deportistas mayores de edad
- **NO se puede eliminar** un acudiente si está asignado a al menos una deportista menor de edad

### Implementación en el backend
```javascript
// Endpoint: DELETE /guardians/:id
async function deleteGuardian(guardianId) {
  // 1. Obtener deportistas asignados a este acudiente
  const athletes = await prisma.athlete.findMany({
    where: { acudiente: guardianId },
    include: {
      user: true
    }
  });
  
  // 2. Verificar si alguna es menor de edad
  const hasMinorAthletes = athletes.some(athlete => {
    const birthDate = new Date(athlete.user.birthDate);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age < 18;
  });
  
  // 3. Si tiene menores de edad, no permitir eliminación
  if (hasMinorAthletes) {
    return {
      success: false,
      error: 'No se puede eliminar este acudiente porque está asignado a deportistas menores de edad'
    };
  }
  
  // 4. Eliminar acudiente
  await prisma.guardian.delete({
    where: { id: guardianId }
  });
  
  return { success: true };
}
```

## 4. Endpoint para cargar acudientes (nuevo)

### Crear endpoint optimizado para el buscador
```javascript
// GET /guardians/search?q=monica
router.get('/guardians/search', async (req, res) => {
  try {
    const { q = '' } = req.query;
    
    const guardians = await prisma.guardian.findMany({
      where: {
        OR: [
          { nombreCompleto: { contains: q, mode: 'insensitive' } },
          { identificacion: { contains: q } },
          { correo: { contains: q, mode: 'insensitive' } }
        ]
      },
      take: 20,
      orderBy: { nombreCompleto: 'asc' },
      include: {
        _count: {
          select: { athletes: true }  // Contar deportistas asignados
        }
      }
    });
    
    return res.json({
      success: true,
      data: guardians
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
```

## Resumen de cambios prioritarios

### Alta prioridad (afectan funcionalidad)
1. ✅ Verificar que el campo `acudiente` se guarda correctamente al crear deportista
2. ✅ Verificar que el `include` de guardian funciona en GET /athletes
3. ✅ Implementar validación de edad para eliminación de acudientes

### Media prioridad (mejoran rendimiento)
4. ⚙️ Implementar paginación en GET /athletes
5. ⚙️ Agregar índices en la base de datos
6. ⚙️ Crear endpoint optimizado GET /guardians/search

### Baja prioridad (optimizaciones adicionales)
7. 💡 Implementar caché para datos de referencia
8. 💡 Optimizar transacciones en creación de matrícula

## Logs para debugging

Agregar estos logs en el backend para ayudar a identificar problemas:

```javascript
// Al crear deportista
console.log('📝 [Athletes] Creando deportista:', {
  firstName: athleteData.firstName,
  lastName: athleteData.lastName,
  acudiente: athleteData.acudiente,
  parentesco: athleteData.parentesco
});

// Después de crear
console.log('✅ [Athletes] Deportista creado:', {
  id: athlete.id,
  acudiente: athlete.acudiente,
  guardianData: athlete.guardian
});

// Al obtener deportistas
console.log('📋 [Athletes] Obteniendo deportistas con guardians:', {
  count: athletes.length,
  withGuardian: athletes.filter(a => a.guardian).length
});
```


## Checklist de verificación

### Para verificar que el acudiente se está guardando correctamente:

1. **Verificar en la base de datos**
   ```sql
   -- Ver si el acudiente está asignado
   SELECT id, firstName, lastName, acudiente, parentesco 
   FROM athletes 
   WHERE firstName = 'Flor';
   
   -- Debería mostrar:
   -- id: 1, firstName: "Flor", lastName: "Castrillón", acudiente: 2, parentesco: "Mother"
   ```

2. **Verificar el endpoint GET /athletes**
   - Abre Postman o usa curl:
   ```bash
   curl http://localhost:3000/api/athletes
   ```
   - Busca el deportista "Flor Castrillón"
   - Verifica que tenga el campo `guardian` con los datos completos

3. **Verificar los logs del backend**
   - Cuando creas una matrícula, deberías ver:
   ```
   📝 [Athletes] Creando deportista: {
     firstName: "Flor",
     acudiente: 2,
     parentesco: "Mother"
   }
   ✅ [Athletes] Deportista creado: {
     id: 1,
     acudiente: 2,
     guardian: { id: 2, nombreCompleto: "Monica..." }
   }
   ```

4. **Verificar los logs del frontend**
   - Abre la consola del navegador
   - Deberías ver:
   ```
   🔍 [useAthletes] Acudientes en deportistas: [
     { id: 1, nombre: "Flor", acudiente: 2, guardian: {...} }
   ]
   ```

### Si el problema persiste:

1. **El acudiente NO se está guardando en la BD**
   - Revisa la sección "Optimizar creación de matrícula" arriba
   - Asegúrate de que `athleteData.acudiente` se está guardando en la tabla `athletes`

2. **El acudiente SÍ está en la BD pero NO aparece en GET /athletes**
   - Revisa la sección "⚠️ PROBLEMA CRÍTICO" arriba
   - Agrega `guardian: true` al `include` del endpoint

3. **El guardian aparece en la respuesta pero NO se muestra en la tabla**
   - Esto sería un problema del frontend (poco probable)
   - Verifica que `getGuardianById` esté funcionando correctamente

## Contacto para soporte

Si después de implementar estos cambios el problema persiste, proporciona:
1. Los logs del backend al crear la matrícula
2. Los logs del frontend en la consola del navegador
3. Una captura de pantalla de la respuesta del endpoint GET /athletes
4. El resultado de la consulta SQL directa a la base de datos
