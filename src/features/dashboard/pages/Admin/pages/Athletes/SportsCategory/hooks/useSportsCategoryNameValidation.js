// useSportsCategoryNameValidation.js
import { useState, useRef, useEffect, useCallback } from "react";
import useSportsCategories from "./useSportsCategories";

export const useSportsCategoryNameValidation = (currentCategoryId = null) => {
  const [nameValidation, setNameValidation] = useState({
    isChecking: false,
    isDuplicate: false,
    message: "",
    isAvailable: false,
  });

  const debounceTimer = useRef(null);

  const { fetchSportsCategories, categories, checkCategoryNameAvailability } = useSportsCategories();

  useEffect(() => {
    if (!categories || categories.length === 0) {
      fetchSportsCategories({ limit: 100 }).catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const existsLocal = useCallback(
    (trimmedLower) =>
      (categories || []).some((c) => {
        const id = c?.id ?? c?.Id ?? null;
        const name = (c?.name || c?.nombre || "").toString().trim().toLowerCase();
        return id !== currentCategoryId && name === trimmedLower;
      }),
    [categories, currentCategoryId]
  );

  const validateNameRemote = useCallback(
    async (nombre) => {
      const trimmed = String(nombre || "").trim().toLowerCase();
      if (trimmed.length < 3) {
        return { available: false, message: "Debe tener minimo 3 caracteres." };
      }

      if (existsLocal(trimmed)) {
        return { available: false, message: `El nombre "${nombre}" ya existe.` };
      }

      try {
        const res = await checkCategoryNameAvailability(trimmed, currentCategoryId ? Number(currentCategoryId) : null);
        if (res && typeof res.available === "boolean") {
          return { available: res.available, message: res.message || (res.available ? "Nombre disponible." : "Nombre en uso.") };
        }
        if (res?.data && typeof res.data.available === "boolean") {
          return { available: res.data.available, message: res.data.message || "" };
        }
        return { available: true, message: "Nombre disponible." };
      } catch {
        const exists = existsLocal(trimmed);
        return {
          available: !exists,
          message: exists ? `El nombre "${nombre}" ya está en uso (offline).` : "Nombre disponible (offline).",
        };
      }
    },
    [checkCategoryNameAvailability, currentCategoryId, existsLocal]
  );

  const validateCategoryName = (value) => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    const trimmed = String(value || "").trim();
    const trimmedLower = trimmed.toLowerCase();

    if (!trimmed || trimmed.length < 3) {
      setNameValidation({
        isChecking: false,
        isDuplicate: true,
        message: trimmed ? "Debe tener minimo 3 caracteres." : "El nombre es obligatorio",
        isAvailable: false,
      });
      return;
    }

    if (existsLocal(trimmedLower)) {
      setNameValidation({
        isChecking: false,
        isDuplicate: true,
        message: `El nombre "${value}" ya existe.`,
        isAvailable: false,
      });
    } else {
      setNameValidation((p) => ({ ...p, isChecking: true, isDuplicate: false, message: "", isAvailable: false }));
    }

    debounceTimer.current = setTimeout(async () => {
      const result = await validateNameRemote(value);
      setNameValidation({
        isChecking: false,
        isDuplicate: !result.available,
        message: result.message,
        isAvailable: result.available,
      });
    }, 150);
  };

  const validateCategoryNameSync = async (value) => {
    setNameValidation((p) => ({ ...p, isChecking: true }));
    try {
      const result = await validateNameRemote(value);
      setNameValidation({
        isChecking: false,
        isDuplicate: !result.available,
        message: result.message,
        isAvailable: result.available,
      });
      return result;
    } catch {
      setNameValidation({ isChecking: false, isDuplicate: false, message: "", isAvailable: true });
      return { available: true };
    }
  };

  const resetNameValidation = () => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
      debounceTimer.current = null;
    }
    setNameValidation({ isChecking: false, isDuplicate: false, message: "", isAvailable: false });
  };

  return {
    nameValidation,
    validateCategoryName,
    validateCategoryNameSync,
    resetNameValidation,
  };
};

export default useSportsCategoryNameValidation;

