import { useState, useMemo, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaPlus } from "react-icons/fa";

/* ---------- Componentes ---------- */
import Table from "../../../../../../../shared/components/Table/table";
import SearchInput from "../../../../../../../shared/components/SearchInput";
import ReportButton from "../../../../../../../shared/components/ReportButton";
import Pagination from "../../../../../../../shared/components/Table/Pagination";
import DonationViewModal from "./components/DonationViewModal";

/* ---------- Datos iniciales ---------- */
import donationsData from "../../../../../../../shared/models/DonationsData";

/* ---------- Utilidades ---------- */
import {
  showDeleteAlert,
  showSuccessAlert,
  showErrorAlert,
} from "../../../../../../../shared/utils/alerts";

const Donations = () => {
  /* ------------------- Estados ------------------- */
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDonation, setSelectedDonation] = useState(null);

  const rowsPerPage = 5;
  const navigate = useNavigate();
  const location = useLocation();

  /* ------------------- Cargar y normalizar datos iniciales ------------------- */
  useEffect(() => {
    if (data.length === 0) {
      const normalized = donationsData.map((d, idx) => {
        const donorName = d.donorName ?? d.nombreDonante ?? "";
        const donationDate = d.donationDate ?? d.fechaDonacion ?? "";
        const registerDate = d.registerDate ?? d.fechaRegistro ?? "";
        const statusRaw = d.status ?? d.estado ?? "";
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
          ...d,
          id: d.id ?? idx + 1,
          donorName,
          donationDate,
          registerDate,
          status: statusRaw,
          descripcion,
          items,
        };
      });

      setData(normalized);
    }
  }, [data]);

  /* ------------------- Recibir nueva o editar donación ------------------- */
  useEffect(() => {
    const newDonation = location.state?.newDonation;
    const isEditing = location.state?.isEditing;

    if (!newDonation) return;

    const items =
      newDonation.items && newDonation.items.length > 0
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
        newDonation.donationDate ??
        new Date().toLocaleDateString("es-CO"),
      registerDate:
        newDonation.registerDate ??
        new Date().toLocaleDateString("es-CO"), // 👈 Fecha actual automática
      status: newDonation.status ?? "Registrado",
      descripcion: newDonation.descripcion ?? "",
      items,
    };

    if (isEditing) {
      setData((prev) =>
        prev.map((d) => (d.id === donation.id ? donation : d))
      );
    } else {
      setData((prev) => [...prev, donation]);
    }

    navigate(location.pathname, { replace: true, state: {} });
  }, [location.state, navigate, location.pathname]);

  /* ------------------- Filtrado / Buscador ------------------- */
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;

    const lowerSearch = searchTerm.toLowerCase();

    return data.filter((item) => {
      const baseValues = Object.values(item)
        .join(" ")
        .toLowerCase();

      const nestedValues =
        item.items
          ?.map((it) => `${it.donationType} ${it.amount}`)
          .join(" ")
          .toLowerCase() || "";

      return (
        baseValues.includes(lowerSearch) || nestedValues.includes(lowerSearch)
      );
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

  /* ------------------- Columnas del reporte ------------------- */
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
    const donationForEdit = {
      id: donation.id,
      donorName: donation.donorName ?? "",
      donationDate: donation.donationDate ?? "",
      registerDate: donation.registerDate ?? "",
      status: donation.status ?? "Registrado",
      descripcion: donation.descripcion ?? "",
      items:
        donation.items?.map((i) => ({
          donationType: i.donationType ?? "",
          amount: i.amount ?? "",
        })) || [{ donationType: "", amount: "" }],
    };

    navigate("/dashboard/donations/form", {
      state: { donation: donationForEdit, isEditing: true },
    });
  };

  const handleView = (donation) => setSelectedDonation(donation);

  const handleDelete = async (donation) => {
    try {
      const result = await showDeleteAlert(
        "¿Eliminar donación?",
        `Se eliminará permanentemente la donación de: ${donation.donorName}`
      );

      if (result.isConfirmed) {
        setData((prev) => prev.filter((item) => item.id !== donation.id));
        showSuccessAlert(
          "Donación eliminada",
          `La donación de ${donation.donorName} fue eliminada correctamente.`
        );
      }
    } catch (error) {
      console.error("Error deleting donation:", error);
      showErrorAlert(
        "Error al eliminar",
        "No se pudo eliminar la donación. Intenta de nuevo."
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
          {/* Buscador */}
          <SearchInput
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Buscar donación..."
          />

          {/* Botones */}
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
      <Table
        thead={{
          titles: [
            "Donante",
            "Tipo de Donación",
            "Estado",
            "Fecha de Donación",
            "Fecha de Registro",
          ],
        }}
        tbody={{
          data: paginatedData.map((donation) => {
            const donationTypes =
              donation.items?.map((it) => it.donationType).filter(Boolean) || [];

            const statusNode = (() => {
              let colorClass = "text-gray-400";
              if (donation.status === "Registrado")
                colorClass = "text-primary-purple";
              if (donation.status === "Anulado")
                colorClass = "text-primary-blue";

              return (
                <span className={`font-semibold ${colorClass}`}>
                  {donation.status}
                </span>
              );
            })();

            return {
              ...donation,
              donationType:
                donationTypes.length > 0
                  ? donationTypes.join(", ")
                  : "Sin tipos",
              status: statusNode,
            };
          }),
          dataPropertys: [
            "donorName",
            "donationType",
            "status",
            "donationDate",
            "registerDate",
          ],
        }}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
      />

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

      {/* ---------- Modal Ver Donación ---------- */}
      {selectedDonation && (
        <DonationViewModal
          donation={selectedDonation}
          onClose={() => setSelectedDonation(null)}
        />
      )}
    </div>
  );
};

export default Donations;
