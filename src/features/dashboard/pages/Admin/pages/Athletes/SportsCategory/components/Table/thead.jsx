import React from "react";

const Thead = ({ options }) => {
  const { thead } = options;
  const { titles = [] } = thead;

  return (
    <thead>
      <tr className="bg-gradient-to-r from-[#b5b9ff] via-[#a7b8ff] to-[#94a6ff] text-white">
        {titles.map((title, index) => (
          <th
            key={index}
            className="px-6 py-4 text-sm font-semibold uppercase tracking-wider text-left"
          >
            {title}
          </th>
        ))}

        {/* 👉 Columna Estado */}
        <th className="px-6 py-4 text-sm font-semibold uppercase tracking-wider text-center">
          Estado
        </th>

        {/* 👉 Última columna fija */}
        <th className="px-6 py-4 text-sm font-semibold uppercase tracking-wider text-center">
          Acciones
        </th>
      </tr>
    </thead>
  );
};

export default Thead;
