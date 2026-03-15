import { Hero } from "../components/Hero";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import apiClient from "../../../shared/services/apiClient";

const placeholderImage = "/assets/images/placeholder-category.jpg";

const normalizeCategories = (raw = []) =>
  raw
    .filter(Boolean)
    .map((cat, index) => ({
      id: cat.id ?? cat.Id ?? index,
      name: cat.name ?? cat.nombre ?? "Categoria sin nombre",
      description: cat.description ?? cat.descripcion ?? "",
      minAge: cat.minAge ?? cat.edadMinima ?? null,
      maxAge: cat.maxAge ?? cat.edadMaxima ?? null,
      imageUrl:
        cat.imageUrl ??
        cat.fileUrl ??
        cat.archivo ??
        cat.image ??
        cat.file ??
        cat.imagen ??
        null,
    }));

const LoadingGrid = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
    {Array.from({ length: 6 }).map((_, idx) => (
      <div
        key={idx}
        className="h-96 rounded-3xl border border-gray-100 bg-white shadow-lg overflow-hidden animate-pulse"
      >
        <div className="h-64 bg-gray-200" />
        <div className="p-6 space-y-3">
          <div className="h-5 w-2/3 bg-gray-200 rounded" />
          <div className="h-4 w-full bg-gray-200 rounded" />
          <div className="h-4 w-1/2 bg-gray-200 rounded" />
        </div>
      </div>
    ))}
  </div>
);

function CategoryCard({ name, imageUrl, description, minAge, maxAge }) {
  const ageRange =
    minAge !== null && maxAge !== null ? `${minAge} - ${maxAge} años` : "Todas las edades";

  return (
    <motion.article
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false }}
      transition={{ duration: 0.6, type: "spring" }}
      whileHover={{
        y: -10,
        boxShadow: "0 20px 40px rgba(181, 149, 255, 0.2)",
        transition: { duration: 0.3 },
      }}
      className="group relative overflow-hidden rounded-3xl bg-white shadow-xl border border-gray-100 hover:border-[#B595FF]/30 transition-all duration-500 cursor-pointer"
    >
      {/* Imagen */}
      <div className="relative h-64 w-full overflow-hidden">
        <motion.img
          src={imageUrl || placeholderImage}
          alt={name}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          onError={(e) => {
            e.target.src = placeholderImage;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        
        {/* Badge de edad */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          whileInView={{ scale: 1, rotate: 0 }}
          viewport={{ once: false }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="absolute top-6 right-6"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-[#B595FF] to-[#9BE9FF] rounded-full blur-md opacity-50" />
            <div className="relative bg-white backdrop-blur-md px-4 py-2 rounded-full border border-[#B595FF]/20 shadow-lg">
              <span className="text-sm font-bold text-[#B595FF]">{ageRange}</span>
            </div>
          </div>
        </motion.div>

        {/* Nombre sobre la imagen */}
        <div className="absolute bottom-6 left-6 right-6">
          <h3 className="text-2xl font-bold text-white font-montserrat drop-shadow-lg">
            {name}
          </h3>
        </div>
      </div>

      {/* Contenido */}
      <div className="p-6 bg-white">
        <p className="text-gray-600 text-base leading-relaxed">
          {description || "Categoría deportiva diseñada para el desarrollo integral de las deportistas."}
        </p>
      </div>

      {/* Línea decorativa animada */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#B595FF] to-transparent"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: false }}
        transition={{ delay: 0.3, duration: 0.8 }}
      />
    </motion.article>
  );
}

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPublicCategories = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await apiClient.get("/sports-categories/public");
        const payload = Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response?.data?.data)
          ? response.data.data
          : [];

        setCategories(normalizeCategories(payload));
      } catch (err) {
        console.error("Error fetching categories:", err);
        setError(err.message || "No se pudieron cargar las categorías.");
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPublicCategories();
  }, []);

  return (
    <div>
      {/* Hero con imagen de fondo */}
      <Hero
        variant="image-only"
        imageUrl="/assets/images/CategoriasHero.jpg"
      />

      {/* Sección de Categorías */}
      <section className="bg-gradient-to-b from-white via-gray-50 to-white px-6 sm:px-10 lg:px-20 py-20">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 font-montserrat mb-4">
              Categorías
            </h2>
            <p className="text-gray-700 leading-relaxed text-lg max-w-3xl mx-auto">
              Programas diseñados para el desarrollo integral de cada etapa. Desde los primeros pasos hasta la proyección profesional.
            </p>
          </motion.div>

          {/* Mensaje de error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <div className="inline-flex items-center justify-center rounded-xl bg-red-50 px-6 py-3 text-red-600 border border-red-200 shadow-sm">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            </motion.div>
          )}

          {/* Grid de categorías */}
          {loading ? (
            <LoadingGrid />
          ) : categories.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-6">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <p className="text-gray-500 text-lg">
                No hay categorías disponibles en este momento.
              </p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {categories.map((category, index) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <CategoryCard {...category} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
