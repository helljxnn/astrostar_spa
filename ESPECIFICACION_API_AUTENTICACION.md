# Especificación Completa - API de Autenticación y Recuperación de Contraseña

## 📋 Información General

**Base URL de la API:** `http://localhost:4000/api`  
**Variable de entorno:** `VITE_API_URL` (opcional, por defecto usa localhost:4000)

---



## 🔐 Endpoints de Autenticación

### 1. Login
**Endpoint:** `POST /auth/login`  
**Headers:**
```json
{
  "Content-Type": "application/json"
}
```

**Body:**
```json
{
  "email": "usuario@ejemplo.com",
  "password": "contraseña123"
}
```

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "123",
      "email": "usuario@ejemplo.com",
      "name": "Nombre Usuario",
      "rol": "admin",
      "role": {
        "name": "admin"
      }
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Respuesta Error (401):**
```json
{
  "success": false,
  "message": "Correo o contraseña incorrectos"
}
```

**Notas importantes:**
- El `refreshToken` se envía como cookie HttpOnly (no en el body)
- El `accessToken` debe almacenarse en memoria (NO en localStorage por seguridad)
- Usar `credentials: 'include'` para manejar cookies

---

### 2. Refresh Token
**Endpoint:** `POST /auth/refresh`  
**Headers:**
```json
{
  "Content-Type": "application/json"
}
```

**Cookies:** Debe incluir el `refreshToken` (HttpOnly cookie)

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Respuesta Error (401):**
```json
{
  "success": false,
  "message": "Token expirado"
}
```

---

### 3. Logout
**Endpoint:** `POST /auth/logout`  
**Headers:**
```json
{
  "Content-Type": "application/json"
}
```

**Cookies:** Debe incluir el `refreshToken`

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "message": "Sesión cerrada exitosamente"
}
```

---

## 🔄 Cambio de Contraseña (Usuario Autenticado)

### Endpoint: Cambiar Contraseña
**Endpoint:** `POST /auth/change-password`  
**Headers:**
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer {accessToken}"
}
```

**Body:**
```json
{
  "currentPassword": "contraseñaActual123",
  "newPassword": "NuevaContraseña123!"
}
```

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "message": "Contraseña cambiada exitosamente."
}
```

**Respuesta Error (400):**
```json
{
  "success": false,
  "message": "La contraseña actual es incorrecta"
}
```

**Validaciones del Frontend:**
- Contraseña actual no vacía
- Nueva contraseña cumple requisitos (8+ caracteres, mayúscula, minúscula, número, especial)
- Nueva contraseña y confirmación coinciden
- Nueva contraseña diferente a la actual

**Comportamiento Post-Cambio:**
1. Mostrar mensaje de éxito
2. Cerrar el modal/pantalla de cambio de contraseña
3. Usuario continúa usando la aplicación normalmente

---

## 🔑 Flujo de Recuperación de Contraseña

### Paso 1: Solicitar Código de Recuperación
**Endpoint:** `POST /auth/forgot-password`  
**Headers:**
```json
{
  "Content-Type": "application/json"
}
```

**Body:**
```json
{
  "email": "usuario@ejemplo.com"
}
```

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "message": "Código enviado a tu correo electrónico"
}
```

**Respuesta Error (404):**
```json
{
  "success": false,
  "message": "El correo no está registrado"
}
```

**Validaciones del Frontend:**
- Email no vacío
- Formato de email válido: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`

**Comportamiento:**
- Envía un código de 6 dígitos al correo del usuario
- El código tiene una expiración (típicamente 15 minutos)
- Después de enviar, redirige automáticamente a `/verify-code` con el email en el state

---

### Paso 2: Verificar Código de Recuperación
**Endpoint:** `POST /auth/verify-reset-token`  
**Headers:**
```json
{
  "Content-Type": "application/json"
}
```

**Body:**
```json
{
  "token": "123456"
}
```

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "data": {
    "email": "usuario@ejemplo.com"
  }
}
```

**Respuesta Error (400):**
```json
{
  "success": false,
  "message": "El código ingresado es incorrecto"
}
```

**Respuesta Error (410):**
```json
{
  "success": false,
  "message": "El código ha expirado"
}
```

**Validaciones del Frontend:**
- El código debe tener exactamente 6 dígitos
- Solo acepta números (0-9)
- Permite pegar el código completo desde el portapapeles

