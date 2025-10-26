// TemporaryTeamsData.jsx - DATOS ESTANDARIZADOS CON "deportistas"
const temporaryTeamsData = [
  {
    id: 1,
    nombre: "Equipo Temporal Sub-17",
    entrenador: "Ana Restrepo",
    entrenadorData: {
      id: "t2",
      name: "Ana Restrepo",
      identification: "CC.1397543865",
      type: "temporal"
    },
    telefono: "+57 3207654321",
    cantidadDeportistas: 1,
    categoria: "Sub 17",
    estado: "Activo",
    teamType: "temporal",
    descripcion: "Equipo temporal de categoría Sub-17",
    deportistas: [
      {
        id: "t1",
        name: "Jennifer Lascarro",
        identification: "TI.1246789334",
        type: "temporal"
      }
    ],
    deportistasIds: ["t1"]
  },
  {
    id: 2,
    nombre: "Equipo Fundación Juvenil",
    entrenador: "Carolina Bran",
    entrenadorData: {
      id: "e3",
      name: "Carolina Bran",
      identification: "CC.9876543210",
      type: "fundacion"
    },
    telefono: "+57 3109876543",
    cantidadDeportistas: 2,
    categoria: "Juvenil",
    estado: "Activo",
    teamType: "fundacion",
    descripcion: "Equipo de la fundación - Categoría Juvenil",
    deportistas: [
      {
        id: 3,
        name: "Mateo Herrera Silva",
        identification: "1098765433",
        type: "fundacion",
        categoria: "Juvenil"
      },
      {
        id: 4,
        name: "Isabella Moreno Castro",
        identification: "1076543210",
        type: "fundacion",
        categoria: "Juvenil"
      }
    ],
    deportistasIds: [3, 4]
  },
  {
    id: 3,
    nombre: "Equipo Fundación Sub-15",
    entrenador: "Héctor Vanegas",
    entrenadorData: {
      id: "e4",
      name: "Héctor Vanegas",
      identification: "CC.1098653986",
      type: "fundacion"
    },
    telefono: "+57 3001234567",
    cantidadDeportistas: 3,
    categoria: "Sub 15",
    estado: "Activo",
    teamType: "fundacion",
    descripcion: "Equipo de la fundación - Categoría Sub 15",
    deportistas: [
      {
        id: 1,
        name: "Santiago Morales Rivera",
        identification: "1098765432",
        type: "fundacion",
        categoria: "Sub 15"
      },
      {
        id: 2,
        name: "Valentina López González",
        identification: "1087654321",
        type: "fundacion",
        categoria: "Sub 15"
      },
      {
        id: 6,
        name: "Camila Rodríguez Pérez",
        identification: "1034567890",
        type: "fundacion",
        categoria: "Sub 15"
      }
    ],
    deportistasIds: [1, 2, 6]
  }
];

export default temporaryTeamsData;