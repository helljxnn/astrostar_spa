// src/utils/dataLoaders.js
// Utilidades para cargar datos desde localStorage o archivos data.jsx

// ============================================
// DATOS REALES DE LOS MÓDULOS
// ============================================

// Datos reales de deportistas
const athletesDataReal = [
  {
    id: 1,
    nombres: "Santiago",
    apellidos: "Morales Rivera",
    tipoDocumento: "tarjeta_identidad",
    numeroDocumento: "1098765432",
    fechaNacimiento: "2010-03-15",
    genero: "masculino",
    telefono: "3001234567",
    correo: "santiago.morales@email.com",
    direccion: "Calle 45 #12-34, Barrio Los Pinos",
    ciudad: "Medellín",
    categoria: "Sub 15",
    estado: "Activo",
    acudiente: 101,
    estadoInscripcion: "Vigente",
    inscripciones: [
      {
        id: 101,
        fechaInscripcion: "2025-01-15",
        estado: "Vigente",
        categoria: "Sub 15",
        concepto: "Inscripción inicial",
        fechaConcepto: "2025-01-15"
      }
    ]
  },
  {
    id: 2,
    nombres: "Valentina",
    apellidos: "López González",
    tipoDocumento: "tarjeta_identidad",
    numeroDocumento: "1087654321",
    fechaNacimiento: "2008-07-22",
    genero: "femenino",
    telefono: "3109876543",
    correo: "valentina.lopez@email.com",
    direccion: "Carrera 15 #67-89, Conjunto El Dorado",
    ciudad: "Medellín",
    categoria: "Sub 15",
    estado: "Activo",
    acudiente: 102,
    estadoInscripcion: "Suspendida",
    inscripciones: [
      {
        id: 102,
        fechaInscripcion: "2025-01-10",
        estado: "Suspendida",
        categoria: "Sub 15",
        concepto: "Lesión de hombro - Reposo médico por 2 meses",
        fechaConcepto: "2025-03-01"
      }
    ]
  },
  {
    id: 3,
    nombres: "Mateo",
    apellidos: "Herrera Silva",
    tipoDocumento: "cedula",
    numeroDocumento: "1098765433",
    fechaNacimiento: "2007-11-08",
    genero: "masculino",
    telefono: "3156789012",
    correo: "mateo.herrera@email.com",
    direccion: "Avenida 80 #23-45, Apartamento 501",
    ciudad: "Medellín",
    categoria: "Juvenil",
    estado: "Activo",
    acudiente: 102,
    estadoInscripcion: "Vencida",
    inscripciones: [
      {
        id: 103,
        fechaInscripcion: "2024-01-20",
        estado: "Vencida",
        categoria: "Juvenil",
        concepto: "Inscripción anual 2024",
        fechaConcepto: "2024-01-20"
      }
    ]
  },
  {
    id: 4,
    nombres: "Isabella",
    apellidos: "Moreno Castro",
    tipoDocumento: "cedula",
    numeroDocumento: "1076543210",
    fechaNacimiento: "2006-05-30",
    genero: "femenino",
    telefono: "3187654321",
    correo: "isabella.moreno@email.com",
    direccion: "Calle 100 #15-20, Zona Norte",
    ciudad: "Medellín",
    categoria: "Juvenil",
    estado: "Inactivo",
    acudiente: 101,
    estadoInscripcion: "Suspendida",
    inscripciones: [
      {
        id: 104,
        fechaInscripcion: "2025-01-10",
        estado: "Suspendida",
        categoria: "Juvenil",
        concepto: "Renuncia definitiva - Cambio de ciudad",
        fechaConcepto: "2025-05-20"
      }
    ]
  },
  {
    id: 5,
    nombres: "Diego",
    apellidos: "Ospina Cortés",
    tipoDocumento: "tarjeta_identidad",
    numeroDocumento: "1021098765",
    fechaNacimiento: "2011-04-12",
    genero: "masculino",
    telefono: "3054321098",
    correo: "diego.ospina@email.com",
    direccion: "Calle 95 #20-15, Zona Rosa",
    ciudad: "Medellín",
    categoria: "Infantil",
    estado: "Activo",
    acudiente: 101,
    estadoInscripcion: "Vigente",
    inscripciones: [
      {
        id: 105,
        fechaInscripcion: "2025-01-05",
        estado: "Vigente",
        categoria: "Infantil",
        concepto: "Inscripción inicial",
        fechaConcepto: "2025-01-05"
      }
    ]
  },
  {
    id: 6,
    nombres: "Camila",
    apellidos: "Rodríguez Pérez",
    tipoDocumento: "tarjeta_identidad",
    numeroDocumento: "1034567890",
    fechaNacimiento: "2009-08-18",
    genero: "femenino",
    telefono: "3176543210",
    correo: "camila.rodriguez@email.com",
    direccion: "Carrera 50 #30-25, Barrio Belén",
    ciudad: "Medellín",
    categoria: "Sub 15",
    estado: "Activo",
    acudiente: 103,
    estadoInscripcion: "Vigente",
    inscripciones: [
      {
        id: 106,
        fechaInscripcion: "2025-03-01",
        estado: "Vigente",
        categoria: "Sub 15",
        concepto: "Reactivación después de suspensión",
        fechaConcepto: "2025-03-01"
      }
    ]
  }
];

