import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  FaArrowLeft,
  FaCloudUploadAlt,
  FaPlus,
  FaTrash,
  FaUser,
  FaCalendarAlt,
  FaDollarSign,
  FaBoxOpen,
  FaUtensils,
  FaInfoCircle,
  FaCheckCircle,
  FaFileAlt,
} from "react-icons/fa";
import donorsSponsorsService from "../DonorsSponsors/services/donorsSponsorsService";
import donationsService from "./services/donationsService";
import eventsService from "../../Events/services/eventsService";
import {
  showErrorAlert,
  showSuccessAlert,
} from "../../../../../../../shared/utils/alerts";

const STATUS_OPTIONS = [
  { value: "Recibida", label: "Recibida" },
  { value: "EnProceso", label: "En proceso" },
  { value: "Verificada", label: "Verificada" },
  { value: "Ejecutada", label: "Ejecutada" },
];

const DONATION_TYPE_OPTIONS = [
  { value: "ECONOMICA", apiType: "ECONOMICA", label: "Economica" },
  { value: "ESPECIE", apiType: "ESPECIE", label: "En especie" },
];

const DONATION_TYPE_MAP = DONATION_TYPE_OPTIONS.reduce((acc, option) => {
  acc[option.value] = option;
  return acc;
}, {});

const getTypeMeta = (typeValue) => DONATION_TYPE_MAP[typeValue] || null;

const CHANNELS = ["Transferencia", "Consignacion", "Nequi", "PSE", "Otro"];

const FOOD_CLASSES = ["Granos", "Proteinas", "Verduras", "Lacteos", "Otros"];
const DEFAULT_RECEPTION_METHOD = "Donacion directa";
const GOOD_CLASSES = [
  "Implementacion deportiva",
  "Nutricion e hidratacion",
  "Educacion y formacion",
  "Bienestar y salud",
  "Apoyo a las familias",
  "Arte y expresion",
  "Logistica y operacion",
  "Servicios profesionales",
  "Corporativa/Alianza",
  "Otros",
];

const PROGRAM_EVENT = "Organizacion de eventos y festivales";

const PROGRAMS = [
  "Escuelas deportivas",
  "Talleres de formacion integral",
  "Apoyo psicosocial",
  "Transporte y alimentacion",
  PROGRAM_EVENT,
  "Apoyo integral a las familias",
  "Becas para ninas",
  "Otros",
];

const getLocalDateTimeString = () => {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 16);
};

const formatNumber = (value) => {
  if (value === "" || value === null || value === undefined) return "";
  const num = Number(value);
  if (Number.isNaN(num)) return value;
  return num.toLocaleString("es-CO");
};

const DonationsForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const statusOnlyMode = Boolean(location.state?.statusOnly);
  const [donors, setDonors] = useState([]);
  const [loadingDonors, setLoadingDonors] = useState(false);
  const [materials, setMaterials] = useState([]);
  const [loadingMaterials, setLoadingMaterials] = useState(false);
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [eventsError, setEventsError] = useState("");
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingDonationId, setEditingDonationId] = useState(null);
  const [prefilledFromState, setPrefilledFromState] = useState(false);
  const [form, setForm] = useState({
    isFoodPurchase: false,
    donorSponsorId: "",
    type: "",
    status: "Recibida",
    program: "",
    eventId: "",
    specificDestination: "",
    donationAt: getLocalDateTimeString(),
    econAmount: "",
    econChannel: "",
    econComprobante: null,
    especieMaterialId: "",
    especieDesc: "",
    especieQty: "",
    especieClass: "",
    especieItems: [],
    especieSoporte: null,
    foodQty: "",
    foodClass: "",
    foodItems: [],
    foodFactura: null,
    foodEvidence: [],
  });
  useEffect(() => {
    const fetchDonors = async () => {
      setLoadingDonors(true);
      try {
        const resp = await donorsSponsorsService.getAll({
          limit: 100,
          status: "Activo",
        });
        const data = resp?.data || resp?.data?.data || [];
        const list = Array.isArray(data) ? data : resp?.data?.data || [];
        setDonors(list);
      } catch (error) {
        console.error("Error cargando donantes", error);
        showErrorAlert(
          "No se pudo cargar donantes/patrocinadores",
          "Revisa tu conexion o intenta mas tarde.",
        );
      } finally {
        setLoadingDonors(false);
      }
    };
    fetchDonors();
  }, []);

  useEffect(() => {
    const fetchMaterials = async () => {
      setLoadingMaterials(true);
      try {
        const MaterialsService = (
          await import("../../SportsMaterials/Materials/services/MaterialsService")
        ).default;
        const resp = await MaterialsService.getAllMaterials({
          estado: "Activo",
        });
        const data = resp?.data || [];
        setMaterials(data);
      } catch (error) {
        console.error("Error cargando materiales", error);
        showErrorAlert(
          "No se pudo cargar materiales",
          "Revisa tu conexion o intenta mas tarde.",
        );
      } finally {
        setLoadingMaterials(false);
      }
    };
    fetchMaterials();
  }, []);

  useEffect(() => {
    const donationState = location.state?.donation;
    if (!donationState || prefilledFromState) return;

    const paymentDetail = (donationState.details || []).find(
      (detail) => detail.recordType === "payment",
    );

    setIsEditing(Boolean(location.state?.isEditing));
    setEditingDonationId(donationState.id);
    setForm((prev) => ({
      ...prev,
      donorSponsorId: donationState.donorSponsorId
        ? String(donationState.donorSponsorId)
        : "",
      type: donationState.type || prev.type || "",
      status: donationState.status || prev.status,
      program: donationState.program || "",
      eventId: donationState.eventId ? String(donationState.eventId) : "",
      specificDestination: donationState.specificDestination || "",
      donationAt: donationState.donationAt || prev.donationAt,
      econAmount: donationState.econAmount ?? prev.econAmount,
      econChannel: donationState.econChannel ?? prev.econChannel,
      isFoodPurchase: donationState.isFoodPurchase ?? false,
      foodItems: donationState.foodItems || [],
      especieItems: donationState.especieItems || [],
    }));

    setPrefilledFromState(true);
  }, [location.state, prefilledFromState]);

  useEffect(() => {
    const shouldLoadEvents = form.program === PROGRAM_EVENT;
    if (!shouldLoadEvents) {
      setForm((prev) => (prev.eventId ? { ...prev, eventId: "" } : prev));
      return;
    }
    if (events.length > 0 || loadingEvents) return;

    const fetchEvents = async () => {
      setLoadingEvents(true);
      setEventsError("");
      try {
        const resp = await eventsService.getActiveEvents();
        const data = resp?.data || resp?.data?.data || resp?.events || [];
        const list = Array.isArray(data) ? data : resp?.data?.events || [];
        const active = list.filter((ev) => {
          const status = (ev.status || ev.estado || ev.state || "")
            .toString()
            .toLowerCase();
          return [
            "activo",
            "active",
            "programado",
            "programada",
            "programado",
          ].includes(status);
        });
        setEvents(active.length ? active : list);
      } catch (error) {
        console.error("Error cargando eventos activos", error);
        setEventsError("No se pudieron cargar los eventos activos.");
      } finally {
        setLoadingEvents(false);
      }
    };

    fetchEvents();
  }, [form.program, events.length, loadingEvents]);

  const handleChange = (field, value) => {
    if (statusOnlyMode && field !== "status") return;
    setForm((prev) => {
      const next = { ...prev, [field]: value };

      if (field === "type") {
        const typeMeta = getTypeMeta(value);
        if (!typeMeta || typeMeta.apiType !== "ECONOMICA") {
          next.isFoodPurchase = false;
        }

        if (!typeMeta || typeMeta.apiType !== "ESPECIE") {
          next.especieItems = [];
          next.especieDesc = "";
          next.especieQty = "";
          next.especieClass = "";
        }
      }

      if (field === "isFoodPurchase" && !value) {
        next.foodQty = "";
        next.foodClass = "";
        next.foodItems = [];
        next.foodFactura = null;
        next.foodEvidence = [];
      }

      return next;
    });
    setErrors((prev) => {
      const next = { ...prev, [field]: undefined };
      if (field === "type" || field.startsWith("especie")) {
        next.especieItems = undefined;
      }
      return next;
    });
  };

  const handleFile = (field, files) => {
    if (statusOnlyMode) return;
    setForm((prev) => ({ ...prev, [field]: files }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleAddEspecieItem = () => {
    if (statusOnlyMode) return;
    const entryErrors = {};

    if (!form.especieMaterialId) {
      entryErrors.especieMaterialId = "Selecciona el material donado.";
    }
    if (!form.especieQty || Number(form.especieQty) <= 0) {
      entryErrors.especieQty = "Cantidad requerida y mayor a 0.";
    }
    if (!form.especieClass) {
      entryErrors.especieClass = "Categoria de la donacion requerida.";
    }

    if (Object.keys(entryErrors).length > 0) {
      setErrors((prev) => ({ ...prev, ...entryErrors }));
      return;
    }

    // Buscar el material seleccionado para obtener su nombre
    const selectedMaterial = materials.find(
      (m) => m.id === Number(form.especieMaterialId),
    );

    setForm((prev) => ({
      ...prev,
      especieItems: [
        ...prev.especieItems,
        {
          materialId: prev.especieMaterialId,
          description:
            selectedMaterial?.nombre ||
            prev.especieDesc.trim() ||
            "Material donado",
          quantity: prev.especieQty,
          classification: prev.especieClass,
        },
      ],
      especieMaterialId: "",
      especieDesc: "",
      especieQty: "",
      especieClass: "",
    }));

    setErrors((prev) => ({
      ...prev,
      especieMaterialId: undefined,
      especieDesc: undefined,
      especieQty: undefined,
      especieClass: undefined,
      especieItems: undefined,
    }));
  };

  const handleRemoveEspecieItem = (index) => {
    if (statusOnlyMode) return;
    setForm((prev) => ({
      ...prev,
      especieItems: prev.especieItems.filter((_, idx) => idx !== index),
    }));
  };

  const handleAddFoodItem = () => {
    if (statusOnlyMode) return;
    const entryErrors = {};
    if (!form.foodQty || Number(form.foodQty) <= 0) {
      entryErrors.foodQty = "Cantidad requerida y mayor a 0.";
    }
    if (!form.foodClass) {
      entryErrors.foodClass = "Clasificacion del alimento requerida.";
    }

    if (Object.keys(entryErrors).length > 0) {
      setErrors((prev) => ({ ...prev, ...entryErrors }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      foodItems: [
        ...prev.foodItems,
        {
          quantity: prev.foodQty,
          classification: prev.foodClass,
        },
      ],
      foodQty: "",
      foodClass: "",
    }));

    setErrors((prev) => ({
      ...prev,
      foodQty: undefined,
      foodClass: undefined,
      foodItems: undefined,
    }));
  };

  const handleRemoveFoodItem = (index) => {
    if (statusOnlyMode) return;
    setForm((prev) => ({
      ...prev,
      foodItems: prev.foodItems.filter((_, idx) => idx !== index),
    }));
  };

  const validate = () => {
    if (statusOnlyMode) {
      if (!form.status) {
        setErrors({ status: "Selecciona el estado." });
        return false;
      }
      setErrors({});
      return true;
    }
    const newErrors = {};
    const selectedType = getTypeMeta(form.type);
    const isEconomic = selectedType?.apiType === "ECONOMICA";
    const isEspecie = selectedType?.apiType === "ESPECIE";
    const isFood = isEconomic && form.isFoodPurchase;
    const requiresEvent = form.program === PROGRAM_EVENT;

    if (!form.donorSponsorId) {
      newErrors.donorSponsorId = "Selecciona el donante o patrocinador.";
    }
    if (!form.donationAt) newErrors.donationAt = "Fecha y hora requeridas.";
    if (!form.type) newErrors.type = "Selecciona el tipo de donacion.";
    if (requiresEvent && !form.eventId) {
      newErrors.eventId = "Selecciona el evento activo.";
    }

    if (isEconomic) {
      if (!form.econAmount || Number(form.econAmount) <= 0)
        newErrors.econAmount = "Valor donado requerido y mayor a 0.";
      else if (Number(form.econAmount) > 999999999999)
        newErrors.econAmount = "El valor mÃ¡ximo permitido es $999,999,999,999.";
      if (!form.econChannel) newErrors.econChannel = "Canal de pago requerido.";
      if (!form.econComprobante)
        newErrors.econComprobante =
          "Adjunta el comprobante (PDF/JPG/PNG, 5MB).";
      if (isFood) {
        // Verificar si hay campos llenos sin agregar
        const hasPendingFoodItem =
          form.foodDesc?.trim() || form.foodQty || form.foodClass;

        if (!form.foodItems || form.foodItems.length === 0) {
          newErrors.foodItems = "Agrega al menos un item de alimentos.";
        } else if (hasPendingFoodItem) {
          newErrors.foodItems =
            "Tienes campos llenos. Presiona 'Agregar item' o borra los campos antes de guardar.";
        }

        if (!form.foodFactura)
          newErrors.foodFactura = "Factura obligatoria (PDF/JPG/PNG, 5MB).";
      }
    }

    if (isEspecie) {
      // Verificar si hay campos llenos sin agregar
      const hasPendingItem =
        (form.especieMaterialId && form.especieMaterialId !== "") ||
        (form.especieDesc?.trim() && form.especieDesc.trim() !== "") ||
        (form.especieQty && form.especieQty !== "") ||
        (form.especieClass && form.especieClass !== "");

      if (!form.especieItems || form.especieItems.length === 0) {
        newErrors.especieItems = "Debes agregar al menos un item en especie.";
      } else if (hasPendingItem) {
        newErrors.especieItems =
          "Tienes campos llenos. Presiona 'Agregar item' o borra los campos antes de guardar.";
      }

      if (!form.especieSoporte)
        newErrors.especieSoporte = "Soporte obligatorio (PDF/JPG/PNG, 5MB).";
    }

    const parsedDate = new Date(form.donationAt);
    if (Number.isNaN(parsedDate.getTime())) {
      newErrors.donationAt = "Fecha/hora invalida";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const buildPayload = () => {
    const details = [];
    const selectedType = getTypeMeta(form.type);
    const isEconomic = selectedType?.apiType === "ECONOMICA";
    const isEspecie = selectedType?.apiType === "ESPECIE";
    const isFood = isEconomic && form.isFoodPurchase;
    const apiType = isFood
      ? "ALIMENTOS"
      : selectedType?.apiType || form.type || "ECONOMICA";
    const donationDate = new Date(form.donationAt);

    if (isEconomic) {
      details.push({
        kind: apiType,
        recordType: "payment",
        amount: Number(form.econAmount),
        channel: form.econChannel,
      });
      if (isFood) {
        (form.foodItems || []).forEach((item) => {
          const quantityValue = Number(item.quantity);
          details.push({
            kind: apiType,
            recordType: "food",
            quantity: Number.isNaN(quantityValue) ? 0 : quantityValue,
            classification: item.classification,
          });
        });
      }
    }

    if (isEspecie) {
      (form.especieItems || []).forEach((item) => {
        const quantityValue = Number(item.quantity);
        details.push({
          kind: selectedType.apiType,
          recordType: "item",
          materialId: item.materialId ? Number(item.materialId) : undefined,
          description: item.description,
          quantity: Number.isNaN(quantityValue) ? 0 : quantityValue,
          classification: item.classification,
          channel: item.channel || DEFAULT_RECEPTION_METHOD,
        });
      });
    }

    const payload = {
      anonymous: false,
      type: apiType,
      status: form.status,
      donationAt: donationDate.toISOString(),
      details,
    };

    if (form.program) {
      payload.program = form.program;
    }

    const notesParts = [];
    if (form.program === PROGRAM_EVENT && form.eventId) {
      const evt =
        events.find((e) => String(e.id) === String(form.eventId)) || null;
      const eventLabel = evt?.name || evt?.nombre || `ID ${form.eventId}`;
      notesParts.push(`Evento: ${eventLabel}`);
    }
    if (form.specificDestination?.trim()) {
      notesParts.push(`Destino especifico: ${form.specificDestination.trim()}`);
    }
    if (notesParts.length) {
      payload.notes = notesParts.join(" | ");
    }

    const donorId = Number(form.donorSponsorId);
    if (donorId) {
      payload.donorSponsorId = donorId;
    }

    // Add serviceId if event is selected
    if (form.program === PROGRAM_EVENT && form.eventId) {
      payload.serviceId = Number(form.eventId);
    }

    return payload;
  };
  const uploadAllFiles = async (donationId) => {
    const uploads = [];
    const typeMeta = getTypeMeta(form.type);
    const isFood = typeMeta?.apiType === "ECONOMICA" && form.isFoodPurchase;

    if (form.econComprobante) {
      uploads.push(
        donationsService.uploadFiles(
          donationId,
          [form.econComprobante],
          "comprobante",
        ),
      );
    }

    if (form.especieSoporte) {
      uploads.push(
        donationsService.uploadFiles(
          donationId,
          [form.especieSoporte],
          "soporte",
        ),
      );
    }

    if (isFood && form.foodFactura) {
      uploads.push(
        donationsService.uploadFiles(donationId, [form.foodFactura], "factura"),
      );
    }

    if (isFood && form.foodEvidence && form.foodEvidence.length > 0) {
      uploads.push(
        donationsService.uploadFiles(
          donationId,
          Array.from(form.foodEvidence),
          "evidencia",
        ),
      );
    }

    return Promise.all(uploads);
  };

  const handleSubmit = async () => {
    if (!validate()) {
      showErrorAlert("Campos incompletos", "Revisa los campos obligatorios.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = buildPayload();

      const request = isEditing
        ? donationsService.update(editingDonationId, payload)
        : donationsService.create(payload);
      const resp = await request;

      const donationId =
        resp?.data?.id ||
        resp?.data?.data?.id ||
        (isEditing ? editingDonationId : null);

      if (donationId) {
        await uploadAllFiles(donationId);
      }

      showSuccessAlert(
        isEditing ? "DonaciÃ³n actualizada" : "DonaciÃ³n guardada",
        isEditing
          ? "Los cambios se guardaron correctamente."
          : "Se registrÃ³ la donaciÃ³n y sus soportes correctamente.",
      );
      navigate("/dashboard/donations");
    } catch (error) {
      console.error("Error completo:", error);
      console.error("Error guardando donacion", error?.response?.data || error);

      const firstErrorMsg =
        error?.response?.data?.errors?.[0]?.msg ||
        error?.response?.data?.errors?.[0]?.message;
      const apiMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        firstErrorMsg ||
        error.message ||
        "No se pudo registrar la donacion.";

      showErrorAlert("Error al guardar", apiMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const summary = useMemo(() => {
    const donorLabel =
      donors.find((d) => d.id === Number(form.donorSponsorId))?.nombre ||
      "Sin seleccionar";

    const selectedType = getTypeMeta(form.type);
    const isFood = selectedType?.apiType === "ECONOMICA" && form.isFoodPurchase;
    const typeLabel = selectedType
      ? isFood
        ? `${selectedType.label} (compra de alimentos)`
        : selectedType.label
      : "Sin seleccionar";
    const eventLabel =
      form.program === PROGRAM_EVENT && form.eventId
        ? events.find((e) => String(e.id) === String(form.eventId))?.name ||
          events.find((e) => String(e.id) === String(form.eventId))?.nombre ||
          `ID ${form.eventId}`
        : null;

    const general = [
      {
        label: "Codigo de donacion",
        value: "Se genera automaticamente al guardar",
      },
      { label: "Donante", value: donorLabel },
      { label: "Tipo", value: typeLabel },
      ...(eventLabel ? [{ label: "Evento", value: eventLabel }] : []),
      {
        label: "Estado",
        value:
          STATUS_OPTIONS.find((s) => s.value === form.status)?.label ||
          form.status,
      },
      { label: "Programa", value: form.program || "N/A" },
      { label: "Destino especifico", value: form.specificDestination || "N/A" },
      { label: "Fecha/Hora", value: form.donationAt },
    ];

    const details = [];
    const files = [];

    if (selectedType?.apiType === "ECONOMICA") {
      details.push(`Valor donado: $${formatNumber(form.econAmount) || "0"}`);
      details.push(`Canal de pago: ${form.econChannel || "N/A"}`);
      files.push(
        form.econComprobante
          ? `Comprobante listo: ${form.econComprobante.name}`
          : "Comprobante pendiente (se subira a Cloudinary)",
      );
      if (isFood) {
        (form.foodItems || []).forEach((item, index) => {
          const segments = [
            `Cantidad: ${item.quantity || "0"}`,
            `Clasificacion: ${item.classification || "N/A"}`,
          ]
            .filter(Boolean)
            .join(" Â· ");
          const prefix =
            (form.foodItems?.length || 0) > 1
              ? `Alimento ${index + 1}:`
              : "Alimento:";
          details.push(`${prefix} ${segments}`);
        });
        files.push(
          form.foodFactura
            ? `Factura lista: ${form.foodFactura.name}`
            : "Factura pendiente (se subira a Cloudinary)",
        );
        files.push(
          form.foodEvidence?.length
            ? `Evidencias listas: ${form.foodEvidence.length} archivo(s)`
            : "Evidencias pendientes (imagenes se subiran a Cloudinary)",
        );
      }
    }

    if (selectedType?.apiType === "ESPECIE") {
      (form.especieItems || []).forEach((item, index) => {
        const material = materials.find(
          (m) => m.id === Number(item.materialId),
        );
        const materialName =
          material?.nombre || item.description || "Material no especificado";

        const segments = [
          `Material: ${materialName}`,
          `Cantidad: ${item.quantity || "0"}`,
          item.classification ? `Categoria: ${item.classification}` : null,
          item.description && item.description !== materialName
            ? `DescripciÃ³n: ${item.description}`
            : null,
        ]
          .filter(Boolean)
          .join(" Â· ");
        const prefix =
          (form.especieItems?.length || 0) > 1
            ? `Item ${index + 1}:`
            : "Detalle:";
        details.push(`${prefix} ${segments}`);
      });
      files.push(
        form.especieSoporte
          ? `Soporte listo: ${form.especieSoporte.name}`
          : "Soporte pendiente (se subira a Cloudinary)",
      );
    }

    return { general, details, files };
  }, [form, donors, events, materials]);

  const selectedType = getTypeMeta(form.type);
  const isEconomicType = selectedType?.apiType === "ECONOMICA";
  const isEspecieType = selectedType?.apiType === "ESPECIE";

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen font-questrial">
      {/* Header mejorado */}
      <div className="flex items-center justify-between mb-6">
        <Link
          to="/dashboard/donations"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-gray-700 shadow-md hover:shadow-lg transition-all transform hover:scale-105"
        >
          <FaArrowLeft /> Regresar
        </Link>
        <div className="text-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-purple to-primary-blue bg-clip-text text-transparent">
            {isEditing ? "Editar DonaciÃ³n" : "Registrar Nueva DonaciÃ³n"}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {statusOnlyMode
              ? "Actualizar estado"
              : "Completa la informaciÃ³n requerida"}
          </p>
        </div>
        <div className="w-32"></div> {/* Spacer para centrar el tÃ­tulo */}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Formulario principal con diseÃ±o mejorado */}
        <div className="xl:col-span-2 space-y-6">
          {/* Card: InformaciÃ³n general */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-primary-purple to-primary-blue px-6 py-4">
              <div className="flex items-center gap-3 text-white">
                <div className="p-2 bg-white/20 rounded-lg">
                  <FaUser className="text-xl" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">InformaciÃ³n General</h2>
                  <p className="text-xs text-white/80">
                    Datos bÃ¡sicos de la donaciÃ³n
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 flex flex-col gap-5">
              <div className="flex flex-col order-2">
                <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <FaUser className="text-primary-purple" />
                  Donante / Patrocinador *
                </label>
                <select
                  value={form.donorSponsorId}
                  onChange={(e) =>
                    handleChange("donorSponsorId", e.target.value)
                  }
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary-purple focus:ring-2 focus:ring-primary-purple/20 transition-all"
                  disabled={statusOnlyMode}
                >
                  <option value="">
                    {loadingDonors ? "Cargando..." : "Seleccionar donante..."}
                  </option>
                  {donors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.nombre}
                    </option>
                  ))}
                </select>
                {errors.donorSponsorId && (
                  <span className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                    <FaInfoCircle /> {errors.donorSponsorId}
                  </span>
                )}
              </div>

              <div className="flex flex-col order-1">
                <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <FaBoxOpen className="text-primary-purple" />
                  Tipo de donaciÃ³n *
                </label>
                <div className="grid md:grid-cols-2 gap-4">
                  {DONATION_TYPE_OPTIONS.map((option) => (
                    <label
                      key={option.value}
                      className={`flex items-center gap-3 px-4 py-3 border-2 rounded-xl cursor-pointer transition-all transform hover:scale-105 ${
                        form.type === option.value
                          ? "border-primary-purple bg-gradient-to-br from-primary-purple/10 to-primary-blue/10 shadow-md"
                          : "border-gray-200 hover:border-primary-purple/50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="type"
                        value={option.value}
                        checked={form.type === option.value}
                        onChange={(e) => handleChange("type", e.target.value)}
                        disabled={statusOnlyMode}
                        className="w-4 h-4 text-primary-purple"
                      />
                      <span className="text-sm font-medium">
                        {option.label}
                      </span>
                    </label>
                  ))}
                </div>
                {errors.type && (
                  <span className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                    <FaInfoCircle /> {errors.type}
                  </span>
                )}
                {isEconomicType && (
                  <label className="flex items-center gap-2 text-sm text-gray-600 mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <input
                      type="checkbox"
                      checked={form.isFoodPurchase}
                      onChange={(e) =>
                        handleChange("isFoodPurchase", e.target.checked)
                      }
                      disabled={statusOnlyMode}
                      className="w-4 h-4 text-primary-blue rounded"
                    />
                    <FaUtensils className="text-primary-blue" />
                    Esta donaciÃ³n econÃ³mica es para compra de alimentos
                  </label>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-4 order-4">
                <div className="flex flex-col order-4">
                  <label className="text-sm font-semibold text-gray-700 mb-2">
                    Programa / Destino
                  </label>
                  <select
                    value={form.program}
                    onChange={(e) => handleChange("program", e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary-purple focus:ring-2 focus:ring-primary-purple/20 transition-all"
                    disabled={statusOnlyMode}
                  >
                    <option value="">Seleccionar...</option>
                    {PROGRAMS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col order-6">
                  <label className="text-sm font-semibold text-gray-700 mb-2">
                    Destino especÃ­fico (opcional)
                  </label>
                  <input
                    type="text"
                    value={form.specificDestination}
                    onChange={(e) =>
                      handleChange("specificDestination", e.target.value)
                    }
                    placeholder="Ej: Becas para niÃ±as..."
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary-purple focus:ring-2 focus:ring-primary-purple/20 transition-all"
                    disabled={statusOnlyMode}
                  />
                </div>
              </div>

              {form.program === PROGRAM_EVENT && (
                <div className="flex flex-col p-4 bg-purple-50 rounded-xl border border-purple-200 order-5">
                  <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <FaCalendarAlt className="text-primary-purple" />
                    Evento (activo) *
                  </label>
                  <select
                    value={form.eventId}
                    onChange={(e) => handleChange("eventId", e.target.value)}
                    className="w-full border-2 border-purple-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary-purple focus:ring-2 focus:ring-primary-purple/20 transition-all"
                    disabled={loadingEvents || statusOnlyMode}
                  >
                    <option value="">
                      {loadingEvents
                        ? "Cargando eventos..."
                        : "Seleccionar evento"}
                    </option>
                    {events.map((ev) => (
                      <option key={ev.id} value={ev.id}>
                        {ev.name || ev.nombre || `Evento ${ev.id}`}
                      </option>
                    ))}
                  </select>
                  {eventsError && (
                    <span className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                      <FaInfoCircle /> {eventsError}
                    </span>
                  )}
                  {errors.eventId && (
                    <span className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                      <FaInfoCircle /> {errors.eventId}
                    </span>
                  )}
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4 order-3">
                <div className="flex flex-col order-3">
                  <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <FaCalendarAlt className="text-primary-purple" />
                    Fecha y hora de donaciÃ³n *
                  </label>
                  <input
                    type="datetime-local"
                    value={form.donationAt}
                    onChange={(e) => handleChange("donationAt", e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary-purple focus:ring-2 focus:ring-primary-purple/20 transition-all"
                    disabled={statusOnlyMode}
                  />
                  {errors.donationAt && (
                    <span className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                      <FaInfoCircle /> {errors.donationAt}
                    </span>
                  )}
                </div>

                <div className="flex flex-col order-7">
                  <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <FaCheckCircle className="text-primary-purple" />
                    Estado *
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) => handleChange("status", e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary-purple focus:ring-2 focus:ring-primary-purple/20 transition-all"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
          {/* Card: DonaciÃ³n econÃ³mica */}
          {isEconomicType && (
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-4">
                <div className="flex items-center gap-3 text-white">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <FaDollarSign className="text-xl" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">
                      DonaciÃ³n EconÃ³mica
                    </h3>
                    <p className="text-xs text-white/80">
                      Detalles del aporte monetario
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-5">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <FaDollarSign className="text-green-600" />
                      Valor donado *
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">
                        $
                      </span>
                      <input
                        type="number"
                        min="0"
                        max="999999999999"
                        step="0.01"
                        value={form.econAmount}
                        onChange={(e) =>
                          handleChange("econAmount", e.target.value)
                        }
                        className="w-full border-2 border-gray-200 rounded-xl pl-8 pr-4 py-3 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                        disabled={statusOnlyMode}
                        placeholder="1000000"
                      />
                    </div>
                    {errors.econAmount && (
                      <span className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                        <FaInfoCircle /> {errors.econAmount}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col">
                    <label className="text-sm font-semibold text-gray-700 mb-2">
                      Canal de pago *
                    </label>
                    <select
                      value={form.econChannel}
                      onChange={(e) =>
                        handleChange("econChannel", e.target.value)
                      }
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                      disabled={statusOnlyMode}
                    >
                      <option value="">Seleccionar canal...</option>
                      {CHANNELS.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                    {errors.econChannel && (
                      <span className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                        <FaInfoCircle /> {errors.econChannel}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col">
                  <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <FaFileAlt className="text-green-600" />
                    Comprobante de pago *
                  </label>
                  <label
                    className={`flex items-center justify-center gap-3 px-6 py-4 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                      statusOnlyMode
                        ? "opacity-60 pointer-events-none bg-gray-50"
                        : form.econComprobante
                          ? "border-green-500 bg-green-50 text-green-700"
                          : "border-gray-300 hover:border-green-500 hover:bg-green-50 text-gray-600"
                    }`}
                  >
                    <FaCloudUploadAlt className="text-2xl" />
                    <div className="text-center">
                      <span className="text-sm font-medium block">
                        {form.econComprobante?.name || "Adjuntar comprobante"}
                      </span>
                      <span className="text-xs text-gray-500">
                        PDF, JPG o PNG (mÃ¡x. 5MB)
                      </span>
                    </div>
                    <input
                      type="file"
                      accept=".pdf,image/jpeg,image/png"
                      className="hidden"
                      onChange={(e) =>
                        handleFile("econComprobante", e.target.files[0])
                      }
                      disabled={statusOnlyMode}
                    />
                  </label>
                  {errors.econComprobante && (
                    <span className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                      <FaInfoCircle /> {errors.econComprobante}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Card: DonaciÃ³n en especie */}
          {isEspecieType && (
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-4">
                <div className="flex items-center gap-3 text-white">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <FaBoxOpen className="text-xl" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">
                        DonaciÃ³n en Especie
                      </h3>
                      <p className="text-xs text-white/80">
                        Bienes y materiales donados
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 flex flex-col gap-5">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <p className="text-sm text-blue-800 flex items-start gap-2">
                    <FaInfoCircle className="mt-0.5 flex-shrink-0" />
                    <span>
                      Completa la informaciÃ³n de cada bien y presiona "Agregar"
                      para incluirlo en la donaciÃ³n.
                    </span>
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <label className="text-sm font-semibold text-gray-700 mb-2">
                      Material donado *
                    </label>
                    <select
                      value={form.especieMaterialId}
                      onChange={(e) =>
                        handleChange("especieMaterialId", e.target.value)
                      }
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                      disabled={statusOnlyMode}
                    >
                      <option value="">
                        {loadingMaterials
                          ? "Cargando materiales..."
                          : "Seleccionar material..."}
                      </option>
                      {materials.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.nombre} - {m.categoria}
                        </option>
                      ))}
                    </select>
                    {errors.especieMaterialId && (
                      <span className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                        <FaInfoCircle /> {errors.especieMaterialId}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col">
                    <label className="text-sm font-semibold text-gray-700 mb-2">
                      Cantidad *
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={form.especieQty}
                      onChange={(e) =>
                        handleChange("especieQty", e.target.value)
                      }
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                      disabled={statusOnlyMode}
                      placeholder="Ej: 10"
                    />
                    {errors.especieQty && (
                      <span className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                        <FaInfoCircle /> {errors.especieQty}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col">
                  <label className="text-sm font-semibold text-gray-700 mb-2">
                    CategorÃ­a de la donaciÃ³n *
                  </label>
                  <select
                    value={form.especieClass}
                    onChange={(e) =>
                      handleChange("especieClass", e.target.value)
                    }
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                    disabled={statusOnlyMode}
                  >
                    <option value="">Seleccionar categorÃ­a...</option>
                    {GOOD_CLASSES.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                  {errors.especieClass && (
                    <span className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                      <FaInfoCircle /> {errors.especieClass}
                    </span>
                  )}
                </div>

                <div className="flex flex-col">
                  <label className="text-sm font-semibold text-gray-700 mb-2">
                    DescripciÃ³n adicional (opcional)
                  </label>
                  <textarea
                    rows="3"
                    value={form.especieDesc}
                    onChange={(e) =>
                      handleChange("especieDesc", e.target.value)
                    }
                    placeholder="Ej: Balones profesionales marca Adidas, talla 5"
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 resize-none transition-all"
                    disabled={statusOnlyMode}
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleAddEspecieItem}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={statusOnlyMode}
                  >
                    <FaPlus /> Agregar item
                  </button>
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <FaFileAlt className="text-orange-600" />
                    Soporte *
                  </label>
                  <label
                    className={`flex items-center justify-center gap-3 px-6 py-4 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                      statusOnlyMode
                        ? "opacity-60 pointer-events-none bg-gray-50"
                        : form.especieSoporte
                          ? "border-orange-500 bg-orange-50 text-orange-700"
                          : "border-gray-300 hover:border-orange-500 hover:bg-orange-50 text-gray-600"
                    }`}
                  >
                    <FaCloudUploadAlt className="text-2xl" />
                    <div className="text-center">
                      <span className="text-sm font-medium block">
                        {form.especieSoporte?.name || "Adjuntar soporte"}
                      </span>
                      <span className="text-xs text-gray-500">
                        PDF, JPG o PNG (mÃ¡x. 5MB)
                      </span>
                    </div>
                    <input
                      type="file"
                      accept=".pdf,image/jpeg,image/png"
                      className="hidden"
                      onChange={(e) =>
                        handleFile("especieSoporte", e.target.files[0])
                      }
                      disabled={statusOnlyMode}
                    />
                  </label>
                  {errors.especieSoporte && (
                    <span className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                      <FaInfoCircle /> {errors.especieSoporte}
                    </span>
                  )}
                </div>

                {errors.especieItems && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <p className="text-red-700 text-sm flex items-center gap-2">
                      <FaInfoCircle /> {errors.especieItems}
                    </p>
                  </div>
                )}

                {form.especieItems.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <FaCheckCircle className="text-green-600" />
                      Items agregados ({form.especieItems.length})
                    </h4>
                    {form.especieItems.map((item, index) => (
                      <div
                        key={`${item.description}-${index}`}
                        className="flex items-center justify-between gap-4 p-4 rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 shadow-sm"
                      >
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-500 text-white text-xs">
                              {index + 1}
                            </span>
                            {item.description}
                          </p>
                          <p className="text-xs text-gray-600 mt-1 ml-8">
                            Cantidad:{" "}
                            <span className="font-semibold">
                              {item.quantity || "0"}
                            </span>{" "}
                            Â· CategorÃ­a:{" "}
                            <span className="font-semibold">
                              {item.classification || "Sin clasificaciÃ³n"}
                            </span>
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveEspecieItem(index)}
                          className="p-2.5 text-red-500 hover:bg-red-100 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={statusOnlyMode}
                          aria-label="Eliminar entrada"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Card: Compra de alimentos */}
          {isEconomicType && form.isFoodPurchase && (
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-4">
                <div className="flex items-center gap-3 text-white">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <FaUtensils className="text-xl" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">
                        Compra de Alimentos
                      </h3>
                      <p className="text-xs text-white/80">
                        Detalle de alimentos adquiridos
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 flex flex-col gap-5">
                <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-4">
                  <p className="text-sm text-cyan-800 flex items-start gap-2">
                    <FaInfoCircle className="mt-0.5 flex-shrink-0" />
                    <span>
                      Agrega los detalles de cada tipo de alimento, la factura y
                      evidencias fotogrÃ¡ficas.
                    </span>
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <label className="text-sm font-semibold text-gray-700 mb-2">
                      Cantidad de alimentos *
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={form.foodQty}
                      onChange={(e) => handleChange("foodQty", e.target.value)}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                      disabled={statusOnlyMode}
                      placeholder="Ej: 50"
                    />
                    {errors.foodQty && (
                      <span className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                        <FaInfoCircle /> {errors.foodQty}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <label className="text-sm font-semibold text-gray-700 mb-2">
                      ClasificaciÃ³n *
                    </label>
                    <select
                      value={form.foodClass}
                      onChange={(e) =>
                        handleChange("foodClass", e.target.value)
                      }
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                      disabled={statusOnlyMode}
                    >
                      <option value="">Seleccionar clasificaciÃ³n...</option>
                      {FOOD_CLASSES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                    {errors.foodClass && (
                      <span className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                        <FaInfoCircle /> {errors.foodClass}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleAddFoodItem}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={statusOnlyMode}
                  >
                    <FaPlus /> Agregar item
                  </button>
                </div>
                {errors.foodItems && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <p className="text-red-700 text-sm flex items-center gap-2">
                      <FaInfoCircle /> {errors.foodItems}
                    </p>
                  </div>
                )}

                {form.foodItems.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <FaCheckCircle className="text-green-600" />
                      Alimentos agregados ({form.foodItems.length})
                    </h4>
                    {form.foodItems.map((item, index) => (
                      <div
                        key={`${item.classification}-${index}`}
                        className="flex items-center justify-between gap-4 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 shadow-sm"
                      >
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-500 text-white text-xs">
                              {index + 1}
                            </span>
                            {item.classification}
                          </p>
                          <p className="text-xs text-gray-600 mt-1 ml-8">
                            Cantidad:{" "}
                            <span className="font-semibold">
                              {item.quantity || "0"}
                            </span>
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveFoodItem(index)}
                          className="p-2.5 text-red-500 hover:bg-red-100 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={statusOnlyMode}
                          aria-label="Eliminar alimento"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex flex-col">
                  <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <FaFileAlt className="text-blue-600" />
                    Factura *
                  </label>
                  <label
                    className={`flex items-center justify-center gap-3 px-6 py-4 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                      statusOnlyMode
                        ? "opacity-60 pointer-events-none bg-gray-50"
                        : form.foodFactura
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-300 hover:border-blue-500 hover:bg-blue-50 text-gray-600"
                    }`}
                  >
                    <FaCloudUploadAlt className="text-2xl" />
                    <div className="text-center">
                      <span className="text-sm font-medium block">
                        {form.foodFactura?.name || "Adjuntar factura"}
                      </span>
                      <span className="text-xs text-gray-500">
                        PDF, JPG o PNG (mÃ¡x. 5MB)
                      </span>
                    </div>
                    <input
                      type="file"
                      accept=".pdf,image/jpeg,image/png"
                      className="hidden"
                      onChange={(e) =>
                        handleFile("foodFactura", e.target.files[0])
                      }
                      disabled={statusOnlyMode}
                    />
                  </label>
                  {errors.foodFactura && (
                    <span className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                      <FaInfoCircle /> {errors.foodFactura}
                    </span>
                  )}
                </div>

                <div className="flex flex-col">
                  <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <FaFileAlt className="text-blue-600" />
                    Evidencia fotogrÃ¡fica (opcional)
                  </label>
                  <label
                    className={`flex items-center justify-center gap-3 px-6 py-4 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                      statusOnlyMode
                        ? "opacity-60 pointer-events-none bg-gray-50"
                        : form.foodEvidence?.length
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-300 hover:border-blue-500 hover:bg-blue-50 text-gray-600"
                    }`}
                  >
                    <FaCloudUploadAlt className="text-2xl" />
                    <div className="text-center">
                      <span className="text-sm font-medium block">
                        {form.foodEvidence?.length
                          ? `${form.foodEvidence.length} archivo(s) seleccionado(s)`
                          : "Adjuntar evidencias"}
                      </span>
                      <span className="text-xs text-gray-500">
                        JPG o PNG (mÃ¡x. 5MB c/u)
                      </span>
                    </div>
                    <input
                      type="file"
                      accept="image/jpeg,image/png"
                      multiple
                      className="hidden"
                      onChange={(e) =>
                        handleFile("foodEvidence", e.target.files)
                      }
                      disabled={statusOnlyMode}
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Botones de acciÃ³n */}
          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate("/dashboard/donations")}
              className="px-6 py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition-all transform hover:scale-105 disabled:opacity-50"
              disabled={submitting}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-primary-purple to-primary-blue text-white font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Guardando...
                </>
              ) : (
                <>
                  <FaCheckCircle />
                  Guardar donaciÃ³n
                </>
              )}
            </button>
          </div>
        </div>

        {/* Panel de resumen mejorado */}
        <aside className="space-y-6">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden sticky top-6">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 px-6 py-4">
              <div className="flex items-center gap-3 text-white">
                <div className="p-2 bg-white/20 rounded-lg">
                  <FaInfoCircle className="text-xl" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Resumen</h3>
                  <p className="text-xs text-white/80">
                    Vista previa de la donaciÃ³n
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
              {/* InformaciÃ³n general */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-2">
                  <FaUser className="text-primary-purple" />
                  InformaciÃ³n General
                </h4>
                {summary.general.map((item) => (
                  <div key={item.label} className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">{item.label}</p>
                    <p className="text-sm font-medium text-gray-800 break-words">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Detalles */}
              {summary.details.length > 0 && (
                <div className="space-y-3 pt-4 border-t">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-2">
                    <FaBoxOpen className="text-primary-purple" />
                    Detalles
                  </h4>
                  <ul className="space-y-2">
                    {summary.details.map((d, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2 text-sm text-gray-700 bg-blue-50 rounded-lg p-3"
                      >
                        <span className="text-primary-blue mt-0.5">â€¢</span>
                        <span className="flex-1">{d}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Archivos */}
              {summary.files.length > 0 && (
                <div className="space-y-3 pt-4 border-t">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-2">
                    <FaFileAlt className="text-primary-purple" />
                    Archivos
                  </h4>
                  <div className="space-y-2">
                    {summary.files.map((f, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2 text-xs bg-green-50 rounded-lg p-3"
                      >
                        <FaCheckCircle className="text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-green-700 flex-1">{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Estado de completitud */}
              <div className="pt-4 border-t">
                <div className="bg-gradient-to-r from-primary-purple/10 to-primary-blue/10 rounded-lg p-4 border border-primary-purple/20">
                  <p className="text-xs text-gray-600 text-center">
                    {Object.keys(errors).length === 0
                      ? "âœ“ Formulario completo y listo para guardar"
                      : `âš  ${Object.keys(errors).length} campo(s) requieren atenciÃ³n`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default DonationsForm;
