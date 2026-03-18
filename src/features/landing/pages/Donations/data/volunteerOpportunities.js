// Importar imágenes
import deporteImage from "../images/deporte y recreacion.webp";
import formacionImage from "../images/formacion integral.webp";
import arteImage from "../images/Arte.webp";
import logisticaImage from "../images/Logistica eventos.webp";
import comunicacionesImage from "../images/Comunicacioens.webp";

export const volunteerOpportunities = [
  {
    id: 1,
    title: "Deporte y recreación",
    icon: "⚽",
    image: deporteImage,
    summary: "Apoya los procesos deportivos de la fundación acompañando entrenamientos y actividades físicas que promueven disciplina, trabajo en equipo y confianza en las niñas.",
    activities: [
      "Acompañar entrenamientos y festivales deportivos",
      "Apoyar la organización de juegos y dinámicas recreativas",
      "Servir como referente positivo durante las actividades físicas"
    ],
    requirements: [
      "Gusto por el deporte y el trabajo con niñas y jóvenes",
      "Actitud dinámica y proactiva",
      "Responsabilidad y puntualidad",
      "Respeto por las normas y lineamientos de la fundación"
    ]
  },
  {
    id: 2,
    title: "Formación integral",
    icon: "📚",
    image: formacionImage,
    summary: "Contribuye al desarrollo integral de las niñas a través de espacios formativos enfocados en valores, liderazgo, bienestar emocional y proyecto de vida.",
    activities: [
      "Apoyar talleres de valores y liderazgo",
      "Participar en actividades de bienestar emocional",
      "Brindar acompañamiento en procesos educativos o reflexivos"
    ],
    requirements: [
      "Interés en procesos sociales o educativos",
      "Sensibilidad y empatía con la niñez",
      "Habilidades básicas de comunicación",
      "Compromiso con el enfoque formativo de la fundación"
    ]
  },
  {
    id: 3,
    title: "Arte y expresión",
    icon: "🎨",
    image: arteImage,
    summary: "Fomenta la creatividad y la expresión como herramientas para fortalecer la autoestima y la confianza de las niñas.",
    activities: [
      "Apoyar talleres de pintura, danza o música",
      "Coordinar dinámicas creativas en eventos",
      "Acompañar procesos de expresión artística"
    ],
    requirements: [
      "Interés o experiencia en actividades artísticas",
      "Creatividad y disposición para trabajar en equipo",
      "Paciencia y actitud positiva",
      "Respeto por la diversidad y la expresión individual"
    ]
  },
  {
    id: 4,
    title: "Logística y eventos",
    icon: "📋",
    image: logisticaImage,
    summary: "Apoya la organización y ejecución de actividades, festivales y jornadas comunitarias asegurando que cada evento se desarrolle de manera ordenada y eficiente.",
    activities: [
      "Apoyar el registro y recepción de participantes",
      "Organizar materiales y espacios",
      "Brindar orientación y acompañamiento durante eventos"
    ],
    requirements: [
      "Organización y atención al detalle",
      "Actitud de servicio",
      "Disponibilidad en fechas de eventos",
      "Trabajo en equipo"
    ]
  },
  {
    id: 5,
    title: "Comunicaciones",
    icon: "📸",
    image: comunicacionesImage,
    summary: "Contribuye a visibilizar el impacto de la fundación mediante la creación de contenido que inspire y conecte con la comunidad.",
    activities: [
      "Tomar fotografías y videos en actividades",
      "Diseñar piezas gráficas o contenido digital",
      "Apoyar la gestión de redes sociales"
    ],
    requirements: [
      "Conocimientos básicos en fotografía, video o diseño (según el rol)",
      "Creatividad y sentido estético",
      "Responsabilidad con el manejo de imagen institucional",
      "Compromiso con la misión de la fundación"
    ]
  }
];

