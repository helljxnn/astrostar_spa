import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

export const LEGACY_IMPORT_SHEET = "Deportistas";
const INSTRUCTIONS_SHEET = "Instrucciones";
const CATALOGS_SHEET = "Catalogos";

export const LEGACY_IMPORT_COLUMNS = [
  "estado_deportista",
  "fecha_estado_deportista",
  "primer_nombre",
  "segundo_nombre",
  "primer_apellido",
  "segundo_apellido",
  "tipo_documento_deportista",
  "documento_deportista",
  "correo_deportista",
  "telefono_deportista",
  "fecha_nacimiento_deportista",
  "direccion_deportista",
  "categoria_deportiva",
  "becada",
  "estado_matricula",
  "fecha_inicio_matricula",
  "fecha_vencimiento_matricula",
  "documento_acudiente",
  "tipo_documento_acudiente",
  "nombre_acudiente",
  "apellido_acudiente",
  "correo_acudiente",
  "telefono_acudiente",
  "fecha_nacimiento_acudiente",
  "direccion_acudiente",
  "parentesco_acudiente",
  "periodos_deuda_mensual",
  "crear_renovacion_pendiente",
  "fecha_inicio_mora",
  "condonar_mora_historica",
  "observaciones",
];

const EXAMPLE_ROW = {
  estado_deportista: "Activo",
  fecha_estado_deportista: "",
  primer_nombre: "Sara",
  segundo_nombre: "",
  primer_apellido: "Lopez",
  segundo_apellido: "",
  tipo_documento_deportista: "Tarjeta de Identidad",
  documento_deportista: "100200300",
  correo_deportista: "sara@example.com",
  telefono_deportista: "3000000000",
  fecha_nacimiento_deportista: "2011-02-10",
  direccion_deportista: "Calle 10 # 20-30",
  categoria_deportiva: "Juvenil",
  becada: "NO",
  estado_matricula: "Vigente",
  fecha_inicio_matricula: "2025-08-01",
  fecha_vencimiento_matricula: "2026-07-31",
  documento_acudiente: "99880011",
  tipo_documento_acudiente: "Cédula de Ciudadanía",
  nombre_acudiente: "Patricia",
  apellido_acudiente: "Lopez",
  correo_acudiente: "patricia@example.com",
  telefono_acudiente: "3000000002",
  fecha_nacimiento_acudiente: "1980-05-05",
  direccion_acudiente: "Calle 5 # 6-20",
  parentesco_acudiente: "Madre",
  periodos_deuda_mensual: "2026-01,2026-02",
  crear_renovacion_pendiente: "NO",
  fecha_inicio_mora: "2026-04-01",
  condonar_mora_historica: "SI",
  observaciones: "EJEMPLO - esta fila no se importa",
};

const normalizeKey = (value) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "_");

const normalizeString = (value) => String(value || "").trim();

const normalizeBooleanString = (value, defaultValue = false) => {
  if (typeof value === "boolean") return value;
  const normalized = normalizeKey(value);
  if (["si", "yes", "true", "1"].includes(normalized)) return true;
  if (["no", "false", "0"].includes(normalized)) return false;
  return defaultValue;
};

