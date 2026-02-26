import { useState } from "react";
import { motion } from "framer-motion";
import { FaHandHoldingHeart } from "react-icons/fa";
import donorsLandingService from "../../../services/donorsLandingService";
import { FormField } from "../../../../../shared/components/FormField";

const sanitizeDigits = (val = "") => val.replace(/[^\d]/g, "");
const sanitizeAlnum = (val = "") => val.replace(/[^a-zA-Z0-9]/g, "");
const sanitizeAlnumDash = (val = "") => val.replace(/[^a-zA-Z0-9-]/g, "");

const DOCUMENT_RULES = {
  "Cédula de Ciudadanía": {
    min: 6,
    max: 10,
    pattern: /^[0-9]+$/,
    sanitize: sanitizeDigits,
    error: "La cédula debe tener entre 6 y 10 dígitos numéricos.",
  },
  "Cédula de Extranjería": {
    min: 6,
    max: 10,
    pattern: /^[0-9]+$/,
    sanitize: sanitizeDigits,
    error: "La cédula de extranjería debe tener entre 6 y 10 dígitos numéricos.",
  },
  Pasaporte: {
    min: 6,
    max: 20,
    pattern: /^[A-Za-z0-9]+$/,
    sanitize: sanitizeAlnum,
    error: "El pasaporte debe tener entre 6 y 20 caracteres alfanuméricos.",
  },
  "Permiso Especial de Permanencia": {
    min: 6,
    max: 15,
    pattern: /^[A-Za-z0-9-]+$/,
    sanitize: sanitizeAlnumDash,
    error:
      "El permiso especial debe tener entre 6 y 15 caracteres y puede incluir guiones.",
  },
  "Tarjeta de Extranjería": {
    min: 6,
    max: 15,
    pattern: /^[A-Za-z0-9-]+$/,
    sanitize: sanitizeAlnumDash,
    error:
      "La tarjeta de extranjería debe tener entre 6 y 15 caracteres y puede incluir guiones.",
  },
  "Número de Identificación Extranjero": {
    min: 6,
    max: 20,
    pattern: /^[A-Za-z0-9-]+$/,
    sanitize: sanitizeAlnumDash,
    error:
      "El número de identificación debe tener entre 6 y 20 caracteres alfanuméricos.",
  },
};

const DEFAULT_DOC_RULE = {
  min: 5,
  max: 20,
  pattern: /^[A-Za-z0-9-]+$/,
  sanitize: sanitizeAlnumDash,
  error: "El documento debe tener entre 5 y 20 caracteres alfanuméricos.",
};

const getDocRule = (type) => DOCUMENT_RULES[type] || DEFAULT_DOC_RULE;

const DOCUMENT_OPTIONS = Object.keys(DOCUMENT_RULES).map((label) => ({
  value: label,
  label,
}));

const initialState = {
  nombreCompleto: "",
  correo: "",
  telefono: "",
  tipoDocumento: "",
  numeroDocumento: "",
  ciudad: "",
  pais: "",
  mensaje: "",
  autorizacion: "Si",
};

