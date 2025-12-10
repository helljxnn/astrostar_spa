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
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    {Array.from({ length: 6 }).map((_, idx) => (
      <div
        key={idx}
        className="h-80 rounded-2xl border border-slate-100 bg-white shadow-md overflow-hidden animate-pulse"
      >
        <div className="h-48 bg-slate-200" />
        <div className="p-5 space-y-3">
          <div className="h-4 w-2/3 bg-slate-200 rounded" />
          <div className="h-4 w-full bg-slate-200 rounded" />
          <div className="h-4 w-1/2 bg-slate-200 rounded" />
        </div>
      </div>
    ))}
  </div>
);

function CategoryCard({ name, imageUrl, description, minAge, maxAge }) {
  const ageRange =
    minAge !== null && maxAge !== null ? `${minAge} - ${maxAge} anos` : "Programa formativo";

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="group relative h-full overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-lg flex flex-col"
    >
      <div className="relative h-52 w-full overflow-hidden">
        <motion.img
          src={imageUrl || placeholderImage}
          alt={name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          whileHover={{ scale: 1.02 }}
          onError={(e) => {
            e.target.src = placeholderImage;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/30 to-transparent" />
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2">
          <motion.span
            whileHover={{ y: -2 }}
            className="px-3 py-1 text-[11px] uppercase tracking-[0.12em] text-white bg-white/10 border border-white/30 rounded-full backdrop-blur-md shadow-sm"
          >
            Categoria
          </motion.span>
          <motion.span
            whileHover={{ y: -2 }}
            className="px-3 py-1 text-[11px] font-semibold text-white bg-primary-purple rounded-full shadow-md"
          >
            {ageRange}
          </motion.span>
        </div>
        <h3 className="absolute bottom-4 left-4 right-4 text-xl font-semibold text-white drop-shadow-md">
          {name}
        </h3>
      </div>

      <div className="flex flex-col gap-4 p-5 flex-1">
        <p className="text-sm leading-relaxed text-slate-600">
          {description || "Categoria deportiva publicada desde el dashboard."}
        </p>
      </div>
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
        setError(err.message || "No se pudieron cargar las categorias.");
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPublicCategories();
  }, []);

  return (
    <div>
      <Hero
        title="Categorias"
        subtitle="Programas disenados para el desarrollo integral de cada etapa."
        imageUrl="/assets/images/CategoriasHero.jpg"
      />

      <section className="bg-gradient-to-b from-slate-50 via-white to-slate-50 px-4 sm:px-6 py-12 md:py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-primary-purple to-primary-blue bg-clip-text text-transparent">
              Categorias de formacion integral
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto mt-3">
              Desde los primeros pasos hasta la proyeccion profesional. Explora
              las categorias publicadas
            </p>
          </div>

          {error && (
            <div className="text-center mb-8">
              <p className="inline-flex items-center justify-center rounded-full bg-red-50 px-4 py-2 text-red-600 border border-red-100">
                {error}
              </p>
            </div>
          )}

          {loading ? (
            <LoadingGrid />
          ) : categories.length === 0 ? (
            <p className="text-gray-500 text-center mt-10">
              No hay categorias disponibles en este momento.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {categories.map((category) => (
                <CategoryCard key={category.id} {...category} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
