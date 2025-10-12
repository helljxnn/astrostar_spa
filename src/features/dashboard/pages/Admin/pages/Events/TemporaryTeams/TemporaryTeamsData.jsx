// TemporaryTeamsData.jsx
const temporaryTeamsData = [
  {
    id: 1,
    nombre: "Manuela Vanegas Sub-17",
    entrenador: "Carolina Bran",
    telefono: "+57 3001234567",
    jugadoras: [
      { 
        id: 2, 
        name: "Valentina López González",
        identification: "1087654321",
        categoria: "Sub 15",
        type: "fundacion"
      },
      { 
        id: 6, 
        name: "Camila Rodríguez Pérez",
        identification: "1034567890",
        categoria: "Sub 15",
        type: "fundacion"
      }
    ],
    jugadorasIds: [2, 6],
    cantidadJugadoras: 2,
    estado: "Activo",
    descripcion: "Equipo Sub-17 para competencias regionales. Enfocado en desarrollo técnico y táctico.",
    entrenadorData: {
      id: "e3",
      name: "Carolina Bran",
      identification: "CC.9876543210",
      type: "fundacion"
    },
    teamType: "fundacion"
  },
  {
    id: 2,
    nombre: "Promesas Sub-15",
    entrenador: "Héctor Vanegas",
    telefono: "+57 3109876543",
    jugadoras: [
      { 
        id: 1, 
        name: "Santiago Morales Rivera",
        identification: "1098765432",
        categoria: "Sub 15",
        type: "fundacion"
      },
      { 
        id: 3, 
        name: "Mateo Herrera Silva",
        identification: "1098765433",
        categoria: "Juvenil",
        type: "fundacion"
      }
    ],
    jugadorasIds: [1, 3],
    cantidadJugadoras: 2,
    estado: "Activo",
    descripcion: "Equipo Sub-15 en formación. Participación en ligas locales y torneos amistosos.",
    entrenadorData: {
      id: "e4",
      name: "Héctor Vanegas",
      identification: "CC.1098653986",
      type: "fundacion"
    },
    teamType: "fundacion"
  },
  {
    id: 3,
    nombre: "Juvenil Elite Temporales",
    entrenador: "Ana Restrepo",
    telefono: "+57 3156789012",
    jugadoras: [
      { 
        id: "t1", 
        name: "Jennifer Lascarro",
        identification: "TI.1246789334",
        categoria: "Sub 17",
        type: "temporal"
      }
    ],
    jugadorasIds: ["t1"],
    cantidadJugadoras: 1,
    estado: "Inactivo",
    descripcion: "Equipo juvenil temporal en receso por temporada baja.",
    entrenadorData: {
      id: "t2",
      name: "Ana Restrepo",
      identification: "CC.1397543865",
      type: "temporal"
    },
    teamType: "temporal"
  }
];

export default temporaryTeamsData;