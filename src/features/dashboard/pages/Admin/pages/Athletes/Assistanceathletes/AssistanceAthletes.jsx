// src/features/dashboard/pages/Admin/pages/Athletes/Assistance/AssistanceAthletes.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import ReportButton from "../../../../../../../shared/components/ReportButton";
import SearchInput from "../../../../../../../shared/components/SearchInput";
import Pagination from "../../../../../../../shared/components/Table/Pagination";
import { showSuccessAlert } from "../../../../../../../shared/utils/alerts";

export default function AssistanceAthletes() {
  const navigate = useNavigate();

  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [attendance, setAttendance] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 6;

  // Base de deportistas (datos quemados)
  const athletesBase = [
    { id: 1, nombre: "Carlos Gómez", documento: "1032547896", edad: 22, categoria: "Juvenil" },
    { id: 2, nombre: "Laura Pérez", documento: "1056987452", edad: 19, categoria: "Sub-20" },
    { id: 3, nombre: "Juan Rodríguez", documento: "1002365478", edad: 25, categoria: "Mayores" },
    { id: 4, nombre: "Valentina Torres", documento: "1023654798", edad: 18, categoria: "Sub-20" },
    { id: 5, nombre: "Andrés López", documento: "1012365987", edad: 23, categoria: "Mayores" },
    { id: 6, nombre: "Mariana Ortiz", documento: "1047852369", edad: 20, categoria: "Juvenil" },
    { id: 7, nombre: "Sebastián Ríos", documento: "1002546987", edad: 21, categoria: "Mayores" },
    { id: 8, nombre: "Daniela Castaño", documento: "1069854712", edad: 19, categoria: "Sub-20" },
  ];

  // Cargar asistencia desde localStorage o crear inicial
  useEffect(() => {
    const savedData = localStorage.getItem(`attendance_${selectedDate}`);
    if (savedData) {
      setAttendance(JSON.parse(savedData));
    } else {
      const initialData = athletesBase.map((a) => ({
        ...a,
        asistencia: false,
        observacion: "",
      }));
      setAttendance(initialData);
    }
  }, [selectedDate]);

  // Manejadores
  const handleAttendanceChange = (id) => {
    setAttendance((prev) =>
      prev.map((a) => (a.id === id ? { ...a, asistencia: !a.asistencia } : a))
    );
  };

  const handleObservationChange = (id, value) => {
    setAttendance((prev) =>
      prev.map((a) => (a.id === id ? { ...a, observacion: value } : a))
    );
  };

  const handleSave = () => {
    if (!selectedDate) {
      showSuccessAlert("⚠️ Debes seleccionar una fecha antes de guardar.");
      return;
    }
    localStorage.setItem(`attendance_${selectedDate}`, JSON.stringify(attendance));
    showSuccessAlert(` Asistencia guardada para el ${selectedDate}.`);
  };

  const goToHistory = () => {
    navigate("/dashboard/athletes-assistance/history");
  };

  // Filtrado y paginación
  const filteredData = useMemo(() => {
    if (!searchTerm) return attendance;
    return attendance.filter((a) =>
      a.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [attendance, searchTerm]);

  const totalRows = filteredData.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + rowsPerPage);

  // Configuración de reporte
  const reportColumns = [
    { header: "Nombre", accessor: "nombre" },
    { header: "Documento", accessor: "documento" },
    { header: "Edad", accessor: "edad" },
    { header: "Categoría", accessor: "categoria" },
    {
      header: "Asistencia",
      accessor: "asistencia",
      transform: (v) => (v ? "Presente" : "Ausente"),
    },
    { header: "Observación", accessor: "observacion" },
  ];

  const gradient = "linear-gradient(90deg, #a4b4ff 0%, #b1b8ff 100%)";

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-questrial">
      {/* Encabezado */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">
          Asistencia de Deportistas{" "}
          {totalRows !== attendance.length && (
            <span className="text-sm text-gray-600 ml-1">
              ({totalRows} de {attendance.length})
            </span>
          )}
        </h1>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Fecha */}
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-400"
          />

          {/* Búsqueda */}
          <div className="sm:w-64">
            <SearchInput
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Buscar deportista..."
              className="w-full"
            />
          </div>

          {/* Botones */}
          <button
            onClick={handleSave}
            className="text-white px-4 py-2 rounded-lg shadow hover:opacity-90 transition"
            style={{ background: gradient }}
          >
            Guardar Asistencia
          </button>

          <button
            onClick={goToHistory}
            className="text-white px-4 py-2 rounded-lg shadow hover:opacity-90 transition"
            style={{ background: gradient }}
          >
            Ver Historial
          </button>

          <ReportButton
            data={filteredData}
            fileName={`Asistencia_${selectedDate}`}
            columns={reportColumns}
          />
        </div>
      </div>

      {/* Tabla */}
      {totalRows === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200 mb-6">
          <p className="text-gray-600">
            No se encontraron deportistas que coincidan con "{searchTerm}"
          </p>
          <button
            onClick={() => setSearchTerm("")}
            className="text-indigo-500 hover:text-indigo-700 mt-2 font-medium"
          >
            Limpiar búsqueda
          </button>
        </div>
      ) : (
        <>
          <div className="bg-white shadow-md rounded-xl overflow-x-auto">
            <table className="min-w-full text-sm md:text-base">
              <thead
                className="text-white uppercase tracking-wide"
                style={{ background: gradient }}
              >
                <tr>
                  <th className="px-4 py-3 text-left">#</th>
                  <th className="px-4 py-3 text-left">Nombre</th>
                  <th className="px-4 py-3 text-left">Documento</th>
                  <th className="px-4 py-3 text-center">Edad</th>
                  <th className="px-4 py-3 text-center">Categoría</th>
                  <th className="px-4 py-3 text-center">Asistencia</th>
                  <th className="px-4 py-3 text-left">Observación</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200 bg-white">
                {paginatedData.map((a, idx) => (
                  <tr
                    key={a.id}
                    className="hover:bg-indigo-50 transition-colors duration-150"
                  >
                    <td className="px-4 py-3">{startIndex + idx + 1}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {a.nombre}
                    </td>
                    <td className="px-4 py-3">{a.documento}</td>
                    <td className="px-4 py-3 text-center">{a.edad}</td>
                    <td className="px-4 py-3 text-center">{a.categoria}</td>

                    <td className="px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={a.asistencia}
                        onChange={() => handleAttendanceChange(a.id)}
                        className="w-5 h-5 cursor-pointer"
                        style={{ accentColor: "#a4b4ff" }}
                      />
                    </td>

                    <td className="px-4 py-3">
                      <textarea
                        value={a.observacion}
                        onChange={(e) =>
                          handleObservationChange(a.id, e.target.value)
                        }
                        placeholder="Observación..."
                        className="w-full px-2 py-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 text-sm resize-none bg-indigo-50/40"
                        rows="1"
                        style={{ minHeight: "34px", maxHeight: "60px" }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(p) => setCurrentPage(p)}
            totalRows={totalRows}
            rowsPerPage={rowsPerPage}
            startIndex={startIndex}
          />
        </>
      )}
    </div>
  );
}
