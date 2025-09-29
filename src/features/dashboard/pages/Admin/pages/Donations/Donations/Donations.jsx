import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useDonations } from "./hooks/useDonations";

import Table from "../../../../../../shared/components/Table/table";
import SearchInput from "../../../../../../shared/components/SearchInput";
import Pagination from "../../../../../../shared/components/Table/Pagination";

import { FaPlus } from "react-icons/fa";
import { IoMdDownload } from "react-icons/io";

const Donations = () => {
  // 📌 Hooks
  const { donations } = useDonations();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  // 🔎 Filtrar datos
  const filteredData = useMemo(
    () =>
      donations.filter(
        (item) =>
          item.nombreDonante?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.tipoDonacion?.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [donations, searchTerm]
  );

  // 📄 Paginación
  const totalRows = filteredData.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedData = filteredData.slice(
    startIndex,
    startIndex + rowsPerPage
  );

  // 🎨 Mapear estado con color
  const mapEstado = (estado) => {
    if (estado === "Registrado")
      return <span className="text-cyan-500 font-semibold">{estado}</span>;
    if (estado === "Anulado")
      return <span className="text-purple-500 font-semibold">{estado}</span>;
    return estado;
  };

  // 📌 Navegar al formulario
  const handleCreate = () => {
    navigate("/DonationsForm");
  };

  // 📌 Generar reporte
  const handleReport = () => {
    navigate("/DonationsReport");
  };

  // 📊 Preparar datos para la tabla
  const tableData = paginatedData.map((item) => ({
    ...item,
    estado: mapEstado(item.estado),
  }));

  // 📍 Render
  return (
    <div className="p-6 font-questrial">
      {/* 🔹 Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Donaciones</h1>

        <div className="flex flex-col sm:flex-row gap-3 items-center w-full sm:w-auto">
          {/* Buscar */}
          <SearchInput
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Buscar donación..."
          />

          {/* Botones */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleReport}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-700 font-semibold hover:bg-gray-200 transition-colors"
            >
              <IoMdDownload size={22} className="text-primary-purple" />
              Generar reporte
            </button>

            <button
              onClick={handleCreate}
              className="flex items-center gap-2 px-4 py-2 bg-primary-blue text-white rounded-lg shadow hover:bg-primary-purple transition-colors"
            >
              <FaPlus /> Crear
            </button>
          </div>
        </div>
      </div>

      {/* 🔹 Tabla */}
      <Table
        thead={{
          titles: [
            "Nombre del Donante",
            "Tipo de Donación",
            "Cantidad",
            "Fecha Donación",
            "Fecha Registro",
            "Estado",
          ],
        }}
        tbody={{
          data: tableData,
          dataPropertys: [
            "nombreDonante",
            "tipoDonacion",
            "cantidad",
            "fechaDonacion",
            "fechaRegistro",
            "estado",
          ],
        }}
      />

      {/* 🔹 Paginación */}
      {totalRows > rowsPerPage && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalRows={totalRows}
          rowsPerPage={rowsPerPage}
          startIndex={startIndex}
        />
      )}
    </div>
  );
};

export default Donations;
