// src/features/dashboard/pages/Admin/pages/Guardians/Guardians.jsx
"use client";

import React, { useState, useMemo } from "react";
import { FaUsers, FaPlus } from "react-icons/fa";
import guardiansData from "./GuardiansData"; // tus acudientes
import SearchInput from "../../../../../../../shared/components/SearchInput";
import Table from "../../../../../../../shared/components/Table/table";
import Pagination from "../../../../../../../shared/components/Table/Pagination";
import ReportButton from "../../../../../../../shared/components/ReportButton";
import {
  showDeleteAlert,
  showSuccessAlert,
  showErrorAlert,
} from "../../../../../../../shared/utils/alerts";
import GuardianModal from "./components/GuardianModal";

const Guardians = () => {
  const [data, setData] = useState(guardiansData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGuardian, setEditingGuardian] = useState(null);
  const [modalMode, setModalMode] = useState("create"); // "create", "edit", "view"
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  // 🔹 Usar `data` en lugar de `guardians`
const filteredData = useMemo(() => {
  if (!searchTerm) return data;

  return data.filter((item) =>
    Object.entries(item).some(([key, value]) => {
      const stringValue = String(value || "").trim();

      // 🔹 Si es el campo Estado, comparar exacto
      if (key.toLowerCase() === "estado") {
        return (
          (stringValue === "Activo" && searchTerm === "Activo") ||
          (stringValue === "Inactivo" && searchTerm === "Inactivo")
        );
      }
      return stringValue.toLowerCase().includes(searchTerm.toLowerCase());
    })
  );
}, [data, searchTerm]);


  // Paginación
  const totalRows = filteredData.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedData = filteredData.slice(
    startIndex,
    startIndex + rowsPerPage
  );

  // Columnas para reporte
  const reportColumns = [
    { key: "tipoDocumento", label: "Tipo Documento" },
    { key: "identificacion", label: "Número de Documento" },
    { key: "nombreCompleto", label: "Nombre Completo" },
    { key: "correo", label: "Correo" },
    { key: "telefono", label: "Teléfono" },
    { key: "edad", label: "Edad" },
    { key: "estado", label: "Estado" },
  ];

  // Guardar acudiente (crear o editar)
  const handleSave = (guardian) => {
    if (editingGuardian) {
      // Editar
      setData((prev) =>
        prev.map((item) =>
          item.id === editingGuardian.id
            ? { ...guardian, id: editingGuardian.id }
            : item
        )
      );
    } else {
      // Crear
      setData((prev) => [
        ...prev,
        { ...guardian, id: prev.length + 1 },
      ]);
    }

    setEditingGuardian(null);
    setIsModalOpen(false);
  };

  // Editar acudiente
  const handleEdit = (guardian) => {
    setEditingGuardian(guardian);
    setModalMode("edit");
    setIsModalOpen(true);
  };

  // Ver acudiente
  const handleView = (guardian) => {
    setEditingGuardian(guardian);
    setModalMode("view");
    setIsModalOpen(true);
  };

  // Eliminar acudiente
  const handleDelete = async (guardian) => {
    try {
      const result = await showDeleteAlert(
        "¿Eliminar acudiente?",
        `Se eliminará permanentemente el acudiente: ${guardian.nombreCompleto}`
      );

      if (result.isConfirmed) {
        setData((prev) => prev.filter((item) => item.id !== guardian.id));
        showSuccessAlert(
          "Acudiente eliminado",
          `${guardian.nombreCompleto} ha sido eliminado correctamente.`
        );
      }
    } catch (error) {
      console.error("Error al eliminar acudiente:", error);
      showErrorAlert(
        "Error al eliminar",
        "No se pudo eliminar el acudiente. Intenta de nuevo."
      );
    }
  };

  return (
    <div className="p-6 font-questrial">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
        <h1 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
          <FaUsers /> Acudientes
        </h1>

        <div className="flex flex-col sm:flex-row gap-3 items-center w-full sm:w-auto">
          {/* Buscador */}
          <SearchInput
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Buscar acudiente..."
          />

          {/* Botones */}
          <div className="flex items-center gap-3">
            <ReportButton
              data={filteredData}
              fileName="Reporte_Acudientes"
              columns={reportColumns}
            />
            <button
              onClick={() => {
                setEditingGuardian(null);
                setModalMode("create");
                setIsModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-primary-purple text-white rounded-lg shadow hover:opacity-90 transition-colors"
            >
              <FaPlus /> Crear
            </button>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <Table
        thead={{
          titles: [
            "Nombre Completo",
            "Identificación",
            "Correo",
            "Teléfono",
            "Estado",
          ],
          state: true,
        }}
        tbody={{
          data: paginatedData,
          dataPropertys: [
            "nombreCompleto",
            "identificacion",
            "correo",
            "telefono",
            "estado",
          ],
          state: true,
        }}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
      />

      {/* Paginador */}
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

      {/* Modal de Acudientes */}
      <GuardianModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingGuardian(null);
          setModalMode("create");
        }}
        onSave={handleSave}
        onDelete={handleDelete}
        guardian={editingGuardian}
        mode={modalMode}
      />
    </div>
  );
};

export default Guardians;
