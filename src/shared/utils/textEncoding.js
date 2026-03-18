const MOJIBAKE_HINT = /(?:Ã.|Â.|â.|ð|Ð|Ñ)/;

const decodeUtf8FromLatin1 = (value) => {
  if (typeof value !== "string" || value.length === 0) {
    return value;
  }

  const bytes = Uint8Array.from(value, (char) => char.charCodeAt(0) & 0xff);
  const decoded = new TextDecoder("utf-8", { fatal: false }).decode(bytes);

  if (!decoded || decoded.includes("\uFFFD")) {
    return value;
  }

  return decoded;
};

export const fixMojibake = (value) => {
  if (typeof value !== "string") {
    return value;
  }

  if (!MOJIBAKE_HINT.test(value)) {
    return value;
  }

  try {
    const decoded = decodeUtf8FromLatin1(value);
    return typeof decoded === "string" ? decoded : value;
  } catch {
    return value;
  }
};

export const normalizeExportText = (value) => {
  if (value === undefined || value === null) {
    return "";
  }

  if (value instanceof Date) {
    return value.toLocaleDateString("es-ES");
  }

  if (typeof value === "object") {
    return fixMojibake(JSON.stringify(value)).normalize("NFC");
  }

  if (typeof value === "string") {
    return fixMojibake(value).normalize("NFC");
  }

  return String(value).normalize("NFC");
};
