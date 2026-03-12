import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaUserShield,
  FaPlus,
  FaSearch,
  FaEye,
  FaTimes,
  FaInfoCircle,
  FaExclamationCircle,
  FaTrash,
} from "react-icons/fa";
import { FormField } from "../../../../../../../../shared/components/FormField";
import { DocumentField } from "../../../../../../../../shared/components/DocumentField";
import {
  showSuccessAlert,
  showErrorAlert,
  showDeleteAlert,
} from "../../../../../../../../shared/utils/alerts.js";
import {
  findCategoryByName,
  resolveCategoryAgeRange,
  isAgeWithinRange,
  formatAgeRange,
} from "../../../../../../../../shared/utils/categoryAgeValidation";
import {
  useFormAthleteValidation,
  athleteValidationRules,
} from "../hooks/useFormAthleteValidation";
import AthletesService from "../services/AthletesService";
import { useDocumentValidation } from "../../../../../../../../shared/hooks/useDocumentValidation";

// Los tipos de documento y categorías ahora se reciben desde props (cargados desde la API)

const states = [
  { value: "Activo", label: "Activo" },
  { value: "Inactivo", label: "Inactivo" },
];

const parentescoOptions = [
  { value: "Madre", label: "Madre" },
  { value: "Padre", label: "Padre" },
  { value: "Abuelo/a", label: "Abuelo/a" },
  { value: "Tío/a", label: "Tío/a" },
  { value: "Hermano/a", label: "Hermano/a" },
  { value: "Primo/a", label: "Primo/a" },
  { value: "Tutor/a Legal", label: "Tutor/a Legal" },
  { value: "Vecino/a", label: "Vecino/a" },
  { value: "Amigo/a de la familia", label: "Amigo/a de la familia" },
  { value: "Otro", label: "Otro (especificar)" },
];

// Mapeo de parentesco del backend (inglés) al frontend (español)
const parentescoBackendToFrontend = {
  Mother: "Madre",
  Father: "Padre",
  Grandparent: "Abuelo/a",
  Uncle_Aunt: "Tío/a",
  Sibling: "Hermano/a",
  Cousin: "Primo/a",
  Legal_Guardian: "Tutor/a Legal",
  Neighbor: "Vecino/a",
  Family_Friend: "Amigo/a de la familia",
  Other: "Otro",
};

// Mapeo inverso: del frontend (español) al backend (inglés)
const parentescoFrontendToBackend = {
  Madre: "Mother",
  Padre: "Father",
  "Abuelo/a": "Grandparent",
  "Tío/a": "Uncle_Aunt",
  "Hermano/a": "Sibling",
  "Primo/a": "Cousin",
  "Tutor/a Legal": "Legal_Guardian",
  "Vecino/a": "Neighbor",
  "Amigo/a de la familia": "Family_Friend",
  Otro: "Other",
};

// Función para calcular la edad (igual que empleados)
const calculateAge = (birthDate) => {
  if (!birthDate) return "";

  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age >= 0 ? age.toString() : "";
};

