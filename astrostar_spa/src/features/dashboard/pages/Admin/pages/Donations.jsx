import React, { useState } from "react";
import Table from "../../../../../shared/components/Table/table";
import { FaPlus } from "react-icons/fa";
import { FiDownload } from "react-icons/fi";

// Datos reales de donaciones
const initialDonationsData = [
  {
    nombreDonante: "Juan Alvarez",
    tipoDonacion: "Balones",
    cantidad: 110,
    descripcion: "Balones para micro y entrenamiento",
    estado: <span className="text-cyan-500 font-semibold">Registrado</span>,
    fechaDonacion: "18/01/2024",
    fechaRegistro: "12/05/2025",
  },
  {
    nombreDonante: "Valeria Alvarez",
    tipoDonacion: "Uniformes",
    cantidad: 25,
    descripcion: "Para la categoría juvenil",
    estado: <span className="text-purple-500 font-semibold">Anulado</span>,
    fechaDonacion: "03/10/2024",
    fechaRegistro: "07/08/2024",
  },
  {
    nombreDonante: "Ariana Alvarez",
    tipoDonacion: "Vendajes",
    cantidad: 78,
    descripcion: "Vendajes para todo tipo",
    estado: <span className="text-purple-500 font-semibold">Anulado</span>,
    fechaDonacion: "03/08/2025",
    fechaRegistro: "05/11/2024",
  },
  {
    nombreDonante: "Yudy Alvarez",
    tipoDonacion: "Conos",
    cantidad: 36,
    descripcion: "Para los entrenamientos",
    estado: <span className="text-cyan-500 font-semibold">Registrado</span>,
    fechaDonacion: "10/02/2025",
    fechaRegistro: "09/03/2023",
  },
];

const Donations = () => {
  const [data] = useState(initialDonationsData);

  return (
    <div className="p-6 font-questrial">
      {/* Encabezado */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Donaciones</h1>

        <div className="flex gap-3">
          {/* Botón Crear */}
          <button
            onClick={() => console.log("Abrir modal para registrar donación")}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-500 text-white rounded-lg shadow hover:bg-cyan-600 transition-colors"
          >
            <FaPlus /> Crear
          </button>

          {/* Botón Generar reporte */}
          <button
            onClick={() => console.log("Generar reporte")}
            className="flex items-center gap-2 px-4 py-2 text-black rounded-lg shadow hover:text-gray-700 transition-colors"
          >
            <FiDownload className="text-purple-500" /> Generar reporte
          </button>
        </div>
      </div>

      {/* Tabla */}
      <Table
        thead={{
          titles: [
            "Nombre del donante",
            "Tipo de donación",
            "Cantidad",
            "Estado",
            "Fecha de donación",
            "Fecha de registro",
          ],
        }}
        tbody={{
          data,
          dataPropertys: [
            "nombreDonante",
            "tipoDonacion",
            "cantidad",
            "estado",
            "fechaDonacion",
            "fechaRegistro",
          ],
        }}
      />
    </div>
  );
};

export default Donations;