// Datos reales de empleados - AGREGAR ENTRENADORES
const employeesDataReal = [
  {
    id: "e1",
    nombre: "Paula Andrea Vanegas",
    identificacion: "CC.1246789334",
    tipoEmpleado: "Psicóloga",
    rol: "Profesional en salud",
    estado: "Activo",
  },
  {
    id: "e2",
    nombre: "Estrella Betancúr",
    identificacion: "CC.7864108557",
    tipoEmpleado: "Administrativo",
    rol: "Profesional deportivo",
    estado: "Incapacitado",
  },
  {
    id: "e3",
    nombre: "Carolina Bran",
    identificacion: "CC.9876543210",
    tipoEmpleado: "Entrenador",
    rol: "Profesional deportivo",
    estado: "Activo",
  },
  {
    id: "e4",
    nombre: "Héctor Vanegas",
    identificacion: "CC.1098653986",
    tipoEmpleado: "Entrenador",
    rol: "Profesional deportivo",
    estado: "Activo",
  }
];

// Datos reales de personas temporales - AGREGAR ENTRENADORES
const temporaryWorkersDataReal = [
  {
    id: "t1",
    tipoPersona: "Jugadora",
    nombre: "Jennifer Lascarro",
    tipoDocumento: "Tarjeta de Identidad",
    identificacion: "TI.1246789334",
    telefono: "3001234567",
    fechaNacimiento: "2006-05-12",
    edad: 19,
    categoria: "Sub 17",
    estado: "Activo",
  },
  {
    id: "t2",
    tipoPersona: "Entrenador",
    nombre: "Ana Restrepo",
    tipoDocumento: "Cédula de Ciudadanía",
    identificacion: "CC.1397543865",
    telefono: "3207654321",
    fechaNacimiento: "1992-09-10",
    edad: 32,
    categoria: "No aplica",
    estado: "Activo",
  },
  {
    id: "t3",
    tipoPersona: "Entrenador",
    nombre: "Luis Enrique",
    tipoDocumento: "Cédula de Ciudadanía",
    identificacion: "CC.1456789123",
    telefono: "3109876543",
    fechaNacimiento: "1985-03-22",
    edad: 38,
    categoria: "No aplica",
    estado: "Activo",
  }
];

// ============================================
// FUNCIONES HELPER PARA CARGAR DATOS
// ============================================

/**
 * Carga entrenadores desde múltiples fuentes:
 * 1. Empleados (tipoEmpleado: "Entrenador")
 * 2. Personas Temporales (tipoPersona: "Entrenador")
 */
