import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Hero } from "../../components/Hero";
import { Founder } from "./components/Founder";
import { MissionVisionObjective } from "./components/MissionVisionObjective";
import { History } from "./components/History";
import { Team } from "./components/Team";
import { Allies } from "./components/Allies";

function Foundation() {
  const location = useLocation();

  useEffect(() => {
    // Manejar scroll al hash cuando la página carga
    if (location.hash) {
      // Delay mínimo para asegurar que el DOM esté listo
      setTimeout(() => {
        const element = document.querySelector(location.hash);
        if (element) {
          element.scrollIntoView({ behavior: "auto", block: "start" });
        }
      }, 50);
    }
  }, [location]);

  return (
    <>
      {/* Banner solo con imagen, sin texto ni cuadro blanco */}
      <Hero
        variant="image-only"
        imageUrl="/assets/images/Foundation/banner_foundation.jpg"
      />

      {/* Sección Fundadora */}
      <Founder />

      {/* Misión, Visión y Objetivo */}
      <MissionVisionObjective />

      {/* Historia con video de YouTube */}
      <History />

      {/* Equipo con Circular Gallery */}
      <Team />

      {/* Aliados con carousel horizontal infinito */}
      <Allies />
    </>
  );
}

export default Foundation;
