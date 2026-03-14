import React, { useEffect, useMemo, useState } from "react";
import Table from "../../../../../../../shared/components/Table/table";
import { FaPlus } from "react-icons/fa";
import ReportButton from "../../../../../../../shared/components/ReportButton";
import { showConfirmAlert } from "../../../../../../../shared/utils/alerts.js";
import SearchInput from "../../../../../../../shared/components/SearchInput";
import DonorSponsorModal from "./components/DonorSponsorModal";
import DonorSponsorViewModal from "./components/DonorSponsorViewModal";
import useDonorsSponsors from "./hooks/useDonorsSponsors";

function DonorsSponsors() {
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
    setSelectedDonor(null);
    setModalMode("create");
    setIsModalOpen(true);
  };

  const handleEdit = (item) => {
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
    const result = await showConfirmAlert(
      "Estas seguro de eliminar?",
      `"${itemToDelete.nombre}" se eliminara permanentemente.`,
      { confirmButtonText: "Si, eliminar", cancelButtonText: "Cancelar" }
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
    setSelectedDonor(item);
    setIsViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedDonor(null);
  };

  const reportData = useMemo(() => {
    return (donorsSponsors || []).map((donor) => ({
      identificacion: donor.identificacion || "",
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
    <div className="p-6 font-questrial space-y-6">
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

          <div className="flex gap-2">
            {[
              { label: "Todos", value: "" },
              { label: "Por confirmar", value: "Por confirmar" },
            ].map((opt) => (
              <button
                key={opt.value || "all"}
                onClick={() => setStatusFilter(opt.value)}
                className={`px-3 py-2 rounded-lg text-sm border transition-colors ${
                  statusFilter === opt.value
                    ? "bg-primary-purple text-white border-primary-purple"
                    : "border-gray-200 text-gray-700 hover:border-primary-purple"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <ReportButton
              data={reportData}
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
            <button
              onClick={handleOpenCreateModal}
              className="flex items-center gap-2 px-4 py-2 bg-primary-blue text-white rounded-lg shadow hover:bg-primary-purple transition-colors"
            >
              <FaPlus /> Crear
            </button>
          </div>
        </div>
      </div>

      <div>
        <Table
          rowsPerPage={pagination.limit || 5}
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
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
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

