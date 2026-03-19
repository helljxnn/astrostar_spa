# 🌟 AstroStar SPA (Frontend)

Frontend web de AstroStar, desarrollado como **Single Page Application (SPA)**.  
Se conecta al backend de AstroStar para la gestión de atletas, servicios, roles, inscripciones y más.

Incluye un set de **pruebas automatizadas** con **Jest** y **Testing Library** para el taller de pruebas.

## 📋 Tabla de contenidos

- [Tecnologías](#-tecnologías)
- [Requisitos previos](#-requisitos-previos)
- [Instalación](#-instalación)
- [Scripts disponibles](#-scripts-disponibles)
- [Pruebas automatizadas](#-pruebas-automatizadas)
- [Estructura del proyecto](#-estructura-del-proyecto)

## 🧰 Tecnologías

- Framework SPA (React / similar).
- **Jest** + **@testing-library** para pruebas.
- npm / Node.js para gestión de dependencias.


## 📌 Requisitos previos

- **Node.js** 22.15.0 (misma versión definida en `.nvmrc`)  
- **npm** ≥ 8.0.0  
- Backend AstroStar corriendo (por defecto en `http://localhost:4000`).

## 🚀 Instalación

1. Clona el proyecto (si no lo has hecho) y entra a la carpeta del SPA:

```bash
cd astrostar_spa
```

2. Instala dependencias:

```bash
npm install
```

3. Configura variables de entorno (si aplica), por ejemplo:

```bash
# .env.local (ejemplo)
VITE_API_URL=http://localhost:4000/api
```

## 🧾 Scripts disponibles

```bash
npm start          # Iniciar la app en modo desarrollo
npm run build      # Generar build de producción
npm run preview    # Previsualizar build de producción (si usas Vite)
npm test           # Ejecutar pruebas
npm run test:watch # Ejecutar pruebas en modo watch
npm run test:coverage # Reporte de cobertura
```

> Algunos scripts pueden variar según la configuración real del proyecto.  
> Revisa `package.json` para ver la lista final de scripts disponibles.

## 🧪 Pruebas automatizadas

Este frontend usa **Jest** + **Testing Library** para las pruebas del taller.

Pruebas incluidas (ejemplo):

- `src/__tests__/Login.render.test.jsx`
- `src/__tests__/Login.validation.test.jsx`
- `src/__tests__/PermissionsUI.test.jsx`
- `src/__tests__/List.test.jsx`

### Ejecutar pruebas

```bash
npm test
npm run test:watch
npm run test:coverage
```

### Evidencia de ejecución

- Los resultados de consola se guardan en:  
  `astrostar_spa/test-results/`

## 🗂️ Estructura del proyecto

Estructura de ejemplo (puede variar según tu implementación real):

```text
astrostar_spa/
├─ src/
│  ├─ components/      # Componentes reutilizables
│  ├─ pages/           # Páginas / vistas
│  ├─ hooks/           # Hooks personalizados
│  ├─ services/        # Llamadas a la API AstroStar
│  ├─ context/         # Context providers (auth, permisos, etc.)
│  └─ __tests__/       # Pruebas Jest + Testing Library
├─ public/
├─ package.json
└─ README.md
```

---

**AstroStar SPA – Frontend**
# AstroStar SPA - Pruebas Automatizadas (Jest)

Este frontend usa Jest + Testing Library para las pruebas del taller.

## Pruebas incluidas

- `src/__tests__/Login.render.test.jsx`
- `src/__tests__/Login.validation.test.jsx`
- `src/__tests__/PermissionsUI.test.jsx`
- `src/__tests__/List.test.jsx`

## Ejecutar pruebas

```bash
npm test
npm run test:watch
npm run test:coverage
```

## Evidencia

- Los resultados de consola se guardan en `astrostar_spa/test-results/`.
