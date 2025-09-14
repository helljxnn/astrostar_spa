import React, { useState, useMemo } from "react";
import Table from "../../../../../../shared/components/Table/table";
import sportsEquipmentData from "../../../../../../shared/models/SportsEquipment";
import { SiGoogleforms } from "react-icons/si";
import { IoMdDownload } from "react-icons/io";
import FormCreate from "./components/formCreate";
import FormEdit from "./components/formEdit";
import ViewDetails from "../../../../../../shared/components/ViewDetails";
import {
  showSuccessAlert,
  showConfirmAlert,
  showErrorAlert,
} from "../../../../../../shared/utils/Alerts";
import SearchInput from "../../../../../../shared/components/SearchInput";

function SportsEquipment() {
  // Estado para la lista de datos, para poder actualizarla en tiempo real
  const [equipmentList, setEquipmentList] = useState(sportsEquipmentData);
  // Estados para controlar la visibilidad de los modales
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  // Estado para el término de búsqueda
  const [searchTerm, setSearchTerm] = useState("");

  // Filtramos los datos basándonos en el término de búsqueda.
  // Usamos useMemo para evitar recalcular en cada render si los datos o el término no cambian.
  const filteredEquipment = useMemo(() =>
    equipmentList.filter(item =>
      item.NombreMaterial.toLowerCase().includes(searchTerm.toLowerCase())
    ), [equipmentList, searchTerm]);

  const handleOpenCreateModal = () => {
    setIsCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  const handleCreate = (newData) => {
    // En una app real, aquí también validarías que el nombre no exista ya.
    const newEquipment = {
      NombreMaterial: newData.nombre,
      CantidadComprado: Number(newData.cantidadReal), // La cantidad inicial se asigna a 'comprado'
      CantidadDonado: 0, // No hay donaciones al crear un item nuevo
      Total: Number(newData.cantidadReal),
      estado: newData.estado,
    };

    // Añadimos el nuevo equipo al principio de la lista
    setEquipmentList(prevList => [newEquipment, ...prevList]);
    handleCloseCreateModal();
    showSuccessAlert("¡Creado!", "El nuevo material deportivo se ha registrado correctamente.");
  };

  // --- Lógica para Editar y Eliminar ---
  // Estas funciones se pasarán como props a la tabla.
  // La tabla las usará para los botones de acción de cada fila.

  const handleEdit = (item) => {
    setSelectedEquipment(item); // Guardamos el item completo
    setIsEditModalOpen(true);   // Abrimos el modal de edición
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedEquipment(null); // Limpiamos el item seleccionado al cerrar
  };

  const handleUpdate = (updatedData) => {
    // Lógica para actualizar el item en nuestra lista de estado
    const updatedList = equipmentList.map(item => {
      // Usamos 'NombreMaterial' como identificador único. En una app real, sería un ID.
      if (item.NombreMaterial === selectedEquipment.NombreMaterial) {
        const newTotal = Number(updatedData.cantidadReal);
        const difference = newTotal - item.Total;
        // Ajustamos la cantidad comprada con la diferencia, preservando las donaciones.
        // Nos aseguramos de que la cantidad comprada no sea negativa.
        const newCantidadComprado = Math.max(0, item.CantidadComprado + difference);

        return {
          ...item,
          NombreMaterial: updatedData.nombre,
          CantidadComprado: newCantidadComprado,
          // CantidadDonado no se modifica desde este formulario
          Total: newTotal,
          estado: updatedData.estado,
        };
      }
      return item;
    });
    setEquipmentList(updatedList);
    handleCloseEditModal(); // Cerramos el modal
    showSuccessAlert("¡Actualizado!", "El material deportivo se ha actualizado correctamente.");
  };

  const handleDelete = async (itemToDelete) => {
    const result = await showConfirmAlert(
      "¿Estás seguro de eliminar?",
      `El material "${itemToDelete.NombreMaterial}" se eliminará permanentemente.`,
      {
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar",
      }
    );

    if (result.isConfirmed) {
      try {
        // Filtramos la lista para excluir el item a eliminar.
        // En una app real, aquí harías una llamada a la API para eliminar el registro.
        const updatedList = equipmentList.filter(
          (item) => item.NombreMaterial !== itemToDelete.NombreMaterial // Usamos NombreMaterial como ID único
        );
        setEquipmentList(updatedList);
        showSuccessAlert(
          "¡Eliminado!",
          `El material "${itemToDelete.NombreMaterial}" ha sido eliminado con éxito.`
        );
      } catch (error) {
        console.error("Error al eliminar el material:", error);
        showErrorAlert("Error", "Ocurrió un error al eliminar el material.");
      }
    }
  };

  const handleView = (item) => {
    setSelectedEquipment(item);
    setIsViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedEquipment(null);
  };

  // Configuración para el modal de detalles reutilizable
  const equipmentDetailConfig = [
    { label: "Nombre del Material", key: "NombreMaterial" },
    { label: "Cantidad Comprada", key: "CantidadComprado" },
    { label: "Cantidad Donada", key: "CantidadDonado" },
    { label: "Total en Inventario", key: "Total" },
    { label: "Estado", key: "estado" },
  ];

  return (
    <div id="contentSportsEquipment" className="w-full h-auto grid grid-rows-[auto_1fr] relative">
      {/* Contenedor index */}
      <div id="header" className="w-full h-auto p-8">
        {/* Cabecera */}
        <h1 className="text-5xl">Material deportivo</h1>
      </div>
      <div id="body" className="w-full h-auto grid grid-rows-[auto_1fr] gap-2 p-4">
        {/* Cuerpo */}
        <div id="actionButtons" className="w-full h-auto p-2 flex flex-row justify-between items-center">
          {/* Componente de Búsqueda reutilizable */}
          <SearchInput
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre..."
          />
          {/* Botones */}
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
              "Nombre",
              "Comprado",
              "Donado",
              "Total",
            ],
            state: true,
          }}
          tbody={{
            data: filteredEquipment,
            dataPropertys: [
              "NombreMaterial",
              "CantidadComprado",
              "CantidadDonado",
              "Total",
            ],
            state: true,
            onEdit: handleEdit,
            onDelete: handleDelete,
            onView: handleView,
          }}
        />
      </div>
      {/* Modal para Crear Material */}
      <FormCreate
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        onSave={handleCreate}
      />
      {/* Modal para Editar Material. Se renderiza aquí y se controla con estado. */}
      <FormEdit
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        onSave={handleUpdate}
        equipmentData={selectedEquipment}
      />
      {/* Modal reutilizable para Ver Detalles */}
      <ViewDetails
        isOpen={isViewModalOpen}
        onClose={handleCloseViewModal}
        data={selectedEquipment}
        detailConfig={equipmentDetailConfig}
        title="Detalles del Material Deportivo"
      />
    </div>
  );
}

export default SportsEquipment;