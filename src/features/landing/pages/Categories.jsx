// src/components/Categories.jsx
import { Hero } from "../components/Hero"; // Asegúrate que exista y reciba `title`, `subtitle`, `imageUrl`
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import apiClient from "../../../shared/services/apiClient"; // Ajusta la ruta según tu estructura

// ✅ Tarjeta de categoría estandarizada (usa campos en inglés)
function CategoryCard({ id, name, imageUrl, description, minAge, maxAge }) {
  return (
    <div className="relative w-full h-80 overflow-hidden rounded-2xl shadow-lg group flex">
      {/* Imagen */}
      <div className="w-3/5 h-full relative overflow-hidden bg-gray-200">
        <motion.img
          src={imageUrl || "/assets/images/placeholder-category.jpg"}
          alt={name}
          className="w-full h-full object-cover"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.3 }}
          onError={(e) => {
            e.target.src = `https://via.placeholder.com/400x300?text=${encodeURIComponent(
              name
            )}`;
          }}
        />
        {/* Nombre superpuesto */}
        <div className="absolute bottom-2 left-2 bg-black/60 text-white px-3 py-1 rounded-lg text-sm font-semibold">
          {name}
        </div>
      </div>

      {/* Panel lateral (aparece al hover) */}
      <motion.div
        className="w-2/5 h-full 
                   bg-gradient-to-r from-purple-200 via-purple-100 to-blue-200 
                   flex flex-col items-center justify-center text-center px-4 
                   opacity-0 group-hover:opacity-100 transition-opacity duration-500"
      >
        <h3 className="text-gray-800 text-xl font-bold mb-2">{name}</h3>
        <p className="text-gray-700 text-sm px-2">
          {description || "Categoría deportiva"}
        </p>
        <p className="text-gray-600 text-sm mt-3">
          Edad: {minAge} — {maxAge} años
        </p>
      </motion.div>
    </div>
  );
}

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPublicCategories = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await apiClient.get("/sports-categories/public");

        // Normalización robusta: maneja tanto {  [...] } como directamente [...]
        let data = [];
        if (Array.isArray(response.data)) {
          data = response.data;
        } else if (response.data?.data && Array.isArray(response.data.data)) {
          data = response.data.data;
        } else if (response.data && Array.isArray(response.data)) {
          data = response.data;
        }

        // Mapeo seguro: asegura que cada categoría tenga los campos necesarios
        const normalized = data.map((cat) => ({
          id: cat.id,
          name: cat.name || cat.nombre || "Sin nombre",
          description: cat.description || cat.descripcion || "",
          minAge: cat.minAge || cat.edadMinima || 0,
          maxAge: cat.maxAge || cat.edadMaxima || 18,
          imageUrl: cat.imageUrl || cat.archivo || null,
        }));

        setCategories(normalized);
      } catch (err) {
        console.error("Error fetching categories:", err);
        setError(err.message || "No se pudieron cargar las categorías");
        // Fallback visual (opcional)
        setCategories([
          {
            id: 1,
            name: "Infantil",
            description: "Para niñas de 5 a 10 años: primeros pasos en el fútbol.",
            minAge: 5,
            maxAge: 10,
            imageUrl: "/assets/images/Infantil.jpg",
          },
          {
            id: 2,
            name: "Pre-Juvenil",
            description: "Desarrollo técnico y táctico para jóvenes de 11 a 14 años.",
            minAge: 11,
            maxAge: 14,
            imageUrl: "/assets/images/Pre-Juvenil.jpg",
          },
          {
            id: 3,
            name: "Juvenil",
            description: "Enfoque competitivo para adolescentes de 15 a 17 años.",
            minAge: 15,
            maxAge: 17,
            imageUrl: "/assets/images/Juvenil.jpg",
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchPublicCategories();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div>
      <Hero
        title="Categorías"
        subtitle="Programas diseñados para el desarrollo integral de cada etapa."
        imageUrl="/assets/images/CategoriasHero.jpg"
      />

      <div className="bg-gray-50 px-4 sm:px-6 py-12 md:py-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-3 bg-gradient-to-r from-purple-500 via-purple-400 to-blue-500 bg-clip-text text-transparent">
            Categorías de Formación Integral
          </h2>
          <p className="text-gray-600 text-center max-w-2xl mx-auto mb-10">
            Desde los primeros pasos hasta la proyección profesional.
          </p>

          {error && (
            <div className="text-center mb-6">
              <p className="text-red-500 font-medium">⚠️ {error}</p>
            </div>
          )}

          {categories.length === 0 ? (
            <p className="text-gray-500 text-center mt-10">
              No hay categorías disponibles en este momento.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {categories.map((category) => (
                <CategoryCard key={category.id} {...category} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
