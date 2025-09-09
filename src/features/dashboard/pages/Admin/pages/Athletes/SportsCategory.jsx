import React from "react";
import Table from "../../../../../../shared/components/Table/table";

// Datos de ejemplo de categorías deportivas
const sportsCategoryData = [
  {
    Nombre: "Juvenil",
    EdadMinima: 16,
    EdadMaxima: 18,
    Detalle: "Juvenil",
    Url: "https://url6",
    Estado: <span className="text-cyan-300 font-semibold">Activo</span>,
  },
  {
    Nombre: "Infantil",
    EdadMinima: 5,
    EdadMaxima: 12,
    Detalle: "Infantil",
    Url: "https://url6",
    Estado: <span className="text-purple-300 font-semibold">Inactivo</span>,
  },
  {
    Nombre: "Sub 15",
    EdadMinima: 13,
    EdadMaxima: 15,
    Detalle: "Categoría Sub 15",
    Url: "https://url6",
    Estado: <span className="text-cyan-300 font-semibold">Activo</span>,
  },
];

function SportsCategory() {
  return (
    <div
      id="content"
      className="w-full h-screen flex flex-col overflow-hidden"
    >
      {/* Encabezado */}
      <div id="header" className="pt-6 text-center">
        <h1 className="text-4xl font-extrabold text-purple-300">
          Categoría Deportiva
        </h1>
      </div>

      {/* Controles: botones + buscador */}
      <div className="flex flex-col md:flex-row items-center justify-between px-10 mt-4">
        {/* Botones */}
        <div className="flex gap-3 mb-4 md:mb-0">
          <button className="px-4 py-2 rounded-full bg-cyan-400 text-white font-semibold hover:bg-cyan-500 transition">
            Crear ➕
          </button>
          <button className="px-4 py-2 rounded-full bg-purple-300 text-purple-800 font-semibold hover:bg-purple-400 transition">
            📄 Generar reporte
          </button>
        </div>

        {/* Buscador */}
        <div>
          <input
            type="text"
            placeholder="Buscar"
            className="px-4 py-2 border rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
          />
        </div>
      </div>

      {/* Tabla */}
      <div
        id="body"
        className="flex-1 flex justify-center mt-6 px-6 overflow-auto"
      >
        <div className="w-full max-w-7xl">
          <Table
            thead={{
              titles: [
                "Nombre",
                "Edad mínima",
                "Edad máxima",
                "Detalle",
                "Url",
                "Estado",
              ],
            }}
            tbody={{
              maxRows: 10,
              data: sportsCategoryData,
              dataPropertys: [
                "Nombre",
                "EdadMinima",
                "EdadMaxima",
                "Detalle",
                "Url",
                "Estado",
              ],
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default SportsCategory;
