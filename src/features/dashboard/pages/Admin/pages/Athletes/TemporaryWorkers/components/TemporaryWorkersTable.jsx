import React from "react";
import { FaEdit, FaTrash, FaEye } from "react-icons/fa";

const TemporaryWorkersTable = ({ workers, onEdit, onDelete, onView }) => {
  return (
    <div className="mt-8 bg-white shadow-lg rounded-2xl p-6">
      <h3 className="text-xl font-bold text-[#9BE9FF] mb-4">Personas Temporales</h3>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-[#f3e8ff] text-[#6b21a8]">
            <th className="p-2 text-left">Tipo de Persona</th>
            <th className="p-2 text-left">Nombre</th>
            <th className="p-2 text-left">Identificación</th>
            <th className="p-2 text-left">Categoría</th>
            <th className="p-2 text-left">Edad</th>
            <th className="p-2 text-left">Estado</th>
            <th className="p-2 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {workers.length === 0 ? (
            <tr>
              <td colSpan="7" className="p-3 text-center text-gray-500">
                No hay personas temporales registradas
              </td>
            </tr>
          ) : (
            workers.map((worker, index) => (
              <tr key={index} className="border-b hover:bg-gray-50">
                <td className="p-2">{worker.tipoPersona}</td>
                <td className="p-2">{worker.nombre}</td>
                <td className="p-2">{worker.identificacion}</td>
                <td className="p-2">
                  {worker.tipoPersona === "Jugadora" ? worker.categoria : "No aplica"}
                </td>
                <td className="p-2">{worker.edad}</td>
                <td
                  className={`p-2 font-medium ${
                    worker.estado === "Activo"
                      ? "text-blue-500"
                      : worker.estado === "Inactivo"
                      ? "text-red-500"
                      : "text-gray-500"
                  }`}
                >
                  {worker.estado}
                </td>
                <td className="p-2 flex gap-2 justify-center">
                  <button
                    className="text-blue-500 hover:text-blue-700"
                    onClick={() => onEdit(worker)}
                  >
                    <FaEdit />
                  </button>
                  <button
                    className="text-red-500 hover:text-red-700"
                    onClick={() => onDelete(worker)}
                  >
                    <FaTrash />
                  </button>
                  <button
                    className="text-purple-500 hover:text-purple-700"
                    onClick={() => onView(worker)}
                  >
                    <FaEye />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TemporaryWorkersTable;
