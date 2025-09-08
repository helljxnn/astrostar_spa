import React, { useState } from "react";
import Table from "../../../../../../shared/components/Table/table";
import sportsEquipmentData from "../../../../../../shared/models/SportsEquipment";
import { SiGoogleforms } from "react-icons/si";
import { IoMdDownload } from "react-icons/io";
import { IoSearch } from "react-icons/io5";
import FormCreate from "./components/formCreate";

function SportsEquipment() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleOpenCreateModal = () => {
    setIsCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  const handleCreateSubmit = (e) => {
    // Aquí iría la lógica para enviar los datos del formulario al backend
    console.log("Formulario enviado!");
    handleCloseCreateModal();
  };

  return (
    <div id="contentSportsEquipment" className="w-full h-auto grid grid-rows-[auto_1fr] relative">
      {/* Contenedor index */}
      <div id="header" className="w-full h-auto p-8">
        {/* Cabecera */}
        <h1 className="text-5xl">Material deportivo</h1>
      </div>
      <div id="body" className="w-full h-auto grid grid-rows-[auto_1fr] gap-2 p-4">
        {/* Cuerpo */}
        <div id="actionButtons" className="w-full h-auto p-2 flex flex-row justify-between">
          {/* Botones */}
          <div id="buttons" className="w-full h-auto flex flex-row items-center gap-4">
            <button onClick={handleOpenCreateModal} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-blue text-white font-semibold">
              Crear <SiGoogleforms size={20} />
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-700 font-semibold hover:bg-gray-300 transition-colors"><IoMdDownload size={25} color="#b595ff" /> Generar reporte</button>
          </div>
          <div id="Search" className="w-full h-auto flex flex-row justify-end gap-4">
            {/* Buscador */}
            <div id="containerSearch" className="px-3 py-2 rounded-lg flex flex-row gap-2 align-center items-center bg-gray-200">
              <IoSearch size={20} color="gray" />
              <input type="text" placeholder="Buscar" className="bg-transparent outline-none border-none" />
            </div>
          </div>
        </div>
        {/* Tabla */}
        <Table
          thead={{
            titles: [
              "Nombre",
              "Comprado",
              "Donado",
              "Total"
            ],
            state: true,
          }}

          tbody={{
            maxRows: 10,
            data: sportsEquipmentData,
            dataPropertys: [
              "NombreMaterial",
              "CantidadComprado",
              "CantidadDonado",
              "Total"
            ],
            state: true,
          }}
        />
        {/* Modal para Crear Material */}
        {/* El modal ahora se renderiza siempre y controla su visibilidad internamente para permitir animaciones de entrada y salida */}
        <FormCreate
          isOpen={isCreateModalOpen}
          onClose={handleCloseCreateModal}
          onSubmit={handleCreateSubmit}
        />
      </div>


    </div>
  );
}

export default SportsEquipment;