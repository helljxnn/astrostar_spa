import React from "react";

const Thead = ({ options }) => {
  const { thead } = options;
  const { titles = [] } = thead;

  return (
    <thead>
      <tr className="bg-gradient-to-r from-[#b491ff] via-[#9fb3ff] to-[#74d5f4] text-white">
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
