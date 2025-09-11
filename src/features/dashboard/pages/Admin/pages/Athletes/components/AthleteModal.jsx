import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { FormField } from "../../../../../../../shared/components/FormField";
import { showSuccessAlert } from "../../../../../../../shared/utils/alerts";
import {
  useFormAthleteValidation,
  athleteValidationRules,
} from "../hooks/useFormAthleteValidation";

const documentTypes = [
  { value: "cedula", label: "Cédula de Ciudadanía" },
  { value: "tarjeta_identidad", label: "Tarjeta de Identidad" },
  { value: "cedula_extranjeria", label: "Cédula de Extranjería" },
  { value: "pasaporte", label: "Pasaporte" },
];

const categoryOptions = [
  { value: "infantil", label: "Infantil (12-14 años)" },
  { value: "juvenil", label: "Juvenil (15-17 años)" },
  { value: "junior", label: "Junior (18-20 años)" },
  { value: "senior", label: "Senior (21-35 años)" },
  { value: "master", label: "Máster (36+ años)" },
  { value: "profesional", label: "Profesional" },
  { value: "elite", label: "Elite" },
];

const states = [
  { value: "Activo", label: "Activo" },
  { value: "Inactivo", label: "Inactivo" },
  { value: "Lesionado", label: "Lesionado" },
  { value: "Suspendido", label: "Suspendido" },
];

const sportsOptions = [
  { value: "acuaticos", label: "Acuáticos" },
  { value: "atletismo", label: "Atletismo" },
  { value: "badminton", label: "Bádminton" },
  { value: "baloncesto", label: "Baloncesto" },
  { value: "beisbol", label: "Béisbol" },
  { value: "billar", label: "Billar" },
  { value: "boxeo", label: "Boxeo" },
  { value: "ciclismo", label: "Ciclismo" },
  { value: "esgrima", label: "Esgrima" },
  { value: "futbol", label: "Fútbol" },
  { value: "gimnasia", label: "Gimnasia" },
  { value: "golf", label: "Golf" },
  { value: "halterofilia", label: "Halterofilia" },
  { value: "judo", label: "Judo" },
  { value: "karate", label: "Karate" },
  { value: "lucha", label: "Lucha" },
  { value: "natacion", label: "Natación" },
  { value: "patinaje", label: "Patinaje" },
  { value: "remo", label: "Remo" },
  { value: "softbol", label: "Softbol" },
  { value: "taekwondo", label: "Taekwondo" },
  { value: "tenis", label: "Tenis" },
  { value: "tenis_mesa", label: "Tenis de Mesa" },
  { value: "triathlon", label: "Triatlón" },
  { value: "voleibol", label: "Voleibol" },
];

