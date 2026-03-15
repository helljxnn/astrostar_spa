import { Hero } from "../../components/Hero";
import { StoriesSection } from "./components/StoriesSection";
import { TestimonialsSection } from "./components/TestimonialsSection";

function Stories() {
  return (
    <>
      {/* Banner principal */}
      <Hero
        variant="image-only"
        imageUrl="https://drive.google.com/thumbnail?id=1XBxLG_XGO1aBVHiHSa-PG3NFV1ZHtFwY&sz=w1400"
      />

      {/* Sección de historias */}
      <StoriesSection />

      {/* Sección de testimonios */}
      <TestimonialsSection />
    </>
  );
}

export default Stories;