import { convertTo12Hour } from "../../../../../shared/utils/helpers/eventsHelper";
import { fixMojibake } from "../../../../../shared/utils/textEncoding";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";
const DEFAULT_EVENT_IMAGE = "/assets/images/EventsHero.webp";
const PUBLIC_EVENTS_ENDPOINT = "/events/public?limit=1000";

const normalizeText = (value) => {
  return String(fixMojibake(value) || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
};

const extractDate = (value) => {
  if (!value) return "";

  if (typeof value === "string" && value.includes("T")) {
    return value.split("T")[0];
  }

  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";

  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const normalizeType = (typeName) => {
  const normalized = normalizeText(typeName);

  if (normalized.includes("torneo")) return "torneo";
  if (normalized.includes("festival")) return "festival";
  if (normalized.includes("clausura")) return "clausura";
  if (normalized.includes("taller")) return "taller";

  return "todos";
};

const normalizeStatus = (status) => {
  const normalized = normalizeText(status);

  if (normalized.includes("cancel")) return "cancelado";
  if (normalized.includes("final")) return "finalizado";

  return "programado";
};

const extractSponsors = (event) => {
  if (Array.isArray(event?.ServiceSponsor)) {
    return event.ServiceSponsor
      .map((item) => fixMojibake(item?.Sponsor?.name))
      .filter(Boolean);
  }

  if (Array.isArray(event?.sponsors)) {
    return event.sponsors
      .map((item) => fixMojibake(item?.name || item?.nombre))
      .filter(Boolean);
  }

  return [];
};

const mapBackendEvent = (event) => {
  const startDate = extractDate(event.startDate || event.fechaInicio || event.date);
  const endDate = extractDate(event.endDate || event.fechaFin || event.endDate);
  const rawTime = event.startTime || event.horaInicio || event.time || "00:00";
  const mappedType = normalizeType(
    event?.type?.name || event?.ServiceType?.name || event?.type,
  );

  return {
    id: event.id,
    title: fixMojibake(event.name || event.nombre || "Evento"),
    type: mappedType,
    date: startDate,
    endDate: endDate || startDate,
    time: convertTo12Hour(rawTime),
    endTime: event.endTime || event.horaFin || null,
    location: fixMojibake(event.location || event.ubicacion || "Por confirmar"),
    description: fixMojibake(
      event.description ||
        event.descripcion ||
        "Proximamente mas informacion del evento.",
    ),
    image: event.imageUrl || event.imagen || DEFAULT_EVENT_IMAGE,
    status: normalizeStatus(event.status || event.estado),
    participants: event?._count?.participants || event.participants || 0,
    category: fixMojibake(
      event?.event_categories?.name ||
        event?.category?.name ||
        event?.type?.name ||
        event?.ServiceType?.name ||
        "Eventos",
    ),
    details: fixMojibake(
      event.details || event.description || event.descripcion || "",
    ),
    telefono: event.phone || event.telefono || "",
    patrocinadores: extractSponsors(event),
  };
};

const extractEventsArray = (payload) => {
  if (!payload) return [];

  if (Array.isArray(payload)) {
    return payload;
  }

  if (payload.success && Array.isArray(payload.data)) {
    return payload.data;
  }

  if (Array.isArray(payload.data)) {
    return payload.data;
  }

  return [];
};

const isPublishedEvent = (event) => {
  const status = normalizeStatus(event?.status || event?.estado);
  if (typeof event?.publish === "boolean") {
    return event.publish && status !== "cancelado";
  }
  return status !== "cancelado";
};

class LandingEventsService {
  async requestPublishedEvents() {
    const response = await fetch(`${API_BASE_URL}${PUBLIC_EVENTS_ENDPOINT}`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      throw new Error(payload?.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async getPublishedEvents() {
    const payload = await this.requestPublishedEvents();
    const sourceEvents = extractEventsArray(payload);

    return sourceEvents
      .filter(isPublishedEvent)
      .map(mapBackendEvent)
      .filter((event) => Boolean(event.date));
  }
}

export default new LandingEventsService();
