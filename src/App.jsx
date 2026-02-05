import AppRoutes from "./routes/Router";
import { AuthProvider } from "./shared/contexts/authContext";
import LoadingProvider from "./shared/contexts/loaderContext";
import { useInstantTooltip } from "./shared/hooks/useInstantTooltip";
import GlobalLoader from "./shared/components/Loader/GlobalLoader";

function App() {
  // Inicializar tooltips instantáneos
  useInstantTooltip();

  return (
    <AuthProvider>
      <LoadingProvider>
        <AppRoutes />
        <GlobalLoader />
      </LoadingProvider>
    </AuthProvider>
  );
}

export default App;
