import { useRef, useState } from "react";
import apiClient from "../../../../../../../../shared/services/apiClient";

export const useFormEventValidation = () => {
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isCheckingName, setIsCheckingName] = useState(false);

  const nameCheckTimeoutRef = useRef(null);
  const latestNameCheckRef = useRef(0);
  const lastResolvedNameRef = useRef({
    eventId: null,
    name: "",
    available: true,
    message: "",
  });

  const clearDuplicateNameError = () => {
    setErrors((prev) => {
      if (!prev.nombre || !prev.nombre.includes("Ya existe")) {
        return prev;
      }

      const nextErrors = { ...prev };
      delete nextErrors.nombre;
      return nextErrors;
    });
  };

  const applyCachedNameResult = (cachedResult) => {
    setErrors((prev) => {
      const nextErrors = { ...prev };

      if (!cachedResult.available) {
        nextErrors.nombre = cachedResult.message;
      } else if (
        nextErrors.nombre &&
        nextErrors.nombre.includes("Ya existe")
      ) {
        delete nextErrors.nombre;
      }

      return nextErrors;
    });
  };

  const checkNameAvailability = (name, eventId = null) => {
    const normalizedName = name?.trim() || "";

    if (nameCheckTimeoutRef.current) {
      clearTimeout(nameCheckTimeoutRef.current);
    }

    if (normalizedName.length < 3) {
      setIsCheckingName(false);
      return;
    }

    if (
      lastResolvedNameRef.current.name === normalizedName &&
      lastResolvedNameRef.current.eventId === eventId
    ) {
      applyCachedNameResult(lastResolvedNameRef.current);
      return;
    }

    setIsCheckingName(true);
    const currentRequestId = latestNameCheckRef.current + 1;
    latestNameCheckRef.current = currentRequestId;

    nameCheckTimeoutRef.current = setTimeout(async () => {
      try {
        let url = `/events/check-name?name=${encodeURIComponent(normalizedName)}`;
        if (eventId) {
          url += `&excludeId=${eventId}`;
        }

        const response = await apiClient.get(url, { skipLoader: true });

        if (latestNameCheckRef.current !== currentRequestId) {
          return;
        }

        const resolvedResult = {
          eventId,
          name: normalizedName,
          available: Boolean(response.success && response.available),
          message: response.message || "",
        };

        lastResolvedNameRef.current = resolvedResult;
        applyCachedNameResult(resolvedResult);
      } catch (error) {
        if (latestNameCheckRef.current !== currentRequestId) {
          return;
        }

        if (error?.message?.includes("Demasiadas peticiones")) {
          setErrors((prev) => ({
            ...prev,
            nombre:
              "La validacion del nombre esta temporalmente ocupada. Intenta de nuevo en unos segundos.",
          }));
        }
      } finally {
        if (latestNameCheckRef.current === currentRequestId) {
          setIsCheckingName(false);
        }
      }
    }, 1200);
  };

  const validateField = (name, value, formData) => {
    let error = "";

    switch (name) {
      case "nombre":
        if (!value?.trim()) {
          error = "El nombre del evento es obligatorio.";
        } else if (value.length < 3) {
          error = "El nombre debe tener al menos 3 caracteres.";
        } else {
          clearDuplicateNameError();
        }
        break;

      case "descripcion":
        if (!value?.trim()) error = "La descripcion es obligatoria.";
        else if (value.length < 10) {
          error = "La descripcion debe tener al menos 10 caracteres.";
        }
        break;

      case "fechaInicio":
        if (!value) {
          error = "La fecha de inicio es obligatoria.";
        } else if (!formData.id) {
          const now = new Date();
          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          const [year, month, day] = value.split("-").map(Number);
          const selectedDateOnly = new Date(year, month - 1, day);

          if (selectedDateOnly <= today) {
            error =
              "Los eventos deben crearse con al menos un dia de anticipacion. Selecciona una fecha valida.";
          }
        }
        break;

      case "fechaFin":
        if (!value) {
          error = "La fecha de finalizacion es obligatoria.";
        } else if (formData.fechaInicio && value < formData.fechaInicio) {
          error = "La fecha de finalizacion no puede ser menor a la de inicio.";
        } else if (!formData.id) {
          const now = new Date();
          const selectedDateTime = new Date(
            value + "T" + (formData.horaFin || "23:59"),
          );

          if (selectedDateTime <= now) {
            error = "La fecha y hora de finalizacion deben ser futuras.";
          }
        }
        break;

      case "horaInicio":
        if (!value) {
          error = "La hora de inicio es obligatoria.";
        } else if (!formData.id && formData.fechaInicio) {
          const now = new Date();
          const selectedDateTime = new Date(formData.fechaInicio + "T" + value);

          if (selectedDateTime <= now) {
            error = "La fecha y hora de inicio deben ser futuras.";
          }
        }
        break;

      case "horaFin":
        if (!value) {
          error = "La hora de finalizacion es obligatoria.";
        } else if (
          formData.horaInicio &&
          formData.fechaInicio === formData.fechaFin &&
          value <= formData.horaInicio
        ) {
          error = "La hora de finalizacion debe ser posterior a la de inicio.";
        } else if (!formData.id && formData.fechaFin) {
          const now = new Date();
          const selectedDateTime = new Date(formData.fechaFin + "T" + value);

          if (selectedDateTime <= now) {
            error = "La fecha y hora de finalizacion deben ser futuras.";
          }
        }
        break;

      case "ubicacion":
        if (!value?.trim()) error = "La ubicacion es obligatoria.";
        break;

      case "telefono":
        if (!value?.trim()) {
          error = "El telefono es obligatorio.";
        } else {
          const rawPhone = value.trim();
          const cleanPhone = rawPhone.replace(/[\s\-()]/g, "");

          if (cleanPhone.startsWith("+") && !cleanPhone.startsWith("+57")) {
            error = "Solo se permite el indicativo +57.";
          } else {
            const localPhone = cleanPhone.startsWith("+57")
              ? cleanPhone.slice(3)
              : cleanPhone.startsWith("57")
                ? cleanPhone.slice(2)
                : cleanPhone;

            if (!/^\d+$/.test(localPhone)) {
              error = "El telefono solo puede contener numeros.";
            } else {
              const isMobile = localPhone.length === 10 && /^3/.test(localPhone);
              const isLandline = localPhone.length === 7 && /^[2-8]/.test(localPhone);

              if (!isMobile && !isLandline) {
                error =
                  "Numero invalido. Celular: 3XXXXXXXXX, fijo: 2XXXXXXX-8XXXXXXX.";
              }
            }
          }
        }
        break;

      case "detalles":
        if (!value?.trim()) error = "Los detalles son obligatorios.";
        else if (value.length < 15) {
          error = "Los detalles deben tener al menos 15 caracteres.";
        }
        break;

      case "categoryIds":
        if (!value || !Array.isArray(value) || value.length === 0) {
          error = "Debe seleccionar al menos una categoria.";
        }
        break;

      case "estado":
        if (!value?.trim()) error = "Debe seleccionar un estado.";
        break;

      case "tipoEvento":
        if (!value && value !== 0) {
          error = "Debe seleccionar un tipo de evento.";
        }
        break;

      default:
        break;
    }

    return error;
  };

  const validate = (formData) => {
    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key], formData);
      if (error) newErrors[key] = error;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBlur = (name, value, formData) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validateField(name, value, formData);
    setErrors((prev) => ({ ...prev, [name]: error }));

    if (!error && name === "nombre") {
      checkNameAvailability(value, formData.id);
    }
  };

  const handleChangeValidation = (name, value, formData) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validateField(name, value, formData);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const touchAllFields = (formData) => {
    const allTouched = {};
    Object.keys(formData).forEach((name) => {
      allTouched[name] = true;
    });
    allTouched.tipoEvento = true;
    setTouched(allTouched);
  };

  return {
    errors,
    touched,
    validate,
    handleBlur,
    handleChangeValidation,
    touchAllFields,
    isCheckingName,
  };
};
