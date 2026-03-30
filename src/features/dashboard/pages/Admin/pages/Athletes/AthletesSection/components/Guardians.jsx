// src/features/dashboard/pages/Admin/pages/Guardians/Guardians.jsx
"use client";

import React, { useState, useMemo, useEffect } from "react";
import { FaUsers, FaPlus } from "react-icons/fa";
import GuardiansService from "../../services/GuardiansService"; // Importar el servicio real
import SearchInput from "../../../../../../../shared/components/SearchInput";
import Table from "../../../../../../../shared/components/Table/table";
import ReportButton from "../../../../../../../shared/components/ReportButton";
import { useReportDataWithService } from "../../../../../../../shared/hooks/useReportData";
import {
  showDeleteAlert,
  showSuccessAlert,
  showErrorAlert,
  showConfirmAlert,
} from "../../../../../../../shared/utils/alerts.js";
import GuardianModal from "./GuardianModal";
import { PAGINATION_CONFIG } from "../../../../../../../shared/constants/paginationConfig";

const Guardians = () => {
  const [data, setData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGuardian, setEditingGuardian] = useState(null);
  const [modalMode, setModalMode] = useState("create"); // "create", "edit", "view"
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(
    PAGINATION_CONFIG.DEFAULT_PAGE,
  );
  const [totalRows, setTotalRows] = useState(0);
  const [loading, setLoading] = useState(false);

  // Hook para obtener datos completos de reporte
  const { getReportData } = useReportDataWithService(GuardiansService.getAllForReport);

  // Función para obtener datos completos del reporte con filtros aplicados
  const getCompleteReportData = async () => {
    return await getReportData(
      { search: searchTerm }, // Aplicar los mismos filtros que la vista
      (data) => data.map((g) => ({
        tipoDocumento: g.documentType || g.tipoDocumento || "N/A",
        identificacion: g.identification || g.identificacion || "N/A",
        nombreCompleto: g.nombreCompleto || `${g.firstName || ""} ${g.lastName || ""}`.trim() || "N/A",
        correo: g.email || g.correo || "N/A",
        telefono: g.phone || g.telefono || "N/A",
        edad: g.age || g.edad || "N/A",
        estado: g.status || g.estado || "N/A",
      }))
    );
  };

  // Cargar acudientes desde el backend
  useEffect(() => {
    const fetchGuardians = async () => {
      setLoading(true);
      try {
        const response = await GuardiansService.getGuardians({
          page: currentPage,
          limit: PAGINATION_CONFIG.ROWS_PER_PAGE,
          search: searchTerm, // Enviar búsqueda al backend
        });

        if (response.success) {
          setData(response.data || []);
          setTotalRows(response.pagination?.total || 0);
        } else {
          showErrorAlert("Error", "No se pudieron cargar los acudientes");
        }
      } catch (error) {
showErrorAlert("Error", "Error al cargar los acudientes");
      } finally {
        setLoading(false);
      }
    };

    fetchGuardians();
  }, [currentPage, searchTerm]); // Recargar cuando cambia la página o la búsqueda

  // Usar datos directamente del backend (ya filtrados y paginados)
  const displayData = data;
  const displayTotalRows = totalRows;

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
  const handleSave = async (guardian) => {
    try {
      if (editingGuardian) {
        const confirmResult = await showConfirmAlert(
          "¿Guardar cambios?",
          `¿Deseas actualizar la información de ${editingGuardian.nombreCompleto}?`,
          {
            confirmButtonText: "Sí, actualizar",
            cancelButtonText: "Cancelar",
          },
        );

        if (!confirmResult.isConfirmed) {
          return;
        }

        // Editar
        const response = await GuardiansService.updateGuardian(
          editingGuardian.id,
          guardian,
        );
        if (response.success) {
          showSuccessAlert(
            "Acudiente actualizado",
            "Los cambios se guardaron correctamente",
          );
          setCurrentPage(1); // Volver a la primera página
        } else {
          showErrorAlert(
            "Error",
            response.error || "No se pudo actualizar el acudiente",
          );
        }
      } else {
        // Crear
        const response = await GuardiansService.createGuardian(guardian);
        if (response.success) {
          showSuccessAlert(
            "Acudiente creado",
            "El acudiente se creó correctamente",
          );
          setCurrentPage(1); // Volver a la primera página
        } else {
          showErrorAlert(
            "Error",
            response.error || "No se pudo crear el acudiente",
          );
        }
      }

      setEditingGuardian(null);
      setIsModalOpen(false);
    } catch (error) {
showErrorAlert("Error", "Error al guardar el acudiente");
    }
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
        `Se eliminará permanentemente el acudiente: ${guardian.nombreCompleto || guardian.firstName + " " + guardian.lastName}`,
      );

      if (result.isConfirmed) {
        const response = await GuardiansService.deleteGuardian(guardian.id);
        if (response.success) {
          showSuccessAlert(
            "Acudiente eliminado",
            `${guardian.nombreCompleto || guardian.firstName + " " + guardian.lastName} ha sido eliminado correctamente.`,
          );
          // Recargar datos
          setCurrentPage(1);
        } else {
          showErrorAlert(
            "Error",
            response.error || "No se pudo eliminar el acudiente",
          );
        }
      }
    } catch (error) {
showErrorAlert(
        "Error al eliminar",
        "No se pudo eliminar el acudiente. Intenta de nuevo.",
      );
    }
  };

  return (
    <div className="p-4 sm:p-6 font-montserrat">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <h1 className="text-2xl font-semibold text-gray-800 flex items-center gap-2 whitespace-nowrap">
          <FaUsers /> Acudientes
        </h1>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
          {/* Buscador */}
          <SearchInput
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              // Si limpia la búsqueda, resetear a página 1
              if (!e.target.value) {
                setCurrentPage(1);
              }
            }}
            placeholder="Buscar acudiente..."
          />

          {/* Botones */}
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <ReportButton
              dataProvider={getCompleteReportData}
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
      {loading ? (
        <div className="text-center text-gray-500 mt-10 py-8 bg-white rounded-2xl shadow border border-gray-200">
          <p>Cargando acudientes...</p>
        </div>
      ) : displayTotalRows > 0 ? (
        <>
          <Table
            serverPagination={true}
            currentPage={currentPage}
            totalRows={displayTotalRows}
            rowsPerPage={PAGINATION_CONFIG.ROWS_PER_PAGE}
            onPageChange={(page) => setCurrentPage(page)}
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
              data: displayData.map((g) => ({
                ...g,
                nombreCompleto:
                  g.nombreCompleto ||
                  `${g.firstName || ""} ${g.lastName || ""}`.trim(),
                identificacion: g.identification || g.identificacion,
                correo: g.email || g.correo,
                telefono: g.phone || g.telefono,
                estado: g.status || g.estado,
              })),
              dataPropertys: [
                "nombreCompleto",
                "identificacion",
                "correo",
                "telefono",
                "estado",
              ],
              state: true,
              stateMap: {
                Activo: "bg-green-100 text-green-800",
                Inactivo: "bg-red-100 text-red-800",
                Active: "bg-green-100 text-green-800",
                Inactive: "bg-red-100 text-red-800",
              },
            }}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={handleView}
          />
        </>
      ) : (
        <div className="text-center text-gray-500 mt-10 py-8 bg-white rounded-2xl shadow border border-gray-200">
          {searchTerm ? (
            <p>No se encontraron acudientes que coincidan con "{searchTerm}"</p>
          ) : (
            <p>No hay acudientes registrados todavía.</p>
          )}
        </div>
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
onUpdate={handleSave}
onDelete={handleDelete}
guardianToEdit={editingGuardian}
mode={modalMode}
      />
    </div>
  );
};

export default Guardians;

