import React from 'react';

export const Hero = ({ title = 'OBJETIVO', description = 'Promover el desarrollo integral de las personas y su relación con el entorno...', imageUrl = '/assets/images/background-image.jpg' }) => {
  return (
    <div className="relative h-[600px] bg-cover bg-center" style={{ backgroundImage: `url(${imageUrl})` }}>
      <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-8">
        <h1 className="text-6xl font-bold text-[#9BE9FF] mb-4 font-questrial">{title}</h1>
        <p className="text-lg text-white max-w-2xl font-questrial">{description}</p>
      </div>
    </div>
  );
};