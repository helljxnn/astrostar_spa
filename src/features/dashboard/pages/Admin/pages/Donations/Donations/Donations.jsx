import { useState, useEffect, forwardRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaPlus, FaRegCalendarAlt, FaDownload } from "react-icons/fa";

import Table from "../../../../../../../shared/components/Table/table";
import SearchInput from "../../../../../../../shared/components/SearchInput";
import ReportButton from "../../../../../../../shared/components/ReportButton";
import PermissionGuard from "../../../../../../../shared/components/PermissionGuard";
import DonationViewModal from "./components/DonationViewModal";
import StatusSelector from "./components/StatusSelector";
import donationsService from "./services/donationsService";
import donorsSponsorsService from "../DonorsSponsors/services/donorsSponsorsService";
import { useReportDataWithService } from "../../../../../../../shared/hooks/useReportData";
import { usePermissions } from "../../../../../../../shared/hooks/usePermissions";
import {
  showSuccessAlert,
  showErrorAlert,
} from "../../../../../../../shared/utils/alerts.js";
import { PAGINATION_CONFIG } from "../../../../../../../shared/constants/paginationConfig";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const DONOR_NAME_FIELDS = [
  "nombre",
  "name",
  "razonSocial",
  "razon_social",
  "companyName",
  "nombreCompleto",
  "razon_social_completa",
  "displayName",
  "fullName",
  "representante",
];

const DONATION_DONOR_FIELDS = [
  "donorName",
  "nombre",
  "donorFullName",
  "donor_full_name",
  "donor",
  "sponsorName",
  "nombreDonante",
  "nombreDonador",
  "nombrePatrocinador",
];

const getDonorDisplayName = (donation, donorsMap = {}) => {
  if (!donation) return "Sin nombre";
  if (donation.anonymous) return "Anonimo";

  const sponsor = donation.donorSponsor || donation.sponsor || {};
  for (const key of DONOR_NAME_FIELDS) {
    if (sponsor?.[key]) return sponsor[key];
  }

  const idKey =
    donation.donorSponsorId ?? donation.donor_id ?? donation.sponsor_id;
  if (idKey && donorsMap[String(idKey)]) {
    return donorsMap[String(idKey)];
  }

  const donor = donation.donor || donation.persona || {};
  const personName =
    donor.fullName ||
    donor.nombreCompleto ||
    [donor.nombres, donor.apellidos].filter(Boolean).join(" ").trim();
  if (personName) return personName;

  for (const key of DONATION_DONOR_FIELDS) {
    if (donation[key]) {
      const val = donation[key];
      if (typeof val === "string") return val;
      if (typeof val === "object") {
        const maybe =
          val.nombre ||
          val.name ||
          val.displayName ||
          [val.nombres, val.apellidos].filter(Boolean).join(" ").trim();
        if (maybe) return maybe;
      }
    }
  }

  if (idKey) return `Donante #${idKey}`;

  return "Anonimo";
};

