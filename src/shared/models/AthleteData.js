// src/features/dashboard/pages/Admin/pages/Athletes/AthleteData.js

const athletesData = [
  // =============================================
  // ESCENARIO 1: DEPORTISTA VIGENTE NORMAL
  // =============================================
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

  // =============================================
  // ESCENARIO 2: DEPORTISTA SUSPENDIDO - LESIÓN TEMPORAL
  // =============================================
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
    estado: "Activo", // ✅ El deportista sigue activo, solo la inscripción está suspendida
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

  // =============================================
  // ESCENARIO 3: DEPORTISTA VENCIDO - RENOVACIÓN PENDIENTE
  // =============================================
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
        fechaInscripcion: "2024-01-20", // ✅ 2024 para mostrar vencida
        estado: "Vencida",
        categoria: "Juvenil",
        concepto: "Inscripción anual 2024",
        fechaConcepto: "2024-01-20"
      }
    ]
  },

  // =============================================
  // ESCENARIO 4: DEPORTISTA INACTIVO - SUSPENDIDA POR RENUNCIA
  // =============================================
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
    estado: "Inactivo", // 
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

  // =============================================
  // ESCENARIO 5: DEPORTISTA NUEVO CON INSCRIPCIÓN VIGENTE
  // =============================================
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

  // =============================================
  // ESCENARIO 6: DEPORTISTA CON HISTORIAL COMPLETO
  // =============================================
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
      },
      {
        id: 206,
        fechaInscripcion: "2024-02-15",
        estado: "Suspendida",
        categoria: "Sub 15",
        concepto: "Viaje familiar al exterior",
        fechaConcepto: "2024-06-10"
      },
      {
        id: 306,
        fechaInscripcion: "2023-01-20",
        estado: "Vencida",
        categoria: "Infantil",
        concepto: "Inscripción anual 2023",
        fechaConcepto: "2023-01-20"
      }
    ]
  }
];

export default athletesData;