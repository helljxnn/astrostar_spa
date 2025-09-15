import React, { useState, useMemo } from 'react';
import Table from "../../../../../../../shared/components/Table/table";
import { SiGoogleforms } from "react-icons/si";
import { IoMdDownload } from "react-icons/io";
import FormCreate from "./formCreate";
import FormEdit from "./formEdit";
import { showSuccessAlert } from '../../../../../../../shared/utils/alerts';
import SearchInput from "../../../../../../../shared/components/SearchInput";

const Purchases = () => {
  // Datos de ejemplo para compras
  const initialPurchasesData = [
    {
      id: 1,
      proveedor: "Deportes Elite",
      monto: "$1.200.000",
      fecha: "2023-09-10",
      concepto: "Balones de fútbol",
      estado: "Completada"
    },
    {
      id: 2,
      proveedor: "Uniformes Pro",
      monto: "$3.500.000",
      fecha: "2023-10-22",
      concepto: "Uniformes equipo principal",
      estado: "Completada"
    },
    {
      id: 3,
      proveedor: "Equipamiento Deportivo S.A.",
      monto: "$850.000",
      fecha: "2023-11-15",
      concepto: "Conos y aros de entrenamiento",
      estado: "En proceso"
    }
  ];

  const [purchasesList, setPurchasesList] = useState(initialPurchasesData);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredPurchases = useMemo(() =>
    purchasesList.filter(item =>
      item.proveedor.toLowerCase().includes(searchTerm.toLowerCase())
    ), [purchasesList, searchTerm]);

  const handleOpenCreateModal = () => {
    setIsCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  const handleCreateSubmit = (formData) => {
    console.log("Formulario de compra enviado!", formData);
    // Aquí se implementaría la lógica para añadir la nueva compra a la lista
    handleCloseCreateModal();
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
    const updatedList = purchasesList.map(item => {
      if (item.id === selectedPurchase.id) {
        // Mapeamos los datos del formulario (que son de 'donación') a nuestra estructura de 'compra'
        return {
          ...item,
          proveedor: updatedData.NombrePatrocinador,
          monto: `$${Number(updatedData.Monto).toLocaleString('es-CO')}`,
          fecha: updatedData.FechaDonacion,
          concepto: updatedData.Descripcion,
          estado: updatedData.estado,
        };
      }
      return item;
    });
    setPurchasesList(updatedList);
    handleCloseEditModal();
    showSuccessAlert("¡Actualizado!", "La compra se ha actualizado correctamente.");
  };

  const handleDelete = (item) => {
    console.log("Intentando eliminar compra:", item);
    // Aquí se podría implementar la lógica de eliminación
  };

  const handleView = (item) => {
    console.log("Viendo detalles de la compra:", item);
    // Aquí se podría implementar la lógica para mostrar un modal de solo lectura
  };

  return (
    <div id="contentPurchases" className="w-full h-auto grid grid-rows-[auto_1fr] relative">
      {/* Contenedor index */}
      <div id="header" className="w-full h-auto p-8">
        {/* Cabecera */}
        <h1 className="text-5xl">Compras</h1>
      </div>
      <div id="body" className="w-full h-auto grid grid-rows-[auto_1fr] gap-2 p-4">
        {/* Cuerpo */}
        <div id="actionButtons" className="w-full h-auto p-2 flex flex-row justify-between items-center">
          <SearchInput
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por proveedor..."
          />
          <div id="buttons" className="h-auto flex flex-row items-center justify-end gap-4">
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-700 font-semibold hover:bg-gray-300 transition-colors"><IoMdDownload size={25} color="#b595ff" /> Generar reporte</button>
            <button onClick={handleOpenCreateModal} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-blue text-white font-semibold">
              Crear <SiGoogleforms size={20} />
            </button>
          </div>
        </div>
        {/* Tabla */}
        <Table
          rowsPerPage={4}
          paginationFrom={4}
          thead={{
            titles: [
              "Proveedor",
              "Monto",
              "Fecha",
              "Concepto",
            ],
            state: true,
            actions: true,
          }}
          tbody={{
            data: filteredPurchases,
            dataPropertys: [
              "proveedor",
              "monto",
              "fecha",
              "concepto",
            ],
            state: true,
            onEdit: handleEdit,
            onDelete: handleDelete,
            onView: handleView,
          }}
        />
      </div>
      {/* Modal para Crear Compra */}
      <FormCreate
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        onSubmit={handleCreateSubmit}
      />
      {/* Modal para Editar Compra */}
      <FormEdit
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        onSave={handleUpdate}
        donationData={selectedPurchase ? {
          NombrePatrocinador: selectedPurchase.proveedor,
          Monto: selectedPurchase.monto.replace(/\D/g, ''),
          FechaDonacion: selectedPurchase.fecha,
          Descripcion: selectedPurchase.concepto,
          estado: selectedPurchase.estado,
          Tipo: 'Empresa' // Valor por defecto, ya que no existe en el modelo de 'compras'
        } : null}
      />
    </div>
  );
}

export default Purchases;