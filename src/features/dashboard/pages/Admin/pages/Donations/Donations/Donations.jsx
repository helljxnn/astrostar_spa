import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaPlus, FaBan } from "react-icons/fa";

import Table from "../../../../../../../shared/components/Table/table";
import SearchInput from "../../../../../../../shared/components/SearchInput";
import ReportButton from "../../../../../../../shared/components/ReportButton";
import Pagination from "../../../../../../../shared/components/Table/Pagination";
import DonationViewModal from "./components/DonationViewModal";
import CancelDonationModal from "./components/CancelDonationModal";
import donationsService from "./services/donationsService";
import {
  showSuccessAlert,
  showErrorAlert,
} from "../../../../../../../shared/utils/alerts";

const DONOR_NAME_FIELDS = [
  "nombre",
  "name",
  "razonSocial",
  "razon_social",
  "companyName",
  "nombreCompleto",
  "razon_social_completa",
];

const getDonorDisplayName = (donation) => {
  if (!donation) return "Sin nombre";
  if (donation.anonymous || !donation.donorSponsorId) return "Anonimo";
  const sponsor = donation.donorSponsor || {};
  for (const key of DONOR_NAME_FIELDS) {
    if (sponsor[key]) {
      return sponsor[key];
    }
  }
  return (
    donation.donorName ||
    donation.nombre ||
    sponsor?.representante ||
    "Sin nombre"
  );
};

const Donations = () => {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [cancelingDonation, setCancelingDonation] = useState(null);
  const [loading, setLoading] = useState(false);

  const rowsPerPage = 5;
  const navigate = useNavigate();

  /* ------------------- Cargar datos desde API ------------------- */
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const resp = await donationsService.list({
          page: currentPage,
          limit: rowsPerPage,
          search: "", // No enviar search al backend, filtraremos localmente
        });
        const records = resp?.data || resp?.data?.data || [];

        const normalized = records.map((d, idx) => {
          const donorName = getDonorDisplayName(d);

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
            registerDate: d.createdAt
              ? new Date(d.createdAt).toLocaleDateString("es-CO")
              : "",
            status: statusLabel,
            typeLabel,
            descripcion: d.program ?? "",
            items,
            cancelReason: d.cancelReason ?? null,
            cancelDate: d.cancelDate ?? null,
            _raw: d,
          };
        });

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
  }, [currentPage]); // Solo recargar cuando cambia la página, no el searchTerm

  /* ------------------- Filtrado ------------------- */
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    const lower = searchTerm.toLowerCase();

    return data.filter((item) => {
      const text = [
        item.donorName,
        item.descripcion,
        ...item.items.map((i) => `${i.donationType} ${i.amount}`),
      ]
        .join(" ")
        .toLowerCase();

      return text.includes(lower);
    });
  }, [data, searchTerm]);

  /* ------------------- Paginación ------------------- */
  // Usar datos filtrados cuando hay búsqueda local
  const displayData = searchTerm ? filteredData : data;
  const displayTotalRows = searchTerm ? filteredData.length : totalRows;
  const totalPages = Math.ceil(displayTotalRows / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;

  // Solo paginar localmente cuando hay búsqueda
  const paginatedData = searchTerm
    ? filteredData.slice(startIndex, startIndex + rowsPerPage)
    : data;

  const reportColumns = [
    { key: "donorName", label: "Donante" },
    { key: "donationType", label: "Tipo de Donación" },
    { key: "status", label: "Estado" },
    { key: "donationDate", label: "Fecha de Donación" },
    { key: "registerDate", label: "Fecha de Registro" },
  ];

  /* ------------------- Handlers ------------------- */
  const handleCreate = () => {
    navigate("/dashboard/donations/form", { state: { isEditing: false } });
  };

  const handleEdit = (donation) => {
    const raw = donation._raw || donation;
    const details = raw.details || [];

    const payment = details.find(
      (d) =>
        (d.kind === "ECONOMICA" || d.kind === "ALIMENTOS") &&
        d.recordType === "payment",
    );
    const especieItems = details
      .filter((d) => d.kind === "ESPECIE" && d.recordType === "item")
      .map((item) => ({
        description: item.description ?? "",
        quantity: item.quantity ?? item.amount ?? "",
        classification: item.classification ?? "",
        method: item.channel ?? "",
      }));
    const foodDetail = details.find(
      (d) => d.kind === "ALIMENTOS" && d.recordType === "food",
    );

    const isFoodPurchase = raw.type === "ALIMENTOS";

    const editable = {
      id: raw.id,
      donorSponsorId: raw.donorSponsorId || "",
      anonymous: raw.anonymous || false,
      type: isFoodPurchase ? "ECONOMICA" : raw.type || "ECONOMICA",
      status: raw.status || "Recibida",
      program: raw.program || "",
      donationAt: raw.donationAt
        ? new Date(raw.donationAt).toISOString().slice(0, 16)
        : new Date().toISOString().slice(0, 16),
      econAmount: payment?.amount ?? "",
      econChannel: payment?.channel ?? "",
      especieItems,
      isFoodPurchase,
      foodQty: foodDetail?.quantity ?? "",
      foodClass: foodDetail?.classification ?? "",
    };

    navigate("/dashboard/donations/form", {
      state: { donation: editable, isEditing: true },
    });
  };

  const handleView = (donation) => setSelectedDonation(donation);
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

          <div className="flex items-center gap-3">
            <ReportButton
              data={filteredData}
              fileName="Reporte_Donaciones"
              columns={reportColumns}
            />

            <button
              onClick={handleCreate}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-sky-300 to-sky-400 hover:from-sky-400 hover:to-sky-500 text-white rounded-lg shadow-md hover:shadow-lg transition-all transform hover:scale-[1.03]"
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
              "Fecha de Donación",
              "Fecha de Registro",
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
              "donationDate",
              "registerDate",
              "status",
            ],
          }}
          onEdit={(row) => handleEdit(row._original || row)}
          onView={(row) => handleView(row._original || row)}
          customActions={[]}
        />
      </div>

      {totalRows > rowsPerPage && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalRows={displayTotalRows}
          rowsPerPage={rowsPerPage}
          startIndex={startIndex}
        />
      )}

      {selectedDonation && (
        <DonationViewModal
          donation={selectedDonation}
          onClose={() => setSelectedDonation(null)}
        />
      )}

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
