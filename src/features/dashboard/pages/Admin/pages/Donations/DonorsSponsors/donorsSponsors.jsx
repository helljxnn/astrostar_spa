import React, { useState, useMemo } from "react";
import Table from "../../../../../../../shared/components/Table/table";
import donorsSponsorsData from "../../../../../../../shared/models/DonorsSponsorsData";
import { SiGoogleforms } from "react-icons/si";
import { IoMdDownload } from "react-icons/io";
import FormCreate from "./components/formCreate";
import FormEdit from "./components/formEdit";
import ViewDetails from "../../../../../../../shared/components/ViewDetails";
import {
    showSuccessAlert,
    showConfirmAlert,
    showErrorAlert,
} from "../../../../../../../shared/utils/alerts";
import SearchInput from "../../../../../../../shared/components/SearchInput";

function DonorsSponsors() {
    const [donorsList, setDonorsList] = useState(donorsSponsorsData);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedDonor, setSelectedDonor] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    const filteredDonors = useMemo(() =>
        donorsList.filter(item =>
            item.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.identificacion.includes(searchTerm)
        ), [donorsList, searchTerm]);

    const handleOpenCreateModal = () => setIsCreateModalOpen(true);
    const handleCloseCreateModal = () => setIsCreateModalOpen(false);

    const handleCreate = (newData) => {
        const newDonor = {
            id: donorsList.length > 0 ? Math.max(...donorsList.map(d => d.id)) + 1 : 1,
            ...newData,
        };

        setDonorsList(prevList => [newDonor, ...prevList]);
        handleCloseCreateModal();
        showSuccessAlert("¡Creado!", "El nuevo donante/patrocinador se ha registrado correctamente.");
    };

    const handleEdit = (item) => {
        setSelectedDonor(item);
        setIsEditModalOpen(true);
    };

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
        setSelectedDonor(null);
    };

    const handleUpdate = (updatedData) => {
        const updatedList = donorsList.map(item => {
            if (item.id === selectedDonor.id) {
                return {
                    ...item,
                    ...updatedData,
                };
            }
            return item;
        });
        setDonorsList(updatedList);
        handleCloseEditModal();
        showSuccessAlert("¡Actualizado!", "Los datos se han actualizado correctamente.");
    };

    const handleDelete = async (itemToDelete) => {
        const result = await showConfirmAlert(
            "¿Estás seguro de eliminar?",
            `"${itemToDelete.nombre}" se eliminará permanentemente.`,
            {
                confirmButtonText: "Sí, eliminar",
                cancelButtonText: "Cancelar",
            }
        );

        if (result.isConfirmed) {
            try {
                const updatedList = donorsList.filter(
                    (item) => item.id !== itemToDelete.id
                );
                setDonorsList(updatedList);
                showSuccessAlert(
                    "¡Eliminado!",
                    `"${itemToDelete.nombre}" ha sido eliminado con éxito.`
                );
            } catch (error) {
                console.error("Error al eliminar:", error);
                showErrorAlert("Error", "Ocurrió un error al eliminar el registro.");
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

    const donorDetailConfig = [
        { label: "Nombre / Razón Social", key: "nombre" },
        { label: "Tipo", key: "tipo" },
        { label: "Tipo de Persona", key: "tipoPersona" },
        { label: "Identificación", key: "identificacion" },
        { label: "Teléfono", key: "telefono" },
        { label: "Correo Electrónico", key: "correo" },
        { label: "Dirección", key: "direccion" },
        { label: "Estado", key: "estado" },
    ];

    return (
        <div id="contentDonorsSponsors" className="w-full h-auto grid grid-rows-[auto_1fr] relative">
            <div id="header" className="w-full h-auto p-8">
                <h1 className="text-5xl">Donantes y Patrocinadores</h1>
            </div>
            <div id="body" className="w-full h-auto grid grid-rows-[auto_1fr] gap-2 p-4">
                <div id="actionButtons" className="w-full h-auto p-2 flex flex-row justify-between items-center">
                    <SearchInput
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Buscar por nombre o identificación..."
                    />
                    <div id="buttons" className="h-auto flex flex-row items-center justify-end gap-4">
                        <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-700 font-semibold hover:bg-gray-300 transition-colors"><IoMdDownload size={25} color="#b595ff" /> Generar reporte</button>
                        <button onClick={handleOpenCreateModal} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-blue text-white font-semibold">
                            Crear <SiGoogleforms size={20} />
                        </button>
                    </div>
                </div>
                <Table
                    rowsPerPage={4}
                    paginationFrom={4}
                    thead={{ titles: ["Nombre", "Tipo", "Identificación"], state: true }}
                    tbody={{
                        data: filteredDonors,
                        dataPropertys: ["nombre", "tipo", "identificacion"],
                        state: true,
                        onEdit: handleEdit,
                        onDelete: handleDelete,
                        onView: handleView,
                    }}
                />
            </div>
            <FormCreate isOpen={isCreateModalOpen} onClose={handleCloseCreateModal} onSave={handleCreate} />
            <FormEdit isOpen={isEditModalOpen} onClose={handleCloseEditModal} onSave={handleUpdate} donorData={selectedDonor} />
            <ViewDetails isOpen={isViewModalOpen} onClose={handleCloseViewModal} data={selectedDonor} detailConfig={donorDetailConfig} title="Detalles del Donante/Patrocinador" />
        </div>
    );
}

export default DonorsSponsors;