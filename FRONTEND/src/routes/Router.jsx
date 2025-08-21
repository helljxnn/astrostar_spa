
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LayoutLanding from "../features/landing/components/LayoutLanding"; // Layout con Navbar y Footer
import Home from "../features/landing/pages/Home";
import About from "../features/landing/pages/About";
import Services from "../features/landing/pages/Services";
import Categories from "../features/landing/pages/Categories";
import Events from "../features/landing/pages/Events";
import Login from "../features/auth/pages/Login";
import SideBar from "../features/dashboard/components/SideBar";


function AppRoutes() {
  return (
      <Routes>
        {/* Grupo con LayoutLanding (Navbar + Footer) */}
        <Route element={<LayoutLanding />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/events" element={<Events />} />
          <Route path="/login" element={<Login />} />
        </Route>

        {/*  de ruta Dashboard*/}
        <Route path="/dashboard" element={<SideBar />} />
      </Routes>
  );
}

export default AppRoutes;

