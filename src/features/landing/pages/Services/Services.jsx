import { Hero } from "../../components/Hero";
import { ServicesHeader } from "./components/ServicesHeader";
import { ServicesGrid } from "./components/ServicesGrid";

function Services() {
  return (
    <>
      <Hero
        variant="background"
        title="SERVICIOS"
        subtitle="En la Fundación Manuela Vanegas, estamos comprometidas con el desarrollo integral de las futbolistas y la promoción del fútbol femenino.Ofrecemos una variedad de programas diseñados para nutrir el talento, fomentar el crecimiento personal y construir una comunidad fuerte."
        imageUrl="/assets/images/services_image.jpg"
      />
      <ServicesHeader />
      <ServicesGrid />
    </>
  );
}

export default Services;
