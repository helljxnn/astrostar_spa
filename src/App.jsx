import React from "react";
import AppRoutes from "./routes/Router";
import AuthProvider from "./shared/contexts/authContext";
import LoadingProvider from "./shared/contexts/loaderContext";


function App() {
  return (
    <AuthProvider>
      <LoadingProvider>
        <AppRoutes />
      </LoadingProvider>
    </AuthProvider>
  );
}

export default App;
