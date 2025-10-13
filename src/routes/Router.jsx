import { Routes, Route } from "react-router-dom";

/* Landing Pages*/
import LayoutLanding from "../features/landing/components/LayoutLanding.jsx";
import About from "../features/landing/pages/About/About.jsx";
import Categories from "../features/landing/pages/Categories.jsx";
import { Events } from "../features/landing/pages/Events/Events.jsx";
import Home from "../features/landing/pages/Home/Home.jsx";
import Login from "../features/auth/pages/Login.jsx";
import ForgotPassword from "../features/auth/pages/ForgotPassword.jsx";
import Services from "../features/landing/pages/Services/Services.jsx";
import PrivateRoutes from "./PrivateRoutes.jsx"; 

function AppRoutes() {
  return (
    <Routes>
      {/* Rutas públicas con LayoutLanding */}
      <Route element={<LayoutLanding />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/events" element={<Events />} />
        <Route path="/services" element={<Services />} />
      </Route>
      {/* Rutas de autenticación sin Layout */}
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Rutas Privadas */}
      <Route path="/*" element={<PrivateRoutes />} />
    </Routes>
  );
}

export default AppRoutes;