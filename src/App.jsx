import React from "react";
import AppRoutes from "./routes/Router";
import { AuthProvider } from "./shared/contexts/authContext";
import { EnrollmentsProvider } from "./shared/contexts/EnrollmentsContext";
import { useInstantTooltip } from "./shared/hooks/useInstantTooltip";
import GlobalLoader from "./shared/components/Loader/GlobalLoader";

function App() {
  // Inicializar tooltips instantáneos
  useInstantTooltip();

  return (
    <AuthProvider>
      <EnrollmentsProvider>
        <AppRoutes />
        <GlobalLoader />
      </EnrollmentsProvider>
    </AuthProvider>
  );
}

export default App;