const excelSerialToDate = (serialValue) => {
  const serial = Number(serialValue);
  if (!Number.isFinite(serial) || serial <= 0) return null;

  const excelEpoch = Date.UTC(1899, 11, 30);
  const parsed = new Date(excelEpoch + serial * 24 * 60 * 60 * 1000);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const formatDateForTemplate = (value) => {
  if (!value) return "";
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  if (typeof value === "number") {
    const parsedFromSerial = excelSerialToDate(value);
    if (parsedFromSerial) {
      return parsedFromSerial.toISOString().slice(0, 10);
    }
  }

  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    return value.slice(0, 10);
  }

  if (typeof value === "string") {
    const numericSerial = value.trim().match(/^\d{5,6}(?:\.\d+)?$/);
    if (numericSerial) {
      const parsedFromSerial = excelSerialToDate(Number(value.trim()));
      if (parsedFromSerial) {
        return parsedFromSerial.toISOString().slice(0, 10);
      }
    }

    const dayFirstMatch = value.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (dayFirstMatch) {
      const [, day, month, year] = dayFirstMatch;
      return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    }
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return normalizeString(value);
  return parsed.toISOString().slice(0, 10);
};

const formatCellValue = (value) => {
  if (value === null || value === undefined) return "";

  if (value instanceof Date) {
    return formatDateForTemplate(value);
  }

  if (typeof value === "object") {
    if (value.text) return normalizeString(value.text);
    if (value.result) return formatCellValue(value.result);
  }

  return normalizeString(value);
};

const buildDocumentTypeMap = (documentTypes = []) => {
  const map = new Map();

  documentTypes.forEach((documentType) => {
    const label = documentType.label || documentType.name || "";
    if (!label) return;

    map.set(normalizeKey(label), documentType);
    map.set(normalizeKey(documentType.name || label), documentType);
    map.set(normalizeKey(documentType.id), documentType);
  });

  return map;
};

const buildSportsCategoryMap = (sportsCategories = []) => {
  const map = new Map();

  sportsCategories.forEach((category) => {
    const name = category.name || category.nombre || "";
    if (!name) return;

    map.set(normalizeKey(name), name);
  });

  return map;
};

const parseMonthlyDebtPeriods = (value) =>
  normalizeString(value)
    .split(",")
    .map((period) => period.trim())
    .filter(Boolean);

const looksLikeDateValue = (value) => /^\d{4}-\d{2}-\d{2}$/.test(normalizeString(value));
const looksLikePeriodList = (value) =>
  /^(\d{4}-\d{2})(\s*,\s*\d{4}-\d{2})*$/.test(normalizeString(value));

const normalizeFinancialTailColumns = (rowData) => {
  const monthlyDebtRaw = normalizeString(rowData.periodos_deuda_mensual);
  const renewalRaw = normalizeString(rowData.crear_renovacion_pendiente);
  const lateFeeRaw = normalizeString(rowData.fecha_inicio_mora);
  const waiveLateFeeRaw = normalizeString(rowData.condonar_mora_historica);
  const observationsRaw = normalizeString(rowData.observaciones);

  const looksShiftedRight =
    !monthlyDebtRaw &&
    looksLikePeriodList(renewalRaw) &&
    ["SI", "NO"].includes(lateFeeRaw.toUpperCase()) &&
    (looksLikeDateValue(waiveLateFeeRaw) || /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(waiveLateFeeRaw)) &&
    ["SI", "NO", ""].includes(observationsRaw.toUpperCase());

  if (!looksShiftedRight) {
    return rowData;
  }

  return {
    ...rowData,
    periodos_deuda_mensual: renewalRaw,
    crear_renovacion_pendiente: lateFeeRaw,
    fecha_inicio_mora: waiveLateFeeRaw,
    condonar_mora_historica: observationsRaw,
    observaciones: "",
  };
};

const isTemplateExampleRow = (rowData = {}) =>
  LEGACY_IMPORT_COLUMNS.every(
    (column) =>
      normalizeString(rowData[column]) === normalizeString(EXAMPLE_ROW[column])
  );

export const downloadLegacyImportTemplate = async (referenceData = {}) => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "AstroStar";
  workbook.created = new Date();

  const instructionsSheet = workbook.addWorksheet(INSTRUCTIONS_SHEET);
  instructionsSheet.columns = [{ width: 35 }, { width: 120 }];
  instructionsSheet.addRows([
    ["Objetivo", "Usa este archivo para cargar deportistas que ya existen en la fundacion antes de salir a produccion."],
    ["Hoja obligatoria", `Completa la hoja "${LEGACY_IMPORT_SHEET}" sin cambiar los encabezados.`],
    ["Hoja Catalogos", `La hoja "${CATALOGS_SHEET}" es solo de consulta. Te muestra los valores permitidos para diligenciar la hoja "${LEGACY_IMPORT_SHEET}".`],
    ["Categorias", "La categoria deportiva debe existir ya en el sistema. Si no existe, creala antes de importar."],
    ["Estado de la deportista", "En estado_deportista usa Activo o Inactivo. Si la deportista esta Activa, fecha_estado_deportista puede quedar vacia. Si esta Inactiva, registra la fecha real desde la cual quedo inactiva."],
    ["Acudiente", "Si la deportista es menor de edad, debes completar todos los campos del acudiente y el parentesco."],
    ["Deuda mensual", "Usa periodos separados por coma, por ejemplo: 2026-01,2026-02."],
    ["Renovacion pendiente", "Usa SI solo si la matricula ya esta Vencida y quieres dejar creada la obligacion de renovacion. No aplica para deportistas becadas."],
    ["Fecha de corte", "Usa una sola fecha para todo el archivo. Debe ser la fecha oficial desde la cual el sistema empezara a administrar estas deportistas, idealmente la fecha de salida a produccion o el primer dia del mes. Esa fecha define si una matricula queda Vigente o Vencida, impide cargar periodos de deuda futuros y sirve como base para la mora historica cuando aplique."],
    ["Mora historica", "Si condonar_mora_historica es SI, la mora empezara en fecha_inicio_mora o en la fecha de corte seleccionada en la migracion."],
    ["Acceso al sistema", "La migracion masiva crea el acceso en el sistema, pero no envia correos automaticos."],
  ]);
  instructionsSheet.getRow(1).font = { bold: true };

  const catalogsSheet = workbook.addWorksheet(CATALOGS_SHEET);
  catalogsSheet.columns = [{ width: 35 }, { width: 50 }];
  catalogsSheet.addRow(["Campo", "Valor permitido"]);
  catalogsSheet.getRow(1).font = { bold: true };

  (referenceData.documentTypes || []).forEach((documentType) => {
    catalogsSheet.addRow([
      "Tipo documento deportista",
      documentType.label || documentType.name,
    ]);
  });

  (referenceData.guardianDocumentTypes || []).forEach((documentType) => {
    catalogsSheet.addRow([
      "Tipo documento acudiente",
      documentType.label || documentType.name,
    ]);
  });

  (referenceData.sportsCategories || []).forEach((category) => {
    catalogsSheet.addRow([
      "Categoria deportiva",
      category.name || category.nombre,
    ]);
  });

  ["Activo", "Inactivo", "Vigente", "Vencida", "SI", "NO"].forEach((value) => {
    catalogsSheet.addRow(["Valores frecuentes", value]);
  });

  const importSheet = workbook.addWorksheet(LEGACY_IMPORT_SHEET);
  importSheet.columns = LEGACY_IMPORT_COLUMNS.map((column) => ({
    header: column,
    key: column,
    width: column.includes("observaciones") ? 35 : 22,
  }));

  const headerRow = importSheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF2563EB" },
  };
  headerRow.alignment = { vertical: "middle", horizontal: "center", wrapText: true };

  importSheet.addRow(EXAMPLE_ROW);
  const exampleRow = importSheet.getRow(2);
  exampleRow.font = { italic: true, color: { argb: "FF475569" } };
  exampleRow.eachCell((cell) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFFEF3C7" },
    };
  });
  importSheet.views = [{ state: "frozen", ySplit: 1 }];

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  saveAs(blob, `plantilla_importacion_legacy_${new Date().toISOString().slice(0, 10)}.xlsx`);
};

