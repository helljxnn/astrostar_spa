import React, { useEffect, useMemo, useState } from "react";
import Table from "../../../../../../../shared/components/Table/table";
import { FaPlus } from "react-icons/fa";
import ReportButton from "../../../../../../../shared/components/ReportButton";
import { showConfirmAlert } from "../../../../../../../shared/utils/alerts.js";
import SearchInput from "../../../../../../../shared/components/SearchInput";
import PermissionGuard from "../../../../../../../shared/components/PermissionGuard";
import { usePermissions } from "../../../../../../../shared/hooks/usePermissions";
import { useReportDataWithService } from "../../../../../../../shared/hooks/useReportData";
import DonorSponsorModal from "./components/DonorSponsorModal";
import DonorSponsorViewModal from "./components/DonorSponsorViewModal";
import useDonorsSponsors from "./hooks/useDonorsSponsors";
import donorsSponsorsService from "./services/donorsSponsorsService";

function DonorsSponsors() {
  const { hasPermission } = usePermissions();
  const { getReportData } = useReportDataWithService(
    donorsSponsorsService.getAllForReport.bind(donorsSponsorsService),
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedDonor, setSelectedDonor] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const {
    donorsSponsors,
    loading,
    pagination,
    loadDonorsSponsors,
    createDonorSponsor,
    updateDonorSponsor,
    deleteDonorSponsor,
    referenceData,
    checkEmailAvailability,
    checkIdentificationAvailability,
  } = useDonorsSponsors();

  // Estado para el contador de "Por confirmar"
  const [pendingCount, setPendingCount] = useState(0);

  // Cargar contador de pendientes
  useEffect(() => {
    const loadPendingCount = async () => {
      try {
        const response = await donorsSponsorsService.getAll({
          status: "Por confirmar",
          limit: 1,
        });
        if (response.success && response.pagination) {
          setPendingCount(response.pagination.total || 0);
        }
      } catch (error) {}
    };

    loadPendingCount();
  }, [donorsSponsors]); // Actualizar cuando cambie la lista

  useEffect(() => {
    const timeout = setTimeout(() => {
      loadDonorsSponsors({
        search: searchTerm,
        status: statusFilter || undefined,
        page: 1,
      });
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchTerm, statusFilter, loadDonorsSponsors]);

  const handleOpenCreateModal = () => {
    if (!hasPermission("donorsSponsors", "Crear")) return;
    setSelectedDonor(null);
    setModalMode("create");
    setIsModalOpen(true);
  };

  const handleEdit = (item) => {
    if (!hasPermission("donorsSponsors", "Editar")) return;
    setSelectedDonor(item);
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDonor(null);
    setModalMode("create");
  };

  const handleSave = async (formData) => {
    try {
      if (modalMode === "edit" && selectedDonor) {
        await updateDonorSponsor(selectedDonor.id, formData);
      } else {
        await createDonorSponsor(formData);
      }
      handleCloseModal();
    } catch (error) {
      // Los mensajes de error ya se muestran en el hook
    }
  };

  const handleDelete = async (itemToDelete) => {
    if (!hasPermission("donorsSponsors", "Eliminar")) return;
    const result = await showConfirmAlert(
      "Estas seguro de eliminar?",
      `"${itemToDelete.nombre}" se eliminara permanentemente.`,
      { confirmButtonText: "Si, eliminar", cancelButtonText: "Cancelar" },
    );

    if (result.isConfirmed) {
      try {
        await deleteDonorSponsor(itemToDelete.id);
      } catch (error) {
        // Los errores ya se notifican en el hook
      }
    }
  };

  const handleView = (item) => {
    if (!hasPermission("donorsSponsors", "Ver")) return;
    setSelectedDonor(item);
    setIsViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedDonor(null);
  };

  const reportData = useMemo(() => {
    return (donorsSponsors || []).map((donor) => ({
      identificacion:
        donor.identificacion || donor.numeroDocumento || donor.nit || "",
      nombre: donor.nombre || "",
      tipo: donor.tipo || "",
      tipoPersona: donor.tipoPersona || "",
      telefono: donor.telefono || "",
      correo: donor.correo || "",
      direccion: donor.direccion || "",
      ciudad: donor.ciudad || "",
      pais: donor.pais || "",
      estado: donor.estado || "",
    }));
  }, [donorsSponsors]);

  // Función para obtener todos los datos para reporte
  const getCompleteReportData = async () => {
    return await getReportData(
      {
        search: searchTerm,
        status: statusFilter || undefined,
      }, // Filtros actuales
      (donors) =>
        donors.map((donor) => ({
          // Mapper de datos
          identificacion:
            donor.identificacion || donor.numeroDocumento || donor.nit || "",
          nombre: donor.nombre || "",
          tipo: donor.tipo || "",
          tipoPersona: donor.tipoPersona || "",
          telefono: donor.telefono || "",
          correo: donor.correo || "",
          direccion: donor.direccion || "",
          ciudad: donor.ciudad || "",
          pais: donor.pais || "",
          estado: donor.estado || "",
        })),
    );
  };

  const tableData = useMemo(() => {
    return (donorsSponsors || []).map((donor) => {
      const isJuridica = donor.tipoPersona === "Juridica";
      const tipoIdentificacion =
        donor.tipoDocumento || donor.documentType || (isJuridica ? "NIT" : "");
      const numeroIdentificacion =
        (isJuridica
          ? donor.nit ||
            donor.numeroDocumento ||
            donor.identificacion ||
            donor.identification
          : donor.numeroDocumento ||
            donor.identificacion ||
            donor.nit ||
            donor.identification) || "";

      return {
        ...donor,
        tipoIdentificacion,
        numeroIdentificacion,
      };
    });
  }, [donorsSponsors]);

  return (
    <div className="p-6 font-montserrat space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-semibold text-gray-800">
          Donantes y Patrocinadores
        </h1>

        <div className="flex flex-col sm:flex-row gap-3 items-center w-full sm:w-auto">
          <SearchInput
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar donante o patrocinador..."
          />

          <div className="flex items-center gap-3">
            <PermissionGuard module="donorsSponsors" action="Ver">
              <ReportButton
                dataProvider={getCompleteReportData}
                fileName="Donantes_y_Patrocinadores"
                columns={[
                  { header: "Identificacion", accessor: "identificacion" },
                  { header: "Nombre / Razon Social", accessor: "nombre" },
                  { header: "Tipo", accessor: "tipo" },
                  { header: "Tipo Persona", accessor: "tipoPersona" },
                  { header: "Telefono", accessor: "telefono" },
                  { header: "Correo", accessor: "correo" },
                  { header: "Direccion", accessor: "direccion" },
                  { header: "Ciudad", accessor: "ciudad" },
                  { header: "Pais", accessor: "pais" },
                  { header: "Estado", accessor: "estado" },
                ]}
              />
            </PermissionGuard>
            <PermissionGuard module="donorsSponsors" action="Crear">
              <button
                onClick={handleOpenCreateModal}
                className="flex items-center gap-2 px-4 py-2 bg-primary-blue text-white rounded-lg shadow hover:bg-primary-purple transition-colors"
              >
                <FaPlus /> Crear
              </button>
            </PermissionGuard>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="inline-flex gap-2">
          <button
            onClick={() => setStatusFilter("")}
            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
              statusFilter === ""
                ? "bg-primary-purple/10 text-primary-purple"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <span>Todos</span>
            <span
              className={`px-1.5 py-0.5 rounded-md text-xs font-medium ${
                statusFilter === ""
                  ? "bg-primary-purple text-white"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              {pagination.total || 0}
            </span>
          </button>
          <button
            onClick={() => setStatusFilter("Por confirmar")}
            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
              statusFilter === "Por confirmar"
                ? "bg-primary-blue/10 text-primary-blue"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
            <span>Por confirmar</span>
            <span
              className={`px-1.5 py-0.5 rounded-md text-xs font-medium ${
                statusFilter === "Por confirmar"
                  ? "bg-primary-blue text-white"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              {pendingCount}
            </span>
          </button>
        </div>
      </div>

      <div>
        <Table
          serverPagination={true}
          currentPage={pagination.page}
          totalRows={pagination.total || 0}
          rowsPerPage={pagination.limit || 5}
          onPageChange={(page) => loadDonorsSponsors({ page })}
          thead={{
            titles: [
              "Nombre",
              "Tipo de Identificacion",
              "Numero de Identificacion",
              "Tel\u00e9fono",
              "Correo",
              "Tipo",
            ],
            state: true,
            actions: true,
          }}
          tbody={{
            data: tableData,
            dataPropertys: [
              "nombre",
              "tipoIdentificacion",
              "numeroIdentificacion",
              "telefono",
              "correo",
              "tipo",
            ],
            state: true,
            cellClassNames: {
              nombre: "whitespace-normal break-words",
              tipoIdentificacion: "whitespace-normal",
              numeroIdentificacion: "whitespace-normal break-words",
              telefono: "whitespace-normal",
              correo: "whitespace-normal break-all",
              tipo: "whitespace-normal",
            },
          }}
          onEdit={hasPermission("donorsSponsors", "Editar") ? handleEdit : null}
          onDelete={
            hasPermission("donorsSponsors", "Eliminar") ? handleDelete : null
          }
          onView={hasPermission("donorsSponsors", "Ver") ? handleView : null}
          buttonConfig={{
            view: () => ({
              show: hasPermission("donorsSponsors", "Ver"),
              disabled: false,
              title: "Ver detalles",
            }),
            edit: () => ({
              show: hasPermission("donorsSponsors", "Editar"),
              disabled: false,
              title: "Editar",
            }),
            delete: () => ({
              show: hasPermission("donorsSponsors", "Eliminar"),
              disabled: false,
              title: "Eliminar",
            }),
          }}
          loading={loading}
        />
      </div>

      <DonorSponsorModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        donorData={selectedDonor}
        mode={modalMode}
        referenceData={referenceData}
        checkEmailAvailability={checkEmailAvailability}
        checkIdentificationAvailability={checkIdentificationAvailability}
      />
      <DonorSponsorViewModal
        isOpen={isViewModalOpen}
        onClose={handleCloseViewModal}
        donorData={selectedDonor}
      />
    </div>
  );
}

export default DonorsSponsors;
