import React from "react";
import Table from "../../../../../../shared/components/Table/table";
import sportsEquipmentData from "../../../../../../shared/models/SportsEquipment";
import usersData from "../../../../../../shared/models/users";

function SportsEquipment() {
  return (
    <div id="content" className="w-full h-auto grid grid-rows-[auto_1fr]">
      {/* Contenedor index */}
      <div id="header">
        {/* Cabecera */}
        <h1>Material deportivo</h1>
      </div>
      <div id="body">
        {/* Cuerpo */}

        {/* Tabla */}
        <Table 
          thead={{
            width: "full",
            height: "auto",
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
            dataPropertys:[
              "NombreMaterial",
              "CantidadComprado",
              "CantidadDonado",
              "Total"
            ],
            state: true,
          }} 
        />
      </div>
    </div>
  );
}

export default SportsEquipment;