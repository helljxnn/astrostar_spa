const rolesData = [
  {
    id: 1,
    nombre: "Administrador",
    descripcion: "Acceso completo al sistema",
    estado: "Activo",
    modulos: [
      {
        nombre: "Usuarios",
        permisos: ["Crear", "Editar", "Eliminar", "Ver"],
      },
      {
        nombre: "Eventos",
        permisos: ["Crear", "Ver", "Editar"],
      },
    ],
  },
  {
    id: 2,
    nombre: "Editor",
    descripcion: "Puede editar contenido",
    estado: "Inactivo",
    modulos: [
      {
        nombre: "Eventos",
        permisos: ["Crear", "Editar", "Ver"], 
      },
    ],
  },
    {
    id: 3,
    nombre: "Editor",
    descripcion: "Puede editar contenido",
    estado: "Inactivo",
    modulos: [
      {
        nombre: "Eventos",
        permisos: ["Crear", "Editar", "Ver"], 
      },
    ],
  },
    {
    id: 4,
    nombre: "Editor",
    descripcion: "Puede editar contenido",
    estado: "Inactivo",
    modulos: [
      {
        nombre: "Eventos",
        permisos: ["Crear", "Editar", "Ver"], 
      },
    ],
  },
    {
    id: 5,
    nombre: "Editor",
    descripcion: "Puede editar contenido",
    estado: "Inactivo",
    modulos: [
      {
        nombre: "Eventos",
        permisos: ["Crear", "Editar", "Ver"], 
      },
    ],
  },
    {
    id: 6,
    nombre: "Editor",
    descripcion: "Puede editar contenido",
    estado: "Inactivo",
    modulos: [
      {
        nombre: "Eventos",
        permisos: ["Crear", "Editar", "Ver"], 
      },
    ],
  },
];

export default rolesData;
