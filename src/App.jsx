import AppRoutes from "./routes/Router";
import { AuthProvider } from "./shared/contexts/authContext";
import { useInstantTooltip } from "./shared/hooks/useInstantTooltip";
import GlobalLoader from "./shared/components/Loader/GlobalLoader";

function App() {
  // Inicializar tooltips instantáneos
  useInstantTooltip();

  return (
    <AuthProvider>
      <AppRoutes />
      <GlobalLoader />
    </AuthProvider>
  );
}

export default App;
