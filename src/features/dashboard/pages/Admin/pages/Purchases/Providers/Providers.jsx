// src/features/dashboard/pages/Admin/pages/Purchases/Providers/Providers.jsx
import React, { useState } from "react";
import { FaPlus } from "react-icons/fa";
import {
  showSuccessAlert,
  showErrorAlert,
  showConfirmAlert,
} from "../../../../../../../shared/utils/alerts";
import Table from "../../../../../../../shared/components/Table/table";
import providersData from "./ProvidersData";
import ProviderModal from "./components/ProviderModal";

const Providers = () => {
  const [data, setData] = useState(providersData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [providerToEdit, setProviderToEdit] = useState(null);

  const formatPhoneNumber = (phone) => {
    if (!phone) return phone;
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, "");
    if (cleanPhone.startsWith("+57") || cleanPhone.startsWith("57")) return phone;
    if (/^\d{7,10}$/.test(cleanPhone)) return `+57 ${cleanPhone}`;
    return phone;
  };

  const handleSave = async (newProvider) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() < 0.1) {
          return reject(new Error("Error de servidor simulado"));
        }

        const providerWithFormattedPhone = {
          ...newProvider,
          id: Date.now(),
          telefono: formatPhoneNumber(newProvider.telefono),
        };

        setData((prevData) => [...prevData, providerWithFormattedPhone]);
        resolve();
      }, 500);
    });
  };

  const handleUpdate = async (updatedProvider) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() < 0.05) {
          return reject(new Error("Error de conexión simulado"));
        }

        const providerWithFormattedPhone = {
          ...updatedProvider,
          telefono: formatPhoneNumber(updatedProvider.telefono),
        };

        setData((prevData) =>
          prevData.map((provider) =>
            provider.id === providerWithFormattedPhone.id
              ? providerWithFormattedPhone
              : provider
          )
        );
        resolve();
      }, 800);
    });
  };

  const handleDelete = async (providerId) => {
    const providerToDelete = data.find((provider) => provider.id === providerId);
    if (!providerToDelete) {
      return showErrorAlert("Error", "Proveedor no encontrado");
    }

    // Usar alerta de error como confirmación
    const confirmResult = await showErrorAlert(
      "¿Estás seguro de eliminar este proveedor?",
      `Esta acción no se puede deshacer. Se eliminará a ${providerToDelete.razonSocial || providerToDelete.nombre}.`
    );

    if (!confirmResult.isConfirmed) {
      return;
    }

    try {
      // Simulación de espera
      await new Promise((resolve) => setTimeout(resolve, 500));

      setData((prevData) =>
        prevData.filter((provider) => provider.id !== providerId)
      );

      showSuccessAlert(
        "Proveedor eliminado",
        `${providerToDelete.razonSocial || providerToDelete.nombre} fue eliminado correctamente.`
      );
    } catch (error) {
      showErrorAlert(
        "Error al eliminar",
        error.message || "No se pudo eliminar el proveedor, intenta de nuevo."
      );
    }
  };

  const handleCreate = () => {
    setModalMode("create");
    setProviderToEdit(null);
    setIsModalOpen(true);
  };

  const handleEdit = (provider) => {
    setModalMode("edit");
    setProviderToEdit(provider);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setProviderToEdit(null);
    setModalMode("create");
  };

  return (
    <div className="p-6 font-questrial">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Proveedores</h1>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-primary-blue text-white rounded-lg shadow hover:bg-primary-purple transition-colors"
        >
          <FaPlus />
          Crear Proveedor
        </button>
      </div>

      <Table
        thead={{
          titles: ["Razón Social", "NIT", "Correo", "Teléfono"],
          state: true,
          actions: true,
        }}
        tbody={{
          data,
          dataPropertys: ["razonSocial", "nit", "correo", "telefono"],
          state: true,
          onEdit: (row) => handleEdit(row),
          onDelete: (row) => handleDelete(row.id),
          onView: (row) => console.log("Ver proveedor:", row),
          stateMap: {
            Activo: "bg-green-100 text-green-800",
            Inactivo: "bg-red-100 text-red-800",
          },
        }}
      />

      <ProviderModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        onUpdate={handleUpdate}
        providerToEdit={providerToEdit}
        mode={modalMode}
      />
    </div>
  );
};

export default Providers;