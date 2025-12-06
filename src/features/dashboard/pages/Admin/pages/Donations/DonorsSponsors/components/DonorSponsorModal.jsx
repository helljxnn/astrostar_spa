import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IoClose } from "react-icons/io5";
import { FaUser, FaBuilding, FaHandHoldingHeart } from "react-icons/fa";
import { FormField } from "../../../../../../../../shared/components/FormField";
import { showErrorAlert } from "../../../../../../../../shared/utils/alerts";

const initialState = {
  tipo: "Donante",
  tipoPersona: "Natural",
  nombreCompleto: "",
  razonSocial: "",
  tipoDocumento: "",
  numeroDocumento: "",
  nit: "",
  personaContacto: "",
  telefono: "",
  correo: "",
  direccion: "",
  estado: "Activo",
};

const DonorSponsorModal = ({ isOpen, onClose, onSave, donorData, mode = "create" }) => {
  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    if (isOpen && donorData && mode === "edit") {
      setFormData({
        tipo: donorData.tipo || "Donante",
        tipoPersona: donorData.tipoPersona || "Natural",
        nombreCompleto: donorData.nombreCompleto || (donorData.tipoPersona === "Natural" ? donorData.nombre || "" : ""),
        razonSocial: donorData.razonSocial || (donorData.tipoPersona === "Juridica" ? donorData.nombre || "" : ""),
        tipoDocumento: donorData.tipoDocumento || "",
        numeroDocumento: donorData.numeroDocumento || (donorData.tipoPersona === "Natural" ? donorData.identificacion || "" : ""),
        nit: donorData.nit || (donorData.tipoPersona === "Juridica" ? donorData.identificacion || "" : ""),
        personaContacto: donorData.personaContacto || "",
        telefono: donorData.telefono || "",
        correo: donorData.correo || "",
        direccion: donorData.direccion || "",
        estado: donorData.estado || "Activo",
      });
      setErrors({});
      setTouched({});
    } else if (isOpen && mode === "create") {
      setFormData(initialState);
      setErrors({});
      setTouched({});
    }
  }, [isOpen, donorData, mode]);

  const isNatural = formData.tipoPersona === "Natural";
  const isJuridica = formData.tipoPersona === "Juridica";
  const isSponsor = formData.tipo === "Patrocinador";

  const validateField = (name, value) => {
    let error = "";
    const requiredIf = (cond, msg) => {
      if (cond && !value.trim()) {
        error = msg;
      }
    };

    switch (name) {
      case "nombreCompleto":
        requiredIf(isNatural, "El nombre completo es requerido.");
        break;
      case "razonSocial":
        requiredIf(isJuridica, "La razon social es requerida.");
        break;
      case "tipoDocumento":
        requiredIf(isNatural, "El tipo de documento es requerido.");
        break;
      case "numeroDocumento":
        requiredIf(isNatural, "El numero de documento es requerido.");
        break;
      case "nit":
        requiredIf(isJuridica, "El NIT es requerido.");
        break;
      case "personaContacto":
        requiredIf(isJuridica, "La persona de contacto es requerida.");
        break;
      case "telefono":
        requiredIf(true, "El telefono es requerido.");
        break;
      case "correo":
        if (!value.trim()) {
          error = "El correo es requerido.";
        } else if (!/\S+@\S+\.\S+/.test(value.trim())) {
          error = "El formato del correo no es valido.";
        }
        break;
      default:
        break;
    }
    return error;
  };

  const validateForm = () => {
    const newErrors = {};
    const fieldsToValidate = [];

    if (isNatural) {
      fieldsToValidate.push("nombreCompleto", "tipoDocumento", "numeroDocumento");
    }

    if (isJuridica) {
      fieldsToValidate.push("razonSocial", "nit", "personaContacto");
    }

    fieldsToValidate.push("telefono", "correo");

    fieldsToValidate.forEach((fieldName) => {
      const error = validateField(fieldName, formData[fieldName] || "");
      if (error) newErrors[fieldName] = error;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "tipoPersona") {
      setFormData((prev) => {
        const updated = { ...prev, [name]: value };
        if (value === "Natural") {
          updated.razonSocial = "";
          updated.nit = "";
          updated.personaContacto = "";
        } else {
          updated.nombreCompleto = "";
          updated.tipoDocumento = "";
          updated.numeroDocumento = "";
        }
        return updated;
      });
    } else if (name === "tipo") {
      setFormData((prev) => {
        const updated = { ...prev, [name]: value };
        return updated;
      });
    } else if (name === "telefono" || name === "numeroDocumento" || name === "nit") {
      if (/^[0-9]*$/.test(value)) {
        setFormData((prev) => ({ ...prev, [name]: value }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleSubmit = () => {
    if (validateForm()) {
      const baseNombre = isJuridica ? formData.razonSocial : formData.nombreCompleto;
      const baseIdentificacion = isJuridica ? formData.nit : formData.numeroDocumento;

      onSave({
        ...formData,
        nombre: baseNombre,
        identificacion: baseIdentificacion,
      });
    } else {
      setTouched({
        nombreCompleto: true,
        razonSocial: true,
        tipoDocumento: true,
        numeroDocumento: true,
        nit: true,
        personaContacto: true,
        telefono: true,
        correo: true,
      });
      showErrorAlert(
        "Error de Validacion",
        "Por favor, complete todos los campos obligatorios."
      );
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          style={{ zIndex: 9999 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] relative flex flex-col overflow-hidden"
            initial={{ scale: 0.9, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 40 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            {/* Header */}
            <div className="flex-shrink-0 bg-white rounded-t-2xl border-b border-gray-200 p-4 relative">
              <button
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
                onClick={onClose}
                aria-label="Cerrar"
              >
                <IoClose size={20} />
              </button>
              <h2 className="text-xl font-bold bg-gradient-to-r from-primary-purple to-primary-blue bg-clip-text text-transparent text-center">
                {mode === "edit" ? "Editar Donante/Patrocinador" : "Crear Donante/Patrocinador"}
              </h2>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Tipo */}
                <div className="col-span-1 md:col-span-2 lg:col-span-4 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Tipo */}
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700">Tipo</p>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { value: "Donante", label: "Donante", icon: <FaHandHoldingHeart /> },
                          { value: "Patrocinador", label: "Patrocinador", icon: <FaHandHoldingHeart /> },
                        ].map((option) => {
                          const active = formData.tipo === option.value;
                          return (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => handleChange({ target: { name: "tipo", value: option.value } })}
                              className={`flex items-center gap-2 w-full h-full px-4 py-3 rounded-2xl border transition-all ${
                                active
                                  ? "border-sky-300 bg-gradient-to-r from-sky-50 via-white to-sky-50 shadow-[0_10px_30px_-18px_rgba(56,189,248,0.8)] text-sky-600"
                                  : "border-gray-200 bg-white text-gray-700 hover:border-sky-200"
                              }`}
                            >
                              <span
                                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                  active ? "border-sky-400 bg-sky-100" : "border-gray-300"
                                }`}
                              >
                                {active && <span className="w-2.5 h-2.5 bg-sky-500 rounded-full" />}
                              </span>
                              <span
                                className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                                  active ? "bg-sky-100 text-sky-500" : "bg-gray-100 text-gray-500"
                                }`}
                              >
                                {option.icon}
                              </span>
                              <span className="font-semibold text-sm">{option.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Tipo de Persona */}
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700">Tipo de Persona</p>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { value: "Juridica", label: "Persona Juridica", icon: <FaBuilding /> },
                          { value: "Natural", label: "Persona Natural", icon: <FaUser /> },
                        ].map((option) => {
                          const active = formData.tipoPersona === option.value;
                          return (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => handleChange({ target: { name: "tipoPersona", value: option.value } })}
                              className={`flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all w-full ${
                                active
                                  ? "border-sky-300 bg-gradient-to-r from-sky-50 via-white to-sky-50 shadow-[0_10px_30px_-18px_rgba(56,189,248,0.8)] text-sky-600"
                                  : "border-gray-200 bg-white text-gray-800 hover:border-sky-200"
                              }`}
                            >
                              <span
                                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                  active ? "border-sky-400 bg-sky-100" : "border-gray-300"
                                }`}
                              >
                                {active && <span className="w-2.5 h-2.5 bg-sky-500 rounded-full" />}
                              </span>
                              <span
                                className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                                  active ? "bg-sky-100 text-sky-500" : "bg-gray-100 text-gray-500"
                                }`}
                              >
                                {option.icon}
                              </span>
                              <span className="font-semibold text-sm">{option.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {isNatural && (
                  <>
                    <FormField
                      label="Nombre completo"
                      name="nombreCompleto"
                      type="text"
                      placeholder="Ej: Juan Perez"
                      required
                      value={formData.nombreCompleto}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.nombreCompleto && errors.nombreCompleto}
                    />
                    <FormField
                      label="Tipo de documento"
                      name="tipoDocumento"
                      type="select"
                      placeholder="Selecciona el tipo de documento"
                      required
                      value={formData.tipoDocumento}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.tipoDocumento && errors.tipoDocumento}
                      options={[
                        { value: "CC", label: "Cedula de Ciudadania" },
                        { value: "TI", label: "Tarjeta de Identidad" },
                        { value: "PAS", label: "Pasaporte" },
                      ]}
                    />
                    <FormField
                      label="Numero de documento"
                      name="numeroDocumento"
                      type="text"
                      placeholder="Ej: 123456789"
                      required
                      value={formData.numeroDocumento}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.numeroDocumento && errors.numeroDocumento}
                    />
                  </>
                )}

                {isJuridica && (
                  <>
                    <FormField
                      label="Razon social"
                      name="razonSocial"
                      type="text"
                      placeholder="Ej: Empresa Solidaria SAS"
                      required
                      value={formData.razonSocial}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.razonSocial && errors.razonSocial}
                    />
                    <FormField
                      label="NIT"
                      name="nit"
                      type="text"
                      placeholder="Ej: 900123456"
                      required
                      value={formData.nit}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.nit && errors.nit}
                    />
                    <FormField
                      label="Persona de contacto"
                      name="personaContacto"
                      type="text"
                      placeholder="Ej: Ana Garcia"
                      required
                      value={formData.personaContacto}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.personaContacto && errors.personaContacto}
                    />
                  </>
                )}

                <FormField
                  label="Telefono"
                  name="telefono"
                  type="tel"
                  placeholder="Ej: 3001234567"
                  required
                  value={formData.telefono}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.telefono && errors.telefono}
                />
                <FormField
                  label="Correo Electronico"
                  name="correo"
                  type="email"
                  placeholder="ejemplo@correo.com"
                  required
                  value={formData.correo}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.correo && errors.correo}
                />
                <FormField
                  label="Direccion"
                  name="direccion"
                  type="text"
                  placeholder="Ej: Calle 10 # 20-30"
                  value={formData.direccion}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />

                {/* Tipo de patrocinio removido para simplificar (fundacion deportiva) */}

                <FormField
                  label="Estado"
                  name="estado"
                  type="select"
                  value={formData.estado}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  options={[
                    { value: "Activo", label: "Activo" },
                    { value: "Inactivo", label: "Inactivo" },
                  ]}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 border-t border-gray-200 p-4">
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-6 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-purple transition-all duration-200 font-medium shadow-lg"
                >
                  {mode === "edit" ? "Guardar Cambios" : "Crear Donante/Patrocinador"}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DonorSponsorModal;
