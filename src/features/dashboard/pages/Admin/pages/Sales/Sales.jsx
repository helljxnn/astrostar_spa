import React from "react";
import Table from "../../../../../../shared/components/Table/table";

function Sales() {
  // Datos de ejemplo para ventas
  const salesData = [
    {
      id: 1,
      cliente: "Club Deportivo Águilas",
      monto: "$2.500.000",
      fecha: "2023-10-05",
      concepto: "Equipamiento completo",
      estado: "Completada"
    },
    {
      id: 2,
      cliente: "Escuela Deportiva Municipal",
      monto: "$1.800.000",
      fecha: "2023-11-12",
      concepto: "Uniformes y balones",
      estado: "Completada"
    },
    {
      id: 3,
      cliente: "Academia Juvenil",
      monto: "$950.000",
      fecha: "2023-12-03",
      concepto: "Material de entrenamiento",
      estado: "En proceso"
    }
  ];

  return (
    <div id="content" className="w-full h-auto grid grid-rows-[auto_1fr]">
      {/* Contenedor index */}
      <div id="header">
        {/* Cabecera */}
        <h1>Ventas</h1>
      </div>
      <div id="body">
        {/* Cuerpo */}

        {/* Tabla */}
        <Table 
          thead={{
            titles: [
              "Cliente",
              "Monto",
              "Fecha",
              "Concepto",
              "Estado"
            ],
            state: true,
          }} 

          tbody={{
            maxRows: 10,
            data: salesData,
            dataPropertys:[
              "cliente",
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

export default Sales;