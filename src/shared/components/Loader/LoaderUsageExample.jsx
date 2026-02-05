import { useState } from "react";
import {
  useLoader,
  showGlobalLoader,
  hideGlobalLoader,
  setGlobalLoaderMessage,
} from "./useLoader";

const LoaderUsageExample = () => {
  const { showLoader, hideLoader, setLoaderMessage } = useLoader();
  const [data, setData] = useState(null);

  // Ejemplo 1: Usando el hook
  const handleFetchWithHook = async () => {
    try {
      showLoader("Obteniendo datos...");

      // Simular petición
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setData("Datos obtenidos correctamente");
    } catch (error) {
      console.error("Error:", error);
    } finally {
      hideLoader();
    }
  };

  // Ejemplo 2: Usando funciones globales
  const handleFetchWithGlobal = async () => {
    try {
      showGlobalLoader("Procesando información...");

      // Simular petición con cambio de mensaje
      setTimeout(() => {
        setGlobalLoaderMessage("Casi terminando...");
      }, 1000);

      await new Promise((resolve) => setTimeout(resolve, 3000));

      setData("Procesamiento completado");
    } catch (error) {
      console.error("Error:", error);
    } finally {
      hideGlobalLoader();
    }
  };

  // Ejemplo 3: Múltiples operaciones
  const handleMultipleOperations = async () => {
    try {
      showLoader("Iniciando proceso...");

      // Operación 1
      setLoaderMessage("Validando datos...");
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Operación 2
      setLoaderMessage("Guardando información...");
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Operación 3
      setLoaderMessage("Finalizando...");
      await new Promise((resolve) => setTimeout(resolve, 800));

      setData("Todas las operaciones completadas");
    } catch (error) {
      console.error("Error:", error);
    } finally {
      hideLoader();
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Ejemplos de uso del Loader</h2>

      <div style={{ marginBottom: "20px" }}>
        <button onClick={handleFetchWithHook} style={{ marginRight: "10px" }}>
          Ejemplo con Hook
        </button>

        <button onClick={handleFetchWithGlobal} style={{ marginRight: "10px" }}>
          Ejemplo Global
        </button>

        <button onClick={handleMultipleOperations}>
          Múltiples Operaciones
        </button>
      </div>

      {data && (
        <div
          style={{
            padding: "10px",
            backgroundColor: "#f0f0f0",
            borderRadius: "4px",
          }}
        >
          <strong>Resultado:</strong> {data}
        </div>
      )}

      <div style={{ marginTop: "30px" }}>
        <h3>Cómo usar:</h3>
        <pre
          style={{
            backgroundColor: "#f5f5f5",
            padding: "15px",
            borderRadius: "4px",
          }}
        >
          {`// 1. Importar el hook o funciones globales
import { useLoader, showGlobalLoader, hideGlobalLoader } from '../hooks/useLoader';

// 2. En un componente con hook
const { showLoader, hideLoader, setLoaderMessage } = useLoader();

// 3. Mostrar loader
showLoader('Mensaje personalizado');

// 4. Cambiar mensaje
setLoaderMessage('Nuevo mensaje');

// 5. Ocultar loader
hideLoader();

// 6. O usar funciones globales
showGlobalLoader('Cargando...');
hideGlobalLoader();`}
        </pre>
      </div>
    </div>
  );
};

export default LoaderUsageExample;