const AthleteModal = ({
  isOpen,
  onClose,
  onSave,
  onUpdate,
  athleteToEdit = null,
  mode = athleteToEdit ? "edit" : "create",
}) => {
  const isEditing = mode === "edit" || athleteToEdit !== null;

  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateAllFields,
    resetForm,
    setTouched,
    setValues,
  } = useFormAthleteValidation(
    {
      nombres: "",
      tipoDocumento: "",
      numeroDocumento: "",
      correo: "",
      telefono: "",
      edad: "",
      fechaNacimiento: "",
      categoria: "",
      estado: "",
      deportes: "",
    },
    {
      nombres: [
        (value) => (!value?.trim() ? "El nombre es obligatorio" : ""),
        (value) => value?.trim().length < 2 ? "El nombre debe tener al menos 2 caracteres" : "",
      ],
      tipoDocumento: [
        (value) => (!value ? "Debe seleccionar un tipo de documento" : "")
      ],
      numeroDocumento: [
        (value) => (!value?.trim() ? "El número de documento es obligatorio" : ""),
      ],
      correo: [
        (value) => (!value?.trim() ? "El correo es obligatorio" : ""),
        (value) => {
          const email = value?.trim() || "";
          const emailRegex = /^[a-zA-Z0-9]([a-zA-Z0-9._-])*[a-zA-Z0-9]@[a-zA-Z0-9]([a-zA-Z0-9.-])*[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
          return !emailRegex.test(email) ? "El correo electrónico no es válido" : "";
        },
      ],
      telefono: [
        (value) => (!value?.trim() ? "El número telefónico es obligatorio" : ""),
      ],
      edad: [
        (value) => (!value || isNaN(parseInt(value)) ? "La edad es obligatoria" : ""),
        (value) => {
          const edad = parseInt(value);
          if (isNaN(edad)) return "";
          if (edad < 12) return "La edad mínima es 12 años";
          if (edad > 65) return "La edad máxima es 65 años";
          return "";
        }
      ],
      fechaNacimiento: [
        (value) => (!value ? "La fecha de nacimiento es obligatoria" : ""),
      ],
      categoria: [
        (value) => (!value ? "Debe seleccionar una categoría" : "")
      ],
      estado: [
        (value) => (!value ? "Debe seleccionar un estado" : "")
      ],
      deportes: [
        (value) => (!value ? "Debe seleccionar al menos un deporte" : "")
      ],
    }
  );

  // Cargar datos del deportista cuando se abra el modal en modo edición
  useEffect(() => {
    if (isOpen && isEditing && athleteToEdit) {
      setValues({
        nombres: athleteToEdit.nombres || "",
        tipoDocumento: athleteToEdit.tipoDocumento || "",
        numeroDocumento: athleteToEdit.numeroDocumento || "",
        correo: athleteToEdit.correo || "",
        telefono: athleteToEdit.telefono || "",
        edad: athleteToEdit.edad || "",
        fechaNacimiento: athleteToEdit.fechaNacimiento || "",
        categoria: athleteToEdit.categoria || "",
        estado: athleteToEdit.estado || "Activo",
        deportes: athleteToEdit.deportes || "",
      });
    }
  }, [isOpen, isEditing, athleteToEdit, setValues]);

  const formatPhoneNumber = (phone) => {
    if (!phone) return phone;
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, "");
    if (cleanPhone.startsWith("+57") || cleanPhone.startsWith("57")) return phone;
    if (/^\d{7,10}$/.test(cleanPhone)) return `+57 ${cleanPhone}`;
    return phone;
  };

  const handleSubmit = async () => {
    // 1. Marcar todos los campos como tocados
    const allTouched = {};
    Object.keys(values).forEach((field) => {
      allTouched[field] = true;
    });
    setTouched(allTouched);

    // 2. Validar todos los campos
    if (!validateAllFields()) {
      showErrorAlert(
        "Campos incompletos",
        "Por favor completa todos los campos correctamente antes de continuar."
      );
      return;
    }

    // 3. Confirmar en modo edición
    if (isEditing) {
      const confirmResult = await showConfirmAlert(
        "¿Estás seguro?",
        `¿Deseas actualizar la información del deportista ${athleteToEdit.nombres}?`,
        {
          confirmButtonText: "Sí, actualizar",
          cancelButtonText: "Cancelar",
        }
      );
      if (!confirmResult.isConfirmed) {
        return;
      }
    }

    try {
      const athleteData = {
        ...values,
        telefono: formatPhoneNumber(values.telefono),
        edad: parseInt(values.edad),
      };

      if (isEditing) {
        const updatedAthleteData = { ...athleteData, id: athleteToEdit.id };
        await onUpdate(updatedAthleteData);
        showSuccessAlert(
          "Deportista actualizado",
          `Los datos de ${values.nombres} han sido actualizados exitosamente.`
        );
      } else {
        await onSave(athleteData);
        showSuccessAlert(
          "Deportista creado",
          "El deportista ha sido creado exitosamente."
        );
      }

      resetForm();
      onClose();
    } catch (error) {
      console.error(
        `Error al ${isEditing ? "actualizar" : "crear"} deportista:`,
        error
      );
      showErrorAlert(
        "Error",
        error.message ||
          `Ocurrió un error al ${isEditing ? "actualizar" : "crear"} el deportista`
      );
    }
  };

  // Función para cerrar el modal y resetear el formulario
  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative"
        initial={{ scale: 0.8, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: 50 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white rounded-t-2xl border-b border-gray-200 p-6 z-10">
          <button
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
            onClick={handleClose}
          >
            ✕
          </button>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary-purple to-primary-blue bg-clip-text text-transparent text-center">
            {isEditing ? "Editar Deportista" : "Crear Deportista"}
          </h2>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          <div className="space-y-6">
            <FormField
              label="Nombre"
              name="nombres"
              type="text"
              placeholder="Nombre del deportista"
              value={values.nombres}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.nombres}
              touched={touched.nombres}
              delay={0.1}
              required
            />

            <FormField
              label="Tipo de Documento"
              name="tipoDocumento"
              type="select"
              placeholder="Seleccionar tipo de documento"
              options={documentTypes}
              value={values.tipoDocumento}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.tipoDocumento}
              touched={touched.tipoDocumento}
              delay={0.15}
              required
            />

            <FormField
              label="Identificación"
              name="numeroDocumento"
              type="text"
              placeholder="Identificación de deportista"
              value={values.numeroDocumento}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.numeroDocumento}
              touched={touched.numeroDocumento}
              delay={0.2}
              required
            />

            <FormField
              label="Correo"
              name="correo"
              type="email"
              placeholder="Correo de la deportista"
              value={values.correo}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.correo}
              touched={touched.correo}
              delay={0.25}
              required
            />

            <FormField
              label="Número Telefónico"
              name="telefono"
              type="text"
              placeholder="Número Telefónico de la deportista"
              value={values.telefono}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.telefono}
              touched={touched.telefono}
              delay={0.3}
              required
            />

            <FormField
              label="Edad"
              name="edad"
              type="number"
              placeholder="Edad de la deportista"
              value={values.edad}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.edad}
              touched={touched.edad}
              delay={0.35}
              required
              min="12"
              max="65"
            />

            <FormField
              label="Fecha de nacimiento"
              name="fechaNacimiento"
              type="date"
              placeholder="Fecha de nacimiento de la deportista"
              value={values.fechaNacimiento}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.fechaNacimiento}
              touched={touched.fechaNacimiento}
              delay={0.4}
              required
            />

            <FormField
              label="Categoria"
              name="categoria"
              type="select"
              placeholder="Categoria deportiva"
              options={categoryOptions}
              value={values.categoria}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.categoria}
              touched={touched.categoria}
              delay={0.45}
              required
            />

            <FormField
              label="Estado registro"
              name="estado"
              type="select"
              placeholder="Seleccionar estado del registro"
              options={states}
              value={values.estado}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.estado}
              touched={touched.estado}
              delay={0.5}
              required
            />

            <FormField
              label="Jugadores"
              name="deportes"
              type="select"
              placeholder="Seleccionar Acuédentes"
              options={sportsOptions}
              value={values.deportes}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.deportes}
              touched={touched.deportes}
              delay={0.55}
              required
            />
          </div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex justify-between pt-6 border-t border-gray-200"
          >
            <motion.button
              type="button"
              onClick={handleClose}
              className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Cancelar
            </motion.button>

            <motion.button
              onClick={handleSubmit}
              className="px-8 py-3 text-white rounded-xl transition-all duration-200 font-medium shadow-lg bg-gradient-to-r from-primary-purple to-primary-blue hover:from-primary-purple hover:to-primary-blue"
              whileHover={{
                scale: 1.02,
                boxShadow: "0 10px 25px rgba(139, 92, 246, 0.3)",
              }}
              whileTap={{ scale: 0.98 }}
            >
              {isEditing ? "Actualizar" : "Crear"}
            </motion.button>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AthleteModal;