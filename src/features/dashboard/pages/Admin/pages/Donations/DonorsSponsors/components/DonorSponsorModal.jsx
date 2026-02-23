import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IoClose } from "react-icons/io5";
import { FaUser, FaBuilding, FaHandHoldingHeart } from "react-icons/fa";
import { FormField } from "../../../../../../../../shared/components/FormField";
import useDonorSponsorForm from "../hooks/useDonorSponsorForm";
import { showErrorAlert } from "../../../../../../../../shared/utils/alerts";
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
  const phoneLabel = isJuridica ? "Tel\u00e9fono de contacto" : "Tel\u00e9fono";
  const emailLabel = isJuridica ? "Correo del representante" : "Correo Electr\u00f3nico";

  const fallbackDocumentTypes = [
    { value: "Cédula de Ciudadanía", label: "Cédula de Ciudadanía" },
    { value: "Cédula de Extranjería", label: "Cédula de Extranjería" },
    { value: "Pasaporte", label: "Pasaporte" },
    { value: "Permiso de Permanencia", label: "Permiso de Permanencia" },
  ];

  const documentTypeOptions =
    referenceData.documentTypes && referenceData.documentTypes.length > 0
      ? referenceData.documentTypes
          .filter((doc) => doc.name !== "Tarjeta de Identidad")
          .map((doc) => ({
            value: doc.name,
            label: doc.name,
          }))
      : fallbackDocumentTypes;

  const estadoOptions = referenceData.estados?.map((item) => ({
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
            className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] relative flex flex-col overflow-hidden"
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
                {mode === "edit" ? "Editar Donante/Patrocinador" : "Crear Donante/Patrocinador"}
              </h2>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="col-span-1 md:col-span-2 lg:col-span-4 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700">Tipo de Persona</p>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { value: "Juridica", label: "Empresa / Organizacion", icon: <FaBuilding /> },
                          { value: "Natural", label: "Persona Natural", icon: <FaUser /> },
                        ].map((option) => {
                          const active = formData.tipoPersona === option.value;
                          return (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() =>
                                handleChange({ target: { name: "tipoPersona", value: option.value } })
                              }
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
                      required
                      value={formData.nombreCompleto}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={errors.nombreCompleto}
                      touched={touched.nombreCompleto}
                      helperText={!errors.nombreCompleto ? nameHelperText : undefined}
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
                      error={errors.tipoDocumento}
                      touched={touched.tipoDocumento}
                      options={documentTypeOptions}
                    />
                    <FormField
                      label="Numero de documento"
                      name="numeroDocumento"
                      type="text"
                      required
                      value={formData.numeroDocumento}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={errors.numeroDocumento || errors.identificacion}
                      touched={touched.numeroDocumento}
                      helperText={
                        checkingId
                          ? "Verificando disponibilidad..."
                          : errors.identificacion
                          ? undefined
                          : `${formData.numeroDocumento.length}/${docMaxLength} caracteres`
                      }
                    />
                  </>
                )}

                {isJuridica && (
                  <>
                    <FormField
                      label="Razon social"
                      name="razonSocial"
                      type="text"
                      required
                      value={formData.razonSocial}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={errors.razonSocial}
                      touched={touched.razonSocial}
                      helperText={!errors.razonSocial ? razonSocialHelperText : undefined}
                    />
                    <FormField
                      label="NIT"
                      name="nit"
                      type="text"
                      required
                      value={formData.nit}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={errors.nit || errors.identificacion}
                      touched={touched.nit}
                      helperText={
                        checkingId
                          ? "Verificando disponibilidad..."
                          : errors.identificacion
                          ? undefined
                          : `${formData.nit.length}/${nitMaxLength} caracteres`
                      }
                    />
                    <FormField
                      label="Representante legal"
                      name="personaContacto"
                      type="text"
                      required
                      value={formData.personaContacto}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={errors.personaContacto}
                      touched={touched.personaContacto}
                    />
                  </>
                )}

                <FormField
                  label={phoneLabel}
                  name="telefono"
                  type="tel"
                  required
                  value={formData.telefono}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.telefono}
                  touched={touched.telefono}
                />
                <FormField
                  label={emailLabel}
                  name="correo"
                  type="email"
                  required
                  value={formData.correo}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.correo}
                  touched={touched.correo}
                  helperText={checkingEmail ? "Verificando disponibilidad..." : undefined}
                />
                <FormField
                  label="Dirección"
                  name="direccion"
                  type="text"
                  value={formData.direccion}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  error={errors.direccion}
                  touched={touched.direccion}
                />
                <FormField
                  label="Ciudad"
                  name="ciudad"
                  type="text"
                  value={formData.ciudad}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  error={errors.ciudad}
                  touched={touched.ciudad}
                />
                <FormField
                  label="Pais"
                  name="pais"
                  type="text"
                  value={formData.pais}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  error={errors.pais}
                  touched={touched.pais}
                />

                {mode === "edit" && (
                  <FormField
                    label="Estado"
                    name="estado"
                    type="select"
                    value={formData.estado}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    options={estadoOptions}
                  />
                )}
              </div>
            </div>

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
                onClick={async () => {
                  const result = await handleSubmit();
                  if (result?.valid) {
                    const baseNombre = isJuridica ? formData.razonSocial : formData.nombreCompleto;
                    const baseIdentificacion = isJuridica ? formData.nit : formData.numeroDocumento;
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
                      "Por favor, complete todos los campos obligatorios antes de continuar."
                      );
                    }
                  }}
                  className="px-6 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-purple transition-all duration-200 font-medium shadow-lg disabled:opacity-60"
                  disabled={checkingId || checkingEmail}
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

  return document?.body ? createPortal(overlay, document.body) : overlay;
};

export default DonorSponsorModal;