const DonorSection = () => {
  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const validate = (field, value, currentData = formData) => {
    const val = (value || "").trim();
    switch (field) {
      case "nombreCompleto":
        if (!val) return "El nombre es obligatorio.";
        if (val.length < 3) return "Mínimo 3 caracteres.";
        return "";
      case "correo":
        if (!val) return "Correo obligatorio.";
        if (!/\S+@\S+\.\S+/.test(val)) return "Correo inválido.";
        return "";
      case "telefono":
        if (!val) return "Teléfono obligatorio.";
        if (val.length < 7) return "Mínimo 7 dígitos.";
        return "";
      case "tipoDocumento":
        if (!val) return "El tipo de documento es obligatorio.";
        return "";
      case "numeroDocumento": {
        if (!val) return "El número de documento es obligatorio.";
        const rule = getDocRule(currentData.tipoDocumento);
        if (val.length < rule.min || val.length > rule.max) return rule.error;
        if (rule.pattern && !rule.pattern.test(val)) return rule.error;
        return "";
      }
      case "autorizacion":
        if (!val) return "Selecciona una opción.";
        return "";
      case "ciudad":
      case "pais":
        if (!val) return "Campo obligatorio.";
        return "";
      default:
        return "";
    }
  };

  const handleChange = (name, value) => {
    let nextSnapshot = formData;
    setFormData((prev) => {
      let next = { ...prev, [name]: value };
      if (name === "telefono") {
        next[name] = value.replace(/[^\d]/g, "").slice(0, 15);
      }
      if (name === "tipoDocumento") {
        const rule = getDocRule(value);
        next.numeroDocumento = rule
          .sanitize(prev.numeroDocumento || "")
          .slice(0, rule.max);
      }
      if (name === "numeroDocumento") {
        const rule = getDocRule(prev.tipoDocumento);
        next.numeroDocumento = rule.sanitize(value).slice(0, rule.max);
      }
      nextSnapshot = next;
      return next;
    });

    if (touched[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: validate(name, nextSnapshot[name], nextSnapshot),
      }));
    }

    if (name === "tipoDocumento" && touched.numeroDocumento) {
      setErrors((prev) => ({
        ...prev,
        numeroDocumento: validate(
          "numeroDocumento",
          nextSnapshot.numeroDocumento,
          nextSnapshot
        ),
      }));
    }
  };

  const handleBlur = (name) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({
      ...prev,
      [name]: validate(name, formData[name], formData),
    }));
  };

  const isValidForm = () => {
    const fields = [
      "correo",
      "telefono",
      "tipoDocumento",
      "numeroDocumento",
      "ciudad",
      "pais",
      "nombreCompleto",
      "autorizacion",
    ];
    const newErrors = {};
    fields.forEach((f) => {
      const msg = validate(f, formData[f], formData);
      if (msg) newErrors[f] = msg;
    });
    setErrors(newErrors);
    setTouched((prev) => ({ ...prev, ...Object.fromEntries(fields.map((f) => [f, true])) }));
    return Object.keys(newErrors).length === 0;
  };

  const reset = () => {
    setFormData(initialState);
    setErrors({});
    setTouched({});
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 4000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cooldown > 0) return;
    if (!isValidForm()) return;

    setIsSubmitting(true);
    try {
      await donorsLandingService.create(formData);
      reset();
      setCooldown(45);
      const timer = setInterval(() => {
        setCooldown((c) => {
          if (c <= 1) {
            clearInterval(timer);
            return 0;
          }
          return c - 1;
        });
      }, 1000);
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        submit:
          error?.message ||
          "No pudimos registrar tu solicitud. Intenta nuevamente.",
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-20 bg-white font-montserrat" id="donantes">
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-start">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-4"
        >
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-purple-50 text-primary-purple rounded-full text-sm font-semibold">
            <FaHandHoldingHeart /> Donante / Donaciones
          </div>
          <h2 className="text-4xl font-extrabold text-gray-900 leading-tight">
            En la Fundación Manuela Vanegas trabajamos cada día para formar niñas a través del deporte y la educación en valores.
          </h2>
          <p className="text-gray-600 text-lg">
            Tu donación nos ayuda a fortalecer nuestros programas, crear espacios seguros y brindar más oportunidades a quienes más lo necesitan. Haz parte de este propósito. Dona hoy y construyamos juntos un mejor futuro.
          </p>
          <p className="text-gray-700 font-semibold">
            Con tu apoyo nos ayudas a construir este sueño, pero además las donaciones a la Fundación Manuela Vanegas son deducibles de impuestos.
          </p>
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-sm text-gray-700">
            <strong>Nota:</strong> si ya has hecho tu donación y quieres solicitar tu certificado, por favor contáctanos:{" "}
            <a href="mailto:fundacionmanuelavanegas@gmail.com" className="text-primary-purple font-semibold">
              fundacionmanuelavanegas@gmail.com
            </a>
          </div>
          {errors.submit && (
            <p className="text-red-600 text-sm font-semibold">{errors.submit}</p>
          )}
          {showSuccess && (
            <div className="text-green-700 bg-green-50 border border-green-200 px-4 py-3 rounded-xl">
              ¡Gracias! Registramos tu solicitud. Te contactaremos muy pronto.
            </div>
          )}
          <div className="flex gap-3 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary-purple"></span>
              Confirmación manual por el equipo
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-300"></span>
              Correo automático de agradecimiento
            </div>
          </div>
        </motion.div>

        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-white border border-gray-200 shadow-xl rounded-2xl p-6 space-y-4"
        >
          <FormField
            label="Nombre completo"
            name="nombreCompleto"
            value={formData.nombreCompleto}
            onChange={(e) => handleChange("nombreCompleto", e.target.value)}
            onBlur={() => handleBlur("nombreCompleto")}
            error={errors.nombreCompleto}
            touched={touched.nombreCompleto}
            required
          />

          <div className="grid md:grid-cols-2 gap-3">
            <FormField
              label="Tipo de documento"
              name="tipoDocumento"
              type="select"
              options={DOCUMENT_OPTIONS}
              value={formData.tipoDocumento}
              onChange={(e) => handleChange("tipoDocumento", e.target.value)}
              onBlur={() => handleBlur("tipoDocumento")}
              error={errors.tipoDocumento}
              touched={touched.tipoDocumento}
              placeholder="Selecciona el tipo de documento"
              required
            />
            <FormField
              label="Número de documento"
              name="numeroDocumento"
              value={formData.numeroDocumento}
              onChange={(e) => handleChange("numeroDocumento", e.target.value)}
              onBlur={() => handleBlur("numeroDocumento")}
              error={errors.numeroDocumento}
              touched={touched.numeroDocumento}
              placeholder="Ej: 1234567890"
              required
              helperText={
                formData.tipoDocumento
                  ? `${(formData.numeroDocumento || "").length}/${
                      getDocRule(formData.tipoDocumento).max
                    } caracteres`
                  : undefined
              }
            />
          </div>

          <FormField
            label="Correo"
            name="correo"
            type="email"
            value={formData.correo}
            onChange={(e) => handleChange("correo", e.target.value)}
            onBlur={() => handleBlur("correo")}
            error={errors.correo}
            touched={touched.correo}
            required
          />

          <FormField
            label="Teléfono"
            name="telefono"
            type="tel"
            value={formData.telefono}
            onChange={(e) => handleChange("telefono", e.target.value)}
            onBlur={() => handleBlur("telefono")}
            error={errors.telefono}
            touched={touched.telefono}
            required
            placeholder="Ej: 3001234567"
          />

          <div className="grid md:grid-cols-2 gap-3">
            <FormField
              label="Ciudad"
              name="ciudad"
              value={formData.ciudad}
              onChange={(e) => handleChange("ciudad", e.target.value)}
              onBlur={() => handleBlur("ciudad")}
              error={errors.ciudad}
              touched={touched.ciudad}
              required
            />
            <FormField
              label="País"
              name="pais"
              value={formData.pais}
              onChange={(e) => handleChange("pais", e.target.value)}
              onBlur={() => handleBlur("pais")}
              error={errors.pais}
              touched={touched.pais}
              required
            />
          </div>

          <FormField
            label="Cuéntanos (opcional)"
            name="mensaje"
            type="textarea"
            value={formData.mensaje}
            onChange={(e) => handleChange("mensaje", e.target.value)}
          />

          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">
              ¿Autorizas a la Fundación a contactarte para avanzar en el proceso?
            </p>
            <div className="flex gap-4">
              {["Si", "No"].map((opt) => (
                <label key={opt} className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="radio"
                    name="autorizacion"
                    value={opt}
                    checked={formData.autorizacion.toLowerCase() === opt.toLowerCase()}
                    onChange={(e) => handleChange("autorizacion", e.target.value)}
                    onBlur={() => handleBlur("autorizacion")}
                  />
                  {opt === "Si" ? "Sí" : "No"}
                </label>
              ))}
            </div>
            {errors.autorizacion && (
              <p className="text-red-500 text-xs">{errors.autorizacion}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting || cooldown > 0}
            className="w-full mt-2 bg-primary-purple text-white py-3 rounded-xl font-semibold hover:bg-primary-blue transition-all disabled:opacity-60"
          >
            {isSubmitting
              ? "Enviando..."
              : cooldown > 0
              ? `Espera ${cooldown}s`
              : "Enviar solicitud"}
          </button>
        </motion.form>
      </div>
    </section>
  );
};

export default DonorSection;


