import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AttendanceHistory() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const attendanceData = {
    "2025-10-13": [
      { id: 1, name: "Carlos Pérez", status: "Presente", observation: "Entrenó fuerza" },
      { id: 2, name: "Laura Gómez", status: "Ausente", observation: "Motivo personal" },
    ],
    "2025-10-12": [
      { id: 1, name: "Carlos Pérez", status: "Ausente", observation: "Enfermedad" },
      { id: 2, name: "Laura Gómez", status: "Presente", observation: "Cardio" },
    ],
  };

  const tableData = attendanceData[selectedDate] || [];

  return (
    <div className="p-6 bg-[#a3e4d7] min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-3">
        <h1 className="text-2xl font-bold text-[#16a085]">
          Historial de Asistencia
        </h1>

        <div className="flex gap-3 items-center">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="p-2 rounded-lg border border-gray-400 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#16a085]"
          />

          <button
            onClick={() => navigate("/dashboard/athletes-assistance")}
            className="bg-[#16a085] text-white px-4 py-2 rounded-lg hover:opacity-90 transition"
          >
            Asistencia
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-md p-4 border border-[#a2d9ce]">
        {tableData.length > 0 ? (
          <table className="w-full border-collapse text-center">
            <thead>
              <tr className="bg-[#16a085] text-white">
                <th className="p-3">ID</th>
                <th className="p-3">Nombre</th>
                <th className="p-3">Estado</th>
                <th className="p-3">Observación</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((row) => (
                <tr key={row.id} className="bg-[#a2d9ce]">
                  <td className="p-3">{row.id}</td>
                  <td className="p-3">{row.name}</td>
                  <td className="p-3">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        row.status === "Presente"
                          ? "bg-green-200 text-green-800"
                          : "bg-red-200 text-red-800"
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className="p-3">
                    <input
                      type="text"
                      defaultValue={row.observation}
                      readOnly
                      className="w-48 md:w-64 p-2 rounded-xl border border-gray-300 bg-white text-gray-700 text-sm"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-center text-gray-600 py-10">
            No hay registros de asistencia para esta fecha.
          </p>
        )}
      </div>
    </div>
  );
}
    