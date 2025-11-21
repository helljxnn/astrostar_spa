import React, { useState, useMemo, useEffect } from "react";
import Table from "../../../../../../../shared/components/Table/table";
import { SiGoogleforms } from "react-icons/si";
import FormCreate from "./components/formCreate";
import FormEdit from "./components/formEdit";
import ReportButton from "../../../../../../../shared/components/ReportButton";
import ViewDetails from "../../../../../../../shared/components/ViewDetails";
import { showSuccessAlert, showConfirmAlert, showErrorAlert } from "../../../../../../../shared/utils/alerts";
import SearchInput from "../../../../../../../shared/components/SearchInput";
import ApiClient from "@shared/services/apiClient";
import PermissionGuard from "../../../../../../../shared/components/PermissionGuard";
import { usePermissions } from "../../../../../../../shared/hooks/usePermissions";

function DonorsSponsors() {
    const { hasPermission } = usePermissions();

    const [donorsList, setDonorsList] = useState([]);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedDonor, setSelectedDonor] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const rowsPerPage = 5;

    useEffect(() => {
        fetchData(currentPage, searchTerm);
    }, [currentPage, searchTerm]);

    const fetchData = async (page, search) => {
        try {
            const params = { page, limit: rowsPerPage, search };
            const response = await ApiClient.get("/donorsSponsors", params);
            if (response.success) {
                setDonorsList(response.data || []);
                setTotalPages(response.pagination?.pages || 1);
            } else {
                showErrorAlert("Error", "Could not fetch records.");
            }
        } catch (error) {
            showErrorAlert("Network Error", error.message);
        }
    };

    const handleOpenCreateModal = () => setIsCreateModalOpen(true);
    const handleCloseCreateModal = () => setIsCreateModalOpen(false);

    const handleCreate = async (newData) => {
        try {
            await ApiClient.post("/donorsSponsors", newData);
            handleCloseCreateModal();
            showSuccessAlert("Created!", "The new donor/sponsor has been registered successfully.");
            fetchData(1, ""); // Go back to the first page
        } catch (error) {
            showErrorAlert("Creation Error", error.message);
        }
    };

    const handleEdit = (item) => {
        setSelectedDonor(item);
        setIsEditModalOpen(true);
    };

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
        setSelectedDonor(null);
    };

    const handleUpdate = async (updatedData) => {
        if (!selectedDonor?.id) return;
        try {
            await ApiClient.put(`/donorsSponsors/${selectedDonor.id}`, updatedData);
            handleCloseEditModal();
            showSuccessAlert("Updated!", "The data has been updated successfully.");
            fetchData(currentPage, searchTerm); // Reload current data
        } catch (error) {
            showErrorAlert("Update Error", error.message);
        }
    };

    const handleDelete = async (itemToDelete) => {
        const result = await showConfirmAlert(
            "Are you sure you want to delete?",
            `"${itemToDelete.name}" will be permanently deleted.`,
            { confirmButtonText: "Yes, delete", cancelButtonText: "Cancel" }
        );

        if (result.isConfirmed) {
            try {
                await ApiClient.delete(`/donorsSponsors/${itemToDelete.id}`);
                showSuccessAlert("Deleted!", `"${itemToDelete.name}" has been deleted.`);
                fetchData(currentPage, searchTerm); // Reload
            } catch (error) {
                showErrorAlert("Deletion Error", error.message);
            }
        }
    };

    const handleView = async (item) => {
        try {
            const response = await ApiClient.get(`/donorsSponsors/${item.id}`);
            if (response.success) {
                setSelectedDonor(response.data);
                setIsViewModalOpen(true);
            } else {
                showErrorAlert("Error", "Could not fetch record details.");
            }
        } catch (error) {
            showErrorAlert("Network Error", error.message);
        }
    };

    const handleCloseViewModal = () => {
        setIsViewModalOpen(false);
        setSelectedDonor(null);
    };

    const donorDetailConfig = [
        { label: "Identification (NIT/ID)", key: "identification" },
        { label: "Name / Company Name", key: "name" },
        { label: "Contact Person", key: "contactPerson" },
        { label: "Type", key: "type" },
        { label: "Person Type", key: "personType" },
        { label: "Phone", key: "phone" },
        { label: "Email", key: "email" },
        { label: "Address", key: "address" },
        { label: "Status", key: "status" },
        { label: 'Creation Date', key: 'createdAt', format: (date) => new Date(date).toLocaleDateString() },
        { label: 'Last Update', key: 'updatedAt', format: (date) => new Date(date).toLocaleDateString() },
    ];

    const reportData = useMemo(() => {
        return donorsList.map(donor => ({
            identification: donor.identification || '',
            name: donor.name || '',
            type: donor.type || '',
            personType: donor.personType || '',
            phone: donor.phone || '',
            email: donor.email || '',
            address: donor.address || '',
            status: donor.status || '',
        }));
    }, [donorsList]);

    return (
        <div id="contentDonorsSponsors" className="w-full h-auto grid grid-rows-[auto_1fr] relative">
            <div id="header" className="w-full h-auto p-8">
                <h1 className="text-4xl font-bold text-gray-800">Donors and Sponsors</h1>
            </div>
            <div id="body" className="w-full h-auto grid grid-rows-[auto_1fr] gap-2 p-4">
                <div id="actionButtons" className="w-full h-auto p-2 flex flex-row justify-between items-center">
                    <SearchInput
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by any data..."
                    />
                    <div id="buttons" className="h-auto flex flex-row items-center justify-end gap-4">
                        <PermissionGuard module="donorsSponsors" action="Ver">
                            <ReportButton
                                data={reportData}
                                fileName="Donors_and_Sponsors"
                                columns={[
                                    { header: "Identification", accessor: "identification" },
                                    { header: "Name / Company Name", accessor: "name" },
                                    { header: "Type", accessor: "type" },
                                    { header: "Person Type", accessor: "personType" },
                                    { header: "Phone", accessor: "phone" },
                                    { header: "Email", accessor: "email" },
                                    { header: "Address", accessor: "address" },
                                    { header: "Status", accessor: "status" },
                                ]}
                            />
                        </PermissionGuard>
                        <PermissionGuard module="donorsSponsors" action="Crear">
                            <button onClick={handleOpenCreateModal} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-purple to-primary-blue text-white rounded-lg shadow hover:opacity-90 transition whitespace-nowrap">
                                Create <SiGoogleforms size={20} />
                            </button>
                        </PermissionGuard>
                    </div>
                </div>
                <Table
                    rowsPerPage={rowsPerPage}
                    pagination={{ currentPage, setCurrentPage, totalPages }}
                    thead={{
                        titles: ["Identification", "Name", "Type", "Phone"],
                        state: true,
                        actions: true,
                    }}
                    tbody={{
                        data: donorsList,
                        dataPropertys: ["identification", "name", "type", "phone"],
                        state: true,
                    }}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onView={handleView}
                    buttonConfig={{
                        edit: () => hasPermission('donorsSponsors', 'Editar'),
                        delete: () => hasPermission('donorsSponsors', 'Eliminar'),
                        view: () => hasPermission('donorsSponsors', 'Ver'),
                    }}
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
                title="Donor/Sponsor Details"
            />
        </div>
    );
}

export default DonorsSponsors;