# Componente Loader

## Descripción

Sistema completo de loader con dos variantes: overlay global con fondo blur y loader inline para componentes específicos.

## Estructura de archivos

```
Loader/
├── index.js                 # Exportaciones principales
├── Loader.jsx              # Componente overlay global (pantalla completa)
├── InlineLoader.jsx         # Componente inline (para usar dentro de otros componentes)
├── GlobalLoader.jsx         # Componente global para el App
├── useLoader.js            # Hook y gestión de estado global
├── loaderInterceptor.js    # Interceptor automático para axios
├── LoaderUsageExample.jsx  # Ejemplos de uso
└── README.md              # Esta documentación
```

## Tipos de Loader

### 1. **Loader** (Overlay Global)

- **Uso**: Para operaciones que deben bloquear toda la interfaz
- **Características**:
  - Fondo blur que cubre toda la pantalla
  - Bloqueo completo de interacciones
  - `position: fixed` con `z-index: 9999`
  - Se usa con el hook `useLoader()` o funciones globales

### 2. **InlineLoader** (Componente Inline)

- **Uso**: Para mostrar carga dentro de componentes específicos
- **Características**:
  - Se renderiza inline sin overlay
  - No bloquea interacciones fuera del componente
  - Tamaños configurables (small, medium, large)
  - Ideal para modales, secciones de página, etc.

## Instalación rápida

### 1. Agregar al App principal

```jsx
// En tu App.jsx
import { GlobalLoader } from "./shared/components/Loader";

function App() {
  return (
    <div className="App">
      {/* Tu contenido */}
      <GlobalLoader />
    </div>
  );
}
```

### 2. Usar Loader Global (Overlay)

```jsx
import { useLoader } from "./shared/components/Loader";

const MiComponente = () => {
  const { showLoader, hideLoader } = useLoader();

  const handleAction = async () => {
    showLoader("Procesando...");
    try {
      // Tu lógica aquí
    } finally {
      hideLoader();
    }
  };

  return <button onClick={handleAction}>Procesar</button>;
};
```

### 3. Usar Loader Inline

```jsx
import { InlineLoader } from "./shared/components/Loader";

const MiComponente = () => {
  const [loading, setLoading] = useState(false);

  if (loading) {
    return (
      <div className="p-8">
        <InlineLoader message="Cargando datos..." size="medium" />
      </div>
    );
  }

  return <div>Mi contenido</div>;
};
```

### 4. Configurar interceptor de axios (opcional)

```jsx
import axios from "axios";
import { setupLoaderInterceptor } from "./shared/components/Loader";

const api = axios.create({ baseURL: "tu-api" });
setupLoaderInterceptor(api);
```

## API

### Hook useLoader() - Para Loader Global

```jsx
const {
  isLoading, // Estado actual
  message, // Mensaje actual
  showLoader, // Mostrar loader overlay
  hideLoader, // Ocultar loader overlay
  setLoaderMessage, // Cambiar mensaje
} = useLoader();
```

### Funciones globales - Para Loader Global

```jsx
import {
  showGlobalLoader,
  hideGlobalLoader,
  setGlobalLoaderMessage,
} from "./shared/components/Loader";

showGlobalLoader("Cargando...");
hideGlobalLoader();
setGlobalLoaderMessage("Nuevo mensaje");
```

### InlineLoader Props

```jsx
<InlineLoader
  message="Cargando..." // Mensaje a mostrar
  size="medium" // Tamaño: "small", "medium", "large"
/>
```

### Interceptor de axios

```jsx
import {
  setupLoaderInterceptor,
  withoutLoader,
} from "./shared/components/Loader";

// Configurar interceptor
setupLoaderInterceptor(axiosInstance);

// Petición sin loader
api.get("/data", withoutLoader());
// o
api.get("/data", { skipLoader: true });
```

## Cuándo usar cada tipo

### Usar **Loader** (Overlay Global) cuando:

- Necesites bloquear toda la interfaz
- Realizas operaciones críticas (guardar, eliminar, etc.)
- Quieres evitar que el usuario interactúe con otros elementos
- Usas el hook `useLoader()` o funciones globales

### Usar **InlineLoader** cuando:

- Cargas contenido específico de un componente
- Quieres mostrar carga sin bloquear el resto de la interfaz
- Estás dentro de modales, cards, secciones específicas
- El usuario puede seguir interactuando con otros elementos

## Ejemplos

Ver `LoaderUsageExample.jsx` para ejemplos completos de todas las funcionalidades.

## Estilos

### Loader (Overlay Global)

- Overlay con `backdrop-filter: blur(4px)`
- `z-index: 9999` para estar por encima de todo
- `pointer-events: all` para bloquear interacciones
- Animación suave de entrada y rotación

### InlineLoader

- Sin overlay, se renderiza inline
- Tamaños configurables
- Colores adaptados para uso en componentes
- Animación suave y centrado automático
