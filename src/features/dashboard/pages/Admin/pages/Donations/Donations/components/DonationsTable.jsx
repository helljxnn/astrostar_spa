import Table from "../../../../../../../shared/components/Table/table";
import { FaEdit, FaEye } from "react-icons/fa";

const DonationTable = ({ donations, onEdit, onView }) => {
  // ---------- Estilo del estado ----------
  const getStatusBadge = (status) => {
    const color =
      status === "Registrado"
        ? { bg: "#B595FF", text: "#B595FF" }
        : { bg: "#9BE9FF", text: "#9BE9FF" };

    return (
      <div
        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-opacity-20"
        style={{ backgroundColor: `${color.bg}33`, color: color.text }}
      >
        <span
          className="inline-block w-2 h-2 rounded-full mr-2"
          style={{ backgroundColor: color.text }}
        ></span>
        {status}
      </div>
    );
  };

  // ---------- Columnas del encabezado ----------
  const columns = [
    { header: "Donante", accessor: "donorName" },
    { header: "Monto", accessor: "amount" },
    { header: "Fecha", accessor: "date" },
    { header: "Estado", accessor: "status" },
    { header: "Acciones", accessor: "actions" },
  ];

  // ---------- Filas de datos ----------
  const rows = donations.map((donation) => ({
    donorName: donation.donorName,
    amount: `$${donation.amount}`,
    date: donation.date,
    status: getStatusBadge(donation.status),
    actions: (
      <div className="flex justify-center gap-3">
        {/* ---------- Editar ---------- */}
        <button
          onClick={() => onEdit(donation)}
          className="p-3 rounded-full bg-[#9BE9FF]/40 text-[#9BE9FF] hover:bg-[#9BE9FF]/60 transition-all shadow-sm"
        >
          <FaEdit />
        </button>

        {/* ---------- Ver ---------- */}
        <button
          onClick={() => onView(donation)}
          className="p-3 rounded-full bg-[#B595FF]/40 text-[#B595FF] hover:bg-[#B595FF]/60 transition-all shadow-sm"
        >
          <FaEye />
        </button>
      </div>
    ),
  }));

  return <Table columns={columns} data={rows} />;
};

export default DonationTable;
