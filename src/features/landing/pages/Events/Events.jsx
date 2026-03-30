"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUpRight,
  CalendarDays,
  CalendarRange,
  Clock3,
  Grid2x2,
  MapPin,
  Newspaper,
} from "lucide-react";
import { useEvents } from "./hooks/useEvents.jsx";
import { Calendar } from "./components/Calendar.jsx";
import { CountdownTimer } from "./components/CountdownTimer.jsx";
import {
  isSameDay,
  parseDateValue,
  sortEventsByDateTime,
} from "../../../../shared/utils/helpers/dateHelpers.js";
import { EventModal } from "./components/EventModal.jsx";
import {
  eventsBannerImage,
  newsItems,
} from "./data/newsData.js";

const dateFormatter = new Intl.DateTimeFormat("es-CO", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

const monthFormatter = new Intl.DateTimeFormat("es-CO", { month: "short" });
const monthTitleFormatter = new Intl.DateTimeFormat("es-CO", {
  month: "long",
  year: "numeric",
});
const weekdayFormatter = new Intl.DateTimeFormat("es-CO", { weekday: "short" });

const viewModes = [
  { id: "agenda", label: "Agenda", icon: CalendarRange },
  { id: "galeria", label: "Galería", icon: Grid2x2 },
];
const statusModes = [
  { id: "todos", label: "Todos" },
  { id: "programado", label: "Programado" },
  { id: "en_curso", label: "En Curso" },
  { id: "finalizado", label: "Finalizado" },
];
const statusSelectOptions = [
  { id: "todos", label: "Estado: Todos" },
  { id: "programado", label: "Estado: Programado" },
  { id: "en_curso", label: "Estado: En Curso" },
  { id: "finalizado", label: "Estado: Finalizado" },
];
const landingEventTypeLabels = {
  todos: "Todos",
  torneo: "Torneos",
  festival: "Festivales",
  clausura: "Clausuras",
  taller: "Talleres",
};
const EVENTS_PAGE_SIZE = 6;

const isMeaningfulValue = (value) => {
  if (!value) return false;
  const normalized = String(value).trim().toLowerCase();
  return (
    normalized &&
    normalized !== "por confirmar" &&
    normalized !== "proximamente mas informacion del evento."
  );
};

const formatDateLabel = (date) => {
  if (!date) return "";
  const parsed = parseDateValue(date);
  return !parsed || Number.isNaN(parsed.getTime()) ? date : dateFormatter.format(parsed);
};

const formatDateRange = (startDate, endDate) => {
  if (!startDate) return "";
  if (!endDate || startDate === endDate) return formatDateLabel(startDate);
  return `${formatDateLabel(startDate)} - ${formatDateLabel(endDate)}`;
};

const getDayNumber = (date) => {
  const parsed = parseDateValue(date);
  return !parsed || Number.isNaN(parsed.getTime())
    ? ""
    : String(parsed.getDate()).padStart(2, "0");
};

const getMonthLabel = (date) => {
  const parsed = parseDateValue(date);
  return !parsed || Number.isNaN(parsed.getTime()) ? "" : monthFormatter.format(parsed);
};

const getMonthTitle = (date) => {
  const parsed = parseDateValue(date);
  return !parsed || Number.isNaN(parsed.getTime()) ? "" : monthTitleFormatter.format(parsed);
};

const getWeekdayLabel = (date) => {
  const parsed = parseDateValue(date);
  return !parsed || Number.isNaN(parsed.getTime()) ? "" : weekdayFormatter.format(parsed);
};

const getEventYear = (event) => {
  const parsed = parseDateValue(event?.date);
  return !parsed || Number.isNaN(parsed.getTime()) ? null : String(parsed.getFullYear());
};

const normalizeToDay = (value) => {
  const parsed = parseDateValue(value);
  if (!parsed || Number.isNaN(parsed.getTime())) return null;
  return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
};

const getEventTimelineStatus = (event) => {
  const today = normalizeToDay(new Date());
  const start = normalizeToDay(event.date);
  const end = normalizeToDay(event.endDate || event.date);

  if (event.status === "cancelado") return "cancelado";
  if (!today || !start || !end) return event.status || "programado";
  if (event.status === "finalizado" || end < today) return "finalizado";
  if (event.status === "en_curso") return "en_curso";
  if (start <= today && end >= today) return "en_curso";
  return "programado";
};

const groupEventsByMonth = (events) => {
  const months = [];
  const monthMap = new Map();

  events.forEach((event) => {
    const parsed = parseDateValue(event.date);
    if (!parsed || Number.isNaN(parsed.getTime())) return;

    const monthKey = `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, "0")}`;

    if (!monthMap.has(monthKey)) {
      const monthEntry = {
        key: monthKey,
        label: getMonthTitle(event.date),
        days: [],
        dayMap: new Map(),
      };
      monthMap.set(monthKey, monthEntry);
      months.push(monthEntry);
    }

    const monthEntry = monthMap.get(monthKey);
    const dayKey = formatDateLabel(event.date);

    if (!monthEntry.dayMap.has(dayKey)) {
      const dayEntry = {
        key: `${monthKey}-${dayKey}`,
        date: event.date,
        events: [],
      };
      monthEntry.dayMap.set(dayKey, dayEntry);
      monthEntry.days.push(dayEntry);
    }

    monthEntry.dayMap.get(dayKey).events.push(event);
  });

  return months.map(({ dayMap, ...month }) => month);
};

const Surface = ({ children, className = "" }) => (
  <div
    className={`rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.06)] ${className}`}
  >
    {children}
  </div>
);

const SectionTitle = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: -30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: false }}
    transition={{ duration: 0.8 }}
    className="mb-12 text-center"
  >
    <h2 className="font-montserrat text-4xl font-bold text-gray-900 sm:text-5xl">
      {children}
    </h2>
  </motion.div>
);