**Comportamiento:**
- Si es exitoso, redirige a `/reset-password` con el token y email en el state
- Si falla, limpia los inputs y permite reintentar

---

### Paso 3: Restablecer Contraseña
**Endpoint:** `POST /auth/reset-password`  
**Headers:**
```json
{
  "Content-Type": "application/json"
}
```

**Body:**
```json
{
  "token": "123456",
  "newPassword": "NuevaContraseña123!"
}
```

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "message": "Contraseña restablecida exitosamente."
}
```

**Respuesta Error (400):**
```json
{
  "success": false,
  "message": "Token inválido o expirado"
}
```

**Validaciones del Frontend:**

#### Requisitos de la Contraseña:
1. **Longitud mínima:** 8 caracteres
2. **Al menos una letra mayúscula:** A-Z
3. **Al menos una letra minúscula:** a-z
4. **Al menos un número:** 0-9
5. **Al menos un carácter especial:** `!@#$%^&*(),.?":{}|<>`

#### Validación en Tiempo Real:
```javascript
const validatePassword = (pwd) => {
  const criteria = {
    minLength: pwd.length >= 8,
    hasUppercase: /[A-Z]/.test(pwd),
    hasLowercase: /[a-z]/.test(pwd),
    hasNumber: /[0-9]/.test(pwd),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
  };

  const strength = Object.values(criteria).filter(Boolean).length;
  
  return {
    criteria,
    strength, // 0-5
    isValid: pwd.length >= 8 && Object.values(criteria).every(Boolean)
  };
};
```

#### Indicador de Fortaleza:
- **0-2 criterios:** "Muy débil" (rojo)
- **3 criterios:** "Débil" (naranja)
- **4 criterios:** "Regular" (amarillo)
- **5 criterios:** "Fuerte" (verde)

**Comportamiento:**
- Validar que ambas contraseñas coincidan
- Mostrar indicador visual de fortaleza en tiempo real
- Mostrar cada requisito con check/x según se cumpla
- Deshabilitar botón de envío si no cumple todos los requisitos
- Después de éxito, redirigir a `/login`

---

## 🎨 Diseño y UX del Frontend Web

### Colores y Estilos
```css
/* Gradientes principales */
background: linear-gradient(to right, black, #B595FF); /* primary-purple */

/* Bordes y focus */
border: 2px solid rgba(181, 149, 255, 0.3); /* primary-purple/30 */
focus:border-color: #B595FF; /* primary-purple */
focus:ring: 2px rgba(181, 149, 255, 0.2); /* primary-purple/20 */

/* Hover effects */
hover:scale: 1.02;
transition: all 200ms;
```

### Componentes Comunes

#### Toast Notifications (SweetAlert2)
```javascript
const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
});

// Uso
Toast.fire({ icon: 'success', title: 'Mensaje exitoso' });
Toast.fire({ icon: 'error', title: 'Mensaje de error' });
```

#### Botones de Carga
```javascript
// Estado normal
"Enviar Instrucciones"

// Estado cargando
"Enviando..."

// Con spinner
<span className="flex items-center justify-center gap-2">
  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
    {/* SVG del spinner */}
  </svg>
  Verificando...
</span>
```

---

## 🔄 Flujo Completo de Navegación

```
1. /login
   ↓ (click "¿Olvidaste tu contraseña?")
   
2. /forgot-password
   - Ingresar email
   - Validar formato
   - POST /auth/forgot-password
   ↓ (éxito automático después de 1.5s)
   
3. /verify-code
   - Mostrar email en pantalla
   - Ingresar código de 6 dígitos
   - Permitir pegar código
   - POST /auth/verify-reset-token
   ↓ (éxito)
   
4. /reset-password
   - Ingresar nueva contraseña
   - Confirmar contraseña
   - Validación en tiempo real
   - Indicador de fortaleza
   - POST /auth/reset-password
   ↓ (éxito después de 1.5s)
   
5. /login
   - Iniciar sesión con nueva contraseña
```

---

## 📱 Consideraciones para App Móvil

### Manejo de Tokens
```dart
// NO almacenar en SharedPreferences por seguridad
// Usar almacenamiento seguro (flutter_secure_storage)

// Access Token: en memoria o secure storage
// Refresh Token: en secure storage con HttpOnly equivalente
```

### Manejo de Errores
```dart
// Códigos de estado HTTP a manejar:
- 200: Éxito
- 400: Bad Request (validación fallida)
- 401: No autorizado (credenciales incorrectas)
- 403: Prohibido (acceso denegado)
- 404: No encontrado (email no registrado)
- 410: Gone (código expirado)
- 500: Error del servidor
```

