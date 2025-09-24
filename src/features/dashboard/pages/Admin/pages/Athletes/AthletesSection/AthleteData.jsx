// src/features/dashboard/pages/Admin/pages/Athletes/AthleteData.js

const athletesData = [
  {
    id: 1,
    nombres: "Santiago",
    apellidos: "Morales Rivera",
    tipoDocumento: "tarjeta_identidad",
    numeroDocumento: "1098765432",
    fechaNacimiento: "2010-03-15", // 13-14 años
    genero: "masculino",
    telefono: "+57 3001234567",
    correo: "santiago.morales@email.com",
    direccion: "Calle 45 #12-34, Barrio Los Pinos",
    ciudad: "Medellín",
    deportePrincipal: "futbol",
    categoria: "Sub 15", // Calculado por edad
    posicion: "Delantero",
    equipoClub: "Academia Deportiva Los Pinos",
    peso: 55.5,
    estatura: 1.65,
    contactoEmergencia: "María Rivera - 3009876543",
    observaciones: "Jugador destacado en la categoría Sub 15. Excelente técnica y velocidad.",
    estado: "Activo",
    acudiente: 1, // ID del acudiente
    estadoInscripcion: "Vigente",
    inscripciones: [
      {
        id: 101,
        fechaInscripcion: "2024-01-15",
        estadoInscripcion: "Vigente",
        concepto: "Inscripción 2024",
        fechaConcepto: "2024-01-15",
        categoria: "Sub 15"
      }
    ]
  },
  {
    id: 2,
    nombres: "Valentina",
    apellidos: "López González",
    tipoDocumento: "tarjeta_identidad",
    numeroDocumento: "1087654321",
    fechaNacimiento: "2008-07-22", // 15-16 años
    genero: "femenino",
    telefono: "+57 3109876543",
    correo: "valentina.lopez@email.com",
    direccion: "Carrera 15 #67-89, Conjunto El Dorado",
    ciudad: "Medellín",
    deportePrincipal: "natacion",
    categoria: "Sub 15",
    posicion: "Estilo Libre",
    equipoClub: "Club Acuático Medellín",
    peso: 52.0,
    estatura: 1.62,
    contactoEmergencia: "Pedro López - 3187654321",
    observaciones: "Promesa de la natación. Medallista departamental en estilo libre.",
    estado: "Activo",
    acudiente: 2,
    estadoInscripcion: "Vigente",
    inscripciones: [
      {
        id: 102,
        fechaInscripcion: "2024-02-01",
        estadoInscripcion: "Vigente",
        concepto: "Inscripción 2024",
        fechaConcepto: "2024-02-01",
        categoria: "Sub 15"
      }
    ]
  },
  {
    id: 3,
    nombres: "Mateo",
    apellidos: "Herrera Silva",
    tipoDocumento: "cedula",
    numeroDocumento: "1098765433",
    fechaNacimiento: "2007-11-08", // 16-17 años
    genero: "masculino",
    telefono: "+57 3156789012",
    correo: "mateo.herrera@email.com",
    direccion: "Avenida 80 #23-45, Apartamento 501",
    ciudad: "Medellín",
    deportePrincipal: "atletismo",
    categoria: "Juvenil",
    posicion: "Velocista 100m",
    equipoClub: "Club Atlético Antioquia",
    peso: 63.3,
    estatura: 1.73,
    contactoEmergencia: "Carmen Silva - 3002468135",
    observaciones: "Récord departamental juvenil en 100 metros planos. Gran potencial.",
    estado: "Activo",
    acudiente: 3,
    estadoInscripcion: "Vigente",
    inscripciones: [
      {
        id: 103,
        fechaInscripcion: "2024-01-20",
        estadoInscripcion: "Vigente",
        concepto: "Inscripción 2024",
        fechaConcepto: "2024-01-20",
        categoria: "Juvenil"
      }
    ]
  },
  {
    id: 4,
    nombres: "Isabella",
    apellidos: "Moreno Castro",
    tipoDocumento: "cedula",
    numeroDocumento: "1076543210",
    fechaNacimiento: "2006-05-30", // 17-18 años
    genero: "femenino",
    telefono: "+57 3187654321",
    correo: "isabella.moreno@email.com",
    direccion: "Calle 100 #15-20, Zona Norte",
    ciudad: "Medellín",
    deportePrincipal: "voleibol",
    categoria: "Juvenil",
    posicion: "Atacante",
    equipoClub: "Voleibol Antioquia",
    peso: 58.7,
    estatura: 1.75,
    contactoEmergencia: "Luis Moreno - 3009876543",
    observaciones: "Capitana del equipo juvenil. Excelente técnica de ataque.",
    estado: "Activo",
    acudiente: 4,
    estadoInscripcion: "Vencida",
    inscripciones: [
      {
        id: 104,
        fechaInscripcion: "2023-01-15",
        estadoInscripcion: "Vencida",
        concepto: "Inscripción 2023",
        fechaConcepto: "2023-01-15",
        categoria: "Juvenil"
      }
    ]
  },
  {
    id: 5,
    nombres: "Sofía",
    apellidos: "Ramírez Pineda",
    tipoDocumento: "tarjeta_identidad",
    numeroDocumento: "1043210987",
    fechaNacimiento: "2012-02-18", // 11-12 años
    genero: "femenino",
    telefono: "+57 3098765432",
    correo: "sofia.ramirez@email.com",
    direccion: "Calle 85 #12-30, Barrio La Castellana",
    ciudad: "Medellín",
    deportePrincipal: "gimnasia",
    categoria: "Infantil",
    posicion: "Artística",
    equipoClub: "Gimnasio Integral Medellín",
    peso: 35.5,
    estatura: 1.48,
    contactoEmergencia: "Patricia Pineda - 3187654321",
    observaciones: "Talento excepcional en gimnasia artística. Medallista regional.",
    estado: "Activo",
    acudiente: 5,
    estadoInscripcion: "Vigente",
    inscripciones: [
      {
        id: 105,
        fechaInscripcion: "2024-03-01",
        estadoInscripcion: "Vigente",
        concepto: "Inscripción 2024",
        fechaConcepto: "2024-03-01",
        categoria: "Infantil"
      }
    ]
  },
  {
    id: 6,
    nombres: "Alejandro",
    apellidos: "Vargas Ruiz",
    tipoDocumento: "cedula",
    numeroDocumento: "1054321098",
    fechaNacimiento: "2006-12-10", // 17-18 años
    genero: "masculino",
    telefono: "+57 3129876543",
    correo: "alejandro.vargas@email.com",
    direccion: "Carrera 7 #45-67, Centro",
    ciudad: "Medellín",
    deportePrincipal: "tenis",
    categoria: "Juvenil",
    posicion: "Individual",
    equipoClub: "Club de Tenis El Poblado",
    peso: 68.2,
    estatura: 1.76,
    contactoEmergencia: "Sandra Ruiz - 3156789012",
    observaciones: "Ranking nacional juvenil. Múltiples títulos departamentales.",
    estado: "Activo",
    acudiente: 6,
    estadoInscripcion: "Vigente",
    inscripciones: [
      {
        id: 106,
        fechaInscripcion: "2024-01-10",
        estadoInscripcion: "Vigente",
        concepto: "Inscripción 2024",
        fechaConcepto: "2024-01-10",
        categoria: "Juvenil"
      }
    ]
  },
  {
    id: 7,
    nombres: "Camila",
    apellidos: "Torres Mendoza",
    tipoDocumento: "tarjeta_identidad",
    numeroDocumento: "1032109876",
    fechaNacimiento: "2009-09-25", // 14-15 años
    genero: "femenino",
    telefono: "+57 3165432109",
    correo: "camila.torres@email.com",
    direccion: "Avenida Las Palmas #67-89, El Poblado",
    ciudad: "Medellín",
    deportePrincipal: "ciclismo",
    categoria: "Sub 15",
    posicion: "Ruta",
    equipoClub: "Cycling Team Antioquia",
    peso: 48.8,
    estatura: 1.58,
    contactoEmergencia: "Gloria Mendoza - 3129876543",
    observaciones: "Especialista en ruta. Participación en campeonatos departamentales.",
    estado: "Activo",
    acudiente: 7,
    estadoInscripcion: "Vigente",
    inscripciones: [
      {
        id: 107,
        fechaInscripcion: "2024-02-15",
        estadoInscripcion: "Vigente",
        concepto: "Inscripción 2024",
        fechaConcepto: "2024-02-15",
        categoria: "Sub 15"
      }
    ]
  },
  {
    id: 8,
    nombres: "Diego",
    apellidos: "Ospina Cortés",
    tipoDocumento: "tarjeta_identidad",
    numeroDocumento: "1021098765",
    fechaNacimiento: "2011-04-12", // 12-13 años
    genero: "masculino",
    telefono: "+57 3054321098",
    correo: "diego.ospina@email.com",
    direccion: "Calle 95 #20-15, Zona Rosa",
    ciudad: "Medellín",
    deportePrincipal: "taekwondo",
    categoria: "Infantil",
    posicion: "Peso Mosca",
    equipoClub: "Academia Taekwondo Elite",
    peso: 42.2,
    estatura: 1.52,
    contactoEmergencia: "Ricardo Ospina - 3098765432",
    observaciones: "Cinturón amarillo avanzado. Gran disciplina y técnica.",
    estado: "Activo",
    acudiente: 8,
    estadoInscripcion: "Vigente",
    inscripciones: [
      {
        id: 108,
        fechaInscripcion: "2024-01-05",
        estadoInscripcion: "Vigente",
        concepto: "Inscripción 2024",
        fechaConcepto: "2024-01-05",
        categoria: "Infantil"
      }
    ]
  }
];

export default athletesData;