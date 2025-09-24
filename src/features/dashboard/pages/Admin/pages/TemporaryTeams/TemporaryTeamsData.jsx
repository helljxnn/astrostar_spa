// TemporaryTeamsData.jsx
const temporaryTeamsData = [
  {
    id: 1,
    nombre: "Manuela Vanegas Sub - 17",
    entrenador: "Carolina Bran",
    telefono: "399562010",
    jugadoras: [
      { id: "a1", name: "Jugador A" },
      { id: "a2", name: "Jugador B" },
      // ...
    ],
    jugadorasIds: ["a1", "a2"],
    cantidadJugadoras: 2,
    estado: "Activo",
    descripcion: "Equipo temporal Sub-17 para torneo local",
  },
  {
    id: 2,
    nombre: "Manuela Vanegas Sub - 15",
    entrenador: "Héctor Vanegas",
    telefono: "3114895020",
    jugadoras: [{ id: "a3", name: "Jugador C" }],
    jugadorasIds: ["a3"],
    cantidadJugadoras: 1,
    estado: "Inactivo",
    descripcion: "Equipo Sub-15",
  },
];

export default temporaryTeamsData;