export const parseLegacyImportWorkbook = async (file, referenceData = {}) => {
  const workbook = new ExcelJS.Workbook();
  const buffer = await file.arrayBuffer();
  await workbook.xlsx.load(buffer);

  const importSheet = workbook.getWorksheet(LEGACY_IMPORT_SHEET);
  if (!importSheet) {
    return {
      success: false,
      records: [],
      rows: [],
      errors: [`No se encontró la hoja "${LEGACY_IMPORT_SHEET}" en el archivo.`],
    };
  }

  const headerRow = importSheet.getRow(1);
  const headers = headerRow.values
    .slice(1)
    .map((header) => normalizeKey(formatCellValue(header)));

  const missingHeaders = LEGACY_IMPORT_COLUMNS.filter(
    (column) => !headers.includes(normalizeKey(column))
  );

  if (missingHeaders.length > 0) {
    return {
      success: false,
      records: [],
      rows: [],
      errors: [
        `Faltan columnas obligatorias en la hoja "${LEGACY_IMPORT_SHEET}": ${missingHeaders.join(", ")}`,
      ],
    };
  }

  const documentTypeMap = buildDocumentTypeMap([
    ...(referenceData.documentTypes || []),
    ...(referenceData.guardianDocumentTypes || []),
  ]);
  const sportsCategoryMap = buildSportsCategoryMap(referenceData.sportsCategories || []);

  const rows = [];
  const records = [];

  importSheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;

    const rowData = {};
    headers.forEach((header, index) => {
      rowData[header] = formatCellValue(row.getCell(index + 1).value);
    });

    const normalizedRowData = normalizeFinancialTailColumns(rowData);

    const isEmptyRow = Object.values(normalizedRowData).every((value) => !normalizeString(value));
    if (isEmptyRow) return;

    if (isTemplateExampleRow(normalizedRowData)) return;

    const localErrors = [];

    const athleteDocumentType =
      documentTypeMap.get(normalizeKey(normalizedRowData.tipo_documento_deportista)) || null;
    const guardianDocumentType = normalizedRowData.tipo_documento_acudiente
      ? documentTypeMap.get(normalizeKey(normalizedRowData.tipo_documento_acudiente)) || null
      : null;
    const categoryName =
      sportsCategoryMap.get(normalizeKey(normalizedRowData.categoria_deportiva)) ||
      normalizeString(normalizedRowData.categoria_deportiva);

    if (!athleteDocumentType) {
      localErrors.push("Tipo de documento de deportista no reconocido.");
    }

    if (normalizedRowData.tipo_documento_acudiente && !guardianDocumentType) {
      localErrors.push("Tipo de documento de acudiente no reconocido.");
    }

    if (!categoryName) {
      localErrors.push("La categoría deportiva es obligatoria.");
    }

    const monthlyDebtRaw = normalizeString(normalizedRowData.periodos_deuda_mensual);
    const renewalRaw = normalizeString(normalizedRowData.crear_renovacion_pendiente);
    const lateFeeRaw = normalizeString(normalizedRowData.fecha_inicio_mora);
    const waiveLateFeeRaw = normalizeString(normalizedRowData.condonar_mora_historica);
    const observationsRaw = normalizeString(normalizedRowData.observaciones);

    const rowSeemsShifted =
      ["SI", "NO"].includes(monthlyDebtRaw.toUpperCase()) ||
      looksLikeDateValue(renewalRaw) ||
      ((waiveLateFeeRaw.toUpperCase() === "SI" || waiveLateFeeRaw.toUpperCase() === "NO") &&
        observationsRaw &&
        !looksLikeDateValue(lateFeeRaw) &&
        !["SI", "NO", ""].includes(lateFeeRaw.toUpperCase()));

    if (rowSeemsShifted) {
      localErrors.push(
        "La fila parece tener columnas corridas. Descarga de nuevo la plantilla actual y pega los datos desde la columna A sin cambiar el orden de los encabezados."
      );
    }

    const guardianDataPresent = [
      normalizedRowData.documento_acudiente,
      normalizedRowData.nombre_acudiente,
      normalizedRowData.apellido_acudiente,
      normalizedRowData.correo_acudiente,
    ].some((value) => normalizeString(value));

    const record = {
      athlete: {
        firstName: normalizeString(normalizedRowData.primer_nombre),
        middleName: normalizeString(normalizedRowData.segundo_nombre) || null,
        lastName: normalizeString(normalizedRowData.primer_apellido),
        secondLastName: normalizeString(normalizedRowData.segundo_apellido) || null,
        documentTypeId: athleteDocumentType?.id || null,
        identification: normalizeString(normalizedRowData.documento_deportista),
        email: normalizeString(normalizedRowData.correo_deportista).toLowerCase(),
        phoneNumber: normalizeString(normalizedRowData.telefono_deportista),
        birthDate: formatDateForTemplate(normalizedRowData.fecha_nacimiento_deportista),
        address: normalizeString(normalizedRowData.direccion_deportista),
        categoria: categoryName,
        status: normalizeString(normalizedRowData.estado_deportista) || "Activo",
        statusAssignedAt: formatDateForTemplate(normalizedRowData.fecha_estado_deportista) || null,
        isScholarship: normalizeBooleanString(normalizedRowData.becada, false),
        relationship: normalizeString(normalizedRowData.parentesco_acudiente) || null,
      },
      enrollment: {
        estado: normalizeString(normalizedRowData.estado_matricula),
        fechaInicio: formatDateForTemplate(normalizedRowData.fecha_inicio_matricula),
        fechaVencimiento: formatDateForTemplate(normalizedRowData.fecha_vencimiento_matricula),
        observaciones: normalizeString(normalizedRowData.observaciones) || null,
      },
      financial: {
        monthlyDebtPeriods: parseMonthlyDebtPeriods(normalizedRowData.periodos_deuda_mensual),
        createRenewalObligation: normalizeBooleanString(
          normalizedRowData.crear_renovacion_pendiente,
          false
        ),
        lateFeeStartsAt: formatDateForTemplate(normalizedRowData.fecha_inicio_mora) || null,
        waiveHistoricalLateFee: normalizeBooleanString(
          normalizedRowData.condonar_mora_historica,
          true
        ),
      },
    };

    if (guardianDataPresent) {
      record.guardian = {
        documentTypeId: guardianDocumentType?.id || null,
        identification: normalizeString(normalizedRowData.documento_acudiente),
        firstName: normalizeString(normalizedRowData.nombre_acudiente),
        lastName: normalizeString(normalizedRowData.apellido_acudiente),
        email: normalizeString(normalizedRowData.correo_acudiente).toLowerCase(),
        phone: normalizeString(normalizedRowData.telefono_acudiente),
        birthDate: formatDateForTemplate(normalizedRowData.fecha_nacimiento_acudiente),
        address: normalizeString(normalizedRowData.direccion_acudiente) || null,
      };
    }

    rows.push({
      rowNumber,
      athleteName: `${record.athlete.firstName} ${record.athlete.lastName}`.trim(),
      identification: record.athlete.identification,
      localErrors,
    });

    records.push(record);
  });

  const errors = rows
    .filter((row) => row.localErrors.length > 0)
    .map((row) => `Fila ${row.rowNumber}: ${row.localErrors.join(" ")}`);

  return {
    success: errors.length === 0,
    records,
    rows,
    errors,
  };
};