export const loadTrainers = () => {
  try {
    const trainers = [];

    console.log("=== INICIANDO CARGA DE ENTRENADORES ===");

    // 1. DESDE EMPLEADOS (Entrenadores)
    const employeesRaw = localStorage.getItem("employees");
    const employees = employeesRaw ? JSON.parse(employeesRaw) : employeesDataReal;
    
    console.log("Empleados encontrados:", employees);

    const trainersFromEmployees = employees
      .filter(e => e.tipoEmpleado === "Entrenador" && e.estado === "Activo")
      .map(e => ({
        id: e.id || e.identificacion,
        name: e.nombre,
        source: "Empleado",
        sourceLabel: "Empleado Fundación",
        identification: e.identificacion,
        badge: "Empleado",
        badgeColor: "bg-blue-100 text-blue-800"
      }));

    console.log("Entrenadores de empleados:", trainersFromEmployees);
    trainers.push(...trainersFromEmployees);

    // 2. DESDE PERSONAS TEMPORALES (Entrenadores)
    const temporaryRaw = localStorage.getItem("temporaryPersons");
    const temporaryPersons = temporaryRaw ? JSON.parse(temporaryRaw) : temporaryWorkersDataReal;
    
    console.log("Personas temporales encontradas:", temporaryPersons);

    const trainersFromTemporary = temporaryPersons
      .filter(t => t.tipoPersona === "Entrenador" && t.estado === "Activo")
      .map(t => ({
        id: t.id || t.identificacion,
        name: t.nombre,
        source: "Temporal",
        sourceLabel: "Persona Temporal",
        identification: t.identificacion,
        badge: "Temporal",
        badgeColor: "bg-purple-100 text-purple-800"
      }));

    console.log("Entrenadores temporales:", trainersFromTemporary);
    trainers.push(...trainersFromTemporary);

    console.log("=== TOTAL ENTRENADORES CARGADOS ===", trainers);
    return trainers;
  } catch (error) {
    console.error("Error cargando entrenadores:", error);
    return [];
  }
};

/**
 * Carga jugadoras desde múltiples fuentes:
 * 1. Deportistas (estado: "Activo")
 * 2. Personas Temporales (tipoPersona: "Jugadora")
 */
export const loadPlayers = () => {
  try {
    const players = [];

    // 1. DESDE DEPORTISTAS (Athletes)
    const athletesRaw = localStorage.getItem("athletes");
    const athletes = athletesRaw ? JSON.parse(athletesRaw) : athletesDataReal;
    
    const playersFromAthletes = athletes
      .filter(a => a.estado === "Activo")
      .map(a => ({
        id: a.id,
        name: `${a.nombres} ${a.apellidos}`,
        source: "Deportista",
        sourceLabel: "Deportista Fundación",
        identification: a.numeroDocumento,
        categoria: a.categoria,
        badge: "Deportista",
        badgeColor: "bg-green-100 text-green-800",
        additionalInfo: `${a.genero === "femenino" ? "Femenino" : "Masculino"} - ${a.ciudad}`
      }));

    players.push(...playersFromAthletes);

    // 2. DESDE PERSONAS TEMPORALES (Jugadoras)
    const temporaryRaw = localStorage.getItem("temporaryPersons");
    const temporaryPersons = temporaryRaw ? JSON.parse(temporaryRaw) : temporaryWorkersDataReal;
    
    const playersFromTemporary = temporaryPersons
      .filter(t => t.tipoPersona === "Jugadora" && t.estado === "Activo")
      .map(t => ({
        id: t.id,
        name: t.nombre,
        source: "Temporal",
        sourceLabel: "Persona Temporal",
        identification: t.identificacion,
        categoria: t.categoria,
        badge: "Temporal",
        badgeColor: "bg-purple-100 text-purple-800",
        additionalInfo: `${t.edad} años`
      }));

    players.push(...playersFromTemporary);

    return players;
  } catch (error) {
    console.error("Error cargando jugadoras:", error);
    return [];
  }
};

/**
 * Agrupa datos por fuente
 */
export const groupBySource = (data) => {
  const sourceMap = new Map();
  
  data.forEach(item => {
    if (!sourceMap.has(item.source)) {
      sourceMap.set(item.source, {
        source: item.source,
        sourceLabel: item.sourceLabel,
        items: []
      });
    }
    sourceMap.get(item.source).items.push(item);
  });

  return Array.from(sourceMap.values());
};

/**
 * Busca en los datos por nombre, identificación o categoría
 */
export const searchInData = (data, searchTerm) => {
  if (!searchTerm?.trim()) return data;
  
  const query = searchTerm.toLowerCase();
  return data.filter(item => 
    item.name?.toLowerCase().includes(query) ||
    item.identification?.toLowerCase().includes(query) ||
    item.categoria?.toLowerCase().includes(query) ||
    item.additionalInfo?.toLowerCase().includes(query)
  );
};