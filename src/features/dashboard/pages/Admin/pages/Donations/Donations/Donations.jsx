import { useState, useEffect, forwardRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaPlus, FaRegCalendarAlt } from "react-icons/fa";

import Table from "../../../../../../../shared/components/Table/table";
import SearchInput from "../../../../../../../shared/components/SearchInput";
import ReportButton from "../../../../../../../shared/components/ReportButton";
import CancelDonationModal from "./components/CancelDonationModal";
import donationsService from "./services/donationsService";
import donorsSponsorsService from "../DonorsSponsors/services/donorsSponsorsService";
import {
  showSuccessAlert,
  showErrorAlert,
} from "../../../../../../../shared/utils/alerts";
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

  const idKey = donation.donorSponsorId ?? donation.donor_id ?? donation.sponsor_id;
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
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(
    PAGINATION_CONFIG.DEFAULT_PAGE,
  );
  const [totalRows, setTotalRows] = useState(0);
  const [cancelingDonation, setCancelingDonation] = useState(null);
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
      } catch (error) {
        console.error("Error cargando donantes para tabla", error);
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
          limit: 10,
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
          const hasName = getDonorDisplayName(d, donorsMap) !== `Donante #${idKey}`;
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
            } catch (e) {
              console.warn("No se pudo obtener donante", id, e?.message || e);
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
        console.error("Error cargando donaciones", error);
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
  const displayData = data;
  const paginatedData = data;

  const reportColumns = [
    { key: "donorName", label: "Donante" },
    { key: "donationType", label: "Tipo de Donación" },
    { key: "programLabel", label: "Programa/Destino" },
    { key: "status", label: "Estado" },
    { key: "donationDate", label: "Fecha de Donación" },
  ];

  const mapDonationToFormState = (raw) => {
    const details = raw.details || raw.detalles || [];
    const payment = details.find(
      (d) =>
        (d.kind === "ECONOMICA" || d.kind === "ALIMENTOS") &&
        d.recordType === "payment",
    );
    const specieItems = details
      .filter((d) => d.kind === "ESPECIE" && d.recordType === "item")
      .map((item) => ({
        description: item.description ?? "",
        quantity: item.quantity ?? item.amount ?? "",
        classification: item.classification ?? "",
        channel: item.channel || item.metodo || item.method || "",
      }));
    const foodDetail = details.find(
      (d) => d.kind === "ALIMENTOS" && d.recordType === "food",
    );
    const firstDetailKind =
      details.find((d) => d.kind)?.kind ||
      (details[0]?.tipo) ||
      null;

    const isFoodPurchase =
      raw.type === "ALIMENTOS" ||
      details.some((d) => d.kind === "ALIMENTOS" && d.recordType === "food");

    return {
      id: raw.id,
      donorSponsorId: raw.donorSponsorId || "",
      anonymous: raw.anonymous || false,
      type:
        (isFoodPurchase ? "ECONOMICA" : raw.type) ||
        (firstDetailKind === "ESPECIE" ? "ESPECIE" : firstDetailKind) ||
        "ECONOMICA",
      status: raw.status || "Recibida",
      program: raw.program || raw.programa || "",
      eventId: raw.eventId ? String(raw.eventId) : "",
      specificDestination: raw.specificDestination || raw.destinoEspecifico || "",
      donationAt: raw.donationAt
        ? new Date(raw.donationAt).toISOString().slice(0, 16)
        : new Date().toISOString().slice(0, 16),
      econAmount:
        payment?.amount ?? raw.econAmount ?? raw.amount ?? raw.valor ?? "",
      econChannel: payment?.channel ?? raw.econChannel ?? raw.canal ?? "",
      econModality:
        payment?.classification ?? raw.econModality ?? raw.modalidad ?? "",
      isFoodPurchase,
      foodQty: foodDetail?.quantity ?? raw.foodQty ?? raw.cantidadAlimentos ?? "",
      foodClass: foodDetail?.classification ?? raw.foodClass ?? raw.clasificacionAlimentos ?? "",
      especieItems: raw.especieItems || specieItems,
      details,
      files:
        raw.files ||
        raw.archivos ||
        raw.attachments ||
        raw.soportes ||
        raw.evidencias ||
        raw.supports ||
        raw.documents ||
        raw.documentos ||
        [],
    };
  };

  /* ------------------- Handlers ------------------- */
  const handleCreate = () => {
    navigate("/dashboard/donations/form", { state: { isEditing: false } });
  };

  const handleView = (donation) => {
    const raw = donation._raw || donation;
    const mapped = mapDonationToFormState(raw);
    navigate("/dashboard/donations/form", {
      state: { donation: mapped, isEditing: true, statusOnly: true },
    });
  };
  const handleCancel = (donation) => setCancelingDonation(donation);

  const handleConfirmCancel = (reason) => {
    try {
      setData((prev) =>
        prev.map((d) =>
          d.id === cancelingDonation.id
            ? {
                ...d,
                status: "Anulado",
                cancelReason: reason,
                cancelDate: new Date().toLocaleDateString("es-CO"),
              }
            : d,
        ),
      );
      showSuccessAlert(
        "Donación anulada",
        `La donación de ${cancelingDonation.donorName} fue anulada correctamente.`,
      );
      setCancelingDonation(null);
    } catch {
      showErrorAlert(
        "Error al anular",
        "No se pudo anular la donación. Intenta de nuevo.",
      );
    }
  };

  /* ------------------- Render ------------------- */
  const statusColorMap = {
    Recibida: "bg-primary-blue/10 text-primary-blue",
    "En proceso": "bg-primary-purple/10 text-primary-purple",
    EnProceso: "bg-primary-purple/10 text-primary-purple",
    Verificada: "bg-primary-purple/10 text-primary-purple",
    Ejecutada: "bg-primary-purple/10 text-primary-purple",
    Anulada: "bg-rose-100 text-rose-700",
  };

  const renderStatusChip = (value) => {
    const cls =
      statusColorMap[value] ||
      statusColorMap[value?.replace(/\s+/g, "")] ||
      "";
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold ${
          cls || "text-primary-purple"
        }`}
      >
        {value || "N/A"}
      </span>
    );
  };

  return (
    <div className="p-6 font-questrial">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Donaciones</h1>

        <div className="flex flex-col sm:flex-row gap-3 items-center w-full sm:w-auto">
          <SearchInput
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              // Si limpia la búsqueda, resetear a página 1
              if (!e.target.value) {
                setCurrentPage(1);
              }
            }}
            placeholder="Buscar donación..."
          />

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
                className="px-2.5 py-1 text-xs bg-primary-blue/20 text-primary-blue rounded-lg hover:bg-primary-blue/30"
                onClick={() => setSelectedMonth(null)}
              >
                Limpiar
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <ReportButton
              data={displayData}
              fileName="Reporte_Donaciones"
              columns={reportColumns}
            />

            <button
              onClick={handleCreate}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-purple to-primary-blue hover:from-primary-purple-light hover:to-primary-blue text-white rounded-lg shadow-md hover:shadow-lg transition-all transform hover:scale-[1.03]"
            >
              <FaPlus /> Crear
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table
          thead={{
            titles: [
              "Donante",
              "Tipo de Donación",
              "Programa / Destino",
              "Fecha de Donación",
              "Estado",
            ],
          }}
          tbody={{
            data: paginatedData.map((donation) => ({
              ...donation,
              donationType: donation.typeLabel || "Sin tipos",
              status: donation.status,
              _original: donation,
            })),
            dataPropertys: [
              "donorName",
              "donationType",
              "programLabel",
              "donationDate",
              "status",
            ],
            customRenderers: {
              status: (value) => renderStatusChip(value),
            },
            cellClassNames: {
              status: "whitespace-nowrap",
            },
          }}
          serverPagination
          rowsPerPage={10}
          totalRows={totalRows}
          currentPage={currentPage}
          onPageChange={(page) => setCurrentPage(page)}
          onView={(row) => handleView(row._original || row)}
          customActions={[]}
        />
      </div>

      {cancelingDonation && (
        <CancelDonationModal
          donation={cancelingDonation}
          onClose={() => setCancelingDonation(null)}
          onConfirm={handleConfirmCancel}
        />
      )}

      {loading && (
        <div className="text-sm text-gray-500 mt-3">Cargando donaciones...</div>
      )}
    </div>
  );
};

export default Donations;

