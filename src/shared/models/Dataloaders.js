// src/utils/dataLoaders.js
// Utilidades para cargar datos desde localStorage o archivos data.jsx

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

// Datos reales de empleados - ENTRENADORES
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

// Importar servicio de personas temporales
import temporaryWorkersService from '../services/temporaryWorkersService';

// Función para cargar personas temporales desde la API
const loadTemporaryWorkersFromAPI = async () => {
  try {
    const response = await temporaryWorkersService.getAll({ limit: 100 });
    if (response.success) {
      return response.data.map(item => ({
        id: item.id.toString(),
        tipoPersona: item.personType,
        nombre: `${item.firstName} ${item.lastName || ''}`.trim(),
        tipoDocumento: item.documentType?.name || 'N/A',
        identificacion: item.identification || 'N/A',
        telefono: item.phone || 'N/A',
        fechaNacimiento: item.birthDate ? new Date(item.birthDate).toISOString().split('T')[0] : '',
        edad: item.age || 0,
        categoria: item.personType === 'Deportista' ? 'No asignada' : 'No aplica',
        estado: item.status === 'Active' ? 'Activo' : 'Inactivo',
      }));
    }
    return [];
  } catch (error) {
    console.error('Error loading temporary workers from API:', error);
    return [];
  }
};

// FUNCIONES HELPER PARA CARGAR DATOS
// ============================================

/**
 * Carga entrenadores desde múltiples fuentes:
 * 1. Empleados (tipoEmpleado: "Entrenador")
 * 2. Personas Temporales (tipoPersona: "Entrenador")
 */
export const loadTrainers = async () => {
  try {
    const trainers = [];

    // 1. DESDE EMPLEADOS (Entrenadores) - FUNDACIÓN
    // Nota: Esta función ahora debería usar la API de empleados
    // Por ahora mantenemos compatibilidad con localStorage como fallback
    const employeesRaw = localStorage.getItem("employees");
    const employees = employeesRaw ? JSON.parse(employeesRaw) : [];

    const trainersFromEmployees = employees
      .filter(e => {
        // Filtrar solo por estado ya que no hay tipos de empleado
        const status = e.status || e.estado;
        return status === "Active" || status === "Activo";
      })
      .map(e => ({
        id: e.id || e.user?.identification || e.identificacion,
        name: e.user ? `${e.user.firstName} ${e.user.lastName}` : e.nombre,
        source: "fundacion",
        sourceLabel: "Entrenadores de la Fundación",
        identification: e.user?.identification || e.identificacion,
        badge: "Empleado",
        badgeColor: "bg-blue-100 text-blue-800",
        type: "fundacion"
      }));

    trainers.push(...trainersFromEmployees);

    // 2. DESDE PERSONAS TEMPORALES (Entrenadores) - TEMPORALES
    const temporaryRaw = localStorage.getItem("temporaryPersons");
    const temporaryPersons = temporaryRaw ? JSON.parse(temporaryRaw) : await loadTemporaryWorkersFromAPI();

    const trainersFromTemporary = temporaryPersons
      .filter(t => t.tipoPersona === "Entrenador" && t.estado === "Activo")
      .map(t => ({
        id: t.id || t.identificacion,
        name: t.nombre,
        source: "temporal",
        sourceLabel: "Entrenadores Temporales",
        identification: t.identificacion,
        badge: "Temporal",
        badgeColor: "bg-purple-100 text-purple-800",
        type: "temporal"
      }));

    trainers.push(...trainersFromTemporary);

    return trainers;
  } catch (error) {
    console.error("Error cargando entrenadores:", error);
    return [];
  }
};

/**
 * Carga deportistas desde múltiples fuentes:
 * 1. Deportistas (estado: "Activo") - CON CATEGORÍA
 * 2. Personas Temporales (tipoPersona: "Deportista") - SIN CATEGORÍA
 */
export const loadAthletes = async () => {
  try {
    const athletes = [];

    // 1. DESDE DEPORTISTAS (Athletes) - FUNDACIÓN - CON CATEGORÍA
    const athletesRaw = localStorage.getItem("athletes");
    const athletesData = athletesRaw ? JSON.parse(athletesRaw) : athletesDataReal;
    
    const athletesFromFoundation = athletesData
      .filter(a => a.estado === "Activo")
      .map(a => ({
        id: a.id,
        name: `${a.nombres} ${a.apellidos}`,
        source: "fundacion",
        sourceLabel: "Deportistas de la Fundación",
        identification: a.numeroDocumento,
        categoria: a.categoria,
        badge: "Deportista",
        badgeColor: "bg-green-100 text-green-800",
        additionalInfo: `${a.genero === "femenino" ? "Femenino" : "Masculino"} - ${a.ciudad}`,
        type: "fundacion"
      }));

    athletes.push(...athletesFromFoundation);

    // 2. DESDE PERSONAS TEMPORALES (Deportistas) - TEMPORALES - SIN CATEGORÍA
    const temporaryRaw = localStorage.getItem("temporaryPersons");
    const temporaryPersons = temporaryRaw ? JSON.parse(temporaryRaw) : await loadTemporaryWorkersFromAPI();
    
    const athletesFromTemporary = temporaryPersons
      .filter(t => t.tipoPersona === "Deportista" && t.estado === "Activo")
      .map(t => ({
        id: t.id,
        name: t.nombre,
        source: "temporal",
        sourceLabel: "Deportistas Temporales",
        identification: t.identificacion,
        categoria: undefined, // EXPLÍCITAMENTE SIN CATEGORÍA
        badge: "Temporal",
        badgeColor: "bg-purple-100 text-purple-800",
        additionalInfo: `${t.edad} años`,
        type: "temporal"
      }));

    athletes.push(...athletesFromTemporary);

    return athletes;
  } catch (error) {
    console.error("Error cargando deportistas:", error);
    return [];
  }
};

// MANTENER COMPATIBILIDAD CON CÓDIGO EXISTENTE
export const loadPlayers = loadAthletes;

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
    (item.categoria && item.categoria.toLowerCase().includes(query)) ||
    item.additionalInfo?.toLowerCase().includes(query)
  );
};

/**
 * Filtra datos por tipo específico
 */
export const filterByType = (data, type) => {
  if (!type) return data;
  return data.filter(item => item.type === type);
};

export default {
  loadTrainers,
  loadAthletes,
  loadPlayers, // MANTENER para compatibilidad
  groupBySource,
  searchInData,
  filterByType
};