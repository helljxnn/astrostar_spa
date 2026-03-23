# AstroStar SPA

Aplicación web de AstroStar desarrollada con React y Vite. Este proyecto consume la API del backend para autenticación, gestión administrativa y consultas operativas de la plataforma.

## Qué incluye

- Interfaz web tipo SPA para los módulos principales de AstroStar.
- Integración con la API REST del backend.
- Configuración con Vite para desarrollo local y build de producción.
- Organización por `features`, `routes`, `shared` y estilos globales.

## Tecnologías principales

- React 18
- Vite
- React Router
- Axios
- Styled Components
- Tailwind CSS
- Jest y Testing Library

## Requisitos previos

- Node.js `22.15.0`
- npm `8` o superior
- Backend de AstroStar disponible en `http://localhost:4000/api` o en una URL equivalente

## Instalación

```bash
npm install
```

## Variables de entorno

El proyecto usa `VITE_API_URL` para definir la URL base del backend.

Ejemplo de archivo `.env`:

```env
VITE_API_URL=http://localhost:4000/api
```

Si no se define esta variable, varias partes de la aplicación usan `http://localhost:4000/api` como valor por defecto.

## Ejecución en desarrollo

```bash
npm run dev
```

Por defecto, Vite levanta la aplicación en:

- `http://localhost:5173`

La configuración actual también permite acceso desde la red local porque el servidor corre con `host: 0.0.0.0`.

## Build de producción

```bash
npm run build
```

Los archivos generados quedan en la carpeta `dist/`.

Para previsualizar el build:

```bash
npm run preview
```

## Scripts disponibles

```bash
npm run dev
npm run build
npm run preview
npm run lint
npm test
npm run test:watch
npm run test:coverage
```

## Estructura general

```text
astrostar_spa/
|- public/
|- scripts/
|- src/
|  |- features/
|  |- routes/
|  |- shared/
|  |- styles/
|  |- test/
|  `- __tests__/
|- .env
|- package.json
`- vite.config.js
```

## Relación con el backend

Para que la aplicación funcione correctamente en local:

1. El backend debe estar corriendo.
2. La variable `VITE_API_URL` debe apuntar a la API correcta.
3. Si vas a probar desde otra máquina en la red, usa una URL accesible desde ese entorno.
