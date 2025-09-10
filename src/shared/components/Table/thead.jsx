// Thead.jsx
import React from "react";

const Thead = ({ options }) => {
  return (
    <thead
      id="thead"
      className="text-gray-700 text-sm uppercase tracking-wider bg-gradient-to-r from-primary-purple to-primary-blue"
    >
      <tr>
        {options.thead.titles.map((item) => (
          <th
            key={item}
            className="px-6 py-4 text-left font-semibold text-white"
          >
            {item}
          </th>
        ))}
        {options.thead.state && (
          <th className="px-6 py-4 text-left font-semibold text-white">
            Estado
          </th>
        )}
        <th className="px-6 py-4 text-center font-semibold text-white">
          Acciones
        </th>
      </tr>
    </thead>
  );
};

export default Thead;
