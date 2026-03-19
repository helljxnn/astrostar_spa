import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import "./MagicBento.css";

const MagicBento = ({ items = [] }) => {
  const cardsRef = useRef([]);

  useEffect(() => {
    if (!cardsRef.current.length) return;

    const visibleCards = cardsRef.current.filter(Boolean);
    gsap.fromTo(
      visibleCards,
      { opacity: 0, y: 26, scale: 0.98 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.6,
        ease: "power3.out",
        stagger: 0.08,
      }
    );
  }, [items]);

  const onEnter = (event) => {
    const card = event.currentTarget;
    gsap.to(card, {
      y: -8,
      scale: 1.015,
      duration: 0.28,
      ease: "power3.out",
    });
  };

  const onLeave = (event) => {
    const card = event.currentTarget;
    gsap.to(card, {
      y: 0,
      scale: 1,
      duration: 0.28,
      ease: "power3.out",
    });
  };

  return (
    <div className="magic-bento-grid">
      {items.map((item, index) => (
        <article
          key={`${item.title}-${index}`}
          ref={(el) => {
            cardsRef.current[index] = el;
          }}
          className="magic-bento-card"
          onMouseEnter={onEnter}
          onMouseLeave={onLeave}
        >
          <img
            src={item.image}
            alt={item.title}
            loading="lazy"
            decoding="async"
            className="magic-bento-image"
          />
          <div className="magic-bento-overlay" />
          <p className="magic-bento-title">{item.title}</p>
        </article>
      ))}
    </div>
  );
};

export default MagicBento;
