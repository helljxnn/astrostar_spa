import React from "react";
import Table from "../../../../../../../shared/components/Table/table";

function Donations() {
  // Datos de ejemplo para donaciones
  const donationsData = [
    {
      id: 1,
      donante: "María González",
      monto: "$500.000",
      fecha: "2023-10-15",
      concepto: "Apoyo a deportistas",
      estado: "Completada"
    },
    {
      id: 2,
      donante: "Juan Pérez",
      monto: "$250.000",
      fecha: "2023-11-05",
      concepto: "Equipamiento deportivo",
      estado: "Completada"
    },
    {
      id: 3,
      donante: "Fundación Deportiva",
      monto: "$1.000.000",
      fecha: "2023-12-01",
      concepto: "Programa de becas",
      estado: "En proceso"
    }
  ];

  return (
    <div id="content" className="w-full h-auto grid grid-rows-[auto_1fr]">
      {/* Contenedor index */}
      <div id="header">
        {/* Cabecera */}
        <h1>Donaciones</h1>
      </div>
      <div id="body">
        {/* Cuerpo */}

        {/* Tabla */}
        <Table 
          thead={{
            titles: [
              "Donante",
              "Monto",
              "Fecha",
              "Concepto",
              "Estado"
            ],
            state: true,
          }} 

          tbody={{
            maxRows: 10,
            data: donationsData,
            dataPropertys:[
              "donante",
              "monto",
              "fecha",
              "concepto",
              "estado"
            ],
            state: true,
          }} 
        />
      </div>
    </div>
  );
}

export default Donations;