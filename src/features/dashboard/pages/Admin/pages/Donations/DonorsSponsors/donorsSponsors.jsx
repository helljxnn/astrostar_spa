import React, { useState, useMemo, useEffect } from "react";
import Table from "../../../../../../../shared/components/Table/table";
import { SiGoogleforms } from "react-icons/si";
import { IoMdDownload } from "react-icons/io";
import FormCreate from "./components/formCreate";
import FormEdit from "./components/formEdit";
import ReportButton from "../../../../../../../shared/components/ReportButton";
import ViewDetails from "../../../../../../../shared/components/ViewDetails";
import { showSuccessAlert, showConfirmAlert, showErrorAlert } from "../../../../../../../shared/utils/alerts";
import SearchInput from "../../../../../../../shared/components/SearchInput";

const LOCAL_STORAGE_KEY = 'donorsSponsorsData';

function DonorsSponsors() {
    const [donorsList, setDonorsList] = useState(() => {
        try {
            const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);
            return storedData ? JSON.parse(storedData) : [];
        } catch (error) {
            console.error("Error al leer desde localStorage:", error);
            return [];
        }
    });

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
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

        // Busca en todos los valores de cada objeto
        return donorsList.filter(item =>
            Object.values(item).some(value => String(value).toLowerCase().includes(term))
        );
    }, [donorsList, searchTerm]);

    const handleOpenCreateModal = () => setIsCreateModalOpen(true);
    const handleCloseCreateModal = () => setIsCreateModalOpen(false);

    const handleCreate = (newData) => {
        const newDonor = { id: Date.now(), ...newData };
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
        setDonorsList(prevList =>
            prevList.map(item =>
                item.id === selectedDonor.id ? { ...item, ...updatedData } : item
            )
        );
        handleCloseEditModal();
        showSuccessAlert("¡Actualizado!", "Los datos se han actualizado correctamente.");
    };

    const handleDelete = async (itemToDelete) => {
        const result = await showConfirmAlert(
            "¿Estás seguro de eliminar?",
            `"${itemToDelete.nombre}" se eliminará permanentemente.`,
            { confirmButtonText: "Sí, eliminar", cancelButtonText: "Cancelar" }
        );

        if (result.isConfirmed) {
            setDonorsList(prevList => prevList.filter(item => item.id !== itemToDelete.id));
            showSuccessAlert("¡Eliminado!", `"${itemToDelete.nombre}" ha sido eliminado.`);
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
        { label: "Identificación (NIT/Cédula)", key: "identificacion" },
        { label: "Nombre / Razón Social", key: "nombre" },
        { label: "Persona de Contacto", key: "personaContacto" },
        { label: "Tipo", key: "tipo" },
        { label: "Tipo de Persona", key: "tipoPersona" },
        { label: "Teléfono", key: "telefono" },
        { label: "Correo Electrónico", key: "correo" },
        { label: "Dirección", key: "direccion" },
        { label: "Estado", key: "estado" },
    ];

    // Prepara los datos para el reporte, asegurando que no haya valores nulos/undefined
    const reportData = useMemo(() => {
        return filteredDonors.map(donor => ({
            identificacion: donor.identificacion || '',
            nombre: donor.nombre || '',
            tipo: donor.tipo || '',
            tipoPersona: donor.tipoPersona || '',
            telefono: donor.telefono || '',
            correo: donor.correo || '',
            direccion: donor.direccion || '',
            estado: donor.estado || '',
        }));
    }, [filteredDonors]);

    return (
        <div id="contentDonorsSponsors" className="w-full h-auto grid grid-rows-[auto_1fr] relative">
            <div id="header" className="w-full h-auto p-8">
                <h1 className="text-4xl font-bold text-gray-800">Donantes y Patrocinadores</h1>
            </div>
            <div id="body" className="w-full h-auto grid grid-rows-[auto_1fr] gap-2 p-4">
                <div id="actionButtons" className="w-full h-auto p-2 flex flex-row justify-between items-center">
                    <SearchInput
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Buscar por cualquier dato..."
                    />
                    <div id="buttons" className="h-auto flex flex-row items-center justify-end gap-4">
                        <ReportButton
                            data={reportData}
                            fileName="Donantes_y_Patrocinadores"
                            columns={[
                                { header: "Identificación", accessor: "identificacion" },
                                { header: "Nombre / Razón Social", accessor: "nombre" },
                                { header: "Tipo", accessor: "tipo" },
                                { header: "Tipo Persona", accessor: "tipoPersona" },
                                { header: "Teléfono", accessor: "telefono" },
                                { header: "Correo", accessor: "correo" },
                                { header: "Dirección", accessor: "direccion" },
                                { header: "Estado", accessor: "estado" },
                            ]}
                        />
                        <button onClick={handleOpenCreateModal} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-purple to-primary-blue text-white rounded-lg shadow hover:opacity-90 transition whitespace-nowraps">
                            Crear <SiGoogleforms size={20} />
                        </button>
                    </div>
                </div>
                <Table
                    rowsPerPage={5}
                    paginationFrom={5}
                    thead={{
                        titles: ["Identificación", "Nombre", "Tipo", "Teléfono"],
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
            <FormCreate
                isOpen={isCreateModalOpen}
                onClose={handleCloseCreateModal}
                onSave={handleCreate}
            />
            <FormEdit
                isOpen={isEditModalOpen}
                onClose={handleCloseEditModal}
                onSave={handleUpdate}
                donorData={selectedDonor}
            />
            <ViewDetails
                isOpen={isViewModalOpen}
                onClose={handleCloseViewModal}
                data={selectedDonor}
                detailConfig={donorDetailConfig}
                title="Detalles del Donante/Patrocinador"
            />
        </div>
    );
}

export default DonorsSponsors;