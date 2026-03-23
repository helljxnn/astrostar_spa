import { Hero } from "../../components/Hero";
import { StoriesSection } from "./components/StoriesSection";
import { TestimonialsSection } from "./components/TestimonialsSection";

function Stories() {
  return (
    <>
      {/* Banner principal */}
      <Hero
        variant="image-only"
        imageUrl="/assets/images/Stories/Imagen_baner_Testimonies.jpg"
      />

      {/* Sección de historias */}
      <StoriesSection />

      {/* Sección de testimonios */}
      <TestimonialsSection />
    </>
  );
}

export default Stories;
