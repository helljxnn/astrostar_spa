// src/utils/dataLoaders.js
// Utilidades para cargar datos desde localStorage o archivos data.jsx

// ============================================
// IMPORTAR TUS ARCHIVOS DE DATOS (FALLBACK)
// ============================================
// Descomenta e importa tus archivos reales:
// import employeesData from "../shared/models/EmployeeData";
// import athletesData from "../features/dashboard/pages/Admin/pages/Athletes/AthleteData";
// import temporaryWorkersData from "../shared/models/TemporaryWorkersData";

// Datos de muestra para demo (REEMPLAZA CON TUS IMPORTS REALES)
const employeesDataFallback = [
  { id: "e1", nombre: "Paula Andrea Vanegas", identificacion: "CC.1246789334", rol: "Profesional deportivo", estado: "Activo" },
  { id: "e2", nombre: "Estrella Betancúr", identificacion: "CC.7864108557", rol: "Profesional deportivo", estado: "Activo" },
  { id: "e3", nombre: "Carolina Bran", identificacion: "CC.9876543210", rol: "Profesional deportivo", estado: "Activo" },
];

const athletesDataFallback = [
  { id: "a1", nombres: "Santiago", apellidos: "Morales Rivera", numeroDocumento: "1098765432", estado: "Activo", categoria: "Sub 15" },
  { id: "a2", nombres: "Valentina", apellidos: "López González", numeroDocumento: "1087654321", estado: "Activo", categoria: "Sub 15" },
  { id: "a3", nombres: "Isabella", apellidos: "Moreno Castro", numeroDocumento: "1076543210", estado: "Activo", categoria: "Juvenil" },
  { id: "a4", nombres: "Mateo", apellidos: "Herrera Silva", numeroDocumento: "1098765433", estado: "Activo", categoria: "Juvenil" },
];

const temporaryWorkersDataFallback = [
  { id: "t1", tipoPersona: "Entrenador", nombre: "Ana Restrepo", identificacion: "CC.1397543865", estado: "Activo" },
  { id: "t2", tipoPersona: "Jugadora", nombre: "Jennifer Lascarro", identificacion: "TI.1246789334", estado: "Activo", categoria: "Sub 17" },
  { id: "t3", tipoPersona: "Entrenador", nombre: "Héctor Vanegas", identificacion: "CC.1098653986", estado: "Activo" },
];

// ============================================
// FUNCIONES HELPER PARA CARGAR DATOS
// ============================================

/**
 * Carga entrenadores desde múltiples fuentes:
 * 1. Empleados (rol: "Profesional deportivo")
 * 2. Personas Temporales (tipoPersona: "Entrenador")
 * @returns {Array} Lista unificada de entrenadores
 */
export const loadTrainers = () => {
  try {
    const trainers = [];

    // 1. DESDE EMPLEADOS (Profesionales Deportivos)
    const employeesRaw = localStorage.getItem("employees");
    const employees = employeesRaw ? JSON.parse(employeesRaw) : employeesDataFallback;
    
    const trainersFromEmployees = employees
      .filter(e => 
        (e.rol === "Profesional deportivo" || e.tipoEmpleado === "Entrenador") && 
        e.estado === "Activo"
      )
      .map(e => ({
        id: e.id || e.identificacion || `emp-${Date.now()}-${Math.random()}`,
        name: e.nombre || `${e.firstName || ""} ${e.lastName || ""}`.trim(),
        source: "Empleado",
        sourceLabel: "Empleado Fundación",
        identification: e.identificacion,
        badge: "👤 Empleado",
        badgeColor: "bg-blue-100 text-blue-800"
      }));

    trainers.push(...trainersFromEmployees);

    // 2. DESDE PERSONAS TEMPORALES (Entrenadores)
    const temporaryRaw = localStorage.getItem("temporaryPersons");
    const temporaryPersons = temporaryRaw ? JSON.parse(temporaryRaw) : temporaryWorkersDataFallback;
    
    const trainersFromTemporary = temporaryPersons
      .filter(t => t.tipoPersona === "Entrenador" && t.estado === "Activo")
      .map(t => ({
        id: t.id || t.identificacion || `temp-${Date.now()}-${Math.random()}`,
        name: t.nombre,
        source: "Temporal",
        sourceLabel: "Persona Temporal",
        identification: t.identificacion,
        badge: "⏱️ Temporal",
        badgeColor: "bg-purple-100 text-purple-800"
      }));

    trainers.push(...trainersFromTemporary);

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
 * @returns {Array} Lista unificada de jugadoras
 */
export const loadPlayers = () => {
  try {
    const players = [];

    // 1. DESDE DEPORTISTAS (Athletes)
    const athletesRaw = localStorage.getItem("athletes");
    const athletes = athletesRaw ? JSON.parse(athletesRaw) : athletesDataFallback;
    
    const playersFromAthletes = athletes
      .filter(a => a.estado === "Activo")
      .map(a => ({
        id: a.id || a.numeroDocumento || `ath-${Date.now()}-${Math.random()}`,
        name: a.nombre || `${a.nombres || ""} ${a.apellidos || ""}`.trim(),
        source: "Deportista",
        sourceLabel: "Deportista Fundación",
        identification: a.numeroDocumento || a.identificacion,
        categoria: a.categoria || "Sin categoría",
        badge: "🏃 Deportista",
        badgeColor: "bg-green-100 text-green-800",
        additionalInfo: a.deportePrincipal || ""
      }));

    players.push(...playersFromAthletes);

    // 2. DESDE PERSONAS TEMPORALES (Jugadoras)
    const temporaryRaw = localStorage.getItem("temporaryPersons");
    const temporaryPersons = temporaryRaw ? JSON.parse(temporaryRaw) : temporaryWorkersDataFallback;
    
    const playersFromTemporary = temporaryPersons
      .filter(t => t.tipoPersona === "Jugadora" && t.estado === "Activo")
      .map(t => ({
        id: t.id || t.identificacion || `temp-${Date.now()}-${Math.random()}`,
        name: t.nombre,
        source: "Temporal",
        sourceLabel: "Persona Temporal",
        identification: t.identificacion,
        categoria: t.categoria || "Sin categoría",
        badge: "⏱️ Temporal",
        badgeColor: "bg-purple-100 text-purple-800",
        additionalInfo: ""
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
 * @param {Array} data - Array de items con propiedad 'source'
 * @returns {Array} Array de objetos {source, sourceLabel, items[]}
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
 * @param {Array} data - Array de items
 * @param {String} searchTerm - Término de búsqueda
 * @returns {Array} Items filtrados
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