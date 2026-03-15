import { useRef, useEffect } from "react";
import { testimonialsData } from "../data/testimonialsData";

const TestimonialCard = ({ testimonial }) => {
  const initials = testimonial.author
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("");

  return (
    <div
      className="
      min-w-[400px]
      max-w-[400px]
      bg-white
      rounded-2xl
      p-8
      shadow-md
      hover:shadow-lg
      transition-shadow
      flex flex-col
      "
    >
      <p
        className="text-gray-700 text-base leading-relaxed mb-6"
        style={{ fontFamily: "'Georgia', serif" }}
      >
        "{testimonial.text}"
      </p>

      <div className="flex items-center gap-4 mt-auto">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-base"
          style={{
            background: "linear-gradient(135deg,#B595FF,#9BE9FF)",
          }}
        >
          {initials}
        </div>

        <div>
          <p className="font-semibold text-gray-900 text-base">
            {testimonial.author}
          </p>
          <p className="text-sm text-[#B595FF]">
            {testimonial.role}
          </p>
        </div>
      </div>
    </div>
  );
};

export const InfiniteTestimonials = () => {
  const carouselRef = useRef(null);

  // Crear array infinito duplicando los testimonios
  const infiniteTestimonials = [...testimonialsData, ...testimonialsData, ...testimonialsData];

  // Auto-scroll fluido continuo
  useEffect(() => {
    let animationId;
    
    const smoothScroll = () => {
      if (carouselRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
        
        // Si llegamos cerca del final, resetear al inicio sin que se note
        if (scrollLeft >= scrollWidth - clientWidth - 100) {
          carouselRef.current.scrollLeft = scrollLeft - (testimonialsData.length * 424); // 400px + 24px gap
        } else {
          carouselRef.current.scrollLeft += 0.5; // Scroll fluido y lento
        }
      }
      animationId = requestAnimationFrame(smoothScroll);
    };

    animationId = requestAnimationFrame(smoothScroll);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, []);

  return (
    <div className="relative">
      {/* Carousel */}
      <div
        ref={carouselRef}
        className="
        flex gap-6
        overflow-x-auto
        px-12
        py-6
        "
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {infiniteTestimonials.map((t, index) => (
          <TestimonialCard key={`${t.id}-${index}`} testimonial={t} />
        ))}
      </div>

      {/* Ocultar scrollbar en webkit */}
      <style jsx>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};