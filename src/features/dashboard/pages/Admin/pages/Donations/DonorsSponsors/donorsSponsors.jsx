import React, { useState, useMemo, useEffect } from "react";
import Table from "../../../../../../../shared/components/Table/table";
import { FaPlus } from "react-icons/fa";
import ReportButton from "../../../../../../../shared/components/ReportButton";
import { showSuccessAlert, showConfirmAlert } from "../../../../../../../shared/utils/alerts";
import SearchInput from "../../../../../../../shared/components/SearchInput";
import donorsSponsorsData from "../../../../../../../shared/models/DonorsSponsorsData";
import DonorSponsorModal from "./components/DonorSponsorModal";
import DonorSponsorViewModal from "./components/DonorSponsorViewModal";

const LOCAL_STORAGE_KEY = "donorsSponsorsData";

function DonorsSponsors() {
  const [donorsList, setDonorsList] = useState(() => {
    try {
      const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);
      const parsedData = storedData ? JSON.parse(storedData) : [];
      return parsedData.length > 0 ? parsedData : donorsSponsorsData;
    } catch (error) {
      console.error("Error al leer desde localStorage:", error);
      return donorsSponsorsData;
    }
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedDonor, setSelectedDonor] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(donorsList));
    } catch (error) {
      console.error("Error al guardar en localStorage:", error);
    }
  }, [donorsList]);

  const filteredDonors = useMemo(() => {
    const term = searchTerm.toLowerCase();
    if (!term) return donorsList;

    return donorsList.filter((item) =>
      Object.values(item).some((value) =>
        String(value).toLowerCase().includes(term)
      )
    );
  }, [donorsList, searchTerm]);

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

  const handleSave = (formData) => {
    if (modalMode === "edit" && selectedDonor) {
      setDonorsList((prevList) =>
        prevList.map((item) =>
          item.id === selectedDonor.id ? { ...item, ...formData } : item
        )
      );
      showSuccessAlert("Actualizado", "Los datos se han actualizado correctamente.");
    } else {
      const newDonor = { id: Date.now(), ...formData };
      setDonorsList((prevList) => [newDonor, ...prevList]);
      showSuccessAlert(
        "Creado",
        "El nuevo donante/patrocinador se registro correctamente."
      );
    }
    handleCloseModal();
  };

  const handleDelete = async (itemToDelete) => {
    const result = await showConfirmAlert(
      "Estas seguro de eliminar?",
      `"${itemToDelete.nombre}" se eliminara permanentemente.`,
      { confirmButtonText: "Si, eliminar", cancelButtonText: "Cancelar" }
    );

    if (result.isConfirmed) {
      setDonorsList((prevList) => prevList.filter((item) => item.id !== itemToDelete.id));
      showSuccessAlert("Eliminado", `"${itemToDelete.nombre}" ha sido eliminado.`);
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
    return filteredDonors.map((donor) => ({
      identificacion: donor.identificacion || "",
      nombre: donor.nombre || "",
      tipo: donor.tipo || "",
      tipoPersona: donor.tipoPersona || "",
      telefono: donor.telefono || "",
      correo: donor.correo || "",
      direccion: donor.direccion || "",
      estado: donor.estado || "",
    }));
  }, [filteredDonors]);

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

      <div className="overflow-x-auto">
        <Table
          rowsPerPage={5}
          thead={{
            titles: ["Identificacion", "Nombre", "Tipo", "Telefono"],
            state: true,
            actions: true,
          }}
          tbody={{
            data: filteredDonors,
            dataPropertys: ["identificacion", "nombre", "tipo", "telefono"],
            state: true,
          }}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
        />
      </div>

      <DonorSponsorModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        donorData={selectedDonor}
        mode={modalMode}
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
