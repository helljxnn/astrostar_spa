# Troubleshooting: Dashboard de Donaciones Muestra $0

## Problema
El Dashboard Analítico en la sección de Donaciones muestra $0 en todas las métricas y "Sin donaciones" en los gráficos, aunque hay donaciones registradas en la base de datos.

## Pasos para Diagnosticar

### 1. Abrir la Consola del Navegador
1. Presiona `F12` o `Ctrl+Shift+I` en tu navegador
2. Ve a la pestaña "Console"
3. Recarga la página del Dashboard Analítico
4. Ve a la sección "Donaciones"

### 2. Verificar los Logs en la Consola

Deberías ver estos mensajes:

```javascript
Donations Response: { ... }
Donors Response: { ... }
Donations array: [ ... ]
Donors array: [ ... }
Estadísticas calculadas: { totalRecaudado: ..., ... }
```

### 3. Posibles Problemas y Soluciones

#### Problema A: "Donations array: []" (Array vacío)

**Causa**: El backend no está devolviendo donaciones.

**Solución**:
1. Verifica que el backend esté corriendo
2. Verifica que haya donaciones en la base de datos:
```sql
SELECT COUNT(*) FROM donation;
SELECT * FROM donation LIMIT 5;
```
3. Verifica que el endpoint funcione:
   - Abre: `http://localhost:3000/api/donations?limit=1000`
   - Deberías ver: `{ "success": true, "data": [...], "pagination": {...} }`

#### Problema B: Error de CORS o Network

**Causa**: El frontend no puede conectarse al backend.

**Solución**:
1. Verifica que el backend esté corriendo en el puerto correcto
2. Verifica la configuración de CORS en el backend
3. Verifica la URL del API en el frontend

#### Problema C: Error 401 o 403 (No autorizado)

**Causa**: Falta autenticación o permisos.

**Solución**:
1. Verifica que estés logueado
2. Verifica que tu usuario tenga permisos para ver donaciones
3. Verifica el token de autenticación en localStorage

#### Problema D: Estructura de datos incorrecta

**Causa**: El backend devuelve los datos en un formato diferente.

**Solución**:
Verifica en la consola la estructura de `Donations Response`. Debería ser:
```javascript
{
  success: true,
  data: [
    {
      id: 1,
      type: "ECONOMICA",
      status: "Recibida",
      donorSponsorId: 1,
      details: [
        {
          recordType: "payment",
          amount: 100000,
          ...
        }
      ],
      ...
    }
  ],
  pagination: { ... }
}
```

### 4. Verificar Donaciones en la Base de Datos

Ejecuta estas consultas SQL:

```sql
-- Ver todas las donaciones
SELECT 
  d.id,
  d.code,
  d.type,
  d.status,
  d."donationAt",
  COUNT(dd.id) as detalles
FROM donation d
LEFT JOIN donation_detail dd ON dd."donationId" = d.id
GROUP BY d.id
ORDER BY d."donationAt" DESC;

-- Ver detalles de donaciones económicas
SELECT 
  d.id,
  d.code,
  dd."recordType",
  dd.amount,
  dd.channel
FROM donation d
INNER JOIN donation_detail dd ON dd."donationId" = d.id
WHERE d.type = 'ECONOMICA'
  AND dd."recordType" = 'payment';

-- Ver total recaudado
SELECT 
  d.type,
  SUM(dd.amount) as total
FROM donation d
INNER JOIN donation_detail dd ON dd."donationId" = d.id
WHERE d.status != 'Anulada'
  AND dd."recordType" = 'payment'
GROUP BY d.type;
```

### 5. Verificar el Servicio de Donaciones

Archivo: `src/features/dashboard/pages/Admin/pages/Donations/Donations/services/donationsService.js`

El método `getStatistics()` debería ser:
```javascript
async getStatistics() {
  return apiClient.get("/donations", { limit: 1000 });
}
```

### 6. Verificar el apiClient

Archivo: `src/shared/services/apiClient.js`

Verifica que:
1. La URL base esté correcta
2. Los headers de autenticación se estén enviando
3. Los interceptores estén funcionando

### 7. Solución Rápida: Recargar Todo

Si nada funciona, intenta:

```bash
# Backend
cd WEB/astrostar_backend
npm install
npx prisma generate
npm run dev

# Frontend (en otra terminal)
cd WEB/astrostar_spa
npm install
npm run dev
```

Luego:
1. Limpia el caché del navegador (Ctrl+Shift+Delete)
2. Cierra sesión y vuelve a iniciar sesión
3. Recarga la página del dashboard

## Cambios Recientes Aplicados

Se agregaron logs de depuración en `DonationsSection.jsx`:
- Log de respuestas del API
- Log de arrays procesados
- Log de estadísticas calculadas
- Log de errores detallados

Estos logs te ayudarán a identificar exactamente dónde está el problema.

## Contacto

Si el problema persiste después de seguir estos pasos, revisa:
1. Los logs de la consola del navegador
2. Los logs del servidor backend
3. Los datos en la base de datos

Y comparte esa información para un diagnóstico más preciso.
