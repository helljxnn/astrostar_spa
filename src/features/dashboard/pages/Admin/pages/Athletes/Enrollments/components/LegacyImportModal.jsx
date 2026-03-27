import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  FaDownload,
  FaFileExcel,
  FaTimes,
  FaUpload,
  FaCheckCircle,
  FaExclamationTriangle,
} from "react-icons/fa";
import {
  showConfirmAlert,
  showErrorAlert,
  showSuccessAlert,
} from "../../../../../../../../shared/utils/alerts.js";
import EnrollmentsService from "../services/EnrollmentsService.js";
import {
  downloadLegacyImportTemplate,
  parseLegacyImportWorkbook,
} from "../utils/legacyImportExcel.js";

const getToday = () => new Date().toISOString().slice(0, 10);

const LegacyImportModal = ({ isOpen, onClose, referenceData, onImported }) => {
  const [file, setFile] = useState(null);
  const [cutoverDate, setCutoverDate] = useState(getToday());
  const [parsing, setParsing] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [localErrors, setLocalErrors] = useState([]);
  const [preview, setPreview] = useState(null);
  const [preparedPayload, setPreparedPayload] = useState(null);

  useEffect(() => {
    if (!isOpen) {
      setFile(null);
      setCutoverDate(getToday());
      setParsing(false);
      setPreviewing(false);
      setImporting(false);
      setLocalErrors([]);
      setPreview(null);
      setPreparedPayload(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (preview) {
      setPreview(null);
      setPreparedPayload(null);
    }
  }, [cutoverDate]);

  const summary = preview?.summary || null;
  if (!isOpen) return null;

  const handleDownloadTemplate = async () => {
    try {
      await downloadLegacyImportTemplate(referenceData);
      await showSuccessAlert(
        "Plantilla descargada",
        "Completa una fila por cada deportista y luego vuelve a cargar el archivo."
      );
    } catch (error) {
      await showErrorAlert("Error", error.message || "No se pudo generar la plantilla");
    }
  };

  const handlePreview = async () => {
    if (!file) {
      await showErrorAlert("Archivo requerido", "Selecciona primero el archivo de migracion.");
      return;
    }

    try {
      setParsing(true);
      setPreviewing(true);
      setLocalErrors([]);
      setPreview(null);
      setPreparedPayload(null);

      const parsedWorkbook = await parseLegacyImportWorkbook(file, referenceData);

      if (!parsedWorkbook.success) {
        setLocalErrors(parsedWorkbook.errors || []);
        return;
      }

      const payload = {
        records: parsedWorkbook.records,
        options: {
          cutoverDate,
          requireSportsCategory: true,
        },
      };

      const previewResult = await EnrollmentsService.previewLegacyImportBatch(payload);
      if (!previewResult.success) {
        await showErrorAlert("No se pudo revisar el archivo", previewResult.error);
        return;
      }

      setPreparedPayload(payload);
      setPreview(previewResult.data);
    } catch (error) {
      await showErrorAlert("Error", error.message || "No se pudo leer el archivo");
    } finally {
      setParsing(false);
      setPreviewing(false);
    }
  };

  const handleImport = async () => {
    if (!preparedPayload || !summary || summary.invalidRows > 0) {
      return;
    }

    const confirmation = await showConfirmAlert(
      "Confirmar migracion",
      `Se registraran ${summary.readyRows} deportistas con fecha de corte ${cutoverDate}.`,
      {
        confirmButtonText: "Registrar deportistas",
      }
    );

    if (!confirmation.isConfirmed) return;

    try {
      setImporting(true);
      const result = await EnrollmentsService.createLegacyImportBatch(preparedPayload);

      if (!result.success) {
        await showErrorAlert("No se pudo completar la migracion", result.error);
        return;
      }

      await showSuccessAlert(
        "Migracion completada",
        `Se registraron ${result.data.summary.importedRows} deportistas correctamente.`
      );

      await onImported?.(result.data);
      onClose();
    } catch (error) {
      await showErrorAlert("Error", error.message || "No se pudo completar la migracion");
    } finally {
      setImporting(false);
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-900/55 px-4 py-6">
      <div className="w-full max-w-6xl overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-200 bg-slate-50 px-6 py-5">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">
              Migracion masiva
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Carga aqui el archivo con las deportistas actuales para registrarlas en el sistema.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-500 transition hover:bg-slate-200 hover:text-slate-800"
          >
            <FaTimes />
          </button>
        </div>
        <div className="max-h-[80vh] overflow-y-auto px-6 py-5">
          <div className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
            <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 font-medium text-white transition hover:bg-emerald-700"
                >
                  <FaDownload />
                  Descargar plantilla
                </button>
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50">
                  <FaFileExcel className="text-emerald-600" />
                  {file ? file.name : "Seleccionar Excel"}
                  <input
                    type="file"
                    accept=".xlsx"
                    className="hidden"
                    onChange={(event) => {
                      setFile(event.target.files?.[0] || null);
                      setPreview(null);
                      setPreparedPayload(null);
                      setLocalErrors([]);
                    }}
                  />
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-1">
                <label className="block max-w-sm">
                  <span className="mb-2 block text-sm font-medium text-slate-700">
                    Fecha de corte
                  </span>
                  <input
                    type="date"
                    value={cutoverDate}
                    onChange={(event) => setCutoverDate(event.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none transition focus:border-primary-blue"
                  />
                  <span className="mt-2 block text-xs leading-5 text-slate-500">
                    Usa la fecha desde la cual el sistema empezara a administrar esta informacion.
                    Sirve para validar si cada matricula debe quedar Vigente o Vencida y para
                    definir desde cuando corre la mora historica si existe deuda importada.
                  </span>
                </label>
              </div>

              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                <p className="font-semibold">Informacion que debe incluir el archivo</p>
                <p className="mt-1">
                  Registra una fila por cada deportista. Incluye sus datos personales, la categoria
                  deportiva, el estado actual de la matricula, las fechas correspondientes, las
                  mensualidades pendientes si existen y los datos del acudiente cuando sea menor de edad.
                </p>
                <p className="mt-2">
                  Si una matricula ya esta vencida y deseas dejar lista la renovacion para gestionarla
                  en el sistema, marca la columna <span className="font-semibold">crear_renovacion_pendiente</span> con
                  <span className="font-semibold"> SI</span>. No uses esa opcion para deportistas becadas.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                Este proceso crea el acceso en el sistema, pero no envia correos automaticos.
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handlePreview}
                  disabled={parsing || previewing || importing}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary-blue px-4 py-2.5 font-medium text-white transition hover:bg-primary-purple disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <FaUpload />
                  {previewing ? "Revisando archivo..." : "Revisar archivo"}
                </button>
                <button
                  type="button"
                  onClick={handleImport}
                  disabled={!summary || summary.invalidRows > 0 || importing}
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <FaCheckCircle />
                  {importing ? "Registrando..." : "Registrar deportistas"}
                </button>
              </div>

              {localErrors.length > 0 && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
                  <div className="mb-2 flex items-center gap-2 text-rose-700">
                    <FaExclamationTriangle />
                    <span className="font-semibold">Errores del archivo</span>
                  </div>
                  <ul className="space-y-1 text-sm text-rose-700">
                    {localErrors.map((error) => (
                      <li key={error}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </section>

            <section className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <h3 className="text-lg font-semibold text-slate-900">Revision del archivo</h3>
              {!summary ? (
                <p className="text-sm text-slate-500">
                  Todavia no hay una revision disponible. Carga el archivo y pulsa Revisar archivo.
                </p>
              ) : (
                <>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl bg-white p-4 shadow-sm">
                      <p className="text-xs uppercase tracking-wide text-slate-500">Filas listas</p>
                      <p className="mt-1 text-3xl font-semibold text-emerald-600">
                        {summary.readyRows}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-white p-4 shadow-sm">
                      <p className="text-xs uppercase tracking-wide text-slate-500">Filas con error</p>
                      <p className="mt-1 text-3xl font-semibold text-rose-600">
                        {summary.invalidRows}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-white p-4 shadow-sm">
                      <p className="text-xs uppercase tracking-wide text-slate-500">Con mensualidades pendientes</p>
                      <p className="mt-1 text-2xl font-semibold text-slate-900">
                        {summary.monthlyDebtRows}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-white p-4 shadow-sm">
                      <p className="text-xs uppercase tracking-wide text-slate-500">Con renovacion pendiente</p>
                      <p className="mt-1 text-2xl font-semibold text-slate-900">
                        {summary.renewalRows}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-white p-4 shadow-sm">
                    <p className="text-sm text-slate-700">
                      Fecha de corte: <span className="font-semibold">{cutoverDate}</span>
                    </p>
                    <p className="mt-1 text-sm text-slate-700">
                      Revisa las filas con error antes de registrar las deportistas.
                    </p>
                  </div>
                </>
              )}
            </section>
          </div>

          {summary && (
            <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead className="bg-slate-100">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">Fila</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">Deportista</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">Identificacion</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">Estado</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">Revision</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {preview.rows.map((row) => (
                      <tr key={`${row.rowNumber}-${row.athlete?.identification || "row"}`}>
                        <td className="px-4 py-3 text-slate-600">{row.rowNumber}</td>
                        <td className="px-4 py-3 text-slate-900">
                          {row.athlete?.fullName || "Fila sin nombre valido"}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {row.athlete?.identification || "-"}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                              row.status === "ready"
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-rose-100 text-rose-700"
                            }`}
                          >
                            {row.status === "ready" ? "Lista" : "Con error"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {row.status === "ready" ? (
                            <div className="space-y-1">
                              <p>Matricula: {row.plan?.enrollment?.estado}</p>
                              <p>Mensualidades pendientes: {row.plan?.financial?.monthlyDebtCount || 0}</p>
                              <p>Acudiente: {row.guardian?.fullName || "No aplica"}</p>
                            </div>
                          ) : (
                            <ul className="space-y-1 text-rose-700">
                              {row.errors?.map((error) => (
                                <li key={error}>{error}</li>
                              ))}
                            </ul>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default LegacyImportModal;
