import { Routes, Route } from "react-router-dom";

/* Landing Pages*/
import LayoutLanding from "../features/landing/components/LayoutLanding.jsx";
import Foundation from "../features/landing/pages/Foundation/Foundation.jsx";
import AreasProjects from "../features/landing/pages/AreasProjects/AreasProjects.jsx";
import Gallery from "../features/landing/pages/Gallery/Gallery.jsx";
import Stories from "../features/landing/pages/Stories/Stories.jsx";
import { Events } from "../features/landing/pages/Events/Events.jsx";
import Home from "../features/landing/pages/Home/Home.jsx";
import Donations from "../features/landing/pages/Donations/Donations.jsx";
import Login from "../features/auth/pages/Login.jsx";
import ForgotPassword from "../features/auth/pages/ForgotPassword.jsx";
import VerifyCode from "../features/auth/pages/VerifyCode.jsx";
import ResetPassword from "../features/auth/pages/ResetPassword.jsx";
import { Unauthorized } from "../shared/components/Unauthorized.jsx";
import { NotFound } from "../shared/components/NotFound.jsx";
import PrivateRoutes from "./PrivateRoutes.jsx";

function AppRoutes() {
  return (
    <Routes>
      {/* Rutas públicas con LayoutLanding */}
      <Route element={<LayoutLanding />}>
        <Route path="/" element={<Home />} />
        <Route path="/fundacion" element={<Foundation />} />
        <Route path="/areas-proyectos" element={<AreasProjects />} />
        <Route path="/galeria" element={<Gallery />} />
        <Route path="/historias" element={<Stories />} />
        <Route path="/events" element={<Events />} />
        <Route path="/donacion" element={<Donations />} />
      </Route>

      {/* Rutas de autenticación sin Layout */}
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/verify-code" element={<VerifyCode />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Ruta pública para acceso no autorizado */}
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Rutas Privadas */}
      <Route path="/dashboard/*" element={<PrivateRoutes />} />

      {/* Catch-all público */}
      <Route
        path="*"
        element={
          <NotFound
            title="Oops, esta ruta no existe"
            description="Revisa la URL o vuelve a una seccion principal para continuar."
            primaryHref="/"
            primaryLabel="Ir al inicio"
            secondaryHref="/dashboard"
            secondaryLabel="Ir al dashboard"
          />
        }
      />
    </Routes>
  );
}

export default AppRoutes;


