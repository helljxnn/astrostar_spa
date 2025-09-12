import { Hero } from "../components/Hero";
import { motion } from "framer-motion";

// Componente de tarjeta de categoría
function CategoryCard({ title, imageUrl, description }) {
  return (
    <div className="relative w-full h-80 overflow-hidden rounded-2xl shadow-lg group flex">
      {/* Imagen que siempre está */}
      <div className="w-3/5 h-full relative overflow-hidden">
        <motion.img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover"
          whileHover={{ scale: 0.95 }} // zoom out suave
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />
        {/* Título sobre la imagen */}
        <div className="absolute bottom-2 left-2 bg-black/60 text-white px-3 py-1 rounded-lg text-sm font-semibold">
          {title}
        </div>
      </div>

      {/* Panel lateral con texto que aparece en hover */}
      <motion.div
        className="w-2/5 h-full 
                   bg-gradient-to-r from-purple-200 via-purple-100 to-blue-200 
                   flex flex-col items-center justify-center text-center px-4 
                   opacity-0 group-hover:opacity-100 transition-opacity duration-500"
      >
        <h3 className="text-gray-800 text-xl font-bold mb-3">{title}</h3>
        <p className="text-gray-700 text-base">{description}</p>
      </motion.div>
    </div>
  );
}

// Página de categorías
function Categories() {
  return (
    <div>
      {/* Hero superior */}
      <Hero
        title="Categorías"
        subtitle="Nuestras categorías son el eje de formación integral: desde el deporte que fortalece el cuerpo, hasta la psicología y la nutrición que cuidan la mente y la salud. También trabajamos en la educación, la fisioterapia y la familia, creando espacios que impulsan el talento, la confianza y los valores para la vida."
        imageUrl="public/assets/images/CategoriasHero.jpg"
      />

      {/* Sección de categorías */}
      <div className="bg-gray-50 px-6 py-16 text-center">
        {/* Título con degradado más grande y llamativo */}
        <h2 className="text-4xl md:text-5xl font-extrabold mb-3 bg-gradient-to-r from-purple-400 via-purple-300 to-blue-300 bg-clip-text text-transparent">
          Categorías de Formación Integral
        </h2>

        {/* Subtítulo más legible */}
        <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto mb-10">
          Conoce cómo cada categoría responde a las necesidades de niñas y jóvenes, 
          combinando deporte, disciplina y valores.
        </p>

        {/* Tarjetas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CategoryCard
            title="Categoría Infantil"
            imageUrl="public/assets/images/Infantil.jpg"
            description="Para niñas de 5 a 10 años: el primer paso hacia el fútbol, aprendiendo valores, disciplina y disfrutando cada entrenamiento."
          />
          <CategoryCard
            title="Categoría Pre-Juvenil"
            imageUrl="public/assets/images/Pre-Juvenil.jpg"
            description="Para jóvenes de 11 a 14 años: se fortalece el talento, la técnica y la estrategia, integrando disciplina y crecimiento personal."
          />
          <CategoryCard
            title="Categoría Juvenil"
            imageUrl="public/assets/images/Juvenil.jpg"
            description="Dirigida a adolescentes de 15 a 17 años: consolidan su talento con enfoque competitivo y proyección profesional."
          />
        </div>
      </div>
    </div>
  );
}

export default Categories;
