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
  "ocupacion_acudiente",
  "parentesco_acudiente",
  "periodos_deuda_mensual",
  "crear_renovacion_pendiente",
  "fecha_inicio_mora",
  "condonar_mora_historica",
  "observaciones",
];

const EXAMPLE_ROW = {
  estado_deportista: "Active",
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
  tipo_documento_acudiente: "Cedula de Ciudadania",
  nombre_acudiente: "Patricia",
  apellido_acudiente: "Lopez",
  correo_acudiente: "patricia@example.com",
  telefono_acudiente: "3000000002",
  fecha_nacimiento_acudiente: "1980-05-05",
  direccion_acudiente: "Calle 5 # 6-20",
  ocupacion_acudiente: "Madre",
  parentesco_acudiente: "Madre",
  periodos_deuda_mensual: "2026-01,2026-02",
  crear_renovacion_pendiente: "NO",
  fecha_inicio_mora: "2026-04-01",
  condonar_mora_historica: "SI",
  observaciones: "Saldo inicial migrado desde control manual",
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

const formatDateForTemplate = (value) => {
  if (!value) return "";
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    return value.slice(0, 10);
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

export const downloadLegacyImportTemplate = async (referenceData = {}) => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "AstroStar";
  workbook.created = new Date();

  const instructionsSheet = workbook.addWorksheet(INSTRUCTIONS_SHEET);
  instructionsSheet.columns = [{ width: 35 }, { width: 120 }];
  instructionsSheet.addRows([
    ["Objetivo", "Usa este archivo para cargar deportistas que ya existen en la fundación antes de salir a producción."],
    ["Hoja obligatoria", `Completa la hoja "${LEGACY_IMPORT_SHEET}" sin cambiar los encabezados.`],
    ["Categorías", "La categoría deportiva debe existir ya en el sistema. Si no existe, créala antes de importar."],
    ["Acudiente", "Si la deportista es menor de edad, debes completar todos los campos del acudiente y el parentesco."],
    ["Deuda mensual", "Usa periodos separados por coma, por ejemplo: 2026-01,2026-02."],
    ["Renovación pendiente", "Usa SI solo si la matrícula está Vencida y quieres dejar la renovación creada."],
    ["Mora histórica", "Si condonar_mora_historica es SI, la mora empezará en fecha_inicio_mora o en la fecha de corte del importador."],
    ["Correos", "La recomendación es importar primero con envío de credenciales desactivado y enviarlas solo después de validar."],
  ]);
  instructionsSheet.getRow(1).font = { bold: true };

  const catalogsSheet = workbook.addWorksheet(CATALOGS_SHEET);
  catalogsSheet.columns = [{ width: 35 }, { width: 40 }, { width: 20 }];
  catalogsSheet.addRow(["Tipo", "Valor", "Observacion"]);
  catalogsSheet.getRow(1).font = { bold: true };

  (referenceData.documentTypes || []).forEach((documentType) => {
    catalogsSheet.addRow([
      "Tipo documento deportista",
      documentType.label || documentType.name,
      documentType.id,
    ]);
  });

  (referenceData.guardianDocumentTypes || []).forEach((documentType) => {
    catalogsSheet.addRow([
      "Tipo documento acudiente",
      documentType.label || documentType.name,
      documentType.id,
    ]);
  });

  (referenceData.sportsCategories || []).forEach((category) => {
    catalogsSheet.addRow([
      "Categoria deportiva",
      category.name || category.nombre,
      category.id || "",
    ]);
  });

  ["Active", "Inactive", "Vigente", "Vencida", "SI", "NO"].forEach((value) => {
    catalogsSheet.addRow(["Valores frecuentes", value, ""]);
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

    const isEmptyRow = Object.values(rowData).every((value) => !normalizeString(value));
    if (isEmptyRow) return;

    const localErrors = [];

    const athleteDocumentType =
      documentTypeMap.get(normalizeKey(rowData.tipo_documento_deportista)) || null;
    const guardianDocumentType = rowData.tipo_documento_acudiente
      ? documentTypeMap.get(normalizeKey(rowData.tipo_documento_acudiente)) || null
      : null;
    const categoryName =
      sportsCategoryMap.get(normalizeKey(rowData.categoria_deportiva)) ||
      normalizeString(rowData.categoria_deportiva);

    if (!athleteDocumentType) {
      localErrors.push("Tipo de documento de deportista no reconocido.");
    }

    if (rowData.tipo_documento_acudiente && !guardianDocumentType) {
      localErrors.push("Tipo de documento de acudiente no reconocido.");
    }

    if (!categoryName) {
      localErrors.push("La categoría deportiva es obligatoria.");
    }

    const guardianDataPresent = [
      rowData.documento_acudiente,
      rowData.nombre_acudiente,
      rowData.apellido_acudiente,
      rowData.correo_acudiente,
    ].some((value) => normalizeString(value));

    const record = {
      athlete: {
        firstName: normalizeString(rowData.primer_nombre),
        middleName: normalizeString(rowData.segundo_nombre) || null,
        lastName: normalizeString(rowData.primer_apellido),
        secondLastName: normalizeString(rowData.segundo_apellido) || null,
        documentTypeId: athleteDocumentType?.id || null,
        identification: normalizeString(rowData.documento_deportista),
        email: normalizeString(rowData.correo_deportista).toLowerCase(),
        phoneNumber: normalizeString(rowData.telefono_deportista),
        birthDate: formatDateForTemplate(rowData.fecha_nacimiento_deportista),
        address: normalizeString(rowData.direccion_deportista),
        categoria: categoryName,
        status: normalizeString(rowData.estado_deportista) || "Active",
        statusAssignedAt: formatDateForTemplate(rowData.fecha_estado_deportista) || null,
        isScholarship: normalizeBooleanString(rowData.becada, false),
        relationship: normalizeString(rowData.parentesco_acudiente) || null,
      },
      enrollment: {
        estado: normalizeString(rowData.estado_matricula),
        fechaInicio: formatDateForTemplate(rowData.fecha_inicio_matricula),
        fechaVencimiento: formatDateForTemplate(rowData.fecha_vencimiento_matricula),
        observaciones: normalizeString(rowData.observaciones) || null,
      },
      financial: {
        monthlyDebtPeriods: parseMonthlyDebtPeriods(rowData.periodos_deuda_mensual),
        createRenewalObligation: normalizeBooleanString(
          rowData.crear_renovacion_pendiente,
          false
        ),
        lateFeeStartsAt: formatDateForTemplate(rowData.fecha_inicio_mora) || null,
        waiveHistoricalLateFee: normalizeBooleanString(
          rowData.condonar_mora_historica,
          true
        ),
      },
    };

    if (guardianDataPresent) {
      record.guardian = {
        documentTypeId: guardianDocumentType?.id || null,
        identification: normalizeString(rowData.documento_acudiente),
        firstName: normalizeString(rowData.nombre_acudiente),
        lastName: normalizeString(rowData.apellido_acudiente),
        email: normalizeString(rowData.correo_acudiente).toLowerCase(),
        phone: normalizeString(rowData.telefono_acudiente),
        birthDate: formatDateForTemplate(rowData.fecha_nacimiento_acudiente),
        address: normalizeString(rowData.direccion_acudiente) || null,
        occupation: normalizeString(rowData.ocupacion_acudiente) || null,
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
