
import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaArrowLeft, FaCloudUploadAlt, FaPlus, FaTrash } from "react-icons/fa";
import donorsSponsorsService from "../DonorsSponsors/services/donorsSponsorsService";
import donationsService from "./services/donationsService";
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

const DONATION_TYPES = {
  ECONOMICA: "Economica",
  ESPECIE: "En Especie",
};

const CHANNELS = ["Transferencia", "Consignacion", "Nequi", "PSE", "Otro"];

const RECEPTION_METHODS = [
  "Acta de entrega",
  "Contrato de donacion",
  "Convenio publico",
  "Donacion directa",
];

const CUSTOM_METHOD_OPTION = "__CUSTOM_METHOD__";

const FOOD_CLASSES = ["Granos", "Proteinas", "Verduras", "Lacteos", "Otros"];
const GOOD_CLASSES = [
  "Alimentos",
  "Implemento deportivo",
  "Ropa",
  "Suplementos",
  "Otros",
];

const PROGRAMS = [
  "Nutricion",
  "Formacion deportiva",
  "Educacion y becas",
  "Salud y bienestar",
  "Apoyo psicosocial",
  "Otros",
];

const formatNumber = (value) => {
  if (value === "" || value === null || value === undefined) return "";
  const num = Number(value);
  if (Number.isNaN(num)) return value;
  return num.toLocaleString("es-CO");
};

const DonationsForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [donors, setDonors] = useState([]);
  const [loadingDonors, setLoadingDonors] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingDonationId, setEditingDonationId] = useState(null);
  const [prefilledFromState, setPrefilledFromState] = useState(false);
  const [customReceptionMethods, setCustomReceptionMethods] = useState([]);
  const [isMethodModalOpen, setIsMethodModalOpen] = useState(false);
  const [methodModalValue, setMethodModalValue] = useState("");
  const [methodModalError, setMethodModalError] = useState("");

  const [form, setForm] = useState({
    anonymous: false,
    isFoodPurchase: false,
    donorSponsorId: "",
    type: "ECONOMICA",
    status: "Recibida",
    program: "",
    donationAt: new Date().toISOString().slice(0, 16),
    notes: "",
    econAmount: "",
    econChannel: "",
    econComprobante: null,
    especieDesc: "",
    especieQty: "",
    especieClass: "",
    especieMethod: "",
    especieItems: [],
    especieSoporte: null,
    foodQty: "",
    foodClass: "",
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
          "Revisa tu conexion o intenta mas tarde."
        );
      } finally {
        setLoadingDonors(false);
      }
    };
    fetchDonors();
  }, []);

  useEffect(() => {
    const donationState = location.state?.donation;
    if (!donationState || prefilledFromState) return;

    setIsEditing(Boolean(location.state?.isEditing));
    setEditingDonationId(donationState.id);
    setForm((prev) => ({
      ...prev,
      anonymous: donationState.anonymous ?? false,
      donorSponsorId: donationState.donorSponsorId
        ? String(donationState.donorSponsorId)
        : "",
      type: donationState.type || prev.type,
      status: donationState.status || prev.status,
      program: donationState.program || "",
      donationAt: donationState.donationAt || prev.donationAt,
      econAmount: donationState.econAmount ?? prev.econAmount,
      econChannel: donationState.econChannel ?? prev.econChannel,
      isFoodPurchase: donationState.isFoodPurchase ?? false,
      foodQty: donationState.foodQty ?? "",
      foodClass: donationState.foodClass ?? "",
      especieItems: donationState.especieItems || [],
    }));

    const customMethods = (donationState.especieItems || [])
      .map((item) => item.method)
      .filter((method) => method && !RECEPTION_METHODS.includes(method));

    if (customMethods.length) {
      setCustomReceptionMethods((prev) => {
        const next = [...prev];
        customMethods.forEach((method) => {
          if (!next.includes(method)) next.push(method);
        });
        return next;
      });
    }

    setPrefilledFromState(true);
  }, [location.state, prefilledFromState]);

  const handleChange = (field, value) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value };

      if (field === "type" && value !== "ECONOMICA") {
        next.isFoodPurchase = false;
      }

      if (field === "type" && value !== "ESPECIE") {
        next.especieItems = [];
        next.especieDesc = "";
        next.especieQty = "";
        next.especieClass = "";
        next.especieMethod = "";
      }

      if (field === "isFoodPurchase" && !value) {
        next.foodQty = "";
        next.foodClass = "";
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
    setForm((prev) => ({ ...prev, [field]: files }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleAddEspecieItem = () => {
    const entryErrors = {};
    if (!form.especieDesc?.trim()) {
      entryErrors.especieDesc = "Descripcion del bien requerida.";
    }
    if (!form.especieQty || Number(form.especieQty) <= 0) {
      entryErrors.especieQty = "Cantidad requerida y mayor a 0.";
    }
    if (!form.especieClass) {
      entryErrors.especieClass = "Clasificacion del bien requerida.";
    }

    if (Object.keys(entryErrors).length > 0) {
      setErrors((prev) => ({ ...prev, ...entryErrors }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      especieItems: [
        ...prev.especieItems,
        {
          description: prev.especieDesc.trim(),
          quantity: prev.especieQty,
          classification: prev.especieClass,
          method: prev.especieMethod,
        },
      ],
      especieDesc: "",
      especieQty: "",
      especieClass: "",
      especieMethod: "",
    }));

    setErrors((prev) => ({
      ...prev,
      especieDesc: undefined,
      especieQty: undefined,
      especieClass: undefined,
      especieMethod: undefined,
      especieItems: undefined,
    }));
  };

  const handleRemoveEspecieItem = (index) => {
    setForm((prev) => ({
      ...prev,
      especieItems: prev.especieItems.filter((_, idx) => idx !== index),
    }));
  };

  const handleMethodSelection = (value) => {
    if (value === CUSTOM_METHOD_OPTION) {
      setIsMethodModalOpen(true);
      return;
    }

    handleChange("especieMethod", value);
  };

  const handleSaveCustomMethod = () => {
    const trimmed = methodModalValue.trim();
    if (!trimmed) {
      setMethodModalError("Ingresa el nombre del metodo.");
      return;
    }

    setCustomReceptionMethods((prev) => {
      if (prev.includes(trimmed)) {
        return prev;
      }
      return [...prev, trimmed];
    });
    setForm((prev) => ({
      ...prev,
      especieMethod: trimmed,
    }));
    setMethodModalValue("");
    setMethodModalError("");
    setIsMethodModalOpen(false);
    setErrors((prev) => ({ ...prev, especieMethod: undefined }));
  };

  const handleCloseMethodModal = () => {
    setIsMethodModalOpen(false);
    setMethodModalValue("");
    setMethodModalError("");
  };

  const validate = () => {
    const newErrors = {};

    if (!form.anonymous && !form.donorSponsorId) {
      newErrors.donorSponsorId = "Selecciona el donante o marca anonimo.";
    }
    if (!form.donationAt) newErrors.donationAt = "Fecha y hora requeridas.";
    if (!form.type) newErrors.type = "Selecciona el tipo de donacion.";

    const isFood = form.type === "ECONOMICA" && form.isFoodPurchase;

    if (form.type === "ECONOMICA") {
      if (!form.econAmount || Number(form.econAmount) <= 0)
        newErrors.econAmount = "Valor donado requerido y mayor a 0.";
      if (!form.econChannel) newErrors.econChannel = "Canal de pago requerido.";
      if (!form.econComprobante)
        newErrors.econComprobante = "Adjunta el comprobante (PDF/JPG/PNG, 5MB).";
      if (isFood) {
        if (!form.foodQty || Number(form.foodQty) <= 0)
          newErrors.foodQty = "Cantidad de alimentos requerida y mayor a 0.";
        if (!form.foodClass)
          newErrors.foodClass = "Clasificacion del alimento requerida.";
        if (!form.foodFactura)
          newErrors.foodFactura = "Factura obligatoria (PDF/JPG/PNG, 5MB).";
      }
    }

    if (form.type === "ESPECIE") {
      if (!form.especieItems || form.especieItems.length === 0) {
        newErrors.especieItems = "Agrega al menos una donación en especie.";
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
    const isFood = form.type === "ECONOMICA" && form.isFoodPurchase;
    const apiType = isFood ? "ALIMENTOS" : form.type;
    const donationDate = new Date(form.donationAt);

    if (form.type === "ECONOMICA") {
      details.push({
        kind: apiType,
        recordType: "payment",
        amount: Number(form.econAmount),
        channel: form.econChannel,
      });
      if (isFood) {
        details.push({
          kind: apiType,
          recordType: "food",
          quantity: Number(form.foodQty),
          classification: form.foodClass,
        });
      }
    }

    if (form.type === "ESPECIE") {
      (form.especieItems || []).forEach((item) => {
        const quantityValue = Number(item.quantity);
        details.push({
          kind: "ESPECIE",
          recordType: "item",
          description: item.description,
          quantity: Number.isNaN(quantityValue) ? 0 : quantityValue,
          classification: item.classification,
          channel: item.method,
        });
      });
    }

    const payload = {
      anonymous: Boolean(form.anonymous),
      type: apiType,
      status: form.status,
      donationAt: donationDate.toISOString(),
      details,
    };

    if (form.program) {
      payload.program = form.program;
    }

    const donorId = Number(form.donorSponsorId);
    if (!form.anonymous && donorId) {
      payload.donorSponsorId = donorId;
    }

    return payload;
  };
  const uploadAllFiles = async (donationId) => {
    const uploads = [];
    const isFood = form.type === "ECONOMICA" && form.isFoodPurchase;

    if (form.econComprobante) {
      uploads.push(
        donationsService.uploadFiles(donationId, [form.econComprobante], "comprobante")
      );
    }

    if (form.especieSoporte) {
      uploads.push(
        donationsService.uploadFiles(donationId, [form.especieSoporte], "soporte")
      );
    }

    if (isFood && form.foodFactura) {
      uploads.push(
        donationsService.uploadFiles(donationId, [form.foodFactura], "factura")
      );
    }

    if (isFood && form.foodEvidence && form.foodEvidence.length > 0) {
      uploads.push(
        donationsService.uploadFiles(
          donationId,
          Array.from(form.foodEvidence),
          "evidencia"
        )
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
      console.log("donation payload", payload);
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
        isEditing ? "Donación actualizada" : "Donación guardada",
        isEditing
          ? "Los cambios se guardaron correctamente."
          : "Se registró la donación y sus soportes correctamente."
      );
      navigate("/dashboard/donations");
    } catch (error) {
      console.error("Error guardando donacion", error?.response?.data || error);
      const firstErrorMsg =
        error?.response?.data?.errors?.[0]?.msg ||
        error?.response?.data?.errors?.[0]?.message;
      const apiMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        firstErrorMsg ||
        JSON.stringify(error?.response?.data) ||
        error.message ||
        "No se pudo registrar la donacion.";
      showErrorAlert(
        "Error al guardar",
        apiMessage
      );
    } finally {
      setSubmitting(false);
    }
  };

  const receptionOptions = useMemo(() => {
    const unique = [...RECEPTION_METHODS];
    customReceptionMethods.forEach((method) => {
      if (!unique.includes(method)) unique.push(method);
    });
    return unique;
  }, [customReceptionMethods]);

  const summary = useMemo(() => {
    const donorLabel =
      form.anonymous && !form.donorSponsorId
        ? "Anonimo"
        : donors.find((d) => d.id === Number(form.donorSponsorId))?.nombre ||
          "Sin seleccionar";

    const isFood = form.type === "ECONOMICA" && form.isFoodPurchase;
    const typeLabel = isFood
      ? "Economica (compra de alimentos)"
      : DONATION_TYPES[form.type];

    const general = [
      { label: "Codigo de donacion", value: "Se genera automaticamente al guardar" },
      { label: "Donante", value: donorLabel },
      { label: "Tipo", value: typeLabel },
      { label: "Estado", value: STATUS_OPTIONS.find((s) => s.value === form.status)?.label || form.status },
      { label: "Programa", value: form.program || "N/A" },
      { label: "Fecha/Hora", value: form.donationAt },
    ];

    const details = [];
    const files = [];

    if (form.type === "ECONOMICA") {
      details.push(`Valor donado: $${formatNumber(form.econAmount) || "0"}`);
      details.push(`Canal de pago: ${form.econChannel || "N/A"}`);
      files.push(
        form.econComprobante
          ? `Comprobante listo: ${form.econComprobante.name}`
          : "Comprobante pendiente (se subira a Cloudinary)"
      );
      if (isFood) {
        details.push(`Cantidad de alimentos: ${form.foodQty || "0"}`);
        details.push(`Clasificacion alimento: ${form.foodClass || "N/A"}`);
        files.push(
          form.foodFactura
            ? `Factura lista: ${form.foodFactura.name}`
            : "Factura pendiente (se subira a Cloudinary)"
        );
        files.push(
          form.foodEvidence?.length
            ? `Evidencias listas: ${form.foodEvidence.length} archivo(s)`
            : "Evidencias pendientes (imagenes se subiran a Cloudinary)"
        );
      }
    }

    if (form.type === "ESPECIE") {
      (form.especieItems || []).forEach((item, index) => {
        const segments = [
          `Descripcion: ${item.description || "N/A"}`,
          `Cantidad: ${item.quantity || "0"}`,
          item.classification ? `Clasificacion: ${item.classification}` : null,
          item.method ? `Metodo de recepcion: ${item.method}` : null,
        ]
          .filter(Boolean)
          .join(" · ");
        const prefix =
          (form.especieItems?.length || 0) > 1
            ? `Item ${index + 1}:`
            : "Detalle:";
        details.push(`${prefix} ${segments}`);
      });
      files.push(
        form.especieSoporte
          ? `Soporte listo: ${form.especieSoporte.name}`
          : "Soporte pendiente (se subira a Cloudinary)"
      );
    }

    return { general, details, files };
  }, [form, donors]);
  return (
    <div className="p-6 bg-gray-50 min-h-screen font-questrial">
      <div className="flex items-center justify-between mb-6">
        <Link
          to="/dashboard/donations"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-gray-700 shadow hover:shadow-md transition"
        >
          <FaArrowLeft /> Regresar
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">
          Registrar Donacion
        </h1>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Formulario principal */}
        <div className="xl:col-span-2 bg-white p-6 rounded-2xl shadow space-y-6">
          {/* Informacion general */}
          <section className="border-b pb-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">
                Informacion general
              </h2>
              <span className="text-sm text-gray-500">
                Estados: Recibida, En proceso, Verificada, Ejecutada
              </span>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">
                  Donante / Patrocinador
                </label>
                <div className="flex items-center gap-3">
                  <select
                    disabled={form.anonymous}
                    value={form.donorSponsorId}
                    onChange={(e) =>
                      handleChange("donorSponsorId", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-300"
                  >
                    <option value="">
                      {loadingDonors ? "Cargando..." : "Seleccionar..."}
                    </option>
                    {donors.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.nombre}
                      </option>
                    ))}
                  </select>
                  <label className="flex items-center gap-2 text-sm text-gray-600">
                    <input
                      type="checkbox"
                      checked={form.anonymous}
                      onChange={(e) =>
                        handleChange("anonymous", e.target.checked)
                      }
                    />
                    Anonimo
                  </label>
                </div>
                {errors.donorSponsorId && (
                  <span className="text-red-500 text-xs mt-1">
                    {errors.donorSponsorId}
                  </span>
                )}
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">
                  Programa / Destino
                </label>
                <select
                  value={form.program}
                  onChange={(e) => handleChange("program", e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-300"
                >
                  <option value="">Seleccionar...</option>
                  {PROGRAMS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">
                  Fecha y hora de donacion *
                </label>
                <input
                  type="datetime-local"
                  value={form.donationAt}
                  onChange={(e) => handleChange("donationAt", e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-300"
                />
                {errors.donationAt && (
                  <span className="text-red-500 text-xs mt-1">
                    {errors.donationAt}
                  </span>
                )}
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">
                  Estado
                </label>
                <select
                  value={form.status}
                  onChange={(e) => handleChange("status", e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-300"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">
                  Tipo de donacion *
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {Object.entries(DONATION_TYPES).map(([value, label]) => (
                    <label
                      key={value}
                      className={`flex items-center gap-2 px-3 py-2 border rounded-xl cursor-pointer transition ${
                        form.type === value
                          ? "border-sky-300 bg-sky-50"
                          : "border-gray-200"
                      }`}
                    >
                      <input
                        type="radio"
                        name="type"
                        value={value}
                        checked={form.type === value}
                        onChange={(e) => handleChange("type", e.target.value)}
                      />
                      <span className="text-sm">{label}</span>
                    </label>
                  ))}
                </div>
                {errors.type && (
                  <span className="text-red-500 text-xs mt-1">{errors.type}</span>
                )}
                {form.type === "ECONOMICA" && (
                  <label className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                    <input
                      type="checkbox"
                      checked={form.isFoodPurchase}
                      onChange={(e) =>
                        handleChange("isFoodPurchase", e.target.checked)
                      }
                    />
                    Esta donacion economica es para compra de alimentos
                  </label>
                )}
              </div>
            </div>
          </section>
          {/* Seccion economica */}
          {form.type === "ECONOMICA" && (
            <section className="space-y-4">
              <h3 className="text-base font-semibold text-gray-800">
                Donacion economica
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-1">
                    Valor donado *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.econAmount}
                    onChange={(e) => handleChange("econAmount", e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-300"
                  />
                  {errors.econAmount && (
                    <span className="text-red-500 text-xs mt-1">
                      {errors.econAmount}
                    </span>
                  )}
                </div>

                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-1">
                    Canal de pago *
                  </label>
                  <select
                    value={form.econChannel}
                    onChange={(e) => handleChange("econChannel", e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-300"
                  >
                    <option value="">Seleccionar...</option>
                    {CHANNELS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  {errors.econChannel && (
                    <span className="text-red-500 text-xs mt-1">
                      {errors.econChannel}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">
                  Comprobante de pago (PDF/JPG/PNG, max 5MB) *
                </label>
                <label className="flex items-center gap-3 px-4 py-3 border border-dashed rounded-xl text-sky-500 cursor-pointer hover:bg-sky-50 transition">
                  <FaCloudUploadAlt />
                  <span className="text-sm">
                    {form.econComprobante?.name || "Adjuntar archivo"}
                  </span>
                  <input
                    type="file"
                    accept=".pdf,image/jpeg,image/png"
                    className="hidden"
                    onChange={(e) =>
                      handleFile("econComprobante", e.target.files[0])
                    }
                  />
                </label>
                {errors.econComprobante && (
                  <span className="text-red-500 text-xs mt-1">
                    {errors.econComprobante}
                  </span>
                )}
              </div>
            </section>
          )}

          {/* Seccion en especie */}
          {form.type === "ESPECIE" && (
            <section className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-semibold text-gray-800">
                    Donacion en especie
                  </h3>
                  <p className="text-sm text-gray-500">
                    Completa cada bien entregado y pulsa el botón + para agregarlo
                    a la donación.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddEspecieItem}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-sky-200 text-sky-600 text-xs font-medium hover:bg-sky-50 transition"
                >
                  <FaPlus /> Agregar entrada
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-1">
                    Descripcion del bien *
                  </label>
                  <input
                    type="text"
                    value={form.especieDesc}
                    onChange={(e) => handleChange("especieDesc", e.target.value)}
                    placeholder="Ej: 20 balones de futbol tamano 5"
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-300"
                  />
                  {errors.especieDesc && (
                    <span className="text-red-500 text-xs mt-1">
                      {errors.especieDesc}
                    </span>
                  )}
                </div>

                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-1">
                    Cantidad *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.especieQty}
                    onChange={(e) => handleChange("especieQty", e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-300"
                  />
                  {errors.especieQty && (
                    <span className="text-red-500 text-xs mt-1">
                      {errors.especieQty}
                    </span>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-1">
                    Clasificacion del bien *
                  </label>
                  <select
                    value={form.especieClass}
                    onChange={(e) => handleChange("especieClass", e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-300"
                  >
                    <option value="">Seleccionar...</option>
                    {GOOD_CLASSES.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                  {errors.especieClass && (
                    <span className="text-red-500 text-xs mt-1">
                      {errors.especieClass}
                    </span>
                  )}
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-1">
                    Metodo de recepcion (opcional)
                  </label>
                  <div className="flex gap-3">
                    <select
                      value={form.especieMethod}
                      onChange={(e) => handleMethodSelection(e.target.value)}
                      className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-300"
                    >
                      <option value="">Seleccionar...</option>
                      {receptionOptions.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                      <option value={CUSTOM_METHOD_OPTION}>Agregar otro...</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => setIsMethodModalOpen(true)}
                      className="px-3 py-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition text-sm"
                    >
                      <FaPlus />
                    </button>
                  </div>
                  <span className="text-xs text-gray-500 mt-1">
                    Puedes añadir un método personalizado.
                  </span>
                </div>
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">
                  Soporte (PDF/JPG/PNG, max 5MB) *
                </label>
                <label className="flex items-center gap-3 px-4 py-3 border border-dashed rounded-xl text-sky-500 cursor-pointer hover:bg-sky-50 transition">
                  <FaCloudUploadAlt />
                  <span className="text-sm">
                    {form.especieSoporte?.name || "Adjuntar soporte"}
                  </span>
                  <input
                    type="file"
                    accept=".pdf,image/jpeg,image/png"
                    className="hidden"
                    onChange={(e) =>
                      handleFile("especieSoporte", e.target.files[0])
                    }
                  />
                </label>
                {errors.especieSoporte && (
                  <span className="text-red-500 text-xs mt-1">
                    {errors.especieSoporte}
                  </span>
                )}
              </div>

              {errors.especieItems && (
                <p className="text-red-500 text-xs">{errors.especieItems}</p>
              )}

              {form.especieItems.length > 0 && (
                <div className="space-y-3 pt-2">
                  {form.especieItems.map((item, index) => (
                    <div
                      key={`${item.description}-${index}`}
                      className="flex items-center justify-between gap-4 p-3 rounded-2xl bg-gray-50 border border-gray-100"
                    >
                      <div>
                        <p className="text-sm font-semibold text-gray-800">
                          Item {index + 1}: {item.description}
                        </p>
                        <p className="text-xs text-gray-500">
                          Cantidad: {item.quantity || "0"} ·{" "}
                          {item.classification || "Sin clasificacion"}
                          {item.method ? ` · ${item.method}` : ""}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveEspecieItem(index)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-full transition"
                        aria-label="Eliminar entrada"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Seccion compra de alimentos (subtipo economica) */}
          {form.type === "ECONOMICA" && form.isFoodPurchase && (
            <section className="space-y-6">
              <div>
                <h3 className="text-base font-semibold text-gray-800">
                  Compra de alimentos (subtipo de donacion economica)
                </h3>
                <p className="text-sm text-gray-500">
                  Agrega detalle de alimentos adquiridos, factura y evidencias
                </p>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-1">
                    Cantidad de alimentos adquiridos *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.foodQty}
                    onChange={(e) => handleChange("foodQty", e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-300"
                  />
                  {errors.foodQty && (
                    <span className="text-red-500 text-xs mt-1">
                      {errors.foodQty}
                    </span>
                  )}
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-1">
                    Clasificacion *
                  </label>
                  <select
                    value={form.foodClass}
                    onChange={(e) => handleChange("foodClass", e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-300"
                  >
                    <option value="">Seleccionar...</option>
                    {FOOD_CLASSES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  {errors.foodClass && (
                    <span className="text-red-500 text-xs mt-1">
                      {errors.foodClass}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">
                  Factura (PDF/JPG/PNG, max 5MB) *
                </label>
                <label className="flex items-center gap-3 px-4 py-3 border border-dashed rounded-xl text-sky-500 cursor-pointer hover:bg-sky-50 transition">
                  <FaCloudUploadAlt />
                  <span className="text-sm">
                    {form.foodFactura?.name || "Adjuntar factura"}
                  </span>
                  <input
                    type="file"
                    accept=".pdf,image/jpeg,image/png"
                    className="hidden"
                    onChange={(e) =>
                      handleFile("foodFactura", e.target.files[0])
                    }
                  />
                </label>
                {errors.foodFactura && (
                  <span className="text-red-500 text-xs mt-1">
                    {errors.foodFactura}
                  </span>
                )}
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">
                  Evidencia fotografica (multiples JPG/PNG, max 5MB c/u)
                </label>
                <label className="flex items-center gap-3 px-4 py-3 border border-dashed rounded-xl text-sky-500 cursor-pointer hover:bg-sky-50 transition">
                  <FaCloudUploadAlt />
                  <span className="text-sm">
                    {form.foodEvidence?.length
                      ? `${form.foodEvidence.length} archivos seleccionados`
                      : "Adjuntar evidencias"}
                  </span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png"
                    multiple
                    className="hidden"
                    onChange={(e) => handleFile("foodEvidence", e.target.files)}
                  />
                </label>
              </div>
            </section>
          )}

          {/* Botones */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate("/dashboard/donations")}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
              disabled={submitting}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="px-5 py-2 rounded-lg bg-gradient-to-r from-sky-300 to-sky-400 text-white font-semibold shadow-md hover:from-sky-400 hover:to-sky-500 transition disabled:opacity-60"
            >
              {submitting ? "Guardando..." : "Guardar donacion"}
            </button>
          </div>
        </div>

        {/* Resumen */}
        <aside className="bg-white p-5 rounded-2xl shadow space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Resumen previo
          </h3>
          <div className="space-y-2 text-sm text-gray-700">
            {summary.general.map((item) => (
              <p key={item.label}>
                <strong>{item.label}:</strong> {item.value}
              </p>
            ))}
            <div>
              <strong>Detalle:</strong>
              <ul className="list-disc ml-4 mt-1">
                {summary.details.map((d, idx) => (
                  <li key={idx}>{d}</li>
                ))}
              </ul>
            </div>
            <div className="space-y-1">
              {summary.files.map((f, idx) => (
                <p key={idx} className="text-xs text-green-700">
                  - {f}
                </p>
              ))}
            </div>
          </div>
        </aside>
        {isMethodModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={handleCloseMethodModal}
            />
            <div
              className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 space-y-4"
              role="dialog"
              aria-modal="true"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">
                  Nuevo método de recepción
                </h3>
                <button
                  type="button"
                  onClick={handleCloseMethodModal}
                  className="text-sm text-gray-500 hover:text-gray-800"
                >
                  Cerrar
                </button>
              </div>
              <p className="text-sm text-gray-500">
                Agrega un método que no aparezca en la lista para usarlo en esta
                o futuras donaciones.
              </p>
              <input
                type="text"
                value={methodModalValue}
                onChange={(e) => setMethodModalValue(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-300"
                placeholder="Ej: Recepción en bodega principal"
              />
              {methodModalError && (
                <p className="text-red-500 text-xs">{methodModalError}</p>
              )}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={handleCloseMethodModal}
                  className="px-4 py-2 text-sm text-gray-600 rounded-xl border border-gray-200 hover:bg-gray-50 transition"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveCustomMethod}
                  className="px-4 py-2 text-sm text-white rounded-xl bg-sky-500 hover:bg-sky-600 transition"
                >
                  Guardar método
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DonationsForm;
