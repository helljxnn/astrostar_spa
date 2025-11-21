  import { useState, useEffect, useRef, useCallback } from "react";
  import useSportsCategories from "./useSportsCategories";

  export const useSportsCategoryNameValidation = (currentCategoryId = null) => {
    const [nameValidation, setNameValidation] = useState({
      isChecking: false,
      isDuplicate: false,
      message: "",
      isAvailable: false,
    });

    const debounceTimer = useRef(null);

    const {
      fetchSportsCategories,
      checkCategoryNameAvailability,
      sportsCategories,
    } = useSportsCategories();

    useEffect(() => {
      fetchSportsCategories({ limit: 1000 });
    }, []);

    const validateName = useCallback(
      async (nombre) => {
        const trimmed = nombre.trim();
        if (trimmed.length < 3)
          return {
            available: false,
            message: "Debe tener mínimo 3 caracteres.",
          };

        try {
          const result = await checkCategoryNameAvailability(
            trimmed,
            currentCategoryId ? Number(currentCategoryId) : null
          );

          return {
            available: result.available,
            message: result.message,
          };
        } catch (error) {
          console.warn("Backend caído. Usando fallback local.");

          const exists = sportsCategories.some(
            (c) =>
              c.id !== currentCategoryId &&
              c.nombre.toLowerCase() === trimmed.toLowerCase()
          );

          return {
            available: !exists,
            message: exists
              ? `El nombre "${trimmed}" ya está en uso.`
              : "Nombre disponible.",
          };
        }
      },
      [sportsCategories, currentCategoryId]
    );

    const debouncedValidate = (value) => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);

      debounceTimer.current = setTimeout(async () => {
        setNameValidation((prev) => ({ ...prev, isChecking: true }));

        const result = await validateName(value);

        setNameValidation({
          isChecking: false,
          isDuplicate: !result.available,
          message: result.message,
          isAvailable: result.available,
        });
      }, 400);
    };

    return {
      nameValidation,
      validateCategoryName: debouncedValidate,
      validateCategoryNameSync: validateName,
    };
  };

  export default useSportsCategoryNameValidation;
