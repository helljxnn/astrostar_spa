import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Hero } from "./Hero";
import { Footer } from "./Footer";
import { ScrollTop } from "./ScrollTop";

function LayoutLanding() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />

      {/* Hero directamente después del navbar */}
      <Hero />

      {/* Contenido dinámico de las páginas */}
      <main className="flex-1 w-full">
        <Outlet />
      </main>

      <Footer />
      <ScrollTop />
    </div>
  );
}

export default LayoutLanding;
