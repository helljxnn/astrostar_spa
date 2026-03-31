import { fixMojibake } from "./textEncoding.js";

const PATCH_FLAG = "__astrostar_ascii_console_patched__";
const LOG_METHODS = ["log", "info", "warn", "error", "debug"];

const isPlainObject = (value) =>
  value !== null &&
  typeof value === "object" &&
  Object.getPrototypeOf(value) === Object.prototype;

const sanitizeAsciiText = (value) => {
  if (typeof value !== "string") {
    return value;
  }

  return fixMojibake(value)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x09\x0A\x0D\x20-\x7E]/g, "");
};

const sanitizeLogValue = (value, seen = new WeakSet()) => {
  if (typeof value === "string") {
    return sanitizeAsciiText(value);
  }

  if (Array.isArray(value)) {
    return value.map((entry) => sanitizeLogValue(entry, seen));
  }

  if (!value || typeof value !== "object") {
    return value;
  }

  if (seen.has(value)) {
    return "[Circular]";
  }

  if (value instanceof Error) {
    return {
      name: sanitizeAsciiText(value.name),
      message: sanitizeAsciiText(value.message),
      stack: sanitizeAsciiText(value.stack || ""),
    };
  }

  if (isPlainObject(value)) {
    seen.add(value);
    const output = {};
    for (const [key, entry] of Object.entries(value)) {
      output[sanitizeAsciiText(key)] = sanitizeLogValue(entry, seen);
    }
    seen.delete(value);
    return output;
  }

  return value;
};

const patchConsoleForAscii = () => {
  if (!window.console || window.console[PATCH_FLAG]) {
    return;
  }

  for (const method of LOG_METHODS) {
    const original = window.console[method];
    if (typeof original !== "function") {
      continue;
    }

    window.console[method] = (...args) => {
      const sanitizedArgs = args.map((arg) => sanitizeLogValue(arg));
      original.apply(window.console, sanitizedArgs);
    };
  }

  Object.defineProperty(window.console, PATCH_FLAG, {
    value: true,
    writable: false,
    enumerable: false,
    configurable: false,
  });
};

patchConsoleForAscii();
