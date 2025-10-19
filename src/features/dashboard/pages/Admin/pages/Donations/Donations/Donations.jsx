import { useState, useMemo, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaPlus, FaBan } from "react-icons/fa";

/* ---------- Componentes ---------- */
import Table from "../../../../../../../shared/components/Table/table";
import SearchInput from "../../../../../../../shared/components/SearchInput";
import ReportButton from "../../../../../../../shared/components/ReportButton";
import Pagination from "../../../../../../../shared/components/Table/Pagination";
import DonationViewModal from "./components/DonationViewModal";
import CancelDonationModal from "./components/CancelDonationModal";

/* ---------- Datos iniciales ---------- */
import donationsData from "../../../../../../../shared/models/DonationsData";

/* ---------- Utilidades ---------- */
import {
  showSuccessAlert,
  showErrorAlert,
} from "../../../../../../../shared/utils/alerts";

const Donations = () => {
  /* ------------------- Estados ------------------- */
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [cancelingDonation, setCancelingDonation] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const rowsPerPage = 5;
  const navigate = useNavigate();
  const location = useLocation();

  /* ------------------- Cargar datos iniciales ------------------- */
  useEffect(() => {
    if (isInitialized) return;

    const normalized = donationsData.map((d, idx) => {
      const donorName = d.donorName ?? d.nombreDonante ?? "";
      const donationDate = d.donationDate ?? d.fechaDonacion ?? "";
      const registerDate = d.registerDate ?? d.fechaRegistro ?? "";
      const status = d.status ?? d.estado ?? "";
      const descripcion = d.descripcion ?? "";

      const items =
        d.items && Array.isArray(d.items) && d.items.length > 0
          ? d.items.map((it) => ({
              donationType: it.donationType ?? it.tipoDonacion ?? "",
              amount: it.amount ?? it.cantidad ?? "",
            }))
          : d.donationType || d.tipoDonacion
          ? [
              {
                donationType: d.donationType ?? d.tipoDonacion,
                amount: d.amount ?? d.cantidad ?? "",
              },
            ]
          : [];

      return {
        id: d.id ?? idx + 1,
        donorName,
        donationDate,
        registerDate,
        status,
        descripcion,
        items,
        cancelReason: d.cancelReason ?? null,
        cancelDate: d.cancelDate ?? null,
      };
    });

    setData(normalized);
    setIsInitialized(true);
  }, [isInitialized]);

  /* ------------------- Crear / Editar donación ------------------- */
  useEffect(() => {
    const newDonation = location.state?.newDonation;
    const isEditing = location.state?.isEditing;
    if (!newDonation) return;

    const items =
      newDonation.items?.length > 0
        ? newDonation.items.map((i) => ({
            donationType: i.donationType ?? "",
            amount: i.amount ?? "",
          }))
        : [{ donationType: "", amount: "" }];

    const donation = {
      ...newDonation,
      id: newDonation.id ?? Date.now(),
      donorName: newDonation.donorName ?? "",
      donationDate:
        newDonation.donationDate ?? new Date().toLocaleDateString("es-CO"),
      registerDate:
        newDonation.registerDate ?? new Date().toLocaleDateString("es-CO"),
      status: newDonation.status ?? "Registrado",
      descripcion: newDonation.descripcion ?? "",
      items,
      cancelReason: null,
      cancelDate: null,
    };

    setData((prev) =>
      isEditing
        ? prev.map((d) => (d.id === donation.id ? donation : d))
        : [...prev, donation]
    );

    navigate(location.pathname, { replace: true, state: {} });
  }, [location.state, navigate, location.pathname]);

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
  const totalRows = filteredData.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedData = filteredData.slice(
    startIndex,
    startIndex + rowsPerPage
  );

  /* ------------------- Columnas para reportes ------------------- */
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
    const editable = {
      ...donation,
      items:
        donation.items?.map((i) => ({
          donationType: i.donationType ?? "",
          amount: i.amount ?? "",
        })) || [{ donationType: "", amount: "" }],
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
            : d
        )
      );
      showSuccessAlert(
        "Donación anulada",
        `La donación de ${cancelingDonation.donorName} fue anulada correctamente.`
      );
      setCancelingDonation(null);
    } catch {
      showErrorAlert(
        "Error al anular",
        "No se pudo anular la donación. Intenta de nuevo."
      );
    }
  };

  /* ------------------- Render ------------------- */
  return (
    <div className="p-6 font-questrial">
      {/* ---------- Header ---------- */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Donaciones</h1>

        <div className="flex flex-col sm:flex-row gap-3 items-center w-full sm:w-auto">
          <SearchInput
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
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
              className="flex items-center gap-2 px-4 py-2 bg-primary-blue text-white rounded-lg shadow hover:bg-primary-purple transition-colors"
            >
              <FaPlus /> Crear
            </button>
          </div>
        </div>
      </div>

      {/* ---------- Tabla ---------- */}
      <div className="overflow-x-auto">
        <Table
          thead={{
            titles: [
              "Donante",
              "Tipo de Donación",
              "Estado",
              "Fecha de Donación",
              "Fecha de Registro",
              "Acciones Extra",
            ],
          }}
          tbody={{
            data: paginatedData.map((donation) => {
              const donationTypes =
                donation.items?.map((i) => i.donationType).filter(Boolean) || [];

              const statusColor =
                donation.status === "Registrado"
                  ? "text-primary-purple"
                  : donation.status === "Anulado"
                  ? "text-red-600"
                  : "text-gray-400";

              return {
                ...donation,
                donationType:
                  donationTypes.length > 0
                    ? donationTypes.join(", ")
                    : "Sin tipos",
                status: (
                  <span className={`font-semibold ${statusColor}`}>
                    {donation.status}
                  </span>
                ),
                accionesExtra:
                  donation.status !== "Anulado" ? (
                    <button
                      onClick={() => handleCancel(donation)}
                      className="flex items-center gap-1 px-3 py-1 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors shadow-sm"
                    >
                      <FaBan size={12} /> Anular
                    </button>
                  ) : (
                    <span className="text-gray-400 text-sm italic">
                      Anulado
                    </span>
                  ),
                _original: donation,
              };
            }),
            dataPropertys: [
              "donorName",
              "donationType",
              "status",
              "donationDate",
              "registerDate",
              "accionesExtra",
            ],
          }}
          onEdit={(row) => handleEdit(row._original || row)}
          onView={(row) => handleView(row._original || row)}
        />
      </div>

      {/* ---------- Paginación ---------- */}
      {totalRows > rowsPerPage && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalRows={totalRows}
          rowsPerPage={rowsPerPage}
          startIndex={startIndex}
        />
      )}

      {/* ---------- Modales ---------- */}
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
    </div>
  );
};

export default Donations;
