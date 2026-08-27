# AstroStar SPA

AstroStar web application built with React and Vite. This project consumes the backend API for authentication, administrative management, and operational queries across the platform.

## What It Includes

- A single-page application interface for AstroStar's main modules.
- Integration with the backend REST API.
- Vite configuration for local development and production builds.
- Project organization based on `features`, `routes`, `shared`, and global styles.

## Main Technologies

- React 18
- Vite
- React Router
- Axios
- Styled Components
- Tailwind CSS
- Jest and Testing Library

## Prerequisites

- Node.js `22.15.0`
- npm `8` or later
- AstroStar Backend available at `http://localhost:4000/api` or an equivalent URL

## Installation

```bash
npm install
```

## Environment Variables

The project uses `VITE_API_URL` to define the backend's base URL.

Example `.env` file:

```env
VITE_API_URL=http://localhost:4000/api
```

If this variable is not defined, several parts of the application use `http://localhost:4000/api` as the default value.

## Running in Development

```bash
npm run dev
```

By default, Vite serves the application at:

- `http://localhost:5173`

The current configuration also allows access from the local network because the server runs with `host: 0.0.0.0`.

## Production Build

```bash
npm run build
```

The generated files are placed in the `dist/` directory.

To preview the production build:

```bash
npm run preview
```

## Available Scripts

```bash
npm run dev
npm run build
npm run preview
npm run lint
npm test
npm run test:watch
npm run test:coverage
```

## Project Structure

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

## Backend Integration

For the application to work correctly in a local environment:

1. The backend must be running.
2. The `VITE_API_URL` variable must point to the correct API.
3. If you are testing from another machine on the network, use a URL that is accessible from that environment.
