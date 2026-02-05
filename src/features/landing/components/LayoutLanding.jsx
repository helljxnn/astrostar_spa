import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Hero } from "./Hero";
import { Footer } from "./Footer";
import { ScrollTop } from "./ScrollTop";
import { useLoading } from "../../../shared/contexts/loaderContext";
import Loader from "../../../shared/components/Loader/Loader";

function LayoutLanding() {
  const { loader } = useLoading();
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Loader isVisible={loader} message="Cargando..." />
      <Navbar />
      <Hero />
      <main className="flex-1 w-full">
        <Outlet />
      </main>
      <Footer />
      <ScrollTop />
    </div>
  );
}

export default LayoutLanding;
