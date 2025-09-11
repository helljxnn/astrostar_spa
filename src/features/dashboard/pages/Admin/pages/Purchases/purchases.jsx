import React, { useState, useMemo } from "react";
import Table from "../../../../../../shared/components/Table/table";
import { SiGoogleforms } from "react-icons/si";
import { IoMdDownload } from "react-icons/io";
import FormCreate from "./components/formCreate"; 
import FormEdit from "./components/formEdit";   
import { showSuccessAlert } from "../../../../../../shared/utils/alerts";
import SearchInput from "../../../../../../shared/components/SearchInput";

// Datos de ejemplo para compras. En una aplicación real, esto vendría de una API.
const purchasesData = [
    {
        id: 1,
        NombreProducto: "Balones de Fútbol (Docena)",
        Proveedor: "Deportes El Campeón",
        FechaCompra: "2024-05-10",
        Cantidad: 5,
        PrecioUnitario: 120000,
        PrecioTotal: 600000,
        estado: "Recibido",
    },
    {
        id: 2,
        NombreProducto: "Conos de Entrenamiento (Set x50)",
        Proveedor: "Inversiones Deportivas S.A.",
        FechaCompra: "2024-05-15",
        Cantidad: 10,
        PrecioUnitario: 50000,
        PrecioTotal: 500000,
        estado: "Recibido",
    },
    {
        id: 3,
        NombreProducto: "Uniformes de Entrenamiento",
        Proveedor: "Textiles Deportivos",
        FechaCompra: "2024-06-01",
        Cantidad: 30,
        PrecioUnitario: 45000,
        PrecioTotal: 1350000,
        estado: "Pendiente",
    },
];


function Purchases() {
    const [purchaseList, setPurchaseList] = useState(purchasesData);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedPurchase, setSelectedPurchase] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    const filteredPurchases = useMemo(() =>
        purchaseList.filter(item =>
            item.NombreProducto.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.Proveedor.toLowerCase().includes(searchTerm.toLowerCase())
        ), [purchaseList, searchTerm]);

    const handleOpenCreateModal = () => setIsCreateModalOpen(true);
    const handleCloseCreateModal = () => setIsCreateModalOpen(false);

    const handleCreateSubmit = (newPurchaseData) => {
        const newPurchase = {
            id: purchaseList.length + 1, // Generación de ID simple para el ejemplo
            ...newPurchaseData,
            PrecioTotal: (newPurchaseData.Cantidad || 0) * (newPurchaseData.PrecioUnitario || 0),
        };
        setPurchaseList([newPurchase, ...purchaseList]);
        handleCloseCreateModal();
        showSuccessAlert("¡Registrada!", "La nueva compra se ha registrado correctamente.");
    };

    const handleEdit = (item) => {
        setSelectedPurchase(item);
        setIsEditModalOpen(true);
    };

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
        setSelectedPurchase(null);
    };

    const handleUpdate = (updatedData) => {
        const updatedList = purchaseList.map(item => {
            if (item.id === selectedPurchase.id) {
                const newTotal = (updatedData.Cantidad || item.Cantidad) * (updatedData.PrecioUnitario || item.PrecioUnitario);
                return { ...item, ...updatedData, PrecioTotal: newTotal };
            }
            return item;
        });
        setPurchaseList(updatedList);
        handleCloseEditModal();
        showSuccessAlert("¡Actualizada!", "La compra se ha actualizado correctamente.");
    };

    const handleDelete = (item) => {
        console.log("Intentando eliminar compra:", item);
        // Aquí se implementaría la lógica de eliminación, posiblemente con un modal de confirmación.
    };

    return (
        <div id="contentPurchases" className="w-full h-auto grid grid-rows-[auto_1fr] relative">
            <div id="header" className="w-full h-auto p-8">
                <h1 className="text-5xl">Gestión de Compras</h1>
            </div>
            <div id="body" className="w-full h-auto grid grid-rows-[auto_1fr] gap-2 p-4">
                <div id="actionButtons" className="w-full h-auto p-2 flex flex-row justify-between items-center">
                    <SearchInput
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Buscar por producto o proveedor..."
                    />
                    <div id="buttons" className="h-auto flex flex-row items-center justify-end gap-4">
                        <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-700 font-semibold hover:bg-gray-300 transition-colors"><IoMdDownload size={25} color="#b595ff" /> Generar reporte</button>
                        <button onClick={handleOpenCreateModal} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-blue text-white font-semibold">
                            Registrar Compra <SiGoogleforms size={20} />
                        </button>
                    </div>
                </div>
                <Table
                    rowsPerPage={5}
                    paginationFrom={5}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    thead={{
                        titles: ["Producto", "Proveedor", "Fecha", "Cantidad", "Total ($)"],
                        state: true,
                    }}
                    tbody={{
                        data: filteredPurchases,
                        dataPropertys: ["NombreProducto", "Proveedor", "FechaCompra", "Cantidad", "PrecioTotal"],
                        state: true,
                    }}
                />
            </div>
            {/* Los modales se renderizan aquí y se controlan con estado */}
            <FormCreate isOpen={isCreateModalOpen} onClose={handleCloseCreateModal} onSubmit={handleCreateSubmit} />
            <FormEdit isOpen={isEditModalOpen} onClose={handleCloseEditModal} onSave={handleUpdate} purchaseData={selectedPurchase} />
        </div>
    );
}
export default Purchases;