import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IoClose } from "react-icons/io5";
import { FaHandHoldingHeart } from "react-icons/fa";
import { FormField } from "../../../../../../../../shared/components/FormField";
import useDonorSponsorForm from "../hooks/useDonorSponsorForm";
import { showErrorAlert } from "../../../../../../../../shared/utils/alerts.js";
import { createPortal } from "react-dom";

const DonorSponsorModal = ({
  isOpen,
  onClose,
  onSave,
  donorData,
  mode = "create",
  referenceData = {},
  checkEmailAvailability,
  checkIdentificationAvailability,
}) => {
  const {
    formData,
    errors,
    touched,
    nameHelperText,
    razonSocialHelperText,
    checkingId,
    checkingEmail,
    docMaxLength,
    nitMaxLength,
    handleChange,
    handleBlur,
    handleSubmit,
    setFromRecord,
  } = useDonorSponsorForm({
    initialData: donorData,
    mode,
    checkEmailAvailability,
    checkIdentificationAvailability,
  });

  useEffect(() => {
    if (isOpen) {
      setFromRecord(donorData);
    }
  }, [donorData, isOpen, setFromRecord]);

  const isNatural = formData.tipoPersona === "Natural";
  const isJuridica = formData.tipoPersona === "Juridica";

  const estadoOptions =
    referenceData.estados?.map((item) => ({
      value: item.value || item,
      label: item.label || item,
    })) || [];

  if (typeof document === "undefined") return null;

  const overlay = (
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
            className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] relative flex flex-col overflow-hidden"
            initial={{ scale: 0.9, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 40 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <div className="flex-shrink-0 bg-white rounded-t-2xl border-b border-gray-200 p-4 relative">
              <button
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
                onClick={onClose}
                aria-label="Cerrar"
              >
                <IoClose size={20} />
              </button>
              <h2 className="text-xl font-bold bg-gradient-to-r from-primary-purple to-primary-blue bg-clip-text text-transparent text-center">
                {mode === "edit"
                  ? "Editar Donante/Patrocinador"
                  : "Crear Donante/Patrocinador"}
              </h2>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {/* Pestañas Donante/Patrocinador */}
              <div className="flex gap-2 mb-6 border-b border-gray-200">
                {[
                  { value: "Donante", label: "Donante" },
                  { value: "Patrocinador", label: "Patrocinador" },
                ].map((option) => {
                  const active = formData.tipo === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        handleChange({ target: { name: "tipo", value: option.value } });
                        if (option.value === "Patrocinador") {
                          handleChange({ target: { name: "tipoPersona", value: "Juridica" } });
                        } else if (option.value === "Donante") {
                          handleChange({ target: { name: "tipoPersona", value: "Natural" } });
                        }
                      }}
                      className={`flex items-center gap-2 px-6 py-3 font-semibold text-sm transition-all relative ${
                        active
                          ? "text-primary-blue border-b-2 border-primary-blue"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>

              {/* INFORMACIÓN DE IDENTIDAD */}
              <div className="mb-6">
                <h3 className="text-base font-bold text-gray-800 uppercase tracking-wide mb-4">
                  Información de Identidad
                </h3>

                {/* Botones Persona Natural / Jurídica */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {[
                    { value: "Natural", label: "Persona Natural" },
                    { value: "Juridica", label: "Persona Jurídica" },
                  ].map((option) => {
                    const active = formData.tipoPersona === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() =>
                          handleChange({
                            target: {
                              name: "tipoPersona",
                              value: option.value,
                            },
                          })
                        }
                        className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all ${
                          active
                            ? "bg-primary-blue text-white shadow-md"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>

                {/* Campos de Identidad */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {isNatural && (
                    <>
                      <FormField
                        label="Nombre Completo"
                        name="nombreCompleto"
                        type="text"
                        placeholder="Ej: Juan Pérez"
                        required
                        value={formData.nombreCompleto}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={errors.nombreCompleto}
                        touched={touched.nombreCompleto}
                        helperText={
                          !errors.nombreCompleto ? nameHelperText : undefined
                        }
                      />
                      <FormField
                        label="Tipo de Documento"
                        name="tipoDocumento"
                        type="select"
                        required
                        value={formData.tipoDocumento}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={errors.tipoDocumento}
                        touched={touched.tipoDocumento}
                        options={[
                          { value: "", label: "Seleccione un tipo" },
                          { value: "Cédula de Ciudadanía", label: "Cédula de Ciudadanía" },
                          { value: "Cédula de Extranjería", label: "Cédula de Extranjería" },
                          { value: "Tarjeta de Identidad", label: "Tarjeta de Identidad" },
                          { value: "Pasaporte", label: "Pasaporte" },
                          { value: "Permiso de Permanencia", label: "Permiso de Permanencia" },
                        ]}
                      />
                      <FormField
                        label="Número de Documento"
                        name="numeroDocumento"
                        type="text"
                        placeholder="Ingrese el número"
                        required
                        value={formData.numeroDocumento}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={
                          errors.numeroDocumento || errors.identificacion
                        }
                        touched={touched.numeroDocumento}
                        helperText={
                          checkingId
                            ? "Verificando disponibilidad..."
                            : errors.identificacion || errors.numeroDocumento
                              ? undefined
                              : `${formData.numeroDocumento.length}/${docMaxLength} caracteres`
                        }
                      />
                    </>
                  )}

                  {isJuridica && (
                    <>
                      <FormField
                        label="Razón Social"
                        name="razonSocial"
                        type="text"
                        placeholder="Ej: Empresa S.A."
                        required
                        value={formData.razonSocial}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={errors.razonSocial}
                        touched={touched.razonSocial}
                        helperText={
                          !errors.razonSocial
                            ? razonSocialHelperText
                            : undefined
                        }
                      />
                      <FormField
                        label="NIT"
                        name="nit"
                        type="text"
                        placeholder="000000000-0"
                        required
                        value={formData.nit}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={errors.nit || errors.identificacion}
                        touched={touched.nit}
                        helperText={
                          checkingId
                            ? "Verificando disponibilidad..."
                            : errors.identificacion || errors.nit
                              ? undefined
                              : `${formData.nit.length}/${nitMaxLength} caracteres`
                        }
                      />
                      <div className="md:col-span-2">
                        <FormField
                          label="Representante Legal"
                          name="personaContacto"
                          type="text"
                          placeholder="Nombre del representante"
                          required
                          value={formData.personaContacto}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={errors.personaContacto}
                          touched={touched.personaContacto}
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* INFORMACIÓN DE CONTACTO */}
              <div className="mb-6">
                <h3 className="text-base font-bold text-gray-800 uppercase tracking-wide mb-4">
                  Información de Contacto
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    label="Correo Electrónico"
                    name="correo"
                    type="email"
                    placeholder="nombre@ejemplo.com"
                    required
                    value={formData.correo}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={errors.correo}
                    touched={touched.correo}
                    helperText={
                      checkingEmail
                        ? "Verificando disponibilidad..."
                        : undefined
                    }
                  />
                  <FormField
                    label="Teléfono Móvil"
                    name="telefono"
                    type="tel"
                    placeholder="+57 300 000 0000"
                    required
                    value={formData.telefono}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={errors.telefono}
                    touched={touched.telefono}
                  />
                  <FormField
                    label="País"
                    name="pais"
                    type="text"
                    placeholder="Colombia"
                    value={formData.pais}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    error={errors.pais}
                    touched={touched.pais}
                  />
                  <FormField
                    label="Ciudad"
                    name="ciudad"
                    type="text"
                    placeholder="Buscar ciudad..."
                    value={formData.ciudad}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    error={errors.ciudad}
                    touched={touched.ciudad}
                  />
                  <div className="md:col-span-2">
                    <FormField
                      label="Dirección"
                      name="direccion"
                      type="text"
                      placeholder="Calle, número, apartamento"
                      value={formData.direccion}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                      error={errors.direccion}
                      touched={touched.direccion}
                    />
                  </div>
                </div>
              </div>

              {/* Estado (solo en modo edición) */}
              {mode === "edit" && (
                <div className="mb-6">
                  <h3 className="text-base font-bold text-gray-800 uppercase tracking-wide mb-4">
                    Estado
                  </h3>
                  <FormField
                    label="Estado"
                    name="estado"
                    type="select"
                    value={formData.estado}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    options={estadoOptions}
                  />
                </div>
              )}
            </div>

            <div className="flex-shrink-0 border-t border-gray-200 p-4 bg-white">
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={async () => {
                    const result = await handleSubmit();
                    if (result?.valid) {
                      const baseNombre = isJuridica
                        ? formData.razonSocial
                        : formData.nombreCompleto;
                      const baseIdentificacion = isJuridica
                        ? formData.nit
                        : formData.numeroDocumento;
                      const payload = {
                        ...formData,
                        nombre: baseNombre,
                        identificacion: baseIdentificacion,
                      };

                      if (isNatural) {
                        delete payload.razonSocial;
                        delete payload.nit;
                        delete payload.personaContacto;
                      } else {
                        delete payload.nombreCompleto;
                        delete payload.tipoDocumento;
                        delete payload.numeroDocumento;
                      }

                      onSave(payload);
                    } else {
                      showErrorAlert(
                        "Campos incompletos",
                        "Por favor, complete todos los campos obligatorios antes de continuar.",
                      );
                    }
                  }}
                  className="px-6 py-2.5 bg-primary-blue text-white rounded-lg hover:bg-primary-purple transition-all font-medium shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={checkingId || checkingEmail}
                >
                  {mode === "edit" ? "Guardar Cambios" : "Crear Registro"}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return document?.body ? createPortal(overlay, document.body) : overlay;
};

export default DonorSponsorModal;