### Validaciones Locales
Implementar las mismas validaciones del frontend web:
- Formato de email
- Longitud y formato del código (6 dígitos)
- Requisitos de contraseña (8+ caracteres, mayúscula, minúscula, número, especial)
- Coincidencia de contraseñas

### Timeouts y Reintentos
```dart
// Configuración recomendada
timeout: Duration(seconds: 30)
maxRetries: 3
retryDelay: Duration(seconds: 2)
```

---

## 🎯 Mensajes de Usuario

### Mensajes de Éxito
- Login: "¡Bienvenido de nuevo!"
- Forgot Password: "Código enviado a tu correo electrónico."
- Verify Code: (redirige automáticamente)
- Reset Password: "Contraseña restablecida exitosamente."

### Mensajes de Error
- Email vacío: "Por favor, ingresa tu correo electrónico."
- Email inválido: "Por favor, ingresa un correo válido."
- Código incompleto: "Por favor, completa los 6 dígitos."
- Código incorrecto: "El código ingresado es incorrecto."
- Código expirado: "El código ha expirado."
- Contraseña débil: "La contraseña no cumple con todos los requisitos."
- Contraseñas no coinciden: "Las contraseñas no coinciden."
- Error de red: "Error al conectar con el servidor."
- Sin conexión: "No se pudo conectar con el servidor. Verifica tu conexión"

---

## 🔒 Seguridad

### Almacenamiento de Tokens
- **Access Token:** Memoria (NO localStorage/SharedPreferences)
- **Refresh Token:** Cookie HttpOnly (web) / Secure Storage (móvil)
- **User Data:** localStorage (web) / SharedPreferences (móvil) - solo datos no sensibles

### Headers Requeridos
```javascript
{
  "Content-Type": "application/json",
  "Authorization": "Bearer {accessToken}" // Solo para rutas protegidas
}
```

### Credentials
```javascript
// En todas las peticiones que usen cookies
credentials: 'include'
```

---

## 📝 Notas Adicionales

1. **Auto-navegación:** El frontend web redirige automáticamente después de operaciones exitosas con un delay de 1.5 segundos

2. **Validación en tiempo real:** La contraseña se valida mientras el usuario escribe, mostrando feedback visual inmediato

3. **Accesibilidad:** Los inputs tienen:
   - `autoComplete` apropiado
   - `inputMode="numeric"` para códigos
   - `type="email"` para emails
   - `type="password"` para contraseñas

4. **UX del código de verificación:**
   - Auto-focus en siguiente input al escribir
   - Backspace navega al input anterior
   - Flechas izquierda/derecha para navegación
   - Soporte para pegar código completo

5. **Iconos usados (react-icons/fi):**
   - FiMail: Email
   - FiLock: Contraseña
   - FiKey: Código
   - FiEye/FiEyeOff: Mostrar/ocultar contraseña
   - FiCheck/FiX: Validación
   - FiArrowLeft: Volver

---

## ✅ Checklist de Implementación Móvil

### Autenticación Básica
- [ ] Configurar base URL de la API
- [ ] Implementar servicio de autenticación con todos los endpoints
- [ ] Implementar almacenamiento seguro de tokens
- [ ] Crear pantalla de Login
- [ ] Implementar sistema de toasts/snackbars

### Recuperación de Contraseña
- [ ] Crear pantalla de Forgot Password con validación de email
- [ ] Crear pantalla de Verify Code con inputs de 6 dígitos
- [ ] Crear pantalla de Reset Password con validación en tiempo real
- [ ] Implementar indicador de fortaleza de contraseña
- [ ] Configurar navegación entre pantallas con state
- [ ] Implementar auto-navegación después de operaciones exitosas

### Cambio de Contraseña (Usuario Autenticado)
- [ ] Crear pantalla/modal de Change Password
- [ ] Implementar validación de contraseña actual
- [ ] Implementar validación de nueva contraseña en tiempo real
- [ ] Mostrar mensaje de éxito después del cambio

### Pruebas
- [ ] Probar flujo completo de recuperación de contraseña
- [ ] Probar cambio de contraseña desde perfil
- [ ] Probar manejo de tokens expirados
- [ ] Probar manejo de errores de red
- [ ] Probar que el usuario puede iniciar sesión con nueva contraseña



