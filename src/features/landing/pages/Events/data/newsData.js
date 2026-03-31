const extractGoogleDriveFileId = (url) => {
  if (!url) return "";

  const match = String(url).match(/\/d\/([^/]+)/);
  return match?.[1] || "";
};

const driveImage = (url, size = "w1600") => {
  const fileId = extractGoogleDriveFileId(url);
  return fileId
    ? `https://drive.google.com/thumbnail?id=${fileId}&sz=${size}`
    : url;
};

export const eventsBannerImage = "/assets/images/News/Banner_news_events.png";

export const newsItems = [
  {
    id: "noticia-1",
    title:
      "UN 2026 QUE SE CONSTRUYE EN EQUIPO: TIENDAS ARA SIGUE APOYANDO NUESTRA MISIÓN.",
    description:
      "La Fundación Manuela Vanegas inicia el 2026 con una gran noticia: Tiendas Ara reafirma su compromiso social y continuará siendo un aliado estratégico en el fortalecimiento de nuestros procesos formativos y deportivos durante este año. Gracias a este valioso respaldo, la fundación podrá seguir impactando de manera positiva a niños, niñas y jóvenes, promoviendo espacios de formación basados en el amor, la disciplina y el respeto. El apoyo de Tiendas Ara no solo representa un impulso para nuestros proyectos, sino también una muestra clara de confianza en nuestra misión y en el trabajo que día a día realizamos con la comunidad.",
    images: [
      "/assets/images/News/31.webp",
      "/assets/images/News/32.webp",
    ],
  },
  {
    id: "noticia-2",
    title: "DOS MISIONES, UN PROPÓSITO: TRANSFORMAR LA VIDA DE LOS JÓVENES.",
    description:
      "¡Buenas noticias! La Fundación Manuela Vanegas y la Fundación Da Alegría unen sus misiones para potenciar el bienestar, la formación y el desarrollo integral de los jóvenes en Colombia. Una alianza que nace del compromiso de transformar realidades y abrir caminos donde la alegría, las oportunidades y los sueños puedan crecer.",
    images: [
      "/assets/images/News/33.webp",
      "/assets/images/News/34.webp",
    ],
  },
  {
    id: "noticia-3",
    title:
      "FUNDACIÓN MANUELA VANEGAS Y FUNDACIÓN PAULA CRISTINA SE UNEN EN LA PREVENCIÓN DEL ABUSO SEXUAL INFANTIL.",
    description:
      "La Fundación Manuela Vanegas anuncia una nueva alianza con la Fundación Paula Cristina, con el propósito de fortalecer la prevención del abuso sexual infantil dentro de nuestros procesos formativos. En el marco de esta iniciativa se desarrollarán tres talleres pedagógicos, liderados por una psicóloga y trabajadoras sociales, enfocados en la prevención, la identificación de señales de alerta y el fortalecimiento de entornos seguros para nuestros niños, niñas y sus familias. Con esta alianza reafirmamos nuestro compromiso con la formación integral, entendiendo que el deporte también es un espacio de protección, cuidado y construcción de valores.",
    images: [
      "/assets/images/News/35.webp",
      "/assets/images/News/36.webp",
    ],
  },
];

export const previewEvents = [
  {
    id: "preview-convocatoria-2026",
    title: "CONVOCATORIA 2026, PARA BENEFICIARIAS",
    date: "2026-02-01",
    endDate: "2026-12-31",
    time:
      "Martes y viernes de 8 am a 9:30 am y Miércoles y jueves de 5:30 pm a 7:00 pm",
    location: "Unidad Deportiva Cristo Rey, Copacabana, Antioquia",
    description:
      "Invitamos a niñas y jóvenes de 5 a 17 años apasionadas por el fútbol a formarse en la Fundación Manuela Vanegas, donde podrán desarrollar su talento, crecer integralmente y aprender valores como la disciplina, el respeto y el trabajo en equipo. Te esperamos.",
    image: driveImage(
      "https://drive.google.com/file/d/1YQczxwdOyJtQeK47L4iTIb6SS4jEOc46/view?usp=drivesdk",
    ),
  },
  {
    id: "preview-festival-2026",
    title: "QUINTO FESTIVAL MANUELA VANEGAS",
    date: "2026-08-10",
    endDate: "2026-08-10",
    time: "10:00 am a 5:00 pm",
    location: "UNIDAD DEPORTIVA IDEM, COPACABANA",
    description:
      "Te invitamos a vivir la quinta edición de nuestro festival, ven y comparte con tu familia mil experiencias inolvidables, tendremos actividades, juegos y muchos premios para ti. Apoyemos juntos la comunidad.",
    image: driveImage(
      "https://drive.google.com/file/d/1_yoeM_LsZTspjsw1ta4B1D-BGwzuT06n/view?usp=drivesdk",
    ),
  },
  {
    id: "preview-clausura-2026",
    title: "CLAUSURA 2026, FUNDACIÓN MANUELA VANEGAS",
    date: "2026-12-22",
    endDate: "2026-12-22",
    time: "10:00 am a 5:00 pm",
    location: "El Castillo de Santa Marta, Vereda el Limonar, Copacabana.",
    description:
      "Los años más grandes y retadores se cierran con broche de oro, ven y comparte con nosotros un día muy especial, vivirás un día inolvidable con premios y actividades.",
    image: driveImage(
      "https://drive.google.com/file/d/17hywBq8disGtecv3lL5zZFCzR1XyEdTe/view?usp=drivesdk",
    ),
  },
];
