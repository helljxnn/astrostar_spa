# Seguridad en el Frontend - AstroStar SPA

## Problema Identificado: Contraseñas Visibles en Inspector

### Descripción del Problema

Se identificó que las contraseñas pueden ser visibles en el inspector del navegador cuando se examina el DOM. Aunque el campo tiene `type="password"` (que oculta visualmente la contraseña con asteriscos), el valor real está presente en el atributo `value` del elemento HTML.

### ¿Por qué sucede esto?

- Los navegadores almacenan el valor real en el DOM para poder procesarlo
- El inspector de elementos permite ver el HTML completo, incluyendo valores de campos
- Esto es un comportamiento estándar de los navegadores y no se puede evitar completamente

### Medidas Implementadas

#### 1. Atributos de Seguridad en Campos de Contraseña

```jsx
<input
  type="password"
  autoComplete="current-password"
  name="password"
  id="password"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
/>
```

- `type="password"`: Oculta visualmente la contraseña
- `autoComplete="current-password"`: Indica al navegador que es una contraseña actual
- `name` e `id`: Necesarios para el autocompletado seguro del navegador

#### 2. Campos de Email Correctamente Configurados

```jsx
<input type="email" autoComplete="email" name="email" id="email" />
```

### Limitaciones Importantes

#### ⚠️ No se puede evitar completamente la inspección del DOM

- Cualquier usuario con acceso físico a la computadora puede inspeccionar el DOM
- El valor de la contraseña estará presente mientras el usuario la escribe
- Esto es un comportamiento estándar de todos los navegadores web

### Mejores Prácticas de Seguridad

#### En el Frontend:

1. ✅ Usar `type="password"` siempre
2. ✅ Nunca almacenar contraseñas en localStorage o sessionStorage
3. ✅ Limpiar el estado de contraseñas después del login
4. ✅ Usar HTTPS en producción (obligatorio)
5. ✅ Implementar rate limiting en el backend
6. ✅ No mostrar mensajes de error específicos ("usuario no existe" vs "contraseña incorrecta")

#### En el Backend:

1. ✅ Hash de contraseñas con bcrypt (ya implementado)
2. ✅ Validación de contraseñas fuertes
3. ✅ Rate limiting en endpoints de autenticación (ya implementado)
4. ✅ Tokens JWT con expiración corta
5. ✅ Refresh tokens seguros

### Recomendaciones Adicionales

#### Para Usuarios:

- No usar computadoras públicas para acceder a cuentas sensibles
- Cerrar sesión después de usar la aplicación
- Usar contraseñas únicas y fuertes
- Habilitar autenticación de dos factores (cuando esté disponible)

#### Para Desarrollo:

- Considerar implementar 2FA (autenticación de dos factores)
- Implementar detección de sesiones sospechosas
- Logs de intentos de login fallidos
- Notificaciones de login desde nuevos dispositivos

### Contexto de Seguridad Web

Es importante entender que:

- El inspector del navegador es una herramienta de desarrollo legítima
- Si alguien tiene acceso físico a una computadora desbloqueada, puede ver lo que el usuario escribe
- La seguridad real está en:
  - Transmisión segura (HTTPS)
  - Almacenamiento seguro en el backend (hashing)
  - Protección contra ataques remotos (rate limiting, CORS, etc.)
  - Educación del usuario sobre seguridad física

### Conclusión

Las mejoras implementadas siguen las mejores prácticas de la industria. El "problema" de ver contraseñas en el inspector es inherente a cómo funcionan los navegadores web y no representa una vulnerabilidad de seguridad real, siempre que:

1. Se use HTTPS en producción
2. Las contraseñas se hasheen en el backend
3. Se implementen medidas de protección contra ataques remotos
4. Los usuarios protejan el acceso físico a sus dispositivos

---

**Última actualización:** Marzo 2026
**Responsable:** Equipo de Desarrollo AstroStar
