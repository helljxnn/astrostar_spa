import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
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
import { toDateInputFormat, toISOString, calculateAge } from "../../../../../../../../shared/utils/dateUtils";

// Los tipos de documento y categor?as ahora se reciben desde props (cargados desde la API)

const states = [
  { value: "Activo", label: "Activo" },
  { value: "Inactivo", label: "Inactivo" },
];

const parentescoOptions = [
  { value: "Madre", label: "Madre" },
  { value: "Padre", label: "Padre" },
  { value: "Abuelo/a", label: "Abuelo/a" },
  { value: "T?o/a", label: "T?o/a" },
  { value: "Hermano/a", label: "Hermano/a" },
  { value: "Primo/a", label: "Primo/a" },
  { value: "Tutor/a Legal", label: "Tutor/a Legal" },
  { value: "Vecino/a", label: "Vecino/a" },
  { value: "Amigo/a de la familia", label: "Amigo/a de la familia" },
  { value: "Otro", label: "Otro (especificar)" },
];

// Mapeo de parentesco del backend (ingl?s) al frontend (espa?ol)
const parentescoBackendToFrontend = {
  Mother: "Madre",
  Father: "Padre",
  Grandparent: "Abuelo/a",
  Uncle_Aunt: "T?o/a",
  Sibling: "Hermano/a",
  Cousin: "Primo/a",
  Legal_Guardian: "Tutor/a Legal",
  Neighbor: "Vecino/a",
  Family_Friend: "Amigo/a de la familia",
  Other: "Otro",
};

// Mapeo inverso: del frontend (espa?ol) al backend (ingl?s)
const parentescoFrontendToBackend = {
  Madre: "Mother",
  Padre: "Father",
  "Abuelo/a": "Grandparent",
  "T?o/a": "Uncle_Aunt",
  "Hermano/a": "Sibling",
  "Primo/a": "Cousin",
  "Tutor/a Legal": "Legal_Guardian",
  "Vecino/a": "Neighbor",
  "Amigo/a de la familia": "Family_Friend",
  Otro: "Other",
};

