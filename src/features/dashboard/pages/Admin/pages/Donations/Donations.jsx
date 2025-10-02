import { useState, useMemo, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaPlus } from "react-icons/fa";

/* ---------- Componentes ---------- */
import Table from "../../../../../../shared/components/Table/table";
import SearchInput from "../../../../../../shared/components/SearchInput";
import ReportButton from "../../../../../../shared/components/ReportButton";
import Pagination from "../../../../../../shared/components/Table/Pagination";
import DonationViewModal from "./components/DonationViewModal";

/* ---------- Datos iniciales ---------- */
import donationsData from "../../../../../../shared/models/DonationsData";

/* ---------- Utilidades ---------- */
import {
  showDeleteAlert,
  showSuccessAlert,
  showErrorAlert,
} from "../../../../../../shared/utils/alerts";

const Donations = () => {
  /* ------------------- Estados ------------------- */
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDonation, setSelectedDonation] = useState(null);

  const rowsPerPage = 5;
  const navigate = useNavigate();
  const location = useLocation();

  /* ------------------- Normalizar datos iniciales ------------------- */
  useEffect(() => {
    if (data.length === 0) {
      const normalized = donationsData.map((d, idx) => {
        const donorName = d.donorName ?? d.nombreDonante ?? "";
        const donationDate = d.donationDate ?? d.fechaDonacion ?? "";
        const registerDate = d.registerDate ?? d.fechaRegistro ?? "";
        const statusRaw = d.status ?? d.estado ?? "";

        const items =
          d.items && Array.isArray(d.items) && d.items.length > 0
            ? d.items.map((it) => ({
                donationType: it.donationType ?? it.tipo ?? it.tipoDonacion ?? "",
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

    // Convertir items a objetos planos
    const items =
      newDonation.items && newDonation.items.length > 0
        ? newDonation.items.map((i) => ({
            donationType: i.donationType ?? "",
            amount: i.amount ?? "",
          }))
        : newDonation.extras?.map((e) => ({
            donationType: e.tipoDonacion ?? "",
            amount: e.cantidad ?? "",
          })) || [{ donationType: "", amount: "" }];

    const donation = {
      ...newDonation,
      id: newDonation.id ?? Date.now(),
      donorName: newDonation.donorName ?? "",
      donationDate: newDonation.donationDate ?? new Date().toLocaleDateString(),
      registerDate:
        newDonation.registerDate ?? new Date().toLocaleDateString(),
      status: newDonation.status ?? "Registrado",
      items,
    };

    if (isEditing) {
      setData((prev) => prev.map((d) => (d.id === donation.id ? donation : d)));
    } else {
      setData((prev) => [...prev, donation]);
    }

    // Limpiar el state de navegación para que no vuelva a insertarlo
    navigate(location.pathname, { replace: true });
  }, [location.state, navigate, location.pathname]);

  /* ------------------- Filtrado ------------------- */
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    return data.filter((item) =>
      Object.values(item).some((value) =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [data, searchTerm]);

  /* ------------------- Paginación ------------------- */
  const totalRows = filteredData.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + rowsPerPage);

  /* ------------------- Columnas para reporte ------------------- */
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
    // Solo datos planos para evitar errores
    const donationForEdit = {
      id: donation.id,
      donorName: donation.donorName ?? "",
      donationDate: donation.donationDate ?? "",
      registerDate: donation.registerDate ?? "",
      status: donation.status ?? "Registrado",
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
      {/* Header */}
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

      {/* Table */}
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

            // Estado con colores correctos
            const statusNode = (() => {
              let colorClass = "text-gray-400";
              if (donation.status === "Registrado") colorClass = "text-primary-purple";
              if (donation.status === "Anulado") colorClass = "text-primary-blue";

              return <span className={`font-semibold ${colorClass}`}>{donation.status}</span>;
            })();

            return {
              ...donation,
              donationType:
                donationTypes.length > 0
                  ? donationTypes.join(", ")
                  : <span className="text-gray-500">Sin tipos</span>,
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

      {/* Pagination */}
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

      {/* Modal */}
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