const Donations = () => {
  const { hasPermission } = usePermissions();
  // Hook para obtener datos completos para reportes
  const { getReportData } = useReportDataWithService(
    donationsService.getAllForReport.bind(donationsService)
  );

  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(
    PAGINATION_CONFIG.DEFAULT_PAGE,
  );
  const [totalRows, setTotalRows] = useState(0);
  const [viewingDonation, setViewingDonation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [donorsMap, setDonorsMap] = useState({});
  const [selectedMonth, setSelectedMonth] = useState(null);

  const navigate = useNavigate();

  const MonthPickerInput = forwardRef(({ value, onClick }, ref) => (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      className="px-3 py-2 rounded-lg flex items-center gap-2 bg-primary-purple/10 hover:bg-primary-purple/20 text-sm text-primary-purple transition-colors"
    >
      <FaRegCalendarAlt className="text-primary-purple" />
      <span className="whitespace-nowrap">{value || "Filtrar por mes"}</span>
    </button>
  ));
  MonthPickerInput.displayName = "MonthPickerInput";

  /* ------------------- Cargar datos desde API ------------------- */
  useEffect(() => {
    const fetchDonors = async () => {
      try {
        const resp = await donorsSponsorsService.getAll({
          limit: 2000,
        });
        const data = resp?.data || resp?.data?.data || [];
        const list = Array.isArray(data) ? data : resp?.data?.data || [];
        const map = {};
        list.forEach((d) => {
          const name =
            d.nombre ||
            d.name ||
            d.displayName ||
            [d.nombres, d.apellidos].filter(Boolean).join(" ").trim();
          if (d.id && name) map[String(d.id)] = name;
        });
        setDonorsMap(map);
      } catch {
        // Error loading donors for table
      }
    };

    fetchDonors();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const resp = await donationsService.list({
          page: currentPage,
          limit: PAGINATION_CONFIG.ROWS_PER_PAGE,
          search: searchTerm, // Enviar búsqueda al backend
          month: selectedMonth
            ? `${selectedMonth.getFullYear()}-${String(
                selectedMonth.getMonth() + 1,
              ).padStart(2, "0")}`
            : undefined,
        });
        const records = resp?.data || resp?.data?.data || [];

        const normalized = records.map((d, idx) => {
          const donorName = getDonorDisplayName(d, donorsMap);

          const items =
            Array.isArray(d.details) && d.details.length > 0
              ? d.details.map((it) => ({
                  donationType: it.recordType || it.kind || "",
                  amount: it.amount ?? "",
                  quantity: it.quantity ?? "",
                  description: it.description,
                  classification: it.classification,
                  method: it.channel,
                }))
              : [];

          const typeLabel =
            d.type === "ECONOMICA"
              ? "Economica"
              : d.type === "ESPECIE"
                ? "En especie"
                : d.type === "ALIMENTOS"
                  ? "Compra de alimentos"
                  : items.find((i) => i.donationType === "item")
                    ? "En especie"
                    : "Economica";

          const statusLabel =
            d.status === "Recibida"
              ? "Recibida"
              : d.status === "EnProceso"
                ? "En proceso"
                : d.status === "Verificada"
                  ? "Verificada"
                  : d.status === "Ejecutada"
                    ? "Ejecutada"
                    : d.status === "Anulada"
                      ? "Anulada"
                      : d.status || "Recibida";

          return {
            id: d.id ?? idx + 1,
            code: d.code || "N/A",
            donorName,
            donationDate: d.donationAt
              ? new Date(d.donationAt).toLocaleString("es-CO")
              : "",
            programLabel:
              d.program ||
              d.programa ||
              d.specificDestination ||
              d.destinoEspecifico ||
              "N/A",
            status: statusLabel,
            typeLabel,
            descripcion: d.program ?? "",
            items,
            cancelReason: d.cancelReason ?? null,
            cancelDate: d.cancelDate ?? null,
            _raw: d,
          };
        });

        // si faltan nombres, intentar completarlos con llamadas puntuales
        const missingIds = new Set();
        records.forEach((d) => {
          const idKey = d.donorSponsorId ?? d.donor_id ?? d.sponsor_id;
          const hasName =
            getDonorDisplayName(d, donorsMap) !== `Donante #${idKey}`;
          if (idKey && !donorsMap[String(idKey)] && !hasName) {
            missingIds.add(String(idKey));
          }
        });

        if (missingIds.size > 0) {
          const fetched = {};
          for (const id of missingIds) {
            try {
              const respId = await donorsSponsorsService.getById(id);
              const donorData =
                respId?.data || respId?.data?.data || respId?.donor || {};
              const name =
                donorData.nombre ||
                donorData.name ||
                donorData.displayName ||
                [donorData.nombres, donorData.apellidos]
                  .filter(Boolean)
                  .join(" ")
                  .trim();
              if (name) fetched[id] = name;
            } catch {
              // Could not fetch donor
            }
          }
          if (Object.keys(fetched).length) {
            setDonorsMap((prev) => ({ ...prev, ...fetched }));
          }
        }

        setData(normalized);
        setTotalRows(
          resp?.pagination?.total || resp?.total || normalized.length,
        );
      } catch (error) {
        showErrorAlert(
          "No se pudieron cargar las donaciones",
          error?.response?.data?.message || error.message || "Intenta de nuevo",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentPage, searchTerm, donorsMap, selectedMonth]); // Recargar cuando cambia la página, la búsqueda o el mes

  /* ------------------- Paginación ------------------- */
  // Usar datos directamente del backend (ya filtrados y paginados)
  const paginatedData = data;

  const reportColumns = [
    { key: "code", label: "Código" },
    { key: "donorName", label: "Donante" },
    { key: "donationType", label: "Tipo de Donación" },
    { key: "programLabel", label: "Programa/Destino" },
    { key: "status", label: "Estado" },
    { key: "donationDate", label: "Fecha de Donación" },
  ];

  /* ------------------- Handlers ------------------- */
  const handleCreate = () => {
    if (!hasPermission("donationsManagement", "Crear")) {
      showErrorAlert("Sin permisos", "No tienes permisos para crear donaciones.");
      return;
    }
    navigate("/dashboard/donations/form", { state: { isEditing: false } });
  };

  const handleView = (donation) => {
    if (!hasPermission("donationsManagement", "Ver")) {
      showErrorAlert(
        "Sin permisos",
        "No tienes permisos para ver detalles de donaciones.",
      );
      return;
    }
    const raw = donation._raw || donation;
    setViewingDonation(raw);
  };

  const handleStatusChange = async (donationId, newStatus) => {
    if (!hasPermission("donationsManagement", "Editar")) {
      showErrorAlert(
        "Sin permisos",
        "No tienes permisos para cambiar el estado de donaciones.",
      );
      return;
    }
    try {
      await donationsService.changeStatus(donationId, newStatus);

      // Actualizar el estado local
      setData((prev) =>
        prev.map((d) =>
          d.id === donationId
            ? {
                ...d,
                status: newStatus === "EnProceso" ? "En proceso" : newStatus,
              }
            : d,
        ),
      );

      showSuccessAlert(
        "Estado actualizado",
        "El estado de la donación se actualizó correctamente.",
      );
    } catch (error) {
      showErrorAlert(
        "Error al actualizar",
        error?.response?.data?.message || "No se pudo actualizar el estado.",
      );
    }
  };

  const handleDownloadCertificate = async (donation) => {
    if (!hasPermission("donationsManagement", "Ver")) {
      showErrorAlert(
        "Sin permisos",
        "No tienes permisos para generar o descargar certificados.",
      );
      return;
    }
    try {
      const response = await donationsService.downloadCertificate(donation.id);

      // Create blob and download
      const pdfBlob =
        response instanceof Blob
          ? response
          : new Blob([response], { type: "application/pdf" });
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Certificado_${donation.code}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      showSuccessAlert(
        "Certificado descargado",
        "El certificado se ha descargado correctamente",
      );
    } catch (error) {
      showErrorAlert(
        "Error",
        error?.response?.data?.message ||
          "No se pudo descargar el certificado. Verifique que la donación tenga un responsable con firma asignado.",
      );
    }
  };

  /* ------------------- Render ------------------- */
  const renderStatusChip = (value, row) => {
    const statusKey = value === "En proceso" ? "EnProceso" : value;
    const donationId = row.id || row._original?.id;

    return (
      <StatusSelector
        currentStatus={statusKey}
        donationId={donationId}
        onStatusChange={handleStatusChange}
        disabled={!hasPermission("donationsManagement", "Editar")}
      />
    );
  };

  // Función para obtener todos los datos para reporte
  const getCompleteReportData = async () => {
    const monthFilter = selectedMonth
      ? `${selectedMonth.getFullYear()}-${String(
          selectedMonth.getMonth() + 1,
        ).padStart(2, "0")}`
      : undefined;

    return await getReportData(
      {
        search: searchTerm,
        month: monthFilter,
      }, // Filtros actuales
      (donations) =>
        donations.map((donation) => {
          const typeLabel =
            donation.typeLabel ||
            (donation.type === "ECONOMICA"
              ? "Economica"
              : donation.type === "ESPECIE"
                ? "En especie"
                : donation.type === "ALIMENTOS"
                  ? "Compra de alimentos"
                  : "Sin tipo");

          return {
            code: donation.code || donation.codigo || "",
            donorName: getDonorDisplayName(donation, donorsMap),
            donationType: typeLabel,
            programLabel: donation.programLabel || donation.program || "",
            status: donation.status || donation.estado || "",
            donationDate: donation.donationAt
              ? new Date(donation.donationAt).toLocaleString("es-CO")
              : donation.donationDate || donation.fechaDonacion || "",
          };
        }),
    );
  };

  return (
    <div className="p-6 font-montserrat">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Donaciones</h1>

        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center w-full sm:w-auto">
          <div className="w-full sm:w-auto sm:min-w-[200px]">
            <SearchInput
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Buscar donación..."
              className="w-full"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            <div className="flex items-center gap-2">
              <DatePicker
                selected={selectedMonth}
                onChange={(date) => {
                  setSelectedMonth(date);
                  setCurrentPage(1);
                }}
                dateFormat="MMMM yyyy"
                showMonthYearPicker
                customInput={<MonthPickerInput />}
                calendarClassName="shadow-lg border border-gray-200 rounded-lg"
                popperPlacement="bottom"
              />
              {selectedMonth && (
                <button
                  className="px-2.5 py-1 text-xs bg-primary-blue/20 text-primary-blue rounded-lg hover:bg-primary-blue/30 whitespace-nowrap"
                  onClick={() => setSelectedMonth(null)}
                >
                  Limpiar
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <PermissionGuard module="donationsManagement" action="Ver">
                <ReportButton
                  dataProvider={getCompleteReportData}
                  fileName="Reporte_Donaciones"
                  columns={reportColumns}
                />
              </PermissionGuard>

              <PermissionGuard module="donationsManagement" action="Crear">
                <button
                  onClick={handleCreate}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-purple hover:bg-primary-blue text-white rounded-lg shadow-md hover:shadow-lg transition-all whitespace-nowrap"
                >
                  <FaPlus /> Crear
                </button>
              </PermissionGuard>
            </div>
          </div>
        </div>
      </div>

      <Table
        enableHorizontalScroll={false}
        thead={{
          titles: [
            "Código",
            "Donante",
            "Tipo de Donación",
            "Fecha de Donación",
            "Estado",
          ],
          actionsHeaderClassName: "w-[160px] min-w-[160px]",
        }}
        tbody={{
          data: paginatedData.map((donation) => ({
            ...donation,
            donationType: donation.typeLabel || "Sin tipos",
            status: donation.status,
            _original: donation,
          })),
          actionsCellClassName: "w-[160px] min-w-[160px]",
          actionsContainerClassName: "flex-nowrap",
          dataPropertys: [
            "code",
            "donorName",
            "donationType",
            "donationDate",
            "status",
          ],
          customRenderers: {
            status: (value, row) => renderStatusChip(value, row),
          },
          cellClassNames: {
            status: "whitespace-nowrap",
          },
        }}
        serverPagination
        totalRows={totalRows}
        currentPage={currentPage}
        onPageChange={(page) => setCurrentPage(page)}
        onView={
          hasPermission("donationsManagement", "Ver")
            ? (row) => handleView(row._original || row)
            : null
        }
        customActions={[
          {
            icon: FaDownload,
            onClick: (row) => handleDownloadCertificate(row._original || row),
            className:
              "p-2 rounded-full bg-green-500/10 text-green-600 hover:bg-green-500/20 hover:text-green-700 transition-all duration-200",
            title: "Descargar Certificado",
            show: () => hasPermission("donationsManagement", "Ver"),
          },
        ]}
        buttonConfig={{
          view: () => ({
            show: hasPermission("donationsManagement", "Ver"),
            disabled: false,
            title: "Ver detalles",
          }),
          customActions: [
            () => ({
              disabled: false,
            }),
          ],
        }}
      />

      {viewingDonation && (
        <DonationViewModal
          donation={{
            ...viewingDonation,
            donorName: getDonorDisplayName(viewingDonation, donorsMap),
            status: viewingDonation.status,
          }}
          onClose={() => setViewingDonation(null)}
        />
      )}

      {loading && (
        <div className="text-sm text-gray-500 mt-3">Cargando donaciones...</div>
      )}
    </div>
  );
};

export default Donations;