const AthleteModal = ({
  isOpen,
  onClose,
  onSave,
  onUpdate,
  athleteToEdit = null,
  guardians = [],
  athletes = [],
  mode = athleteToEdit ? "edit" : "create",
  onCreateGuardian,
  onViewGuardian,
  onDeleteGuardian,
  newlyCreatedGuardianId = null,
  referenceData = { documentTypes: [] },
  isEnrollmentMode = false,
}) => {
  const isEditing =
    (mode === "edit" || athleteToEdit !== null) && !isEnrollmentMode;
  const [showGuardianSearch, setShowGuardianSearch] = useState(false);
  const [guardianSearchTerm, setGuardianSearchTerm] = useState("");
  const [currentAge, setCurrentAge] = useState(null);
  const [otroParentesco, setOtroParentesco] = useState("");
  const [hasDateOfBirth, setHasDateOfBirth] = useState(false);
  const [asyncErrors, setAsyncErrors] = useState({});
  const [checkingEmail, setCheckingEmail] = useState(false);

  // Hook para validación de documento en tiempo real
  const excludeUserId =
    isEditing && !isEnrollmentMode && athleteToEdit?.userId
      ? athleteToEdit.userId
      : null;
  // En modo matrícula (isEnrollmentMode), saltar la verificación de inscripciones pendientes
  // Solo verificar si ya está matriculado como deportista
  const skipInscriptionCheck = isEnrollmentMode;
  const {
    isChecking: isCheckingDocumentValidation,
    documentExists,
    validationMessage: documentValidationMessage,
    validateDocumentDebounced,
    clearValidation: clearDocumentValidation,
  } = useDocumentValidation(excludeUserId, skipInscriptionCheck);

  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateAllFields,
    validateFields,
    resetForm,
    setTouched,
    setValues,
    setErrors,
  } = useFormAthleteValidation(
    {
      firstName: "",
      middleName: "",
      lastName: "",
      secondLastName: "",
      documentTypeId: "",
      identification: "",
      email: "",
      phoneNumber: "",
      address: "",
      birthDate: "",
      age: "",
      categoria: "",
      estado: "Activo",
      acudiente: "",
      parentesco: "",
    },
    athleteValidationRules,
  );

  // Debug: Ver qué tipos de documento se están recibiendo
  useEffect(() => {
    if (isOpen && referenceData.documentTypes) {
      console.log("📊 Total:", referenceData.documentTypes.length);
    }
  }, [isOpen, referenceData.documentTypes]);

  // Función personalizada para manejar cambios (igual que empleados)
  const handleCustomChange = (name, value) => {
    if (name === "birthDate") {
      const age = calculateAge(value);
      setValues((prev) => ({
        ...prev,
        [name]: value,
        age: age,
      }));
    } else {
      handleChange({ target: { name, value } });
    }
  };

  // Función para manejar cambio de email y marcar como touched inmediatamente
  const handleEmailChange = (e) => {
    // Marcar como touched PRIMERO para activar validación instantánea
    setTouched((prev) => ({ ...prev, email: true }));
    // Luego actualizar el valor
    handleChange(e);
  };

  useEffect(() => {
    if (values.birthDate) {
      const age = calculateAge(values.birthDate);
      setCurrentAge(parseInt(age) || null);
      setHasDateOfBirth(true);
    } else {
      setCurrentAge(null);
      setHasDateOfBirth(false);
    }
  }, [values.birthDate]);

  useEffect(() => {
    if (newlyCreatedGuardianId && guardians.length > 0 && !isEditing) {
      const guardianExists = guardians.find(
        (g) => g.id === newlyCreatedGuardianId,
      );
      if (guardianExists) {
        handleChange({
          target: {
            name: "acudiente",
            value: newlyCreatedGuardianId.toString(),
          },
        });
      }
    }
  }, [newlyCreatedGuardianId, guardians, isEditing]);

  // Re-validar el campo de identificación INSTANTÁNEAMENTE cuando cambia el tipo de documento
  useEffect(() => {
    if (values.documentTypeId && values.identification) {
      // Marcar el campo como touched para que se muestre el error
      setTouched((prev) => ({ ...prev, identification: true }));
    }
  }, [values.documentTypeId, setTouched]);

  // Validación en tiempo real de documento (verifica deportistas + inscripciones)
  useEffect(() => {
    if (!values.identification || values.identification.length < 6) {
      clearDocumentValidation();
      setAsyncErrors((prev) => ({ ...prev, identification: null }));
      return;
    }

    // NO VALIDAR en modo edición normal (desde tabla de deportistas)
    // SÍ VALIDAR en modo matrícula (isEnrollmentMode) y en modo creación
    if (isEditing && !isEnrollmentMode) {
      clearDocumentValidation();
      setAsyncErrors((prev) => ({ ...prev, identification: null }));
      if (
        errors.identification &&
        errors.identification.includes("ya está registrado")
      ) {
        setErrors((prev) => ({ ...prev, identification: "" }));
      }
      return;
    }
    console.log(
      "🔍 [AthleteModal] Documento a validar:",
      values.identification,
    );

    // Usar el hook de validación con debounce
    validateDocumentDebounced(values.identification, 6);
  }, [
    values.identification,
    isEditing,
    isEnrollmentMode,
    validateDocumentDebounced,
    clearDocumentValidation,
    setErrors,
    errors.identification,
  ]);

  // Sincronizar el resultado de la validación con asyncErrors
  useEffect(() => {
    // Solo actualizar si estamos validando o acabamos de terminar
    if (documentExists) {
      // Documento existe - mostrar error
      setAsyncErrors((prev) => ({
        ...prev,
        identification: documentValidationMessage,
      }));
      setErrors((prev) => ({
        ...prev,
        identification: documentValidationMessage,
      }));
      setTouched((prev) => ({ ...prev, identification: true }));
    } else if (
      !isCheckingDocumentValidation &&
      values.identification.length >= 6
    ) {
      // Validación completada y documento NO existe - limpiar error solo si es de validación async
      setAsyncErrors((prev) => ({ ...prev, identification: null }));
      // Solo limpiar el error si es un error de documento duplicado
      if (
        errors.identification &&
        (errors.identification.includes("ya está matriculado") ||
          errors.identification.includes("ya tiene una inscripción") ||
          errors.identification.includes("ya está registrado") ||
          errors.identification.includes("ya está inscrito"))
      ) {
        setErrors((prev) => ({ ...prev, identification: "" }));
      }
    }
  }, [
    documentExists,
    documentValidationMessage,
    isCheckingDocumentValidation,
    values.identification.length,
    setErrors,
    setTouched,
  ]);

  // Validación instantánea de email
  useEffect(() => {
    const checkEmail = async () => {
      // No validar si el email está vacío o no tiene formato básico de email
      if (!values.email || !values.email.includes("@")) {
        setAsyncErrors((prev) => ({ ...prev, email: null }));
        return;
      }

      // Validar formato de email primero (antes de consultar al backend)
      // Regex más estricta: solo letras, números, puntos, guiones y guiones bajos
      const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(values.email)) {
        // Si el formato es inválido, no hacer la consulta al backend
        // El error de formato ya lo maneja la validación síncrona
        setAsyncErrors((prev) => ({ ...prev, email: null }));
        return;
      }

      // En modo edición, NO validar si el email es el mismo que el original
      if (
        isEditing &&
        !isEnrollmentMode &&
        athleteToEdit?.email === values.email
      ) {
        setAsyncErrors((prev) => ({ ...prev, email: null }));
        if (errors.email && errors.email.includes("ya está registrado")) {
          setErrors((prev) => ({ ...prev, email: "" }));
        }
        return;
      }

      setCheckingEmail(true);
      try {
        console.log("🔍 [AthleteModal] Email a validar:", values.email);
        console.log(
          "🔍 [AthleteModal] isEditing:",
          isEditing,
          "isEnrollmentMode:",
          isEnrollmentMode,
        );

        // En modo edición, excluir el userId del deportista actual
        // En modo matrícula o creación, no excluir a nadie
        const excludeUserId =
          isEditing && !isEnrollmentMode && athleteToEdit?.userId
            ? athleteToEdit.userId
            : null;
        console.log("🔍 [AthleteModal] athleteToEdit completo:", athleteToEdit);

        const result = await AthletesService.checkEmailAvailability(
          values.email,
          excludeUserId,
        );
        console.log("🔍 [AthleteModal] result.available:", result.available);

        if (!result.available) {
          const errorMsg = `Este email ya está registrado`;
          setAsyncErrors((prev) => ({ ...prev, email: errorMsg }));
          setErrors((prev) => ({ ...prev, email: errorMsg }));
          setTouched((prev) => ({ ...prev, email: true }));
        } else {
          setAsyncErrors((prev) => ({ ...prev, email: null }));
          if (errors.email && errors.email.includes("ya está registrado")) {
            setErrors((prev) => ({ ...prev, email: "" }));
          }
        }
      } catch (error) {
        console.error("❌ [AthleteModal] Error verificando email:", error);
        console.error(
          "❌ [AthleteModal] Error completo:",
          error.message,
          error.stack,
        );
      } finally {
        setCheckingEmail(false);
      }
    };

    // Validar INSTANTÁNEAMENTE si:
    // 1. El campo ya fue tocado (touched.email)
    // 2. Estamos en modo matrícula (isEnrollmentMode)
    // 3. Estamos en modo edición (isEditing)
    const shouldValidateInstantly =
      touched.email || isEnrollmentMode || isEditing;
    const delay = shouldValidateInstantly ? 0 : 300;

    const timeoutId = setTimeout(checkEmail, delay);
    return () => clearTimeout(timeoutId);
  }, [
    values.email,
    isEditing,
    athleteToEdit,
    setErrors,
    setTouched,
    errors.email,
    isEnrollmentMode,
    touched.email,
  ]);

  // Validación de categoría vs edad en tiempo real
  // REGLA: Puede escoger categorías MAYORES a su edad, pero NO MENORES
  useEffect(() => {
    // Solo validar si hay fecha de nacimiento y categoría seleccionada
    if (!values.birthDate || !values.categoria) {
      // Limpiar error de categoría si no hay datos para validar
      if (errors.categoria && errors.categoria.includes("edad")) {
        setErrors((prev) => ({ ...prev, categoria: "" }));
      }
      return;
    }

    // Calcular edad
    const birthDate = new Date(values.birthDate);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    // Buscar la categoría seleccionada
    const selectedCategory = referenceData.sportsCategories?.find(
      (cat) => cat.name === values.categoria,
    );

    if (!selectedCategory) {
      return;
    }

    // NUEVA LÓGICA: Permitir categorías mayores, bloquear categorías menores
    const minAge = selectedCategory.minAge || 0;
    const maxAge = selectedCategory.maxAge || 999;

    // Si la edad es MAYOR al máximo de la categoría, NO permitir (está muy grande para esa categoría)
    if (age > maxAge) {
      const errorMsg = `Tu edad es mayor a la edad para la categoría`;
      setErrors((prev) => ({ ...prev, categoria: errorMsg }));
      setTouched((prev) => ({ ...prev, categoria: true }));
    } else {
      // Limpiar error si la edad es válida (menor o igual al máximo)
      if (
        errors.categoria &&
        (errors.categoria.includes("edad") ||
          errors.categoria.includes("mayor"))
      ) {
        setErrors((prev) => ({ ...prev, categoria: "" }));
      }
    }
  }, [
    values.birthDate,
    values.categoria,
    referenceData.sportsCategories,
    setErrors,
    setTouched,
    errors.categoria,
  ]);

  useEffect(() => {
    if (isOpen && athleteToEdit && (isEditing || isEnrollmentMode)) {
      console.log("🔵 [AthleteModal] isEditing:", isEditing);
      console.log(
        "🔵 [AthleteModal] Parentesco recibido:",
        athleteToEdit.parentesco,
      );

      // Convertir fecha ISO a formato YYYY-MM-DD
      let birthDate =
        athleteToEdit.birthDate || athleteToEdit.fechaNacimiento || "";
      if (birthDate) {
        try {
          // Si ya está en formato YYYY-MM-DD, usarla directamente
          if (
            typeof birthDate === "string" &&
            /^\d{4}-\d{2}-\d{2}$/.test(birthDate)
          ) {
          }
          // Si viene en formato DD/MM/YYYY o D/M/YYYY (del landing)
          else if (
            typeof birthDate === "string" &&
            /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(birthDate)
          ) {
            const [day, month, year] = birthDate.split("/");
            // Agregar ceros iniciales si es necesario
            const dayPadded = day.padStart(2, "0");
            const monthPadded = month.padStart(2, "0");
            birthDate = `${year}-${monthPadded}-${dayPadded}`;
          }
          // Si viene en formato ISO (YYYY-MM-DDTHH:mm:ss.sssZ), extraer solo la fecha
          else if (typeof birthDate === "string" && birthDate.includes("T")) {
            birthDate = birthDate.split("T")[0];
          }
          // Si viene en otro formato, intentar convertir
          else {
            const date = new Date(birthDate);
            if (!isNaN(date.getTime())) {
              // Usar la fecha local sin conversión UTC para evitar cambios de día
              const year = date.getFullYear();
              const month = String(date.getMonth() + 1).padStart(2, "0");
              const day = String(date.getDate()).padStart(2, "0");
              birthDate = `${year}-${month}-${day}`;
            } else {
              console.error(
                "🔴 [AthleteModal] Fecha inválida, no se puede convertir",
              );
              birthDate = "";
            }
          }
        } catch (error) {
          console.error("🔴 [AthleteModal] Error procesando fecha:", error);
          birthDate = "";
        }
      }
      // Convertir parentesco del backend (inglés) al frontend (español)
      let parentescoFrontend = athleteToEdit.parentesco || "";
      if (
        parentescoFrontend &&
        parentescoBackendToFrontend[parentescoFrontend]
      ) {
        parentescoFrontend = parentescoBackendToFrontend[parentescoFrontend];
      }
      // Separar nombres y apellidos si vienen del landing (formato: "Nombre1 Nombre2" y "Apellido1 Apellido2")
      let firstName = athleteToEdit.firstName || "";
      let middleName = athleteToEdit.middleName || "";
      let lastName = athleteToEdit.lastName || "";
      let secondLastName = athleteToEdit.secondLastName || "";

      // Si viene del landing (tiene "nombres" y "apellidos" en lugar de firstName/lastName)
      if (athleteToEdit.nombres && !athleteToEdit.firstName) {
        const nombres = athleteToEdit.nombres.trim().split(/\s+/);
        firstName = nombres[0] || "";
        middleName = nombres.slice(1).join(" ") || "";
      }

      if (athleteToEdit.apellidos && !athleteToEdit.lastName) {
        const apellidos = athleteToEdit.apellidos.trim().split(/\s+/);
        lastName = apellidos[0] || "";
        secondLastName = apellidos.slice(1).join(" ") || "";
      }
      console.log(
        "🔵 [AthleteModal] Categoría recibida:",
        athleteToEdit.categoria,
      );
      const newValues = {
        firstName: firstName,
        middleName: middleName,
        lastName: lastName,
        secondLastName: secondLastName,
        documentTypeId:
          athleteToEdit.documentTypeId || athleteToEdit.tipoDocumento || "",
        identification:
          athleteToEdit.identification || athleteToEdit.numeroDocumento || "",
        email: athleteToEdit.email || athleteToEdit.correo || "",
        phoneNumber: athleteToEdit.phoneNumber || athleteToEdit.telefono || "",
        address: athleteToEdit.address || athleteToEdit.direccion || "",
        birthDate: birthDate,
        age: calculateAge(birthDate),
        categoria: athleteToEdit.categoria || "",
        // Si estamos en modo matrícula, siempre usar "Activo", de lo contrario usar el estado del atleta
        estado: isEnrollmentMode ? "Activo" : athleteToEdit.estado || "Activo",
        acudiente: athleteToEdit.acudiente?.toString() || "",
        parentesco: parentescoFrontend,
      };

      setValues(newValues);

      setHasDateOfBirth(!!birthDate);

      // En modo edición, marcar email como touched para activar validación instantánea
      if (isEditing && !isEnrollmentMode) {
        setTouched((prev) => ({ ...prev, email: true }));
      }

      // Si el parentesco no está en las opciones, es un "Otro" personalizado
      if (
        parentescoFrontend &&
        !parentescoOptions.some((opt) => opt.value === parentescoFrontend)
      ) {
        setOtroParentesco(parentescoFrontend);
        setValues((prev) => ({ ...prev, parentesco: "Otro" }));
      }

      // ✅ VALIDACIÓN AUTOMÁTICA: Marcar todos los campos como touched y validar
      if (isEnrollmentMode) {
        console.log("🔍 [AthleteModal] Email a validar:", newValues.email);
        // Marcar todos los campos como touched INMEDIATAMENTE
        const allTouched = {
          firstName: true,
          middleName: true,
          lastName: true,
          secondLastName: true,
          documentTypeId: true,
          identification: true,
          email: true,
          phoneNumber: true,
          birthDate: true,
          categoria: true,
          estado: true,
          acudiente: true,
          parentesco: true,
        };

        setTouched(allTouched);

        // Ejecutar validaciones asíncronas INMEDIATAMENTE (sin setTimeout)
        (async () => {
          // Validar documento - Verificar en TODOS los usuarios
          if (
            newValues.identification &&
            newValues.identification.length >= 6
          ) {
            try {
              // En modo matrícula desde landing, no hay usuario previo, así que no excluir nada
              const result =
                await AthletesService.checkIdentificationAvailability(
                  newValues.identification,
                  null,
                );
              if (!result.available) {
                const errorMsg = `Este documento ya está registrado`;
                setAsyncErrors((prev) => ({
                  ...prev,
                  identification: errorMsg,
                }));
                setErrors((prev) => ({ ...prev, identification: errorMsg }));
              } else {
                setAsyncErrors((prev) => ({ ...prev, identification: null }));
              }
            } catch (error) {
              console.error(
                "❌ [AthleteModal] Error verificando documento:",
                error,
              );
            }
          }

          // Validar email - Verificar en TODOS los usuarios
          // Primero validar formato antes de consultar al backend
          // Regex más estricta: solo letras, números, puntos, guiones y guiones bajos
          const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

          if (newValues.email && newValues.email.includes("@")) {
            console.log(
              "🔍 [AthleteModal] Email pasa regex?",
              emailRegex.test(newValues.email),
            );

            if (emailRegex.test(newValues.email)) {
              try {
                // En modo matrícula desde landing, no hay usuario previo, así que no excluir nada
                const result = await AthletesService.checkEmailAvailability(
                  newValues.email,
                  null,
                );
                if (!result.available) {
                  const errorMsg = `Este email ya está registrado`;
                  setAsyncErrors((prev) => ({ ...prev, email: errorMsg }));
                  setErrors((prev) => ({ ...prev, email: errorMsg }));
                } else {
                  setAsyncErrors((prev) => ({ ...prev, email: null }));
                }
              } catch (error) {
                console.error(
                  "❌ [AthleteModal] Error verificando email:",
                  error,
                );
              }
            } else {
              // El error de formato ya lo maneja la validación síncrona
            }
          }

          // ✅ VALIDAR TELÉFONO INMEDIATAMENTE con los nuevos valores
          validateFields(["phoneNumber"], newValues);
        })();
      }
    } else if (isOpen && !isEditing && !isEnrollmentMode) {
      setValues({
        firstName: "",
        middleName: "",
        lastName: "",
        secondLastName: "",
        documentTypeId: "",
        identification: "",
        email: "",
        phoneNumber: "",
        address: "",
        birthDate: "",
        age: "",
        categoria: "",
        estado: "Activo",
        acudiente: "",
        parentesco: "",
      });
      setOtroParentesco("");
      setAsyncErrors({});
      setHasDateOfBirth(false);
    }
  }, [isOpen, isEditing, isEnrollmentMode, athleteToEdit, setValues]);

  const handleParentescoChange = (e) => {
    const { name, value } = e.target;
    // Actualizar el valor
    handleChange(e);

    // Limpiar el campo "Otro" si no es necesario
    if (value !== "Otro") {
      setOtroParentesco("");
    }
  };

  const filteredGuardians = guardians.filter(
    (guardian) =>
      guardian.nombreCompleto
        ?.toLowerCase()
        .includes(guardianSearchTerm.toLowerCase()) ||
      guardian.identificacion?.includes(guardianSearchTerm),
  );

  const selectedGuardian = guardians.find(
    (g) => g.id?.toString() === values.acudiente?.toString(),
  );

  const isMinor = currentAge !== null && currentAge < 18;
  const isAcudienteRequired = hasDateOfBirth && isMinor;

  const getFinalParentesco = () => {
    if (values.parentesco === "Otro" && otroParentesco.trim()) {
      return otroParentesco.trim();
    }
    return values.parentesco;
  };

  const getAcudienteOptions = () => {
    const baseOptions = guardians.map((g) => ({
      value: g.id.toString(),
      label: `${g.nombreCompleto} - ${g.identificacion}`,
    }));

    if (hasDateOfBirth && !isAcudienteRequired) {
      return [{ value: "", label: "Sin acudiente" }, ...baseOptions];
    }

    return baseOptions;
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    console.log("🔵 [AthleteModal] Valores actuales:", values);

    // Marcar todos los campos como tocados para mostrar errores
    const allTouched = {};
    Object.keys(athleteValidationRules).forEach((f) => (allTouched[f] = true));
    setTouched(allTouched);
    const isValid = validateAllFields();
    if (!isValid) {
      return;
    }

    // Validación especial para "Otro" parentesco
    if (
      values.acudiente &&
      values.parentesco === "Otro" &&
      !otroParentesco.trim()
    ) {
      showErrorAlert(
        "Parentesco requerido",
        "Debes especificar el tipo de parentesco en el campo 'Especificar parentesco'.",
      );
      return;
    }

    const ageValue = calculateAge(values.birthDate);
    const ageNumber =
      ageValue !== "" && !Number.isNaN(Number(ageValue))
        ? Number(ageValue)
        : null;
    console.log("🔍 [AthleteModal] Edad calculada:", ageNumber);
    console.log(
      "🔍 [AthleteModal] Categorías disponibles:",
      referenceData.sportsCategories,
    );

    const selectedCategory = findCategoryByName(
      referenceData.sportsCategories || [],
      values.categoria,
    );
    if (values.categoria && !selectedCategory) {
      showErrorAlert(
        "Categoria invalida",
        "La categoria seleccionada no existe. Por favor, selecciona una categoria valida.",
      );
      return;
    }

    // NUEVA LÓGICA: Permitir categorías mayores, bloquear categorías menores
    const minAge = selectedCategory.minAge || 0;
    const maxAge = selectedCategory.maxAge || 999;
    console.log(
      "🔍 [AthleteModal] Edad:",
      ageNumber,
      "Categoría:",
      values.categoria,
      "Rango:",
      minAge,
      "-",
      maxAge,
    );

    // Si la edad es MAYOR al máximo de la categoría, NO permitir (está muy grande para esa categoría)
    if (ageNumber !== null && ageNumber > maxAge) {
      // NO mostrar sweet alert, el error ya está visible debajo del campo
      return;
    }
    console.log(
      "✅ [AthleteModal] Todas las validaciones pasaron, procediendo a guardar...",
    );

    try {
      const finalParentesco = getFinalParentesco();

      // Convertir parentesco del frontend (español) al backend (inglés)
      let parentescoBackend = finalParentesco;
      if (parentescoBackend && parentescoFrontendToBackend[parentescoBackend]) {
        parentescoBackend = parentescoFrontendToBackend[parentescoBackend];
      }
      console.log(
        "🔵 [AthleteModal] Parentesco convertido a inglés:",
        parentescoBackend,
      );

      // Convertir acudiente a número o null
      const acudienteId =
        values.acudiente && values.acudiente.toString().trim()
          ? parseInt(values.acudiente)
          : null;

      // Preparar datos base del deportista
      const athleteData = {
        firstName: values.firstName.trim(),
        middleName: values.middleName?.trim() || "",
        lastName: values.lastName.trim(),
        secondLastName: values.secondLastName?.trim() || "",
        documentTypeId: values.documentTypeId,
        identification: values.identification.trim(),
        email: values.email.trim(),
        phoneNumber: values.phoneNumber,
        address: values.address.trim(),
        birthDate: values.birthDate,
        categoria: values.categoria,
        estado: values.estado,
      };

      // Solo agregar acudiente y parentesco si hay un acudiente seleccionado
      if (acudienteId) {
        athleteData.acudiente = acudienteId;
        athleteData.parentesco = parentescoBackend;
      }
      if (isEditing) {
        // Detectar si cambió el email
        const emailChanged = athleteToEdit.email !== values.email.trim();
        const updateData = {
          ...athleteData,
          id: athleteToEdit.id,
          shouldUpdateInscription:
            values.estado === "Inactivo" && athleteToEdit.estado !== "Inactivo",
          emailChanged, // Indicar si cambió el email para reenviar credenciales
        };
        await onUpdate(updateData);
      } else {
        // Si estamos en modo matrícula desde inscripción, preservar el ID de la inscripción
        if (isEnrollmentMode && athleteToEdit?.id) {
          athleteData.preRegistrationId = athleteToEdit.id;
        }

        await onSave(athleteData);
      }
      resetForm();
      setOtroParentesco("");
      setHasDateOfBirth(false);
      onClose();
    } catch (error) {
      console.error("❌ [AthleteModal] Error en submit:", error);
      showErrorAlert("Error", error.message);
    }
  };

  const handleCreateGuardian = () => {
    console.log(
      "🟣 [AthleteModal] onCreateGuardian existe?",
      typeof onCreateGuardian,
    );
    if (onCreateGuardian) {
      onCreateGuardian();
    } else {
    }
  };

  const handleViewGuardian = () => {
    if (selectedGuardian && onViewGuardian) {
      onViewGuardian(selectedGuardian);
    }
  };

  const handleDeleteGuardianClick = async (guardianToDelete = null) => {
    const guardian = guardianToDelete || selectedGuardian;

    if (!guardian || !onDeleteGuardian) return;

    const isCurrentGuardian = values.acudiente === guardian.id?.toString();

    // Mensaje simple y directo
    const confirmMessage = `¿Eliminar a ${guardian.nombreCompleto}?`;

    // Confirmar eliminación
    const result = await showDeleteAlert(
      "Confirmar eliminación",
      confirmMessage,
    );

    if (result.isConfirmed) {
      // Intentar eliminar (el backend validará si tiene otros deportistas)
      const success = await onDeleteGuardian(guardian);

      if (success) {
        // Si era el acudiente actual, desvincularlo
        if (isCurrentGuardian) {
          handleChange({
            target: {
              name: "acudiente",
              value: "",
            },
          });

          handleChange({
            target: {
              name: "parentesco",
              value: "",
            },
          });

          setOtroParentesco("");

          // Si es menor de edad, mostrar advertencia
          if (isAcudienteRequired) {
            showErrorAlert(
              "Acudiente requerido",
              "Debes asignar un nuevo acudiente antes de guardar.",
            );
          }
        }
      }
    }
  };

  const handleSelectGuardianFromSearch = (guardian) => {
    handleChange({
      target: { name: "acudiente", value: guardian.id.toString() },
    });
    setGuardianSearchTerm("");
    setShowGuardianSearch(false);
  };

  const handleClose = () => {
    resetForm();
    setOtroParentesco("");
    setHasDateOfBirth(false);
    setShowGuardianSearch(false);
    setGuardianSearchTerm("");
    setCurrentAge(null);
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
        className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden relative flex flex-col"
        initial={{ scale: 0.8, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: 50 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
      >
        <div className="flex-shrink-0 bg-white rounded-t-2xl border-b border-gray-200 p-3 relative">
          <button
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-full"
            onClick={handleClose}
          >
            <FaTimes size={16} />
          </button>
          <h2 className="text-xl font-bold bg-gradient-to-r from-primary-purple to-primary-blue bg-clip-text text-transparent text-center">
            {isEditing
              ? "Editar Deportista"
              : isEnrollmentMode
                ? "Crear Matrícula"
                : "Crear Deportista"}
          </h2>
          {isEditing && (
            <p className="text-center text-gray-600 mt-2">
              Modificando información de:{" "}
              <span className="font-semibold text-primary-purple">
                {athleteToEdit.nombres} {athleteToEdit.apellidos}
              </span>
            </p>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          <div className="mb-3">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b border-gray-200 pb-2">
              Información Personal
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {/* Tipo Documento */}
              <FormField
                label="Tipo de Documento"
                name="documentTypeId"
                type="select"
                placeholder="Seleccionar tipo de documento"
                required
                options={referenceData.documentTypes.map((type) => ({
                  value: type.id,
                  label: type.name,
                }))}
                value={values.documentTypeId}
                error={errors.documentTypeId}
                touched={touched.documentTypeId}
                onChange={handleChange}
                onBlur={handleBlur}
                delay={0.1}
              />

              {/* Identificación con validación por tipo de documento */}
              <div className="relative">
                <DocumentField
                  documentType={
                    referenceData.documentTypes.find(
                      (dt) => dt.id === parseInt(values.documentTypeId),
                    )?.name
                  }
                  value={values.identification}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.identification || asyncErrors.identification}
                  touched={touched.identification}
                  required
                  disabled={false}
                  label="Número de Documento"
                  name="identification"
                />
                {isCheckingDocumentValidation && (
                  <div className="absolute right-3 top-9">
                    <div className="w-5 h-5 border-2 border-primary-purple border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>

              <div>
                <FormField
                  label="Primer Nombre"
                  name="firstName"
                  type="text"
                  placeholder="Primer nombre de la deportista"
                  value={values.firstName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.firstName}
                  touched={touched.firstName}
                  required
                  delay={0.3}
                />
              </div>

              <div>
                <FormField
                  label="Segundo Nombre"
                  name="middleName"
                  type="text"
                  placeholder="Segundo nombre (opcional)"
                  value={values.middleName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.middleName}
                  touched={touched.middleName}
                  required={false}
                  delay={0.35}
                />
              </div>

              <div>
                <FormField
                  label="Primer Apellido"
                  name="lastName"
                  type="text"
                  placeholder="Primer apellido de la deportista"
                  value={values.lastName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.lastName}
                  touched={touched.lastName}
                  required
                  delay={0.4}
                />
              </div>

              <div>
                <FormField
                  label="Segundo Apellido"
                  name="secondLastName"
                  type="text"
                  placeholder="Segundo apellido (opcional)"
                  value={values.secondLastName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.secondLastName}
                  touched={touched.secondLastName}
                  required={false}
                  delay={0.45}
                />
              </div>

              <div className="relative">
                <FormField
                  label="Correo Electrónico"
                  name="email"
                  type="email"
                  placeholder="correo@ejemplo.com"
                  value={values.email}
                  onChange={handleEmailChange}
                  onBlur={handleBlur}
                  error={errors.email || asyncErrors.email}
                  touched={touched.email}
                  required
                  delay={0.5}
                />
                {checkingEmail && (
                  <div className="absolute right-3 top-9">
                    <div className="w-5 h-5 border-2 border-primary-purple border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>

              <div>
                <FormField
                  label="Número Telefónico"
                  name="phoneNumber"
                  type="text"
                  placeholder="Número de Teléfono"
                  value={values.phoneNumber}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.phoneNumber}
                  touched={touched.phoneNumber}
                  required
                  delay={0.6}
                />
              </div>

              <div>
                <FormField
                  label="Dirección"
                  name="address"
                  type="text"
                  placeholder="Dirección de residencia"
                  value={values.address}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.address}
                  touched={touched.address}
                  required
                  delay={0.7}
                />
              </div>

              <div>
                <FormField
                  label="Fecha de Nacimiento"
                  name="birthDate"
                  type="date"
                  placeholder="Selecciona la fecha"
                  value={values.birthDate}
                  onChange={handleCustomChange}
                  onBlur={handleBlur}
                  error={errors.birthDate}
                  touched={touched.birthDate}
                  required
                  minAge={5}
                  maxAge={100}
                  helperText={
                    currentAge !== null
                      ? `Edad: ${currentAge} años ${isMinor ? "(Menor)" : "(Mayor)"}`
                      : "Ingresa la fecha para determinar si requiere acudiente"
                  }
                  delay={0.7}
                />
              </div>

              {/* Edad (calculada automáticamente) */}
              <div>
                <FormField
                  label="Edad"
                  name="age"
                  type="text"
                  placeholder="Calculada automáticamente"
                  value={currentAge !== null ? `${currentAge} años` : ""}
                  disabled
                  helperText={
                    currentAge !== null
                      ? `${isMinor ? "Menor de edad" : "Mayor de edad"}`
                      : ""
                  }
                  delay={0.75}
                />
              </div>

              <div>
                <FormField
                  label="Categoría"
                  name="categoria"
                  type="select"
                  placeholder="Selecciona la categoría"
                  options={referenceData.sportsCategories.map((cat) => ({
                    value: cat.name,
                    label: cat.name,
                  }))}
                  value={values.categoria}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.categoria}
                  touched={touched.categoria}
                  required
                  helperText=""
                  delay={0.8}
                />
              </div>

              {isEditing && (
                <div>
                  <FormField
                    label="Estado de la Deportista"
                    name="estado"
                    type="select"
                    placeholder="Selecciona el estado"
                    options={states}
                    value={values.estado}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={errors.estado}
                    touched={touched.estado}
                    required
                    helperText={
                      values.estado === "Activo"
                        ? "Participa normalmente en actividades"
                        : "⚠️ Al marcar como Inactivo, la inscripción se suspenderá"
                    }
                    delay={0.9}
                  />
                </div>
              )}
            </div>
          </div>

          <motion.div
            className={`rounded-lg p-3 border mb-3 ${
              !hasDateOfBirth
                ? "bg-gray-50 border-gray-200"
                : isAcudienteRequired
                  ? "bg-blue-50 border-blue-200"
                  : values.acudiente
                    ? "bg-purple-50 border-purple-200"
                    : "bg-green-50 border-green-200"
            }`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.4 }}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <FaUserShield className="text-primary-purple" />
                Información del Acudiente
                {!hasDateOfBirth && (
                  <span className="text-xs bg-gray-500 text-white px-2 py-0.5 rounded-full">
                    PENDIENTE
                  </span>
                )}
                {hasDateOfBirth && isAcudienteRequired && (
                  <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">
                    OBLIGATORIO
                  </span>
                )}
                {hasDateOfBirth && !isAcudienteRequired && (
                  <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">
                    OPCIONAL
                  </span>
                )}
              </h3>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowGuardianSearch(!showGuardianSearch)}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 text-sm font-medium"
                >
                  <FaSearch size={12} />
                  {showGuardianSearch ? "Ocultar" : "Buscar"}
                </button>
                <button
                  type="button"
                  onClick={handleCreateGuardian}
                  className="flex items-center gap-2 px-3 py-2 bg-primary-purple text-white rounded-lg hover:bg-purple-700 transition-all duration-200 text-sm font-medium"
                >
                  <FaPlus size={12} />
                  Crear Nuevo
                </button>
              </div>
            </div>

            <AnimatePresence>
              {showGuardianSearch && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-3"
                >
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Buscar acudiente por nombre o documento..."
                      value={guardianSearchTerm}
                      onChange={(e) => setGuardianSearchTerm(e.target.value)}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-purple focus:border-primary-purple transition-all duration-200 text-sm"
                    />
                    <FaSearch
                      className="absolute right-3 top-3 text-gray-400"
                      size={12}
                    />
                  </div>
                  {guardianSearchTerm && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2 max-h-32 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg"
                    >
                      {filteredGuardians.length > 0 ? (
                        filteredGuardians.map((guardian) => {
                          const athleteCount = athletes.filter(
                            (a) =>
                              a.acudiente?.toString() ===
                              guardian.id?.toString(),
                          ).length;
                          const canDelete =
                            athleteCount === 0 ||
                            (athleteCount === 1 &&
                              values.acudiente === guardian.id?.toString());

                          return (
                            <div
                              key={guardian.id}
                              className="flex items-center justify-between px-3 py-2 hover:bg-purple-50 border-b border-gray-100 last:border-b-0 transition-colors duration-150"
                            >
                              <button
                                type="button"
                                onClick={() =>
                                  handleSelectGuardianFromSearch(guardian)
                                }
                                className="flex-1 text-left"
                              >
                                <div className="font-medium text-gray-800 text-sm">
                                  {guardian.nombreCompleto}
                                </div>
                                <div className="text-xs text-gray-600">
                                  {guardian.tipoDocumento}:{" "}
                                  {guardian.identificacion} • {athleteCount}{" "}
                                  deportista(s)
                                </div>
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (canDelete) {
                                    handleDeleteGuardianClick(guardian);
                                  } else {
                                    showErrorAlert(
                                      "No se puede eliminar",
                                      `Este acudiente tiene ${athleteCount} deportistas asignados.`,
                                    );
                                  }
                                }}
                                disabled={!canDelete}
                                className={`ml-2 p-2 rounded transition-colors ${
                                  canDelete
                                    ? "text-red-500 hover:bg-red-50"
                                    : "text-gray-300 cursor-not-allowed"
                                }`}
                                title={
                                  canDelete
                                    ? "Eliminar acudiente"
                                    : `Tiene ${athleteCount} deportistas asignados`
                                }
                              >
                                <FaTrash size={12} />
                              </button>
                            </div>
                          );
                        })
                      ) : (
                        <div className="px-3 py-4 text-gray-500 text-center text-sm">
                          <FaUserShield
                            size={20}
                            className="mx-auto mb-1 text-gray-300"
                          />
                          <p>No se encontraron acudientes</p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Acudiente{" "}
                  {isAcudienteRequired && (
                    <span className="text-red-500">*</span>
                  )}
                </label>
                <input
                  type="text"
                  value={
                    values.acudiente
                      ? guardians.find(
                          (g) => String(g.id) === String(values.acudiente),
                        )?.nombreCompleto || "Acudiente seleccionado"
                      : !hasDateOfBirth
                        ? "Primero ingresa la fecha de nacimiento"
                        : "Sin acudiente asignado"
                  }
                  disabled
                  className="w-full p-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-600 cursor-not-allowed"
                />
                {errors.acudiente && touched.acudiente && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.acudiente}
                  </p>
                )}
              </div>

              {values.acudiente && (
                <div className="space-y-2">
                  <div>
                    <FormField
                      label="Parentesco"
                      name="parentesco"
                      type="select"
                      placeholder="Selecciona el parentesco"
                      options={parentescoOptions}
                      value={values.parentesco}
                      onChange={handleParentescoChange}
                      onBlur={handleBlur}
                      error={errors.parentesco}
                      touched={touched.parentesco}
                      required
                      helperText="Relación del acudiente con el deportista"
                    />
                  </div>

                  {values.parentesco === "Otro" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-1"
                    >
                      <label className="block text-sm font-medium text-gray-700">
                        Especificar parentesco *
                      </label>
                      <input
                        type="text"
                        placeholder="Ej: Vecino, Amigo de la familia, Conocido..."
                        value={otroParentesco}
                        onChange={(e) => setOtroParentesco(e.target.value)}
                        onBlur={handleBlur}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-purple focus:border-primary-purple transition-all duration-200 text-sm"
                        required
                      />
                      {otroParentesco === "" && touched.parentesco && (
                        <motion.div
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-1 flex items-start gap-1 p-2 bg-red-50 border border-red-200 rounded"
                        >
                          <FaExclamationCircle
                            className="text-red-500 mt-0.5 flex-shrink-0"
                            size={12}
                          />
                          <p className="text-red-600 text-xs">
                            Debes especificar el tipo de parentesco
                          </p>
                        </motion.div>
                      )}
                    </motion.div>
                  )}
                </div>
              )}
            </div>

            <AnimatePresence>
              {selectedGuardian && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 bg-white rounded-lg p-3 border border-gray-200"
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-1 text-xs flex-1">
                      <div>
                        <strong>Nombre:</strong>{" "}
                        {selectedGuardian.nombreCompleto}
                      </div>
                      <div>
                        <strong>Documento:</strong>{" "}
                        {selectedGuardian.tipoDocumento} -{" "}
                        {selectedGuardian.identificacion}
                      </div>
                      <div>
                        <strong>Teléfono:</strong> {selectedGuardian.telefono}
                      </div>
                      <div>
                        <strong>Correo:</strong> {selectedGuardian.correo}
                      </div>
                      {values.parentesco && (
                        <div>
                          <strong>Parentesco:</strong>{" "}
                          <span>{getFinalParentesco()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {hasDateOfBirth && !isAcudienteRequired && !values.acudiente && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-xs text-green-800"
              >
                Esta deportista es mayor de edad. El acudiente es opcional pero
                puede ser asignado si es necesario.
              </motion.div>
            )}
          </motion.div>

          {!isEditing && !isEnrollmentMode && (
            <motion.div
              className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.4 }}
            >
              <div className="flex items-start gap-2">
                <div className="bg-blue-100 rounded-full p-1 mt-0.5">
                  <svg
                    className="w-3 h-3 text-blue-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-blue-800 mb-1 text-sm">
                    Creación automática
                  </h4>
                  <p className="text-sm text-blue-700">
                    Al crear la deportista, se generará automáticamente con
                    estado <strong>"Activo"</strong> y una matrícula inicial con
                    estado <strong>"Vigente"</strong>.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {!isEditing && isEnrollmentMode && (
            <motion.div
              className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.4 }}
            >
              <div className="flex items-start gap-2">
                <div className="bg-blue-100 rounded-full p-1 mt-0.5">
                  <svg
                    className="w-3 h-3 text-blue-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-blue-800 mb-1 text-sm">
                    Matrícula automática
                  </h4>
                  <p className="text-sm text-blue-700">
                    Al crear la matrícula, se generará automáticamente la
                    deportista con estado <strong>"Activo"</strong> y una
                    matrícula con estado <strong>"Vigente"</strong>.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        <div className="flex-shrink-0 border-t border-gray-200 p-3">
          <div className="flex justify-between">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={(event) => handleSubmit(event)}
              className="flex items-center gap-2 px-4 py-2 bg-primary-blue text-white rounded-lg shadow hover:bg-primary-purple transition-colors"
            >
              {isEditing
                ? "Actualizar Deportista"
                : isEnrollmentMode
                  ? "Crear Matrícula"
                  : "Crear Deportista"}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AthleteModal;
