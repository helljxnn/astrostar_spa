import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { testimonialsData } from "../data/testimonialsData";

const mothersTestimonials = testimonialsData.filter((item) =>
  item.role.toLowerCase().includes("madre")
);

const athletesTestimonials = testimonialsData.filter(
  (item) => !item.role.toLowerCase().includes("madre")
);

const TESTIMONIAL_CARD_HEIGHT_REM = 11.5;
const TESTIMONIAL_GAP_REM = 1;
const TESTIMONIALS_VISIBLE_COUNT = 4;
const TESTIMONIAL_CARD_HEIGHT = `${TESTIMONIAL_CARD_HEIGHT_REM}rem`;
const TESTIMONIAL_GAP = `${TESTIMONIAL_GAP_REM}rem`;
const TESTIMONIAL_WINDOW_HEIGHT = `${
  TESTIMONIAL_CARD_HEIGHT_REM * TESTIMONIALS_VISIBLE_COUNT +
  TESTIMONIAL_GAP_REM * (TESTIMONIALS_VISIBLE_COUNT - 1) +
  1.5
}rem`;
const AUTO_SCROLL_SPEED_PX = 0.06;

const buildLoopItems = (items, minimumCount = 10) => {
  if (!items.length) return [];

  const expanded = [];

  while (expanded.length < minimumCount) {
    expanded.push(...items);
  }

  return expanded.slice(0, minimumCount);
};

const normalizeOffset = (value, cycleHeight) => {
  if (!cycleHeight) return 0;

  let normalized = value % cycleHeight;

  if (normalized > 0) normalized -= cycleHeight;
  if (normalized <= -cycleHeight) normalized += cycleHeight;

  return normalized;
};

const TestimonialCard = ({ testimonial, index, featured = false }) => {
  const initials = testimonial.author
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("");

  return (
    <motion.article
      initial={{ opacity: 0, y: 28, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.65, delay: (index % 4) * 0.05 }}
      whileHover={{
        y: -4,
        scale: 1.01,
        boxShadow: "0 18px 34px rgba(15, 23, 42, 0.16)",
      }}
      className={[
        "group relative w-full overflow-hidden rounded-[1.35rem] border border-slate-200 bg-white p-4 font-montserrat text-slate-900 shadow-[0_12px_28px_rgba(15,23,42,0.07)]",
        featured ? "sm:p-[1.15rem]" : "",
      ].join(" ")}
      style={{ height: TESTIMONIAL_CARD_HEIGHT }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(181,149,255,0.18),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(155,233,255,0.14),transparent_28%)] opacity-60 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="relative z-10 flex h-full flex-col">
        <p className="text-[0.95rem] leading-[1.55] text-slate-800 sm:text-[1rem]">
          {testimonial.text}
        </p>

        <div className="mt-auto flex items-center gap-3 pt-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#B595FF] to-[#9BE9FF] text-xs font-bold text-white shadow-md">
            {initials}
          </div>

          <div>
            <p className="text-[0.95rem] font-bold text-slate-900">
              {testimonial.author}
            </p>
            <p className="mt-0.5 text-sm leading-snug text-slate-500">
              {testimonial.role}
            </p>
          </div>
        </div>
      </div>
    </motion.article>
  );
};

const MarqueeColumn = ({
  items,
  reverse = false,
  featured = false,
}) => {
  const containerRef = useRef(null);
  const trackRef = useRef(null);
  const animationFrameRef = useRef(null);
  const lastFrameTimeRef = useRef(0);
  const offsetRef = useRef(0);
  const cycleHeightRef = useRef(0);
  const dragStateRef = useRef({
    active: false,
    startY: 0,
    startOffset: 0,
  });
  const loopItems = buildLoopItems(items, 12);
  const duplicated = [...loopItems, ...loopItems, ...loopItems];

  useEffect(() => {
    const rootFontSize = Number.parseFloat(
      window.getComputedStyle(document.documentElement).fontSize
    );
    const cardHeightPx = TESTIMONIAL_CARD_HEIGHT_REM * rootFontSize;
    const gapPx = TESTIMONIAL_GAP_REM * rootFontSize;

    cycleHeightRef.current =
      loopItems.length * cardHeightPx + (loopItems.length - 1) * gapPx;

    const render = () => {
      if (!trackRef.current) return;

      offsetRef.current = normalizeOffset(offsetRef.current, cycleHeightRef.current);
      trackRef.current.style.transform = `translateY(${offsetRef.current}px)`;
    };

    const step = (time) => {
      if (!lastFrameTimeRef.current) {
        lastFrameTimeRef.current = time;
      }

      const delta = time - lastFrameTimeRef.current;
      lastFrameTimeRef.current = time;

      if (!dragStateRef.current.active) {
        offsetRef.current += (reverse ? 1 : -1) * AUTO_SCROLL_SPEED_PX * delta;
        render();
      }

      animationFrameRef.current = window.requestAnimationFrame(step);
    };

    render();
    animationFrameRef.current = window.requestAnimationFrame(step);

    return () => {
      if (animationFrameRef.current) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [loopItems.length, reverse]);

  const applyDrag = (clientY) => {
    if (!dragStateRef.current.active || !trackRef.current) return;

    const nextOffset =
      dragStateRef.current.startOffset +
      (clientY - dragStateRef.current.startY);

    offsetRef.current = normalizeOffset(nextOffset, cycleHeightRef.current);
    trackRef.current.style.transform = `translateY(${offsetRef.current}px)`;
  };

  const handlePointerDown = (event) => {
    dragStateRef.current = {
      active: true,
      startY: event.clientY,
      startOffset: offsetRef.current,
    };

    containerRef.current?.setPointerCapture?.(event.pointerId);
  };

  const handlePointerMove = (event) => {
    applyDrag(event.clientY);
  };

  const handlePointerUp = (event) => {
    dragStateRef.current.active = false;
    containerRef.current?.releasePointerCapture?.(event.pointerId);
  };

  return (
    <div
      ref={containerRef}
      className="group relative overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-gradient-to-b from-white via-purple-50/20 to-white p-3 shadow-[0_16px_34px_rgba(15,23,42,0.07)] cursor-grab select-none touch-none active:cursor-grabbing"
      style={{ height: TESTIMONIAL_WINDOW_HEIGHT }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-8 bg-gradient-to-b from-white via-white/92 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-8 bg-gradient-to-t from-white via-white/92 to-transparent" />

      <div className="relative h-full w-full overflow-hidden rounded-[1.2rem]">
        <div
          ref={trackRef}
          className="absolute left-0 top-0 w-full pr-[1px] will-change-transform"
          style={{ display: "flex", flexDirection: "column", gap: TESTIMONIAL_GAP }}
        >
          {duplicated.map((testimonial, index) => (
            <TestimonialCard
              key={`${testimonial.id}-${index}-${reverse ? "reverse" : "forward"}`}
              testimonial={testimonial}
              index={index}
              featured={featured}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export const TestimonialsSection = () => {
  return (
    <section className="overflow-hidden bg-gradient-to-b from-gray-50 via-white to-white px-6 py-10 font-montserrat sm:px-10 sm:py-12 lg:px-20">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Testimonios
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-start">
          <motion.div
            initial={{ opacity: 0, x: -28 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.7 }}
          >
            <MarqueeColumn items={mothersTestimonials} featured />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 28 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.7, delay: 0.08 }}
          >
            <MarqueeColumn items={athletesTestimonials} reverse />
          </motion.div>
        </div>
      </div>
    </section>
  );
};
