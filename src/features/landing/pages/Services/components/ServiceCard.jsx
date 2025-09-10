// src/features/services/components/ServiceCard.jsx
import React from "react";

export const ServiceCard = ({ title, description, image }) => {
  return (
    <div className="relative w-full h-72" style={{ perspective: '1000px' }}>
      <div 
        className="group relative w-full h-full transition-transform duration-700 cursor-pointer"
        style={{ 
          transformStyle: 'preserve-3d',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'rotateY(180deg)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'rotateY(0deg)';
        }}
      >
        {/* Front (Imagen + título) */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center 
          rounded-2xl shadow-xl overflow-hidden"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover rounded-2xl"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent text-white py-6 text-center">
            <h3 className="text-xl font-bold">{title}</h3>
          </div>
        </div>

        {/* Back (Texto resumido) */}
        <div
          className="absolute inset-0 p-6 flex items-center justify-center text-center
          bg-gradient-to-br from-primary-purple to-primaty-blue text-black 
          rounded-2xl shadow-xl"
          style={{ 
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)'
          }}
        >
          <div>
            <h3 className="text-2xl font-bold mb-4">{title}</h3>
            <p className="text-sm leading-relaxed">{description}</p>
          </div>
        </div>
      </div>
    </div>
  );
};