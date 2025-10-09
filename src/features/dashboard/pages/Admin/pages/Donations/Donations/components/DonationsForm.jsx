import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { FaTrash } from "react-icons/fa";

/* ---------- Hooks ---------- */
import {
  useFormDonationsValidation,
  donationsValidationRules,
} from '../hooks/useFormDonationsValidation';

/* ---------- Utils ---------- */
import {
  showErrorAlert,
  showSuccessAlert,
} from "../../../../../../../../shared/utils/alerts";

const DonationsForm = () => {
  const navigate = useNavigate();
  const location = useLocation();

  /* ---------- Datos iniciales ---------- */
  const donantes = ["Carlos Pérez", "Ana Gómez", "Luis Rodríguez"];
  const [tipos, setTipos] = useState([
    "Material Deportivo",
    "Uniformes",
    "Botellas de Agua",
  ]);

  /* ---------- Estado modal ---------- */
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nuevoTipo, setNuevoTipo] = useState("");
  const [activeExtraIndex, setActiveExtraIndex] = useState(null);

  /* ---------- Validaciones ---------- */
  const { errors, validateField, validateForm } = useFormDonationsValidation(
    donationsValidationRules
  );

  /* ---------- Detectar si es edición ---------- */
  const donationToEdit = location.state?.donation;
  const isEditing = location.state?.isEditing ?? false;

  /* ---------- Estado de la donación ---------- */
  const [currentDonation, setCurrentDonation] = useState({
    nombreDonante: "",
    descripcion: "",
    estado: "Registrado",
    fechaDonacion: "",
    fechaRegistro: new Date().toISOString().split("T")[0],
    donacionesExtra: [{ tipoDonacion: "", cantidad: "" }],
  });

  /* ---------- Cargar datos si es edición ---------- */
  useEffect(() => {
    if (donationToEdit) {
      setCurrentDonation({
        nombreDonante: donationToEdit.donorName || "",
        descripcion: donationToEdit.descripcion || "",
        estado: donationToEdit.status || "Registrado",
        fechaDonacion: donationToEdit.donationDate || "",
        fechaRegistro:
          donationToEdit.registerDate ||
          new Date().toISOString().split("T")[0],
        donacionesExtra:
          donationToEdit.items?.map((i) => ({
            tipoDonacion: i.donationType || "",
            cantidad: i.amount || "",
          })) || [{ tipoDonacion: "", cantidad: "" }],
      });
    }
  }, [donationToEdit]);

  /* ---------- ➕ Agregar fila dinámica ---------- */
  const handleAddDonationField = () => {
    setCurrentDonation((prev) => ({
      ...prev,
      donacionesExtra: [
        ...prev.donacionesExtra,
        { tipoDonacion: "", cantidad: "" },
      ],
    }));
  };

  /* ---------- 🗑 Eliminar fila ---------- */
  const handleRemoveDonationField = (index) => {
    if (currentDonation.donacionesExtra.length === 1) return;
    const updated = currentDonation.donacionesExtra.filter((_, i) => i !== index);
    setCurrentDonation({ ...currentDonation, donacionesExtra: updated });
  };

  /* ---------- Cambio en campos dinámicos ---------- */
  const handleChangeExtra = (index, field, value) => {
    if (field === "tipoDonacion" && value === "Otros") {
      setActiveExtraIndex(index);
      setIsModalOpen(true);
      return;
    }

    const updated = currentDonation.donacionesExtra.map((d, i) =>
      i === index ? { ...d, [field]: value } : d
    );

    setCurrentDonation({ ...currentDonation, donacionesExtra: updated });
    validateField("donacionesExtra", updated);
  };

  /* ---------- Guardar nuevo tipo desde modal ---------- */
  const handleGuardarNuevoTipo = () => {
    if (!nuevoTipo.trim()) {
      showErrorAlert("Debes ingresar un tipo de donación.");
      return;
    }

    setTipos((prev) => [...prev, nuevoTipo]);

    const updated = currentDonation.donacionesExtra.map((d, i) =>
      i === activeExtraIndex ? { ...d, tipoDonacion: nuevoTipo } : d
    );

    setCurrentDonation({ ...currentDonation, donacionesExtra: updated });
    validateField("donacionesExtra", updated);

    setNuevoTipo("");
    setIsModalOpen(false);
    setActiveExtraIndex(null);

    showSuccessAlert(`Tipo de donación "${nuevoTipo}" agregado y seleccionado.`);
  };

  /* ---------- ✅ Guardar donación ---------- */
  const handleGuardar = () => {
    const isValid = validateForm(currentDonation);
    if (!isValid) {
      showErrorAlert("Por favor, completa todos los campos obligatorios.");
      return;
    }

    const donationData = {
      id: donationToEdit?.id ?? Date.now(),
      donorName: currentDonation.nombreDonante,
      donationDate: currentDonation.fechaDonacion,
      registerDate: currentDonation.fechaRegistro,
      status: currentDonation.estado,
      items: currentDonation.donacionesExtra.map((d) => ({
        donationType: d.tipoDonacion,
        amount: d.cantidad,
      })),
      donationType: currentDonation.donacionesExtra[0]?.tipoDonacion || "",
      amount: currentDonation.donacionesExtra[0]?.cantidad || "",
      descripcion: currentDonation.descripcion,
    };

    showSuccessAlert(
      isEditing
        ? "Donación actualizada correctamente"
        : "Donación guardada correctamente"
    );

    setTimeout(() => {
      navigate("/dashboard/donations", {
        state: { newDonation: donationData, isEditing },
      });
    }, 500);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-questrial relative">
      {/* ---------- Botón regresar ---------- */}
      <Link
        to="/dashboard/donations"
        className="absolute top-6 left-6 px-4 py-2 rounded-xl bg-primary-purple/70 
                   text-black font-semibold shadow-md 
                   hover:bg-primary-blue/70 hover:scale-105 transition"
      >
        ← Regresar
      </Link>

      {/* ---------- Título ---------- */}
      <div className="flex items-center justify-center w-full max-w-6xl mx-auto mb-6">
        <h1 className="text-3xl font-bold text-[#9BE9FF] text-center">
          {isEditing ? "Editar Donación" : "Crear Donación"}
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ---------- FORMULARIO ---------- */}
        <form
          onSubmit={(e) => e.preventDefault()}
          className="bg-white p-6 rounded-2xl shadow-lg space-y-5"
        >
          {/* Nombre Donante */}
          <div className="flex flex-col">
            <label className="mb-2 font-medium text-gray-700">
              Nombre del Donante <span className="text-red-500">*</span>
            </label>
            <select
              value={currentDonation.nombreDonante}
              onChange={(e) => {
                setCurrentDonation({
                  ...currentDonation,
                  nombreDonante: e.target.value,
                });
                validateField("nombreDonante", e.target.value);
              }}
              className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
            >
              <option value="">Seleccionar...</option>
              {donantes.map((d, i) => (
                <option key={i} value={d}>
                  {d}
                </option>
              ))}
            </select>
            {errors.nombreDonante && (
              <span className="text-red-500 text-sm">{errors.nombreDonante}</span>
            )}
          </div>

          {/* Campos dinámicos */}
          <div className="flex flex-col">
            <label className="mb-2 font-medium text-gray-700 flex items-center justify-between">
              Tipo de donación <span className="text-red-500">*</span>
              <button
                type="button"
                onClick={handleAddDonationField}
                className="ml-2 px-4 py-1 rounded-lg bg-primary-purple/70 
                           text-black font-semibold shadow-md 
                           hover:bg-primary-blue/70 hover:scale-105 transition"
              >
                +
              </button>
            </label>

            {currentDonation.donacionesExtra.map((d, index) => (
              <div
                key={index}
                className="grid grid-cols-5 gap-2 mb-3 items-center"
              >
                {/* Select tipo */}
                <div className="col-span-2">
                  <select
                    value={d.tipoDonacion}
                    onChange={(e) =>
                      handleChangeExtra(index, "tipoDonacion", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  >
                    <option value="">Seleccionar...</option>
                    {tipos.map((tipo, i) => (
                      <option key={i} value={tipo}>
                        {tipo}
                      </option>
                    ))}
                    <option value="Otros">Otros</option>
                  </select>
                </div>

                {/* Cantidad */}
                <div className="col-span-2">
                  <input
                    type="number"
                    placeholder="Cantidad"
                    value={d.cantidad}
                    onChange={(e) =>
                      handleChangeExtra(index, "cantidad", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>

                {/* Botón eliminar */}
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={() => handleRemoveDonationField(index)}
                    className="p-2 border border-gray-300 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-md"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}

            {errors.donacionesExtra && (
              <span className="text-red-500 text-sm">
                {errors.donacionesExtra}
              </span>
            )}
          </div>

          {/* Descripción */}
          <div className="flex flex-col">
            <label className="mb-2 font-medium text-gray-700">
              Descripción <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={currentDonation.descripcion}
              onChange={(e) => {
                setCurrentDonation({
                  ...currentDonation,
                  descripcion: e.target.value,
                });
                validateField("descripcion", e.target.value);
              }}
              placeholder="Ej: Balones de fútbol tamaño 5"
              className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
            {errors.descripcion && (
              <span className="text-red-500 text-sm">{errors.descripcion}</span>
            )}
          </div>

          {/* Estado */}
          <div className="flex flex-col">
            <label className="mb-2 font-medium text-gray-700">
              Estado <span className="text-red-500">*</span>
            </label>
            <select
              value={currentDonation.estado}
              onChange={(e) =>
                setCurrentDonation({ ...currentDonation, estado: e.target.value })
              }
              className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
            >
              <option value="Registrado">Registrado</option>
              <option value="Anulado">Anulado</option>
            </select>
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col">
              <label className="mb-2 font-medium text-gray-700">
                Fecha de Donación <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={currentDonation.fechaDonacion}
                onChange={(e) =>
                  setCurrentDonation({
                    ...currentDonation,
                    fechaDonacion: e.target.value,
                  })
                }
                className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>

            <div className="flex flex-col">
              <label className="mb-2 font-medium text-gray-700">
                Fecha de Registro <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={currentDonation.fechaRegistro}
                onChange={(e) =>
                  setCurrentDonation({
                    ...currentDonation,
                    fechaRegistro: e.target.value,
                  })
                }
                className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>
          </div>
        </form>

        {/* ---------- PREVIEW ---------- */}
        <div>
          <h2 className="text-xl font-semibold mb-4 text-gray-700">
            Resumen de Donación
          </h2>
          <div className="bg-white p-6 rounded-xl shadow space-y-4">
            <p>
              <strong>Donante:</strong> {currentDonation.nombreDonante || "N/A"}
            </p>
            <p>
              <strong>Descripción:</strong> {currentDonation.descripcion || "N/A"}
            </p>
            <p>
              <strong>Estado:</strong> {currentDonation.estado}
            </p>
            <p>
              <strong>Fecha Donación:</strong> {currentDonation.fechaDonacion || "N/A"}
            </p>
            <p>
              <strong>Fecha Registro:</strong> {currentDonation.fechaRegistro}
            </p>

            <div>
              <strong>Donaciones:</strong>
              <ul className="list-disc ml-6 mt-2">
                {currentDonation.donacionesExtra.map((d, i) => (
                  <li key={i}>
                    {d.tipoDonacion || "N/A"} - {d.cantidad || "0"}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Botón guardar */}
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={handleGuardar}
              className="px-5 py-2 rounded-lg bg-primary-purple/70 text-black font-semibold shadow-md hover:bg-primary-blue/70 hover:scale-105 transition"
            >
              {isEditing ? "Actualizar" : "Guardar"}
            </button>
          </div>
        </div>
      </div>

      {/* ---------- MODAL para nuevo tipo ---------- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl shadow-lg w-96">
            <h3 className="text-lg font-semibold mb-4">Agregar Nuevo Tipo</h3>
            <input
              type="text"
              value={nuevoTipo}
              onChange={(e) => setNuevoTipo(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleGuardarNuevoTipo();
                }
              }}
              placeholder="Escribe el nuevo tipo"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setActiveExtraIndex(null);
                  setNuevoTipo("");
                }}
                className="px-4 py-2 bg-gray-300 rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={handleGuardarNuevoTipo}
                className="px-4 py-2 bg-primary-purple/70 rounded-lg"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DonationsForm;
