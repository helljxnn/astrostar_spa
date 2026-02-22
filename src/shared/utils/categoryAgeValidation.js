export const normalizeCategoryName = (value = "") =>
  String(value || "").trim().toLowerCase();

export const resolveCategoryAgeRange = (category) => {
  if (!category) return null;

  const minRaw =
    category.minAge ??
    category.edadMinima ??
    category.ageMin ??
    category.age_min ??
    category.min;
  const maxRaw =
    category.maxAge ??
    category.edadMaxima ??
    category.ageMax ??
    category.age_max ??
    category.max;

  const minAge = Number(minRaw);
  const maxAge = Number(maxRaw);

  if (!Number.isFinite(minAge) || !Number.isFinite(maxAge)) return null;

  return { minAge, maxAge };
};

export const findCategoryByName = (categories = [], name) => {
  const target = normalizeCategoryName(name);
  if (!target) return null;

  return (
    (categories || []).find((cat) => {
      const catName = cat?.name ?? cat?.nombre ?? "";
      return normalizeCategoryName(catName) === target;
    }) || null
  );
};

export const isAgeWithinRange = (age, range) => {
  if (!range || !Number.isFinite(range.minAge) || !Number.isFinite(range.maxAge)) {
    return true;
  }

  const ageNum = Number(age);
  if (!Number.isFinite(ageNum)) return true;

  return ageNum >= range.minAge && ageNum <= range.maxAge;
};

export const formatAgeRange = (range) => {
  if (!range || !Number.isFinite(range.minAge) || !Number.isFinite(range.maxAge)) {
    return "";
  }
  return `${range.minAge}-${range.maxAge}`;
};