// ELIMINADA: Funci?n calculateAge local - ahora se usa desde dateUtils

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
  loadGuardians,
}) => {
  const isEditing =
    (mode === "edit" || athleteToEdit !== null) && !isEnrollmentMode;
  const [showGuardianSearch, setShowGuardianSearch] = useState(false);
  const [guardianSearchTerm, setGuardianSearchTerm] = useState("");
  const [currentAge, setCurrentAge] = useState(null);
  const [hasDateOfBirth, setHasDateOfBirth] = useState(false);
  const [asyncErrors, setAsyncErrors] = useState({});
  const [checkingEmail, setCheckingEmail] = useState(false);

  // Hook para validaci?n de documento en tiempo real
  const excludeUserId =
    isEditing && !isEnrollmentMode && athleteToEdit?.userId
      ? athleteToEdit.userId
      : null;
  // En modo matr?cula (isEnrollmentMode), saltar la verificaci?n de inscripciones pendientes
  // Solo verificar si ya est? matriculado como deportista
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
      isScholarship: false,
    },
    athleteValidationRules,
  );

  // Debug: Ver qu? tipos de documento se est?n recibiendo
  useEffect(() => {
    if (isOpen && referenceData.documentTypes) {
    }
  }, [isOpen, referenceData.documentTypes]);

  // Funci?n personalizada para manejar cambios (igual que empleados)
  const handleCustomChange = (name, value) => {
    if (name === "birthDate") {
      const age = calculateAge(value);
      setValues((prev) => ({
        ...prev,
        [name]: value,
        age: age.toString(), // Convertir a string para el formulario
      }));
    } else {
      handleChange({ target: { name, value } });
    }
  };

  // Funci?n para manejar cambio de email y marcar como touched inmediatamente
  const handleEmailChange = (e) => {
    // Marcar como touched PRIMERO para activar validaci?n instant?nea
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
    if (newlyCreatedGuardianId && guardians.length > 0) {
      const guardianExists = guardians.find(g => g.id === newlyCreatedGuardianId);
      if (guardianExists) {
        handleChange({
          target: {
            name: "acudiente",
            value: newlyCreatedGuardianId.toString(),
          },
        });
      }
    }
  }, [newlyCreatedGuardianId, guardians]);

  // Cargar acudientes cuando se abre el buscador
  useEffect(() => {
    if (showGuardianSearch && loadGuardians && guardians.length === 0) {
      loadGuardians();
    }
  }, [showGuardianSearch]); // ? SOLO depender de showGuardianSearch para evitar re-renders infinitos

  // Re-validar el campo de identificaci?n INSTANT?NEAMENTE cuando cambia el tipo de documento
  useEffect(() => {
    if (values.documentTypeId && values.identification) {
      // Marcar el campo como touched para que se muestre el error
      setTouched((prev) => ({ ...prev, identification: true }));
    }
  }, [values.documentTypeId, setTouched]);

  // Validaci?n en tiempo real de documento (verifica deportistas + inscripciones)
  useEffect(() => {
    if (!values.identification || values.identification.length < 6) {
      clearDocumentValidation();
      setAsyncErrors((prev) => ({ ...prev, identification: null }));
      return;
    }

    // NO VALIDAR en modo edici?n normal (desde tabla de deportistas)
    // S? VALIDAR en modo matr?cula (isEnrollmentMode) y en modo creaci?n
    if (isEditing && !isEnrollmentMode) {
      clearDocumentValidation();
      setAsyncErrors((prev) => ({ ...prev, identification: null }));
      if (
        errors.identification &&
        errors.identification.includes("ya est? registrado")
      ) {
        setErrors((prev) => ({ ...prev, identification: "" }));
      }
      return;
    }

    // Usar el hook de validaci?n con debounce
    validateDocumentDebounced(values.identification, 6);
  }, [values.identification, isEditing, isEnrollmentMode]); // ? Removidas dependencias problem?ticas

  // Sincronizar el resultado de la validaci?n con asyncErrors
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
      // Validaci?n completada y documento NO existe - limpiar error solo si es de validaci?n async
      setAsyncErrors((prev) => ({ ...prev, identification: null }));
      // Solo limpiar el error si es un error de documento duplicado
      setErrors(prev => {
        if (prev.identification && (
          prev.identification.includes('ya est? matriculado') || 
          prev.identification.includes('ya tiene una inscripci?n') ||
          prev.identification.includes('ya est? registrado') ||
          prev.identification.includes('ya est? inscrito')
        )) {
          const { identification, ...rest } = prev;
          return rest;
        }
        return prev;
      });
    }
  }, [documentExists, documentValidationMessage, isCheckingDocumentValidation, values.identification.length]); // ? Removidas dependencias problem?ticas

  // Validaci?n instant?nea de email
  useEffect(() => {
    const checkEmail = async () => {
      // No validar si el email est? vac?o o no tiene formato b?sico de email
      if (!values.email || !values.email.includes("@")) {
        setAsyncErrors((prev) => ({ ...prev, email: null }));
        return;
      }

      // Validar formato de email primero (antes de consultar al backend)
      // Regex m?s estricta: solo letras, n?meros, puntos, guiones y guiones bajos
      const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(values.email)) {
        // Si el formato es inv?lido, no hacer la consulta al backend
        // El error de formato ya lo maneja la validaci?n s?ncrona
        setAsyncErrors((prev) => ({ ...prev, email: null }));
        return;
      }

      // En modo edici?n, NO validar si el email es el mismo que el original
      if (isEditing && !isEnrollmentMode && athleteToEdit?.email === values.email) {
        setAsyncErrors(prev => ({ ...prev, email: null }));
        return;
      }

      setCheckingEmail(true);
      try {

        // En modo edici?n, excluir el userId del deportista actual
        // En modo matr?cula o creaci?n, no excluir a nadie
        const excludeUserId =
          isEditing && !isEnrollmentMode && athleteToEdit?.userId
            ? athleteToEdit.userId
            : null;

        const result = await AthletesService.checkEmailAvailability(
          values.email,
          excludeUserId,
        );

        if (!result.available) {
          const errorMsg = `Este email ya est? registrado`;
          setAsyncErrors((prev) => ({ ...prev, email: errorMsg }));
          setErrors((prev) => ({ ...prev, email: errorMsg }));
          setTouched((prev) => ({ ...prev, email: true }));
        } else {
          setAsyncErrors(prev => ({ ...prev, email: null }));
          setErrors(prev => {
            // Solo limpiar si es un error de email duplicado
            if (prev.email && prev.email.includes('ya est? registrado')) {
              const { email, ...rest } = prev;
              return rest;
            }
            return prev;
          });
        }
      } catch (error) {
        console.error("? [AthleteModal] Error verificando email:", error);
        console.error(
          "? [AthleteModal] Error completo:",
          error.message,
          error.stack,
        );
      } finally {
        setCheckingEmail(false);
      }
    };

    // Validar INSTANT?NEAMENTE si:
    // 1. El campo ya fue tocado (touched.email)
    // 2. Estamos en modo matr?cula (isEnrollmentMode)
    // 3. Estamos en modo edici?n (isEditing)
    const shouldValidateInstantly =
      touched.email || isEnrollmentMode || isEditing;
    const delay = shouldValidateInstantly ? 0 : 300;

    const timeoutId = setTimeout(checkEmail, delay);
    return () => clearTimeout(timeoutId);
  }, [values.email, isEditing, athleteToEdit?.email, athleteToEdit?.userId, isEnrollmentMode, touched.email]); // ? Removidas dependencias problem?ticas

  // ? VALIDACI?N DE EDAD VS CATEGOR?A ELIMINADA
  // Ahora se permite seleccionar cualquier categor?a sin importar la edad del deportista

  useEffect(() => {
    if (isOpen && athleteToEdit && (isEditing || isEnrollmentMode)) {
      
      // Convertir fecha usando la utilidad segura
      const birthDateRaw = athleteToEdit.birthDate || athleteToEdit.fechaNacimiento || "";
      
      const birthDate = toDateInputFormat(birthDateRaw);
      
      // Convertir parentesco del backend (ingl?s) al frontend (espa?ol)
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
        age: calculateAge(birthDate).toString(),
        categoria: athleteToEdit.categoria || "",
        // Si estamos en modo matr?cula, siempre usar "Activo", de lo contrario usar el estado del atleta
        estado: isEnrollmentMode ? "Activo" : athleteToEdit.estado || "Activo",
        acudiente: athleteToEdit.acudiente?.toString() || "",
        parentesco: parentescoFrontend,
        isScholarship: athleteToEdit.isScholarship === true,
      };

      setValues(newValues);

      setHasDateOfBirth(!!birthDate);

      // En modo edici?n, marcar email como touched para activar validaci?n instant?nea
      if (isEditing && !isEnrollmentMode) {
        setTouched((prev) => ({ ...prev, email: true }));
      }

      // Si el parentesco no est? en las opciones, es un "Otro" personalizado
      if (
        parentescoFrontend &&
        !parentescoOptions.some((opt) => opt.value === parentescoFrontend)
      ) {
        setValues((prev) => ({ ...prev, parentesco: "Otro" }));
      }

      // ? VALIDACI?N AUTOM?TICA: Marcar todos los campos como touched y validar
      if (isEnrollmentMode) {
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

        // Ejecutar validaciones as?ncronas INMEDIATAMENTE (sin setTimeout)
        (async () => {
          // Validar documento - Verificar en TODOS los usuarios
          if (
            newValues.identification &&
            newValues.identification.length >= 6
          ) {
            try {
              // En modo matr?cula desde landing, no hay usuario previo, as? que no excluir nada
              const result =
                await AthletesService.checkIdentificationAvailability(
                  newValues.identification,
                  null,
                );
              if (!result.available) {
                const errorMsg = `Este documento ya est? registrado`;
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
                "? [AthleteModal] Error verificando documento:",
                error,
              );
            }
          }

          // Validar email - Verificar en TODOS los usuarios
          // Primero validar formato antes de consultar al backend
          // Regex m?s estricta: solo letras, n?meros, puntos, guiones y guiones bajos
          const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

          if (newValues.email && newValues.email.includes("@")) {

            if (emailRegex.test(newValues.email)) {
              try {
                // En modo matr?cula desde landing, no hay usuario previo, as? que no excluir nada
                const result = await AthletesService.checkEmailAvailability(
                  newValues.email,
                  null,
                );
                if (!result.available) {
                  const errorMsg = `Este email ya est? registrado`;
                  setAsyncErrors((prev) => ({ ...prev, email: errorMsg }));
                  setErrors((prev) => ({ ...prev, email: errorMsg }));
                } else {
                  setAsyncErrors((prev) => ({ ...prev, email: null }));
                }
              } catch (error) {
                console.error(
                  "? [AthleteModal] Error verificando email:",
                  error,
                );
              }
            } else {
                  // El error de formato ya lo maneja la validaci?n s?ncrona
            }
          }

          // ? VALIDAR TEL?FONO INMEDIATAMENTE con los nuevos valores
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
        isScholarship: false,
      });
      setAsyncErrors({});
      setHasDateOfBirth(false);
    }
  }, [isOpen, isEditing, isEnrollmentMode, athleteToEdit, setValues]);

  const handleParentescoChange = (e) => {
    const { name, value } = e.target;
    // Actualizar el valor
    handleChange(e);
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

  // Limpiar error de acudiente cuando se seleccione uno
  useEffect(() => {
    if (values.acudiente) {
      setErrors(prev => {
        if (prev.acudiente) {
          const { acudiente, ...rest } = prev;
          return rest;
        }
        return prev;
      });
    }
  }, [values.acudiente]); // ? Removida dependencia errors.acudiente

  const getFinalParentesco = () => {
    // Si es "Otro", siempre devolver "Otro" para el mapeo al backend
    // El texto libre se manejar? por separado en otherRelationship
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

    // Marcar todos los campos como tocados para mostrar errores
    const allTouched = {};
    Object.keys(athleteValidationRules).forEach((f) => (allTouched[f] = true));
    setTouched(allTouched);
    const isValid = validateAllFields();
    if (!isValid) {
      return;
    }

    const ageValue = calculateAge(values.birthDate);
    const ageNumber =
      ageValue !== "" && !Number.isNaN(Number(ageValue))
        ? Number(ageValue)
        : null;

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
    
    // NO HAY VALIDACI?N DE EDAD VS CATEGOR?A - Se permite cualquier combinaci?n

    // ?? VALIDACI?N CR?TICA: Menores de edad DEBEN tener acudiente
    if (ageNumber !== null && ageNumber < 18) {
      const acudienteId = values.acudiente && values.acudiente.toString().trim() 
        ? parseInt(values.acudiente) 
        : null;
      
      if (!acudienteId) {
        // Establecer error inline en el campo de acudiente
        setErrors(prev => ({
          ...prev,
          acudiente: "La deportista es menor de edad. Debe asignar un acudiente antes de continuar."
        }));
        setTouched(prev => ({
          ...prev,
          acudiente: true
        }));
        return;
      }
    }


    try {
      const finalParentesco = getFinalParentesco();

      // Convertir parentesco del frontend (espa?ol) al backend (ingl?s)
      let parentescoBackend = finalParentesco;
      if (parentescoBackend && parentescoFrontendToBackend[parentescoBackend]) {
        parentescoBackend = parentescoFrontendToBackend[parentescoBackend];
      }

      // Convertir acudiente a n?mero o null
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
        birthDate: toISOString(values.birthDate), // Convertir a ISO para el backend
        categoria: values.categoria,
        estado: values.estado,
      };

      // Solo agregar acudiente y parentesco si hay un acudiente seleccionado
      if (acudienteId) {
        athleteData.acudiente = acudienteId;
        athleteData.parentesco = parentescoBackend;
      }
      // Incluir isScholarship siempre (solo en edici?n)
      if (isEditing) {
        athleteData.isScholarship = values.isScholarship === true;
      }
      if (isEditing) {
        // Detectar si cambi? el email
        const emailChanged = athleteToEdit.email !== values.email.trim();
        const updateData = {
          ...athleteData,
          id: athleteToEdit.id,
          shouldUpdateInscription:
            values.estado === "Inactivo" && athleteToEdit.estado !== "Inactivo",
          emailChanged, // Indicar si cambi? el email para reenviar credenciales
        };
        await onUpdate(updateData);
      } else {
        // Si estamos en modo matr?cula desde inscripci?n, preservar el ID de la inscripci?n
        if (isEnrollmentMode && athleteToEdit?.id) {
          athleteData.preRegistrationId = athleteToEdit.id;
        }

        await onSave(athleteData);
      }
      resetForm();
      setHasDateOfBirth(false);
      onClose();
    } catch (error) {
      console.error("? [AthleteModal] Error en submit:", error);
      showErrorAlert("Error", error.message);
    }
  };

  const handleCreateGuardian = () => {
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

    // Verificar si el acudiente tiene deportistas menores asignados ANTES de mostrar el di?logo
    const assignedAthletes = athletes.filter(
      a => a.acudiente?.toString() === guardian.id?.toString()
    );
    
    const hasMinorAthletes = assignedAthletes.some(athlete => {
      const birthDateStr = athlete.birthDate || athlete.fechaNacimiento;
      if (!birthDateStr) return false;
      
      const today = new Date();
      const birthDate = new Date(birthDateStr);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age < 18;
    });
    
    // Si tiene deportistas menores, mostrar error y NO permitir eliminar
    if (hasMinorAthletes) {
      showErrorAlert(
        "No se puede eliminar",
        "Este acudiente est? asignado a deportistas menores de edad"
      );
      return;
    }

    const isCurrentGuardian = values.acudiente === guardian.id?.toString();

    // Mensaje simple y directo
    const confirmMessage = `?Eliminar a ${guardian.nombreCompleto}?`;

    // Confirmar eliminaci?n
    const result = await showDeleteAlert(
      "Confirmar eliminaci?n",
      confirmMessage,
    );

    if (result.isConfirmed) {
      // Intentar eliminar
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

          // Si es menor de edad, marcar campo como touched y mostrar error
          if (isAcudienteRequired) {
            setTouched(prev => ({
              ...prev,
              acudiente: true
            }));
            
            setErrors(prev => ({
              ...prev,
              acudiente: "La deportista es menor de edad. Debe asignar un acudiente antes de continuar."
            }));
            
            showErrorAlert(
              "Acudiente requerido",
              "La deportista es menor de edad. Debes asignar un nuevo acudiente antes de guardar."
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

  const handleClose = async () => {
    // ?? VALIDACI?N CR?TICA: Si estamos editando y la deportista es menor de edad
    // NO permitir cerrar si no tiene acudiente asignado
    if (isEditing && athleteToEdit) {
      const birthDateStr = values.birthDate || athleteToEdit.birthDate || athleteToEdit.fechaNacimiento;
      
      if (birthDateStr) {
        const age = calculateAge(birthDateStr);
        const ageNumber = parseInt(age);
        
        // Si es menor de edad
        if (ageNumber < 18) {
          const acudienteId = values.acudiente && values.acudiente.toString().trim() 
            ? parseInt(values.acudiente) 
            : null;
          
          // Si NO tiene acudiente asignado
          if (!acudienteId) {
            
            // Mostrar alerta de confirmaci?n
            const Swal = (await import('sweetalert2')).default;
            const result = await Swal.fire({
              title: '?? Acudiente Requerido',
              html: `
                <div style="text-align: left;">
                  <p><strong>La deportista es menor de edad (${ageNumber} a?os)</strong></p>
                  <br>
                  <p>Debe asignar un acudiente antes de cerrar este formulario.</p>
                  <p style="color: #666; font-size: 0.9em;">Si cierra sin asignar un acudiente, la deportista quedar? sin representante legal.</p>
                </div>
              `,
              icon: 'warning',
              showCancelButton: true,
              confirmButtonText: 'Asignar Acudiente',
              cancelButtonText: 'Cerrar de todos modos',
              confirmButtonColor: '#8b5cf6',
              cancelButtonColor: '#ef4444',
              reverseButtons: true
            });
            
            // Si el usuario decide asignar acudiente, no cerrar el modal
            if (result.isConfirmed) {
              // Hacer scroll al campo de acudiente
              const acudienteField = document.querySelector('[name="acudiente"]');
              if (acudienteField) {
                acudienteField.scrollIntoView({ behavior: 'smooth', block: 'center' });
                acudienteField.focus();
              }
              return; // NO cerrar el modal
            }
            
            // Si el usuario decide cerrar de todos modos, continuar
          }
        }
      }
    }
    
    // Cerrar el modal normalmente
    resetForm();
    setHasDateOfBirth(false);
    setShowGuardianSearch(false);
    setGuardianSearchTerm("");
    setCurrentAge(null);
    onClose();
  };

  if (!isOpen) return null;

  const modalContent = (
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
        onClick={(e) => e.stopPropagation()}
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
                ? "Crear Matr?cula"
                : "Crear Deportista"}
          </h2>
          {isEditing && (
            <p className="text-center text-gray-600 mt-2">
              Modificando informaci?n de:{" "}
              <span className="font-semibold text-primary-purple">
                {athleteToEdit.nombres} {athleteToEdit.apellidos}
              </span>
            </p>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          <div className="mb-3">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b border-gray-200 pb-2">
              Informaci?n Personal
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

              {/* Identificaci?n con validaci?n por tipo de documento */}
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
                  label="N?mero de Documento"
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
                  label="Correo Electr?nico"
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
                  label="N?mero Telef?nico"
                  name="phoneNumber"
                  type="text"
                  placeholder="N?mero de Tel?fono"
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
                  label="Direcci?n"
                  name="address"
                  type="text"
                  placeholder="Direcci?n de residencia"
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
                  helperText=""
                  delay={0.7}
                />
              </div>

              {/* Edad (calculada autom?ticamente) */}
              <div>
                <FormField
                  label="Edad"
                  name="age"
                  type="text"
                  placeholder="Calculada autom?ticamente"
                  value={currentAge !== null ? `${currentAge} a?os` : ""}
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
                  label="Categor?a"
                  name="categoria"
                  type="select"
                  placeholder="Selecciona la categor?a"
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
                  helperText={
                    values.categoria && values.birthDate
                      ? (() => {
                          const age = calculateAge(values.birthDate);
                          const ageNum = age !== "" && !Number.isNaN(Number(age)) ? Number(age) : null;
                          const selectedCat = referenceData.sportsCategories.find(c => c.name === values.categoria);
                          if (selectedCat && ageNum !== null) {
                            if (ageNum < selectedCat.minAge) {
                              return `?? Edad ${ageNum} es menor al m?nimo (${selectedCat.minAge}). Selecciona una categor?a apropiada.`;
                            } else if (ageNum > selectedCat.maxAge) {
                              return `?? Edad ${ageNum} supera el m?ximo (${selectedCat.maxAge}), pero puede inscribirse en esta categor?a superior.`;
                            } else {
                              return `? Edad ${ageNum} est? en el rango de esta categor?a (${selectedCat.minAge}-${selectedCat.maxAge})`;
                            }
                          }
                          return "";
                        })()
                      : "Selecciona una categor?a seg?n la edad de la deportista"
                  }
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
                    helperText=""
                    delay={0.9}
                  />
                </div>
              )}

              {/* -- isScholarship (solo en edici?n) -- */}
              {isEditing && (
                <div className="flex items-start gap-3 p-3 bg-purple-50 border border-purple-200 rounded-lg col-span-full">
                  <input
                    type="checkbox"
                    id="isScholarship"
                    name="isScholarship"
                    checked={values.isScholarship === true}
                    onChange={(e) =>
                      handleChange({ target: { name: "isScholarship", value: e.target.checked } })
                    }
                    className="mt-0.5 w-4 h-4 text-primary-purple border-gray-300 rounded focus:ring-primary-purple cursor-pointer"
                  />
                  <label htmlFor="isScholarship" className="cursor-pointer select-none flex-1">
                    <span className="block text-sm font-semibold text-purple-800">
                      ?? Deportista Becada
                    </span>
                    <span className="block text-xs text-purple-600 mt-0.5">
                      Si est? marcada, esta deportista est? exenta del pago de mensualidades. El sistema no generar? obligaciones de pago para ella.
                    </span>
                  </label>
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
                Informaci?n del Acudiente
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
                          // Contar deportistas asignados a este acudiente
                          const assignedAthletes = athletes.filter(
                            a => a.acudiente?.toString() === guardian.id?.toString()
                          );
                          const athleteCount = assignedAthletes.length;
                          
                          // Verificar si alguna deportista asignada es menor de edad
                          const hasMinorAthletes = assignedAthletes.some(athlete => {
                            const birthDateStr = athlete.birthDate || athlete.fechaNacimiento;
                            if (!birthDateStr) return false;
                            
                            const today = new Date();
                            const birthDate = new Date(birthDateStr);
                            let age = today.getFullYear() - birthDate.getFullYear();
                            const monthDiff = today.getMonth() - birthDate.getMonth();
                            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                              age--;
                            }
                            return age < 18;
                          });
                          
                          // Solo se puede eliminar si:
                          // - No tiene deportistas asignados, O
                          // - Solo tiene deportistas mayores de edad
                          const canDelete = athleteCount === 0 || !hasMinorAthletes;
                          
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
                                  {guardian.identificacion} ? {athleteCount}{" "}
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
                                      `Este acudiente est? asignado a deportistas menores de edad.`
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
                      ? (() => {
                          // Buscar en la lista local primero
                          const localGuardian = guardians.find(g => String(g.id) === String(values.acudiente));
                          if (localGuardian) return localGuardian.nombreCompleto;
                          
                          // Si no est? en la lista local, usar el guardian del athleteToEdit
                          if (athleteToEdit?.guardian) {
                            return athleteToEdit.guardian.nombreCompleto || 
                                   `${athleteToEdit.guardian.firstName} ${athleteToEdit.guardian.lastName}`.trim();
                          }
                          
                          return "Acudiente seleccionado";
                        })()
                      : !hasDateOfBirth 
                        ? "Primero ingresa la fecha de nacimiento"
                        : "Sin acudiente asignado"
                  }
                  disabled
                  className={`w-full p-3 border rounded-xl bg-gray-50 text-gray-600 cursor-not-allowed ${
                    isAcudienteRequired && !values.acudiente
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-300'
                  }`}
                />
                {isAcudienteRequired && !values.acudiente && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 flex items-start gap-2 p-2 bg-red-50 border border-red-200 rounded"
                  >
                    <FaExclamationCircle className="text-red-500 mt-0.5 flex-shrink-0" size={14} />
                    <p className="text-red-600 text-xs">
                      La deportista es menor de edad. Debes asignar un acudiente antes de guardar.
                    </p>
                  </motion.div>
                )}
                {errors.acudiente && touched.acudiente && !isAcudienteRequired && (
                  <p className="text-red-500 text-xs mt-1">{errors.acudiente}</p>
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
                      helperText=""
                    />
                  </div>

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
                          <strong>Tel?fono:</strong> {selectedGuardian.telefono}
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
                    <div className="flex gap-2 ml-3">
                      {!isAcudienteRequired && (
                        <button
                          type="button"
                          onClick={() => {
                            handleChange({ target: { name: "acudiente", value: "" } });
                            handleChange({ target: { name: "parentesco", value: "" } });
                          }}
                          className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors text-xs"
                          title="Deseleccionar acudiente"
                        >
                          <FaTimes size={10} />
                          Quitar
                        </button>
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
                    Creaci?n autom?tica
                  </h4>
                  <p className="text-sm text-blue-700">
                    Al crear la deportista, se generar? autom?ticamente con
                    estado <strong>"Activo"</strong> y una matr?cula inicial con
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
                    Matr?cula autom?tica
                  </h4>
                  <p className="text-sm text-blue-700">
                    Al crear la matr?cula, se generar? autom?ticamente la
                    deportista con estado <strong>"Activo"</strong> y una
                    matr?cula con estado <strong>"Vigente"</strong>.
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
              disabled={isAcudienteRequired && !values.acudiente}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow transition-colors font-medium ${
                isAcudienteRequired && !values.acudiente
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-primary-blue text-white hover:bg-primary-purple'
              }`}
              title={isAcudienteRequired && !values.acudiente ? 'Debes asignar un acudiente antes de guardar' : ''}
            >
              {isEditing
                ? "Actualizar Deportista"
                : isEnrollmentMode
                  ? "Crear Matr?cula"
                  : "Crear Deportista"}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );

  return createPortal(modalContent, document.body);
};

export default AthleteModal;






