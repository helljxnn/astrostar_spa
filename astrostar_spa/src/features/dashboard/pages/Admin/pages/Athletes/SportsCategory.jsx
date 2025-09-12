import  { useState } from "react";
import Table from "../../../../../../shared/components/Table/table";
import { FaPlus } from "react-icons/fa";
import { FiDownload } from "react-icons/fi";
import initialSportsCategoryData from "../../../../../../shared/models/initialSportsCategoryData";

const SportsCategory = () => {
  const [data, setData] = useState(initialSportsCategoryData);

  const handleSave = (newCategory) => {
    setData([...data, newCategory]);
  };

  // Función para pintar estado con colores
  const renderEstado = (estado) => {
    if (estado === "Activo") {
      return <span className="text-cyan-500 font-semibold">{estado}</span>;
    }
    if (estado === "Inactivo") {
      return <span className="text-purple-500 font-semibold">{estado}</span>;
    }
    return <span className="text-gray-500">{estado}</span>;
  };

  return (
    <div className="p-6 font-questrial">
      {/* Header con botones */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">
          Categorías Deportivas
        </h1>

        <div className="flex gap-3">
          {/* Botón Crear */}
          <button
            onClick={() => console.log("Abrir modal para crear categoría")}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-500 text-white rounded-lg shadow hover:bg-cyan-600 transition-colors"
          >
            <FaPlus /> Crear
          </button>

          {/* Botón Generar reporte */}
          <button
            onClick={() => console.log("Generar reporte")}
            className="flex items-center gap-2 px-4 py-2 text-black hover:text-gray-700 transition-colors"
          >
            <FiDownload className="text-purple-500" /> Generar reporte
          </button>
        </div>
      </div>

      {/* Tabla usando componente genérico */}
      <Table
        thead={{
          titles: ["Nombre", "Edad mínima", "Edad máxima", "Detalle", "Estado"],
        }}
        tbody={{
          data,
          dataPropertys: ["Nombre", "EdadMinima", "EdadMaxima", "Detalle", "Estado"],
          customRender: {
            Estado: renderEstado, // <- aquí pintamos con color
          },
        }}
      />
    </div>
  );
};

export default SportsCategory;
