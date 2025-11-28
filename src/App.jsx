import AppRoutes from "./routes/Router";
import { AuthProvider } from "./shared/contexts/authContext";
import LoadingProvider from "./shared/contexts/loaderContext";
import { useInstantTooltip } from "./shared/hooks/useInstantTooltip";

function App() {
  // Inicializar tooltips instantáneos
  useInstantTooltip();

  return (
    <AuthProvider>
      <LoadingProvider>
        <AppRoutes />
      </LoadingProvider>
    </AuthProvider>
  );
}

export default App;
