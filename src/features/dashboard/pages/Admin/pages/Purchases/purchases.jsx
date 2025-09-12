import React from 'react';
import Table from "../../../../../../shared/components/Table/table";

export const Purchases = () => {
  // Datos de ejemplo para compras
  const purchasesData = [
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

  return (
    <div id="content" className="w-full h-auto grid grid-rows-[auto_1fr]">
      {/* Contenedor index */}
      <div id="header">
        {/* Cabecera */}
        <h1>Compras</h1>
      </div>
      <div id="body">
        {/* Cuerpo */}

        {/* Tabla */}
        <Table 
          thead={{
            titles: [
              "Proveedor",
              "Monto",
              "Fecha",
              "Concepto",
              "Estado"
            ],
            state: true,
          }} 

          tbody={{
            maxRows: 10,
            data: purchasesData,
            dataPropertys:[
              "proveedor",
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
