import { useCallback, useEffect, useMemo, useRef, useState } from "react";

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
  descripcion: "",
};

export const useDonorSponsorForm = ({
  initialData = null,
  mode = "create",
  checkIdentificationAvailability,
  checkEmailAvailability,
}) => {
  const DOC_LENGTHS = {
    "Cédula de Ciudadanía": 10,
    "Cedula de Ciudadania": 10,
    "Tarjeta de Identidad": 10,
    "Pasaporte": 10,
    "Cédula de Extranjería": 10,
    "Cedula de Extranjeria": 10,
    "Permiso de Permanencia": 10,
  };
  const NIT_MAX = 10;

  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [checkingId, setCheckingId] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const originalValues = useRef({
    correo: initialData?.correo || "",
    identificacion:
      initialData?.identificacion ||
      initialData?.nit ||
      initialData?.numeroDocumento ||
      "",
  });

  const normalizedId = useMemo(() => {
    return formData.tipoPersona === "Juridica"
      ? formData.nit || ""
      : formData.numeroDocumento || "";
  }, [formData.nit, formData.numeroDocumento, formData.tipoPersona]);

  const docMaxLength = useMemo(() => {
    return DOC_LENGTHS[formData.tipoDocumento] || 10;
  }, [formData.tipoDocumento]);


  const nameHelperText = useMemo(() => {
    if (errors.nombreCompleto) return undefined;
    const val = (formData.nombreCompleto || "").trim();
    if (!val) return "Escribe el nombre completo tal como aparece en el documento.";
    if (val.length < 3) return "Sigue escribiendo el nombre completo.";
    return "Nombre listo para guardar.";
  }, [errors.nombreCompleto, formData.nombreCompleto]);

  const razonSocialHelperText = useMemo(() => {
    if (formData.tipoPersona !== "Juridica") return undefined;
    if (errors.razonSocial) return undefined;
    const val = (formData.razonSocial || "").trim();
    if (!val) return "Ingresa la razon social registrada.";
    if (val.length < 3) return "Sigue escribiendo la razon social.";
    return "Razon social lista para guardar.";
  }, [errors.razonSocial, formData.razonSocial, formData.tipoPersona]);

  const setFromRecord = useCallback((record) => {
    if (!record) {
      setFormData(initialState);
      setErrors({});
      setTouched({});
      originalValues.current = { correo: "", identificacion: "" };
      return;
    }

    setFormData({
      tipo: record.tipo || "Donante",
      tipoPersona: record.tipoPersona || "Natural",
      nombreCompleto: record.nombreCompleto || record.nombre || "",
      razonSocial: record.razonSocial || record.nombre || "",
      tipoDocumento: record.tipoDocumento || "",
      numeroDocumento: (record.numeroDocumento || record.identificacion || "")
        .toString()
        .slice(0, docMaxLength),
      nit: (record.nit || record.identificacion || "")
        .toString()
        .slice(0, NIT_MAX),
      personaContacto: record.personaContacto || "",
      telefono: record.telefono || "",
      correo: record.correo || "",
      direccion: record.direccion || "",
      estado: record.estado || "Activo",
      descripcion: record.descripcion || "",
    });
    setErrors({});
    setTouched({});
    originalValues.current = {
      correo: record.correo || "",
      identificacion:
        record.identificacion || record.nit || record.numeroDocumento || "",
    };
  }, [docMaxLength]);

  useEffect(() => {
    setFromRecord(initialData);
  }, [initialData, setFromRecord]);

  const computeFieldError = useCallback(
    (name, value, currentFormData = formData) => {
      const val = (value || "").trim();
      const isNatural = currentFormData.tipoPersona === "Natural";
      const isJuridica = currentFormData.tipoPersona === "Juridica";
      const currentDocLength =
        DOC_LENGTHS[currentFormData.tipoDocumento] || docMaxLength;

      if (name === "nombreCompleto" && isNatural) {
        if (!val) return "El nombre completo es obligatorio.";
        if (!/^[\p{L}\s]+$/u.test(val))
          return "Solo se permiten letras y espacios.";
        if (val.length < 3) return "Debe tener al menos 3 caracteres.";
      }

      if (name === "razonSocial" && isJuridica) {
        if (!val) return "La razon social es obligatoria.";
        if (val.length < 3) return "Debe tener al menos 3 caracteres.";
      }

      if (name === "tipoDocumento" && isNatural) {
        if (!val) return "El tipo de documento es obligatorio.";
      }

      if (name === "numeroDocumento" && isNatural) {
        if (!val) return "El numero de documento es obligatorio.";
        if (val.length !== currentDocLength)
          return `Debe tener ${currentDocLength} caracteres.`;
      }

      if (name === "nit" && isJuridica) {
        if (!val) return "El NIT es obligatorio.";
        if (val.length !== NIT_MAX)
          return `Debe tener ${NIT_MAX} caracteres.`;
      }

      if (name === "personaContacto" && isJuridica) {
        if (!val) return "La persona de contacto es obligatoria.";
        if (val.length < 3) return "Debe tener al menos 3 caracteres.";
      }

      if (name === "telefono") {
        if (!val) return "El telefono es obligatorio.";
        if (val.length < 7) return "Minimo 7 digitos.";
      }

      if (name === "correo") {
        if (!val) return "El correo es obligatorio.";
        if (!/\S+@\S+\.\S+/.test(val))
          return "El formato del correo no es valido.";
      }

      if (name === "direccion") {
        if (!val) return "La direccion es obligatoria.";
        if (val.length < 4) return "Debe tener al menos 4 caracteres.";
      }

      return "";
    },
    [docMaxLength, formData]
  );
  const validateForm = useCallback(() => {
    const fieldsToCheck = [];
    if (formData.tipoPersona === "Natural") {
      fieldsToCheck.push("nombreCompleto", "tipoDocumento", "numeroDocumento");
    } else {
      fieldsToCheck.push("razonSocial", "nit", "personaContacto");
    }
    fieldsToCheck.push("telefono", "correo", "direccion");

    const aggregatedErrors = {};
    fieldsToCheck.forEach((field) => {
      const message = computeFieldError(field, formData[field]);
      if (message) {
        aggregatedErrors[field] = message;
      }
    });
    setErrors(aggregatedErrors);
    return Object.keys(aggregatedErrors).length === 0;
  }, [computeFieldError, formData]);

  const handleChange = useCallback(
    (e) => {
      const { name, value } = e.target;

      setTouched((prev) => ({ ...prev, [name]: true }));

      setFormData((prev) => {
        let updated = { ...prev, [name]: value };

        if (name === "tipoPersona") {
          if (value === "Natural") {
            updated = {
              ...updated,
              razonSocial: "",
              nit: "",
              personaContacto: "",
            };
          } else {
            updated = {
              ...updated,
              nombreCompleto: "",
              tipoDocumento: "",
              numeroDocumento: "",
            };
          }
        }

        if (["telefono", "numeroDocumento", "nit"].includes(name)) {
          const numeric = value.replace(/[^\d]/g, "");
          const nextDocLength =
            DOC_LENGTHS[updated.tipoDocumento] || docMaxLength;
          const maxLen =
            name === "telefono"
              ? 15
              : name === "numeroDocumento"
              ? nextDocLength
              : NIT_MAX;
          updated[name] = numeric.slice(0, maxLen);
        }

        const validationContext = { ...updated };
        const fieldError = computeFieldError(
          name,
          updated[name],
          validationContext
        );

        setErrors((prevErrors) => {
          const nextErrors = {
            ...prevErrors,
            [name]: fieldError || undefined,
          };

          if (name === "tipoPersona") {
            if (updated.tipoPersona === "Natural") {
              nextErrors.razonSocial = undefined;
              nextErrors.nit = undefined;
              nextErrors.personaContacto = undefined;
            } else {
              nextErrors.nombreCompleto = undefined;
              nextErrors.tipoDocumento = undefined;
              nextErrors.numeroDocumento = undefined;
              nextErrors.identificacion = undefined;
            }
          }

          if (name === "numeroDocumento" || name === "nit") {
            nextErrors.identificacion = undefined;
          }

          return nextErrors;
        });

        return updated;
      });
    },
    [computeFieldError, docMaxLength]
  );
  const handleBlur = useCallback(
    async (e) => {
      const { name, value } = e.target;
      setTouched((prev) => ({ ...prev, [name]: true }));
      const message = computeFieldError(name, value);
      setErrors((prev) => ({
        ...prev,
        [name]: message || undefined,
      }));

      if (name === "correo" && value.trim()) {
        if (value.trim() === originalValues.current.correo) return;
        setCheckingEmail(true);
        const result = await (checkEmailAvailability ||
          (async () => ({ available: true })))(value.trim(), initialData?.id);
        setCheckingEmail(false);
        if (!result?.available) {
          setErrors((prev) => ({
            ...prev,
            correo: result?.message || "Correo no disponible.",
          }));
        }
      }

      if ((name === "numeroDocumento" || name === "nit") && value.trim()) {
        if (value.trim() === originalValues.current.identificacion) return;
        setCheckingId(true);
        const result = await (checkIdentificationAvailability ||
          (async () => ({ available: true })))(value.trim(), initialData?.id);
        setCheckingId(false);
        if (!result?.available) {
          setErrors((prev) => ({
            ...prev,
            identificacion:
              result?.message || "La identificacion ya esta registrada.",
          }));
        }
      }
    },
    [
      checkEmailAvailability,
      checkIdentificationAvailability,
      initialData?.id,
      computeFieldError,
    ]
  );

  const handleSubmit = useCallback(async () => {
    setTouched({
      tipo: true,
      tipoPersona: true,
      nombreCompleto: true,
      razonSocial: true,
      tipoDocumento: true,
      numeroDocumento: true,
      nit: true,
      personaContacto: true,
      telefono: true,
      correo: true,
      direccion: true,
    });

    const isValid = validateForm();
    if (!isValid) {
      return { valid: false };
    }

    if (formData.correo && formData.correo !== originalValues.current.correo) {
      setCheckingEmail(true);
      const result = await (checkEmailAvailability ||
        (async () => ({ available: true })))(formData.correo, initialData?.id);
      setCheckingEmail(false);
      if (!result?.available) {
        setErrors((prev) => ({
          ...prev,
          correo: result?.message || "Correo no disponible.",
        }));
        return { valid: false };
      }
    }

    if (normalizedId && normalizedId !== originalValues.current.identificacion) {
      setCheckingId(true);
      const result = await (checkIdentificationAvailability ||
        (async () => ({ available: true })))(normalizedId, initialData?.id);
      setCheckingId(false);
      if (!result?.available) {
        setErrors((prev) => ({
          ...prev,
          identificacion:
            result?.message || "La identificacion ya esta registrada.",
        }));
        return { valid: false };
      }
    }

    return { valid: true };
  }, [
    checkEmailAvailability,
    checkIdentificationAvailability,
    formData.correo,
    initialData?.id,
    normalizedId,
    validateForm,
  ]);

  const resetForm = useCallback(() => {
    setFormData(initialState);
    setErrors({});
    setTouched({});
    originalValues.current = { correo: "", identificacion: "" };
  }, []);

  return {
    formData,
    errors,
    touched,
    checkingId,
    nameHelperText,
    razonSocialHelperText,
    checkingEmail,
    docMaxLength,
    nitMaxLength: NIT_MAX,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    setFromRecord,
  };
};

export default useDonorSponsorForm;
