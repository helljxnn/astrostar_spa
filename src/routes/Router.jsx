import { Routes, Route } from "react-router-dom";

/* Landing Pages*/
import LayoutLanding from "../features/landing/components/LayoutLanding.jsx";
import Foundation from "../features/landing/pages/Foundation/Foundation.jsx";
import Stories from "../features/landing/pages/Stories/Stories.jsx";
import Categories from "../features/landing/pages/Categories.jsx";
import { Events } from "../features/landing/pages/Events/Events.jsx";
import Home from "../features/landing/pages/Home/Home.jsx";
import Donations from "../features/landing/pages/Donations/Donations.jsx";
import Login from "../features/auth/pages/Login.jsx";
import ForgotPassword from "../features/auth/pages/ForgotPassword.jsx";
import VerifyCode from "../features/auth/pages/VerifyCode.jsx";
import ResetPassword from "../features/auth/pages/ResetPassword.jsx";
import Services from "../features/landing/pages/Services/Services.jsx";
import { Unauthorized } from "../shared/components/Unauthorized.jsx";
import RescheduleResponse from "../features/public/RescheduleResponse.jsx";
import PrivateRoutes from "./PrivateRoutes.jsx";

function AppRoutes() {
  return (
    <Routes>
      {/* Rutas públicas con LayoutLanding */}
      <Route element={<LayoutLanding />}>
        <Route path="/" element={<Home />} />
        <Route path="/fundacion" element={<Foundation />} />
        <Route path="/historias" element={<Stories />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/events" element={<Events />} />
        <Route path="/services" element={<Services />} />
        <Route path="/donacion" element={<Donations />} />
      </Route>

      {/* Rutas de autenticación sin Layout */}
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/verify-code" element={<VerifyCode />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Ruta pública para reagendamiento de citas */}
      <Route path="/appointments/reschedule/:token/:action" element={<RescheduleResponse />} />

      {/* Ruta pública para acceso no autorizado */}
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Rutas Privadas */}
      <Route path="/*" element={<PrivateRoutes />} />
    </Routes>
  );
}

export default AppRoutes;