const NewsCard = ({ item, index, onImageClick, onReadMore }) => {
  const [primaryImage, secondaryImage] = item.images;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false }}
      transition={{ duration: 0.6, type: "spring", delay: index * 0.1 }}
      whileHover={{
        y: -10,
        boxShadow: "0 20px 40px rgba(181, 149, 255, 0.2)",
        transition: { duration: 0.3 },
      }}
      className="group relative overflow-hidden rounded-[32px] border border-[#ddd1ff] bg-white shadow-[0_24px_70px_rgba(15,23,42,0.10)] transition-all duration-500 cursor-pointer"
    >
      {/* Imagen principal - SIN TÍTULO ENCIMA */}
      <motion.div
        onClick={() => onImageClick(item.images[0], item.title)}
        whileHover={{ scale: 1.02 }}
        className="relative h-64 overflow-hidden cursor-pointer"
      >
        <img
          src={typeof item.images[0] === "string" ? item.images[0] : item.images[0].src}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
        
        {/* Solo indicador de expansión - SIN TÍTULO */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          whileHover={{ opacity: 1, scale: 1 }}
          className="absolute top-6 right-6 bg-white/90 backdrop-blur-md rounded-full p-3 shadow-lg"
        >
          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
          </svg>
        </motion.div>
      </motion.div>

      {/* Contenido - TÍTULO SEPARADO DE LA IMAGEN */}
      <div className="p-6">
        {/* Título aquí, separado de la imagen */}
        <h3 className="text-xl font-bold text-gray-900 font-montserrat mb-4 leading-tight line-clamp-2">
          {item.title}
        </h3>
        
        {/* Descripción con EXACTAMENTE el mismo tamaño que Fundación */}
        <p className="text-gray-700 leading-relaxed text-lg mb-4 line-clamp-3">
          {item.description}
        </p>

        {/* Imágenes secundarias - EXACTAMENTE IGUALES EN TAMAÑO E IMPORTANCIA */}
        {item.images.length > 1 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-6"
          >
            <div className="grid grid-cols-2 gap-4">
              {item.images.slice(1, 3).map((image, imgIndex) => (
                <motion.div
                  key={imgIndex}
                  onClick={() => onImageClick(image, item.title)}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative h-32 rounded-xl overflow-hidden border-2 border-gray-200 cursor-pointer shadow-md hover:shadow-lg transition-all duration-300"
                >
                  <img
                    src={typeof image === "string" ? image : image.src}
                    alt={item.title}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  
                  {/* Indicador de expansión */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    className="absolute inset-0 bg-black/20 flex items-center justify-center"
                  >
                    <div className="bg-white/90 rounded-full p-2">
                      <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Botón "Leer más" - EXACTAMENTE como donaciones */}
        <motion.div
          onClick={() => onReadMore(item)}
          whileHover={{ x: 2 }}
          className="flex items-center gap-2 text-[#B595FF] font-semibold cursor-pointer"
        >
          <span>Leer más</span>
          <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </motion.div>
      </div>

      {/* Línea decorativa - como donaciones */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#B595FF] to-transparent"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: false }}
        transition={{ delay: 0.3, duration: 0.8 }}
      />

      {/* Efectos adicionales de animación */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
        initial={{ x: "-100%" }}
        whileHover={{ x: "100%" }}
        transition={{ duration: 0.8 }}
      />
    </motion.div>
  );
};

// Modal para imagen expandida - CON MÁS ANIMACIONES
const ImageModal = ({ image, title, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.3, opacity: 0, rotateY: -45 }}
          animate={{ scale: 1, opacity: 1, rotateY: 0 }}
          exit={{ scale: 0.3, opacity: 0, rotateY: 45 }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 25,
            opacity: { duration: 0.3 }
          }}
          className="relative max-w-5xl max-h-[90vh] bg-white rounded-3xl overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <motion.button
            onClick={onClose}
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            className="absolute top-4 right-4 bg-white/90 backdrop-blur-md rounded-full p-3 hover:bg-white transition-colors z-10 shadow-lg"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </motion.button>
          
          <motion.img
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            src={typeof image === "string" ? image : image.src}
            alt={title}
            className="w-full h-full object-contain"
          />

          {/* Título con animación */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6"
          >
            <h3 className="text-white font-montserrat font-bold text-xl">
              {title}
            </h3>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Modal para información completa - CON MÁS ANIMACIONES
const NewsModal = ({ item, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 100 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 100 }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 30,
            opacity: { duration: 0.3 }
          }}
          className="relative max-w-4xl max-h-[90vh] bg-white rounded-3xl overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <motion.button
            onClick={onClose}
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            className="absolute top-4 right-4 bg-white/90 backdrop-blur-md rounded-full p-3 hover:bg-white transition-colors z-10 shadow-lg"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </motion.button>
          
          <div className="overflow-y-auto max-h-[90vh]">
            {/* Imagen principal con animación */}
            <motion.div 
              initial={{ scale: 1.1, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="h-64 overflow-hidden relative"
            >
              <img
                src={typeof item.images[0] === "string" ? item.images[0] : item.images[0].src}
                alt={item.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            </motion.div>
            
            {/* Contenido con animaciones escalonadas */}
            <div className="p-8">
              <motion.h2 
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="text-2xl font-bold text-gray-900 font-montserrat mb-6"
              >
                {item.title}
              </motion.h2>
              
              <motion.p 
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="text-gray-700 leading-relaxed mb-6 text-lg"
              >
                {item.description}
              </motion.p>
              
              {/* Galería de imágenes con animaciones */}
              {item.images.length > 1 && (
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                >
                  <h3 className="text-lg font-bold text-gray-900 font-montserrat mb-4">
                    Galería de imágenes
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {item.images.slice(1).map((image, imgIndex) => (
                      <motion.div 
                        key={imgIndex} 
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.5 + imgIndex * 0.1, duration: 0.4 }}
                        whileHover={{ scale: 1.05, y: -5 }}
                        className="aspect-square rounded-xl overflow-hidden border border-slate-200 shadow-md cursor-pointer"
                      >
                        <img
                          src={typeof image === "string" ? image : image.src}
                          alt={item.title}
                          className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                        />
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const EnhancedNewsCard = ({ item, index, onImageClick, onReadMore }) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [loadedImages, setLoadedImages] = useState(() =>
    item.images.map((_, imageIndex) => imageIndex === 0),
  );
  const firstLoadedImageIndex = loadedImages.findIndex(Boolean);
  const visibleImageIndex =
    loadedImages[activeImageIndex]
      ? activeImageIndex
      : firstLoadedImageIndex >= 0
        ? firstLoadedImageIndex
        : 0;
  const activeImage = item.images[visibleImageIndex] ?? item.images[0];

  useEffect(() => {
    setLoadedImages(item.images.map((_, imageIndex) => imageIndex === 0));

    const preloaders = item.images.map((image, imageIndex) => {
      const src = typeof image === "string" ? image : image.src;
      const preloadImage = new window.Image();

      const markAsReady = () => {
        setLoadedImages((current) => {
          if (current[imageIndex]) return current;
          const next = [...current];
          next[imageIndex] = true;
          return next;
        });
      };

      preloadImage.onload = markAsReady;
      preloadImage.onerror = markAsReady;
      preloadImage.src = src;
      return preloadImage;
    });

    return () => {
      preloaders.forEach((preloadImage) => {
        preloadImage.onload = null;
        preloadImage.onerror = null;
      });
    };
  }, [item.images]);

  useEffect(() => {
    if (item.images.length < 2) return undefined;

    const intervalId = window.setInterval(() => {
      setActiveImageIndex((current) => {
        for (let offset = 1; offset <= item.images.length; offset += 1) {
          const nextIndex = (current + offset) % item.images.length;
          if (loadedImages[nextIndex]) return nextIndex;
        }
        return current;
      });
    }, 3200);

    return () => window.clearInterval(intervalId);
  }, [item.images, loadedImages]);

  return (
    <motion.article
      initial={{ opacity: 0, y: 50 }}
      animate="rest"
      whileHover="hovered"
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false }}
      variants={{
        rest: {
          y: 0,
          boxShadow: "0 24px 70px rgba(15,23,42,0.10)",
        },
        hovered: {
          y: -10,
          boxShadow: "0 28px 60px rgba(181, 149, 255, 0.18)",
        },
      }}
      transition={{ duration: 0.6, type: "spring", delay: index * 0.1 }}
      className="group relative flex h-full flex-col overflow-hidden rounded-[32px] border border-[#ddd1ff] bg-white shadow-[0_24px_70px_rgba(15,23,42,0.10)]"
    >
      <div className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(181,149,255,0.22),_transparent_48%),linear-gradient(180deg,_#fff_0%,_#faf7ff_100%)] p-4 sm:p-5">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#B595FF]/20 via-white/10 to-transparent" />

        <div className="relative h-[260px] sm:h-[320px] lg:h-[360px]">
          <motion.button
            type="button"
            onClick={() => onImageClick(activeImage, item.title)}
            className="relative h-full w-full overflow-hidden rounded-[28px] bg-[#faf7ff] text-left shadow-[0_20px_45px_rgba(15,23,42,0.22)]"
          >
            {item.images.map((image, imageIndex) => (
              <motion.div
                key={`${item.id}-${imageIndex}`}
                initial={false}
                animate={{
                  opacity:
                    loadedImages[imageIndex] && visibleImageIndex === imageIndex ? 1 : 0,
                  scale: visibleImageIndex === imageIndex ? 1 : 1.01,
                  zIndex: visibleImageIndex === imageIndex ? 1 : 0,
                }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                className="absolute inset-0 overflow-hidden rounded-[28px]"
              >
                <img
                  src={typeof image === "string" ? image : image.src}
                  alt={`${item.title} imagen ${imageIndex + 1}`}
                  className="h-full w-full object-cover"
                  loading={imageIndex === 0 ? "eager" : "auto"}
                  fetchPriority={imageIndex === 0 ? "high" : "auto"}
                  onLoad={() => {
                    setLoadedImages((current) => {
                      if (current[imageIndex]) return current;
                      const next = [...current];
                      next[imageIndex] = true;
                      return next;
                    });
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/55 via-slate-950/10 to-transparent" />
              </motion.div>
            ))}

            {item.images.length > 1 && (
              <div className="absolute inset-x-0 bottom-0 z-10 flex justify-end bg-gradient-to-t from-slate-950/55 via-slate-950/10 to-transparent px-5 py-4">
                <div className="flex items-center gap-2 rounded-full border border-white/30 bg-slate-950/28 px-3 py-2 shadow-[0_8px_18px_rgba(15,23,42,0.18)] backdrop-blur-sm">
                  {item.images.map((image, imageIndex) => (
                    <button
                      key={`${item.id}-indicator-${imageIndex}`}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveImageIndex(imageIndex);
                        onImageClick(image, item.title);
                      }}
                      className={`h-2.5 w-2.5 rounded-full border border-white/35 transition ${
                        visibleImageIndex === imageIndex
                          ? "bg-white shadow-[0_0_0_2px_rgba(255,255,255,0.18)]"
                          : "bg-white/45"
                      }`}
                      aria-label={`Ver imagen ${imageIndex + 1}`}
                    />
                  ))}
                </div>
              </div>
            )}
          </motion.button>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-6 sm:p-7">
        <h3 className="mb-4 text-xl font-bold leading-tight text-gray-900 font-montserrat sm:text-[1.45rem]">
          {item.title}
        </h3>

        <p className="mb-6 text-base leading-8 text-slate-700 line-clamp-5 sm:text-[1.02rem]">
          {item.description}
        </p>

        <motion.button
          type="button"
          onClick={() => onReadMore(item)}
          whileHover={{ x: 2 }}
          className="mt-auto font-semibold text-[#8d69e6]"
        >
          <span>Leer mas</span>
        </motion.button>
      </div>

      <motion.div
        className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#f5edff] via-[#B595FF] to-[#f5edff]"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: false }}
        transition={{ delay: 0.3, duration: 0.8 }}
      />

      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
        initial={{ x: "-100%" }}
        whileHover={{ x: "100%" }}
        transition={{ duration: 0.8 }}
      />
    </motion.article>
  );
};

const EnhancedNewsModal = ({ item, isOpen, onClose, onImageClick }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 100 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 100 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30,
            opacity: { duration: 0.3 },
          }}
          className="relative max-h-[90vh] max-w-4xl overflow-hidden rounded-3xl bg-white shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <motion.button
            onClick={onClose}
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            className="absolute right-4 top-4 z-10 rounded-full bg-white/90 p-3 shadow-lg backdrop-blur-md transition-colors hover:bg-white"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </motion.button>

          <div className="max-h-[90vh] overflow-y-auto">
            <motion.div
              initial={{ scale: 1.02, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="grid h-[320px] gap-3 bg-slate-100 p-3 sm:h-[400px] sm:grid-cols-[1.45fr_0.95fr]"
            >
              <button
                type="button"
                onClick={() => onImageClick(item.images[0], item.title)}
                className="group relative overflow-hidden rounded-[24px]"
              >
                <img
                  src={typeof item.images[0] === "string" ? item.images[0] : item.images[0].src}
                  alt={`${item.title} imagen principal`}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-slate-950/10 to-transparent" />
              </button>

              <div className="grid gap-3">
                {item.images.slice(1, 3).map((image, imgIndex) => (
                  <button
                    key={imgIndex}
                    type="button"
                    onClick={() => onImageClick(image, item.title)}
                    className="group relative overflow-hidden rounded-[24px] text-left"
                  >
                    <img
                      src={typeof image === "string" ? image : image.src}
                      alt={`${item.title} imagen ${imgIndex + 2}`}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-transparent to-transparent" />
                  </button>
                ))}
              </div>
            </motion.div>

            <div className="p-8">
              <motion.h2
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="mb-6 text-2xl font-bold leading-tight text-gray-900 font-montserrat"
              >
                {item.title}
              </motion.h2>

              <motion.p
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="mb-6 text-lg leading-relaxed text-gray-700"
              >
                {item.description}
              </motion.p>

              {item.images.length > 2 && (
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                >
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                    {item.images.slice(2).map((image, imgIndex) => (
                      <motion.button
                        key={imgIndex}
                        type="button"
                        onClick={() => onImageClick(image, item.title)}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.5 + imgIndex * 0.1, duration: 0.4 }}
                        whileHover={{ scale: 1.05, y: -5 }}
                        className="aspect-square overflow-hidden rounded-xl border border-slate-200 shadow-md"
                      >
                        <img
                          src={typeof image === "string" ? image : image.src}
                          alt={item.title}
                          className="h-full w-full object-cover transition-transform duration-300 hover:scale-110"
                        />
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const EventMeta = ({ icon: Icon, label, value }) => {
  if (!isMeaningfulValue(value)) return null;

  return (
    <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <Icon className="mt-0.5 text-slate-700" size={18} />
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
          {label}
        </p>
        <p className="text-sm font-medium text-slate-900">{value}</p>
      </div>
    </div>
  );
};

const getStatusLabel = (status) => {
  if (status === "en_curso") return "En Curso";
  if (status === "finalizado") return "Finalizado";
  if (status === "cancelado") return "Cancelado";
  return "Programado";
};

const getTypeLabel = (type) => {
  return landingEventTypeLabels[type] || "Evento";
};

const getStatusBadgeClasses = (status) => {
  if (status === "en_curso") {
    return "border-[#bfdbfe] bg-[#eff6ff] text-[#1d4ed8]";
  }
  if (status === "finalizado") {
    return "border-slate-200 bg-slate-100 text-slate-700";
  }
  if (status === "cancelado") {
    return "border-[#fecaca] bg-[#fef2f2] text-[#dc2626]";
  }
  return "border-[#d9cbff] bg-[#faf7ff] text-[#8e73d8]";
};

const getTypeBadgeClasses = (type) => {
  if (type === "festival") {
    return "border-[#fbcfe8] bg-[#fdf2f8] text-[#be185d]";
  }
  if (type === "torneo") {
    return "border-[#fde68a] bg-[#fffbeb] text-[#b45309]";
  }
  if (type === "clausura") {
    return "border-[#c7d2fe] bg-[#eef2ff] text-[#4338ca]";
  }
  if (type === "taller") {
    return "border-[#bae6fd] bg-[#f0f9ff] text-[#0369a1]";
  }
  return "border-slate-200 bg-slate-100 text-slate-700";
};

const EventBadges = ({ event, compact = false, light = false }) => {
  const baseClasses = compact
    ? "rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]"
    : "rounded-full border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em]";
  const lightEffect = light ? "backdrop-blur-sm shadow-sm" : "";

  return (
    <div className="flex flex-wrap gap-2">
      <span className={`${baseClasses} ${lightEffect} ${getStatusBadgeClasses(event.status)}`}>
        {getStatusLabel(event.status)}
      </span>
      <span className={`${baseClasses} ${lightEffect} ${getTypeBadgeClasses(event.type)}`}>
        {getTypeLabel(event.type)}
      </span>
    </div>
  );
};

const EventCard = ({ event, onOpen, index = 0, wide = false }) => (
  <motion.button
    type="button"
    onClick={() => onOpen(event)}
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-120px" }}
    transition={{ duration: 0.4, delay: index * 0.04 }}
    className={`group w-full overflow-hidden rounded-[28px] border border-slate-200 bg-white text-left shadow-[0_18px_60px_rgba(15,23,42,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_70px_rgba(15,23,42,0.1)] ${
      wide ? "lg:grid lg:grid-cols-[1.05fr_0.95fr]" : ""
    }`}
  >
    <div
      className={`relative overflow-hidden bg-slate-200 ${
        wide ? "min-h-[270px]" : "min-h-[150px]"
      }`}
    >
      <img
        src={event.image}
        alt={event.title}
        className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      <div className="absolute left-5 top-5 flex h-20 w-20 flex-col items-center justify-center rounded-[22px] bg-white/95 text-slate-900 shadow-lg">
        <span className="text-2xl font-bold leading-none">{getDayNumber(event.date)}</span>
        <span className="mt-1 text-[11px] font-semibold uppercase tracking-[0.2em]">
          {getMonthLabel(event.date)}
        </span>
      </div>
      <div className={`absolute inset-x-0 bottom-0 ${wide ? "p-6 sm:p-8" : "p-3.5 sm:p-4"}`}>
        <div className="mb-3">
          <EventBadges event={event} light />
        </div>
        <h3
          className={`font-montserrat font-bold uppercase leading-tight text-white ${
            wide ? "text-2xl sm:text-3xl" : "text-base sm:text-lg"
          }`}
        >
          {event.title}
        </h3>
      </div>
    </div>

    <div className={`flex flex-col ${wide ? "p-6 sm:p-8" : "p-3.5 sm:p-4"}`}>
      {!wide && <div className="mb-3"><EventBadges event={event} compact /></div>}
      <div className={wide ? "grid gap-3" : "grid gap-2.5"}>
        <EventMeta
          icon={CalendarDays}
          label="Fecha"
          value={formatDateRange(event.date, event.endDate)}
        />
        <EventMeta icon={Clock3} label="Hora" value={event.time} />
        <EventMeta icon={MapPin} label="Lugar" value={event.location} />
      </div>

      {isMeaningfulValue(event.description) && (
        <p className={`text-slate-700 ${wide ? "mt-6 text-base leading-8" : "mt-4 text-[13px] leading-6"}`}>
          {event.description}
        </p>
      )}

      <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-slate-900">
        <ArrowUpRight size={16} />
      </div>
    </div>
  </motion.button>
);

const GalleryCard = ({ event, onOpen, index = 0 }) => (
  <motion.button
    type="button"
    onClick={() => onOpen(event)}
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-120px" }}
    transition={{ duration: 0.35, delay: index * 0.03 }}
    className="group overflow-hidden rounded-[22px] border border-slate-200 bg-white text-left shadow-[0_14px_40px_rgba(15,23,42,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(15,23,42,0.1)]"
  >
    <div className="relative aspect-[1/0.88] overflow-hidden bg-slate-200">
      <img
        src={event.image}
        alt={event.title}
        className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
      <div className="absolute left-3 top-3 flex h-12 w-12 flex-col items-center justify-center rounded-[14px] bg-white/95 text-slate-900 shadow-lg">
        <span className="text-base font-bold leading-none">{getDayNumber(event.date)}</span>
        <span className="mt-0.5 text-[8px] font-semibold uppercase tracking-[0.16em]">
          {getMonthLabel(event.date)}
        </span>
      </div>
      <div className="absolute inset-x-0 bottom-0 p-3.5">
        <div className="mb-2">
          <EventBadges event={event} compact light />
        </div>
        <h3 className="line-clamp-3 font-montserrat text-[13px] font-bold uppercase leading-snug text-white sm:text-sm">
          {event.title}
        </h3>
      </div>
    </div>

    <div className="space-y-2 p-3.5">
      {isMeaningfulValue(event.time) && (
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
          {event.time}
        </p>
      )}
      {isMeaningfulValue(event.location) && (
        <p className="line-clamp-2 text-[13px] leading-5 text-slate-700">{event.location}</p>
      )}
      <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-900">
        <ArrowUpRight size={14} />
      </div>
    </div>
  </motion.button>
);

const AgendaItem = ({ event, onOpen, selected }) => (
  <button
    type="button"
    onClick={() => onOpen(event)}
    className={`w-full rounded-[22px] border px-5 py-4 text-left transition ${
      selected
        ? "border-[#b595ff] bg-[#faf7ff]"
        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
    }`}
  >
    <div className="min-w-0">
      <div className="mb-3">
        <EventBadges event={event} compact />
      </div>
      <p className="font-montserrat text-lg font-bold uppercase leading-snug text-slate-900">
        {event.title}
      </p>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
        {isMeaningfulValue(event.time) && (
          <p className="text-sm font-medium text-slate-700">{event.time}</p>
        )}
        {isMeaningfulValue(event.location) && (
          <p className="text-sm text-slate-600">{event.location}</p>
        )}
      </div>
    </div>
  </button>
);

const AgendaRow = ({ entry, onOpen, selectedId, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ duration: 0.4, delay }}
    className="grid gap-4 rounded-[28px] border border-slate-200 bg-white p-4 shadow-[0_18px_60px_rgba(15,23,42,0.05)] md:grid-cols-[78px_1fr]"
  >
    <div className="flex flex-col items-center justify-center rounded-[18px] bg-slate-100 px-2.5 py-3.5 text-center text-slate-800">
      <span className="text-[9px] font-semibold uppercase tracking-[0.16em]">
        {getWeekdayLabel(entry.date)}
      </span>
      <span className="mt-1 text-[22px] font-bold leading-none">
        {getDayNumber(entry.date)}
      </span>
      <span className="mt-1 text-[9px] font-semibold uppercase tracking-[0.16em]">
        {getMonthLabel(entry.date)}
      </span>
    </div>

    <div className="space-y-3">
      {entry.events.map((event) => (
        <AgendaItem
          key={event.id}
          event={event}
          onOpen={onOpen}
          selected={selectedId === event.id}
        />
      ))}
    </div>
  </motion.div>
);

const EventSkeleton = () => (
  <div className="space-y-6">
    <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
      <div className="h-[300px] animate-pulse rounded-[28px] bg-slate-200" />
      <div className="space-y-4 rounded-[28px] border border-slate-200 bg-white p-8">
        <div className="h-8 w-3/4 animate-pulse rounded-full bg-slate-200" />
        <div className="h-20 animate-pulse rounded-[20px] bg-slate-100" />
        <div className="h-20 animate-pulse rounded-[20px] bg-slate-100" />
        <div className="h-24 animate-pulse rounded-[20px] bg-slate-100" />
      </div>
    </div>
    <div className="grid gap-4">
      {[0, 1, 2].map((item) => (
        <div
          key={item}
          className="grid gap-4 rounded-[28px] border border-slate-200 bg-white p-4 md:grid-cols-[112px_1fr]"
        >
          <div className="h-24 animate-pulse rounded-[22px] bg-slate-200" />
          <div className="space-y-3">
            <div className="h-6 w-2/3 animate-pulse rounded-full bg-slate-200" />
            <div className="h-4 w-1/2 animate-pulse rounded-full bg-slate-100" />
            <div className="h-4 w-3/5 animate-pulse rounded-full bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const Events = () => {
  const [modalEvent, setModalEvent] = useState(null);
  const [contentMode, setContentMode] = useState("eventos");
  const [viewMode, setViewMode] = useState("agenda");
  const [statusMode, setStatusMode] = useState("programado");
  const [selectedYear, setSelectedYear] = useState("todos");
  const [visibleCount, setVisibleCount] = useState(EVENTS_PAGE_SIZE);
  
  // Estados para los modales de noticias
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedNews, setSelectedNews] = useState(null);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [newsModalOpen, setNewsModalOpen] = useState(false);
  const {
    filteredEvents,
    loading,
    selectedDate,
    setSelectedDate,
    selectedEventId,
    setSelectedEventId,
    selectedEventType,
    setSelectedEventType,
    eventTypes,
  } = useEvents();

  const orderedEvents = useMemo(
    () => sortEventsByDateTime(filteredEvents),
    [filteredEvents],
  );
  const visibleEvents = orderedEvents;
  const yearOptions = useMemo(() => {
    const years = Array.from(
      new Set(visibleEvents.map((event) => getEventYear(event)).filter(Boolean)),
    ).sort((a, b) => Number(b) - Number(a));

    return [{ id: "todos", label: "Todos" }, ...years.map((year) => ({ id: year, label: year }))];
  }, [visibleEvents]);
  const baseFilteredEvents = useMemo(
    () =>
      selectedYear === "todos"
        ? visibleEvents
        : visibleEvents.filter((event) => getEventYear(event) === selectedYear),
    [selectedYear, visibleEvents],
  );
  const dateFilteredBaseEvents = useMemo(
    () =>
      selectedDate
        ? baseFilteredEvents.filter((event) =>
            isSameDay(
              parseDateValue(event.date),
              selectedDate,
              event.endDate ? parseDateValue(event.endDate) : null,
            ),
          )
        : baseFilteredEvents,
    [baseFilteredEvents, selectedDate],
  );
  const eventsByStatus = useMemo(
    () => ({
      todos: dateFilteredBaseEvents,
      programado: dateFilteredBaseEvents.filter(
        (event) => getEventTimelineStatus(event) === "programado",
      ),
      en_curso: dateFilteredBaseEvents.filter(
        (event) => getEventTimelineStatus(event) === "en_curso",
      ),
      finalizado: dateFilteredBaseEvents.filter(
        (event) => getEventTimelineStatus(event) === "finalizado",
      ),
      cancelado: dateFilteredBaseEvents.filter(
        (event) => getEventTimelineStatus(event) === "cancelado",
      ),
    }),
    [dateFilteredBaseEvents],
  );
  const availableStatusMode =
    statusModes.find((mode) => eventsByStatus[mode.id].length > 0)?.id || "programado";
  const calendarNextEvent = eventsByStatus.programado[0] || null;

  useEffect(() => {
    if (eventsByStatus[statusMode]?.length > 0) return;
    setStatusMode(availableStatusMode);
  }, [availableStatusMode, eventsByStatus, statusMode]);

  useEffect(() => {
    setVisibleCount(EVENTS_PAGE_SIZE);
  }, [selectedYear, statusMode, viewMode, selectedDate, selectedEventType]);

  const scopedEvents = eventsByStatus[statusMode] || [];
  const selectedScopedEvent = useMemo(
    () => scopedEvents.find((event) => event.id === selectedEventId) || null,
    [scopedEvents, selectedEventId],
  );

  useEffect(() => {
    if (scopedEvents.length === 0) {
      if (selectedEventId !== null) {
        setSelectedEventId(null);
      }
      return;
    }

    if (!selectedScopedEvent) {
      setSelectedEventId(scopedEvents[0].id);
    }
  }, [scopedEvents, selectedScopedEvent, selectedEventId, setSelectedEventId]);

  const featuredEvent = selectedScopedEvent || scopedEvents[0] || null;
  const selectedDayReference = selectedDate || parseDateValue(featuredEvent?.date);
  const selectedDayEvents = useMemo(
    () =>
      selectedDayReference
        ? sortEventsByDateTime(
            scopedEvents.filter((event) =>
              isSameDay(
                parseDateValue(event.date),
                selectedDayReference,
                event.endDate ? parseDateValue(event.endDate) : null,
              ),
            ),
          )
        : [],
    [featuredEvent?.date, scopedEvents, selectedDayReference],
  );
  const galleryEvents = useMemo(
    () =>
      featuredEvent
        ? scopedEvents.filter((event) => event.id !== featuredEvent.id)
        : scopedEvents,
    [scopedEvents, featuredEvent],
  );
  const monthGroups = useMemo(
    () => groupEventsByMonth(scopedEvents),
    [scopedEvents],
  );
  const limitedGalleryEvents = galleryEvents.slice(0, visibleCount);
  const limitedMonthGroups = useMemo(() => {
    let consumed = 0;
    const groups = [];

    monthGroups.forEach((month) => {
      if (consumed >= visibleCount) return;

      const days = [];
      month.days.forEach((day) => {
        if (consumed >= visibleCount) return;

        const remaining = visibleCount - consumed;
        const dayEvents = day.events.slice(0, remaining);

        if (dayEvents.length > 0) {
          days.push({ ...day, events: dayEvents });
          consumed += dayEvents.length;
        }
      });

      if (days.length > 0) {
        groups.push({ ...month, days });
      }
    });

    return groups;
  }, [monthGroups, visibleCount]);
  const totalScopedEvents = scopedEvents.length;

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedYear(String(date.getFullYear()));

    const eventsOnDate = visibleEvents.filter((event) =>
      isSameDay(
        parseDateValue(event.date),
        date,
        event.endDate ? parseDateValue(event.endDate) : null,
      ),
    );

    if (eventsOnDate.length > 0) {
      const [firstMatch] = sortEventsByDateTime(eventsOnDate);
      setSelectedEventId(firstMatch.id);
      return;
    }

    setSelectedEventId(null);
  };

  // Funciones para manejar los modales de noticias
  const handleImageClick = (image, title) => {
    setSelectedImage({ image, title });
    setImageModalOpen(true);
  };

  const handleReadMore = (newsItem) => {
    setSelectedNews(newsItem);
    setNewsModalOpen(true);
  };

  const closeImageModal = () => {
    setImageModalOpen(false);
    setSelectedImage(null);
  };

  const closeNewsModal = () => {
    setNewsModalOpen(false);
    setSelectedNews(null);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <section
        className="relative flex min-h-screen items-end overflow-hidden px-6 pb-10 sm:px-10 sm:pb-12 lg:px-16 lg:pb-16"
        style={{
          marginLeft: "calc(-50vw + 50%)",
          marginRight: "calc(-50vw + 50%)",
          width: "100vw",
          backgroundImage: `url(${eventsBannerImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center 4%",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-black/10" />
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="relative mx-auto w-full max-w-7xl"
        />
      </section>

      <section className="px-4 pb-2 pt-8 sm:px-8 sm:pt-10 lg:px-20">
        <div className="mx-auto flex max-w-7xl justify-center md:justify-end">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35 }}
            className="rounded-full border border-[#d9cbff] bg-white p-2 shadow-[0_18px_48px_rgba(15,23,42,0.08)]"
          >
            <div className="inline-flex flex-wrap items-center justify-center gap-1">
              {[
                {
                  id: "eventos",
                  label: "Eventos",
                  icon: CalendarRange,
                },
                {
                  id: "noticias",
                  label: "Noticias",
                  icon: Newspaper,
                },
              ].map((item) => {
                const active = contentMode === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setContentMode(item.id)}
                    className={`flex items-center gap-2 rounded-full px-5 py-3 text-[15px] font-semibold transition ${
                      active
                        ? "bg-[#b595ff] text-white shadow-[0_10px_24px_rgba(181,149,255,0.28)]"
                        : "text-[#5f6b7a] hover:bg-[#f7f4ff]"
                    }`}
                  >
                    <Icon className="h-[18px] w-[18px]" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {contentMode === "eventos" && (
      <section className="px-4 pb-14 pt-8 sm:px-8 sm:pb-16 sm:pt-12 lg:px-20 lg:pt-14">
        <div className="mx-auto max-w-7xl">
          <SectionTitle>Eventos</SectionTitle>

          <div className="mt-8 grid gap-5 lg:gap-6 xl:mt-10 xl:grid-cols-[340px_minmax(0,1fr)]">
            <div className="space-y-6">
              <Surface className="p-4 sm:p-5">
                <Calendar
                  events={visibleEvents}
                  onDateSelect={handleDateSelect}
                  selectedDate={selectedDate}
                  onEventSelect={setSelectedEventId}
                  nextEvent={calendarNextEvent}
                />
              </Surface>

              <Surface className="p-4 sm:p-5">
                <CountdownTimer selectedEvent={featuredEvent} />
              </Surface>
            </div>

            <div className="space-y-6">
              {featuredEvent ? (
                <div className="space-y-4">
                  {selectedDayEvents.length > 1 && (
                    <Surface className="p-4 sm:p-5">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                        Eventos Del Dia
                      </p>
                      <div className="mt-3 overflow-x-auto pb-1">
                        <div className="flex min-w-max gap-2.5">
                        {selectedDayEvents.map((event) => {
                          const active = featuredEvent?.id === event.id;
                          return (
                            <button
                              key={event.id}
                              type="button"
                              onClick={() => setSelectedEventId(event.id)}
                              title={event.title}
                              className={`max-w-[280px] shrink-0 rounded-full border px-4 py-2 text-left text-xs font-semibold uppercase tracking-[0.14em] transition sm:max-w-[320px] ${
                                active
                                  ? "border-[#b595ff] bg-[#faf7ff] text-[#8e73d8]"
                                  : "border-slate-200 bg-white text-slate-700 hover:border-[#d9cbff] hover:bg-[#faf7ff]"
                              }`}
                            >
                              <span className="block truncate">{event.title}</span>
                            </button>
                          );
                        })}
                        </div>
                      </div>
                    </Surface>
                  )}

                  <EventCard event={featuredEvent} onOpen={setModalEvent} wide />
                </div>
              ) : !loading ? (
                <Surface className="p-6 sm:p-8">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                    Eventos
                  </p>
                  <h3 className="mt-3 font-montserrat text-2xl font-bold text-slate-900">
                    No hay eventos publicados para mostrar
                  </h3>
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                    Esta vista ahora refleja directamente los eventos publicados desde el
                    módulo de gestión. Si un evento no aparece aquí, revisa en el dashboard
                    que esté creado correctamente y con publicación activa.
                  </p>
                </Surface>
              ) : null}

              <div className="rounded-[28px] border border-slate-200 bg-white p-3 shadow-[0_18px_60px_rgba(15,23,42,0.06)] sm:p-3.5">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                  <div className="flex flex-wrap items-center gap-3">
                  {viewModes.map((mode) => {
                    const Icon = mode.icon;
                    const active = viewMode === mode.id;
                    return (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => setViewMode(mode.id)}
                        title={mode.label}
                        aria-label={mode.label}
                        className={`inline-flex h-10 w-10 items-center justify-center rounded-full border transition ${
                          active
                            ? "border-[#b595ff] bg-[#b595ff] text-white shadow-[0_10px_24px_rgba(181,149,255,0.28)]"
                            : "border-[#d9cbff] bg-white text-[#5f6b7a] hover:bg-[#f7f4ff]"
                        }`}
                      >
                        <Icon size={15} />
                      </button>
                    );
                  })}
                  </div>

                  <div className="grid gap-2.5 md:grid-cols-3 xl:w-[560px]">
                    <div className="relative">
                    <span className="pointer-events-none absolute left-3.5 top-2 z-10 text-[9px] font-semibold uppercase tracking-[0.18em] text-[#8e73d8]">
                      Estado
                    </span>
                    <select
                      value={statusMode}
                      onChange={(event) => setStatusMode(event.target.value)}
                      className="w-full appearance-none rounded-[18px] border border-[#d9cbff] bg-[linear-gradient(180deg,#ffffff_0%,#faf7ff_100%)] px-3.5 pb-2.5 pt-6 pr-9 text-[13px] font-semibold text-slate-800 outline-none transition focus:border-[#b595ff] focus:bg-white"
                    >
                      {statusSelectOptions.map((mode) => (
                        <option key={mode.id} value={mode.id}>
                          {mode.label.replace("Estado: ", "")}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-3.5 flex items-center text-[#8e73d8]">
                      <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M5 7.5L10 12.5L15 7.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </div>

                  <div className="relative">
                    <span className="pointer-events-none absolute left-3.5 top-2 z-10 text-[9px] font-semibold uppercase tracking-[0.18em] text-[#45b8d1]">
                      Tipo
                    </span>
                    <select
                      value={selectedEventType ?? eventTypes[0]?.id ?? "todos"}
                      onChange={(event) => setSelectedEventType(event.target.value)}
                      className="w-full appearance-none rounded-[18px] border border-[#cdeefe] bg-[linear-gradient(180deg,#ffffff_0%,#f4fcff_100%)] px-3.5 pb-2.5 pt-6 pr-9 text-[13px] font-semibold text-slate-800 outline-none transition focus:border-[#9be9ff] focus:bg-white"
                    >
                      {eventTypes.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-3.5 flex items-center text-[#45b8d1]">
                      <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M5 7.5L10 12.5L15 7.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </div>

                  <div className="relative">
                    <span className="pointer-events-none absolute left-3.5 top-2 z-10 text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Año
                    </span>
                    <select
                      value={selectedYear}
                      onChange={(event) => {
                        setSelectedYear(event.target.value);
                        setSelectedDate(null);
                      }}
                      className="w-full appearance-none rounded-[18px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] px-3.5 pb-2.5 pt-6 pr-9 text-[13px] font-semibold text-slate-800 outline-none transition focus:border-slate-300 focus:bg-white"
                    >
                      {yearOptions.map((year) => (
                        <option key={year.id} value={year.id}>
                          {year.label}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-3.5 flex items-center text-slate-500">
                      <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M5 7.5L10 12.5L15 7.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </div>
                </div>
                </div>
              </div>

              {loading ? (
                <EventSkeleton />
              ) : (
                <AnimatePresence mode="wait">
                  {viewMode === "agenda" ? (
                    <motion.div
                      key="agenda"
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -18 }}
                      transition={{ duration: 0.28 }}
                      className="space-y-8"
                    >
                      {limitedMonthGroups.map((month, monthIndex) => (
                        <section key={month.key}>
                          <div className="mb-4 flex items-center">
                            <h3 className="font-montserrat text-2xl font-bold capitalize text-slate-900">
                              {month.label}
                            </h3>
                            <div className="ml-4 h-px flex-1 bg-slate-200" />
                          </div>

                          <div className="space-y-4">
                            {month.days.map((entry, index) => (
                              <AgendaRow
                                key={entry.key}
                                entry={entry}
                                onOpen={setModalEvent}
                                selectedId={modalEvent?.id}
                                delay={monthIndex * 0.03 + index * 0.03}
                              />
                            ))}
                          </div>
                        </section>
                      ))}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="galeria"
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -18 }}
                      transition={{ duration: 0.28 }}
                      className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
                    >
                      {limitedGalleryEvents.map((event, index) => (
                        <GalleryCard
                          key={event.id}
                          event={event}
                          onOpen={setModalEvent}
                          index={index}
                        />
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              )}

              {!loading && totalScopedEvents > visibleCount && (
                <div className="flex justify-center pt-2">
                  <button
                    type="button"
                    onClick={() =>
                      setVisibleCount((current) =>
                        Math.min(current + EVENTS_PAGE_SIZE, totalScopedEvents),
                      )
                    }
                    className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:border-slate-400 hover:bg-slate-50"
                  >
                    Ver más eventos
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
      )}

      {contentMode === "noticias" && (
      <section className="bg-[linear-gradient(180deg,_#ffffff_0%,_#faf7ff_42%,_#ffffff_100%)] px-4 py-14 sm:px-8 sm:py-16 lg:px-20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: false, amount: 0.85 }}
            variants={{
              hidden: { opacity: 0, y: -30 },
              show: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.7 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 font-montserrat">
              Noticias
            </h2>
          </motion.div>

          {/* Grid simple de 3 columnas como el diseño original */}
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: false, margin: "-80px" }}
            variants={{
              hidden: {},
              show: {
                transition: {
                  staggerChildren: 0.15,
                },
              },
            }}
            className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3"
          >
            {newsItems.map((item, index) => (
              <motion.div
                key={item.id}
                variants={{
                  hidden: { opacity: 0, y: 40 },
                  show: { opacity: 1, y: 0 }
                }}
                className="h-full"
              >
                <EnhancedNewsCard 
                  item={item} 
                  index={index}
                  onImageClick={handleImageClick}
                  onReadMore={handleReadMore}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
      )}

      {modalEvent && (
        <EventModal event={modalEvent} onClose={() => setModalEvent(null)} />
      )}

      {/* Modales para noticias */}
      <ImageModal 
        image={selectedImage?.image}
        title={selectedImage?.title}
        isOpen={imageModalOpen}
        onClose={closeImageModal}
      />
      
      <EnhancedNewsModal 
        item={selectedNews}
        isOpen={newsModalOpen}
        onClose={closeNewsModal}
        onImageClick={handleImageClick}
      />
    </div>
  );
};
