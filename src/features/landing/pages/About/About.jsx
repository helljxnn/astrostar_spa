import { Hero } from "../../components/Hero";
import { MissionVisionValues } from "./components/MissionVisionValues";

function About() {
  return (
    <>
      <Hero
        variant="background"
        title="OBJETIVO"
        subtitle="Promover el desarrollo integral de las personas y su relación con el entorno, fomentando el deporte, la recreación, la actividad física y el uso saludable del tiempo libre. También busca incentivar la participación ciudadana y el respeto por los derechos humanos, en línea con la Constitución colombiana y las leyes actuales."
        imageUrl="/assets/images/about_image.jpg"
      />
      
      <MissionVisionValues />
    </>
  );
}

export default About;