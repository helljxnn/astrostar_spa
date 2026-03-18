export const isCancelledDonation = (donation) =>
  String(donation?.status || "").trim().toLowerCase() === "anulada";

export const parseNumericValue = (value) => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value !== "string") return 0;

  let sanitized = value.trim();
  if (!sanitized) return 0;

  sanitized = sanitized.replace(/\s+/g, "").replace(/[^\d,.-]/g, "");
  if (!sanitized) return 0;

  const hasComma = sanitized.includes(",");
  const hasDot = sanitized.includes(".");

  if (hasComma && hasDot) {
    if (sanitized.lastIndexOf(",") > sanitized.lastIndexOf(".")) {
      sanitized = sanitized.replace(/\./g, "").replace(",", ".");
    } else {
      sanitized = sanitized.replace(/,/g, "");
    }
  } else if (hasComma) {
    const parts = sanitized.split(",");
    if (parts.length > 2) {
      const decimalPart = parts[parts.length - 1];
      if (decimalPart.length <= 2) {
        sanitized = `${parts.slice(0, -1).join("")}.${decimalPart}`;
      } else {
        sanitized = parts.join("");
      }
    } else {
      const maybeThousands =
        parts.length > 1 && parts[parts.length - 1].length === 3;
      sanitized = maybeThousands ? parts.join("") : sanitized.replace(",", ".");
    }
  } else if (hasDot) {
    const parts = sanitized.split(".");
    if (parts.length > 2) {
      const decimalPart = parts[parts.length - 1];
      if (decimalPart.length <= 2) {
        sanitized = `${parts.slice(0, -1).join("")}.${decimalPart}`;
      } else {
        sanitized = parts.join("");
      }
    } else {
      const maybeThousands =
        parts.length > 1 && parts[parts.length - 1].length === 3;
      if (maybeThousands) {
        sanitized = parts.join("");
      }
    }
  }

  const parsed = Number(sanitized);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const getDonationMonetaryAmount = (donation) => {
  if (!donation) return 0;
  if (donation.type !== "ECONOMICA" && donation.type !== "ALIMENTOS") return 0;

  const payment = (donation.details || []).find(
    (detail) => detail.recordType === "payment",
  );

  return parseNumericValue(payment?.amount);
};

export const getDonationInKindUnits = (donation) => {
  if (!donation) return 0;
  if (donation.type !== "ESPECIE") return 0;

  return (donation.details || []).reduce((sum, detail) => {
    if (detail.recordType !== "item") return sum;
    return sum + Math.round(parseNumericValue(detail.quantity));
  }, 0);
};

export const getDonationInKindValue = (donation) => {
  if (!donation) return 0;
  if (donation.type !== "ESPECIE") return 0;

  return (donation.details || []).reduce((sum, detail) => {
    if (detail.recordType !== "item") return sum;

    const value = parseNumericValue(detail.amount);
    if (value > 0) return sum + value;

    return sum + parseNumericValue(detail.quantity);
  }, 0);
};
