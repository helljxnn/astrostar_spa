// src/features/dashboard/pages/Admin/pages/Athletes/Athletes.jsx
import React, { useState } from "react";
import { FaPlus } from "react-icons/fa";
import {
  showSuccessAlert,
  showErrorAlert,
  showConfirmAlert,
} from "../../../../../../shared/utils/alerts";
import Table from "../../../../../../shared/components/Table/table";
import athletesData from "./AthleteData";
import AthleteModal from "./AthletesSection/components/AthleteModal";

const Athletes = () => {
  const [data, setData] = useState(athletesData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [athleteToEdit, setAthleteToEdit] = useState(null);

  const formatPhoneNumber = (phone) => {
    if (!phone) return phone;
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, "");
    if (cleanPhone.startsWith("+57") || cleanPhone.startsWith("57"))
      return phone;
    if (/^\d{7,10}$/.test(cleanPhone)) return `+57 ${cleanPhone}`;
    return phone;
  };

  const calculateAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }
    return age;
  };

  const handleSave = async (newAthlete) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() < 0.1) {
          return reject(new Error("Error de servidor simulado"));
        }

        const athleteWithFormattedData = {
          ...newAthlete,
          id: Date.now(),
          telefono: formatPhoneNumber(newAthlete.telefono),
          edad: calculateAge(newAthlete.fechaNacimiento),
        };

        setData((prevData) => [...prevData, athleteWithFormattedData]);
        resolve();
      }, 500);
    });
  };

  const handleUpdate = async (updatedAthlete) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() < 0.05) {
          return reject(new Error("Error de conexión simulado"));
        }

        const athleteWithFormattedData = {
          ...updatedAthlete,
          telefono: formatPhoneNumber(updatedAthlete.telefono),
          edad: calculateAge(updatedAthlete.fechaNacimiento),
        };

        setData((prevData) =>
          prevData.map((athlete) =>
            athlete.id === athleteWithFormattedData.id
              ? athleteWithFormattedData
              : athlete
          )
        );
        resolve();
      }, 800);
    });
  };

  const handleDelete = async (athleteId) => {
    const athleteToDelete = data.find((athlete) => athlete.id === athleteId);
    if (!athleteToDelete) {
      return showErrorAlert("Error", "Deportista no encontrado");
    }

    // Usar alerta de error como confirmación
    const confirmResult = await showErrorAlert(
      "¿Estás seguro de eliminar este deportista?",
      `Esta acción no se puede deshacer. Se eliminará a ${athleteToDelete.nombres} ${athleteToDelete.apellidos}.`
    );

    if (!confirmResult.isConfirmed) {
      return;
    }

    try {
      // Simulación de espera
      await new Promise((resolve) => setTimeout(resolve, 500));

      setData((prevData) =>
        prevData.filter((athlete) => athlete.id !== athleteId)
      );

      showSuccessAlert(
        "Deportista eliminado",
        `${athleteToDelete.nombres} ${athleteToDelete.apellidos} fue eliminado correctamente.`
      );
    } catch (error) {
      showErrorAlert(
        "Error al eliminar",
        error.message || "No se pudo eliminar el deportista, intenta de nuevo."
      );
    }
  };

  const handleCreate = () => {
    setModalMode("create");
    setAthleteToEdit(null);
    setIsModalOpen(true);
  };

  const handleEdit = (athlete) => {
    setModalMode("edit");
    setAthleteToEdit(athlete);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setAthleteToEdit(null);
    setModalMode("create");
  };

  // Formatear datos para mostrar en la tabla
  const formattedData = data.map((athlete) => ({
    ...athlete,
    nombreCompleto: `${athlete.nombres} ${athlete.apellidos}`,
    edad: calculateAge(athlete.fechaNacimiento),
    deporteCategoria: `${athlete.deportePrincipal} - ${athlete.categoria}`,
  }));

  return (
    <div className="p-6 font-questrial">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Deportistas</h1>
        </div>

        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-primary-blue text-white rounded-lg shadow hover:bg-primary-purple transition-colors"
        >
          <FaPlus />
          Crear Deportista
        </button>
      </div>

      <Table
        thead={{
          titles: [
            "Nombre Completo",
            "Deporte - Categoría",
            "Edad",
            "Correo",
            "Teléfono",
          ],
          state: true,
          actions: true,
        }}
        tbody={{
          data: formattedData,
          dataPropertys: [
            "nombreCompleto",
            "deporteCategoria",
            "edad",
            "correo",
            "telefono",
          ],
          state: true,
          onEdit: (row) => handleEdit(row),
          onDelete: (row) => handleDelete(row.id),
          onView: (row) => console.log("Ver deportista:", row),
          stateMap: {
            Activo: "bg-green-100 text-green-800",
            Inactivo: "bg-red-100 text-red-800",
            Lesionado: "bg-yellow-100 text-yellow-800",
            Suspendido: "bg-orange-100 text-orange-800",
          },
        }}
      />

      <AthleteModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        onUpdate={handleUpdate}
        athleteToEdit={athleteToEdit}
        mode={modalMode}
      />
    </div>
  );
};

export default Athletes;
