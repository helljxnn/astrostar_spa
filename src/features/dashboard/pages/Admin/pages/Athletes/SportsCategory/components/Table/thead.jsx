import React from "react";

const Thead = ({ options }) => {
  const { thead } = options;
  const { titles = [], state = false } = thead;

  // Verificar si "Estado" y "Acciones" ya están incluidos en los títulos
  const hasEstado = titles.some(title => 
    title.toLowerCase().includes('estado')
  );
  const hasAcciones = titles.some(title => 
    title.toLowerCase().includes('acciones')
  );

  return (
    <thead
      id="thead"
      className="text-gray-700 text-sm uppercase tracking-wider bg-gradient-to-r from-primary-purple to-primary-blue"
    >
      <tr>
        {titles.map((title, index) => (
          <th
            key={index}
            className="px-6 py-4 text-left font-semibold text-white"
          >
            {title}
          </th>
        ))}
        {state && !hasEstado && (
          <th className="px-6 py-4 text-left font-semibold text-white">
            Estado
          </th>
        )}
        {!hasAcciones && (
          <th className="px-6 py-4 text-center font-semibold text-white">
            Acciones
          </th>
        )}
      </tr>
    </thead>
  );
};

export default Thead;