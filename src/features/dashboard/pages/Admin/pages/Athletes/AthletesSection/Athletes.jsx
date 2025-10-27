import { useState, useMemo } from "react";
import { FaUsers, FaPlus, FaClipboardList, FaHistory } from "react-icons/fa";
import AthleteModal from "./components/AthleteModal.jsx";
import AthleteViewModal from "./components/AthleteViewModal.jsx";
import GuardianModal from "../../Athletes/AthletesSection/components/GuardianModal.jsx";
import GuardianViewModal from "../AthletesSection/components/GuardianViewModal.jsx";
import GuardiansListModal from "./components/GuardiansListModal.jsx";
import InscriptionManagementModal from "./components/InscriptionManagementModal.jsx";
import InscriptionHistoryModal from "../AthletesSection/components/AthleteInscriptionHistoryModal.jsx";

import Table from "../../../../../../../shared/components/Table/table.jsx";
import Pagination from "../../../../../../../shared/components/Table/Pagination.jsx";
import SearchInput from "../../../../../../../shared/components/SearchInput.jsx";
import ReportButton from "../../../../../../../shared/components/ReportButton.jsx";

import athletesData from "../../../../../../../shared/models/AthleteData.js";
import guardiansData from "../../../../../../../shared/models/GuardiansData.js";

import {
  showSuccessAlert,
  showErrorAlert,
  showDeleteAlert,
} from "../../../../../../../shared/utils/alerts.js";

const Athletes = () => {
  // Estados de atletas
  const [data, setData] = useState(athletesData || []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [athleteToEdit, setAthleteToEdit] = useState(null);
  const [athleteToView, setAthleteToView] = useState(null);

  // Estados de acudientes
  const [guardians, setGuardians] = useState(guardiansData || []);
  const [isGuardianModalOpen, setIsGuardianModalOpen] = useState(false);
  const [isGuardianViewOpen, setIsGuardianViewOpen] = useState(false);
  const [isGuardiansListOpen, setIsGuardiansListOpen] = useState(false);
  const [guardianToEdit, setGuardianToEdit] = useState(null);
  const [guardianToView, setGuardianToView] = useState(null);
  const [guardianModalMode, setGuardianModalMode] = useState("create");
  const [newlyCreatedGuardianId, setNewlyCreatedGuardianId] = useState(null);

  // Estados de inscripciones
  const [isInscriptionHistoryModalOpen, setIsInscriptionHistoryModalOpen] = useState(false);
  const [athleteForInscription, setAthleteForInscription] = useState(null);
  const [isInscriptionManagementOpen, setIsInscriptionManagementOpen] = useState(false);

  // Estados comunes
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  // Filtrado de atletas
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;

    return data.filter((item) =>
      Object.entries(item).some(([key, value]) => {
        const stringValue = String(value).trim();
        if (
          key.toLowerCase() === "estado" ||
          key.toLowerCase() === "estadoinscripcion"
        ) {
          return stringValue.toLowerCase() === searchTerm.toLowerCase();
        }
        return stringValue.toLowerCase().includes(searchTerm.toLowerCase());
      })
    );
  }, [data, searchTerm]);

  const totalRows = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / rowsPerPage));
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + rowsPerPage);

  const handlePageChange = (page) => setCurrentPage(page);

  // Función auxiliar para obtener el acudiente
  const getGuardianById = (guardianId) => {
    return guardians.find((g) => String(g.id) === String(guardianId));
  };

  const handleSave = async (newAthlete) => {
    try {
      console.log("🔥 handleSave - Datos recibidos:", newAthlete);

      const acudienteId = newAthlete.acudiente || null;

      if (acudienteId) {
        const guardianExists = guardians.find((g) => String(g.id) === String(acudienteId));

        if (!guardianExists) {
          showErrorAlert("Error", "El acudiente seleccionado no existe.");
          console.error("❌ Acudiente NO encontrado");
          return;
        }

        console.log("✅ Acudiente encontrado:", guardianExists);
      }

      const athleteId = data.length > 0 ? Math.max(...data.map((a) => a.id)) + 1 : 1;

      const inscriptionState = newAthlete.estado === "Inactivo" ? "Suspendida" : "Vigente";
      const inscriptionConcept = newAthlete.estado === "Inactivo"
        ? "Inscripción inicial suspendida - Deportista inactivo"
        : "Inscripción inicial";

      const formattedAthlete = {
        id: athleteId,
        nombres: newAthlete.nombres.trim(),
        apellidos: newAthlete.apellidos.trim(),
        tipoDocumento: newAthlete.tipoDocumento,
        numeroDocumento: newAthlete.numeroDocumento?.trim() || "",
        fechaNacimiento: newAthlete.fechaNacimiento,
        genero: "masculino",
        telefono: newAthlete.telefono?.trim() || "",
        correo: newAthlete.correo?.trim() || "",
        direccion: "",
        ciudad: "Medellín",
        categoria: newAthlete.categoria,
        estado: newAthlete.estado || "Activo",
        acudiente: acudienteId,
        parentesco: newAthlete.parentesco || null,
        estadoInscripcion: inscriptionState,
        inscripciones: [
          {
            id: 1,
            fechaInscripcion: new Date().toISOString().split("T")[0],
            estado: inscriptionState,
            categoria: newAthlete.categoria,
            concepto: inscriptionConcept,
            fechaConcepto: new Date().toISOString().split("T")[0],
          },
        ],
      };

      console.log("💾 Deportista formateado:", formattedAthlete);

      setData((prev) => [...prev, formattedAthlete]);

      if (newAthlete.estado === "Inactivo") {
        showSuccessAlert(
          "Deportista creado",
          "El deportista fue creado como Inactivo con inscripción suspendida."
        );
      } else {
        showSuccessAlert("Éxito", "El deportista fue creado correctamente.");
      }

      setIsModalOpen(false);
      setNewlyCreatedGuardianId(null);
    } catch (error) {
      console.error("❌ Error en handleSave:", error);
      showErrorAlert("Error", error.message);
    }
  };

  const handleUpdate = async (updatedAthlete) => {
    try {
      const athleteWithCorrectTypes = {
        ...updatedAthlete,
        acudiente: updatedAthlete.acudiente || null,
        estado: updatedAthlete.estado || "Activo",
      };

      if (
        updatedAthlete.shouldUpdateInscription &&
        athleteWithCorrectTypes.estado === "Inactivo"
      ) {
        const athlete = data.find((a) => a.id === athleteWithCorrectTypes.id);

        if (athlete && athlete.inscripciones && athlete.inscripciones.length > 0) {
          const currentInscription = athlete.inscripciones[0];

          if (currentInscription.estado === "Vigente") {
            const stateChangeRecord = {
              id: crypto.randomUUID(),
              estado: "Suspendida",
              estadoAnterior: currentInscription.estado,
              concepto: "Suspensión automática - Deportista marcado como Inactivo",
              fechaInscripcion: currentInscription.fechaInscripcion,
              fechaConcepto: new Date().toISOString(),
              categoria: currentInscription.categoria,
              tipo: "cambio_estado",
            };

            athleteWithCorrectTypes.inscripciones = [
              stateChangeRecord,
              ...athlete.inscripciones,
            ];
            athleteWithCorrectTypes.estadoInscripcion = "Suspendida";

            showSuccessAlert(
              "Deportista actualizado",
              "El deportista fue marcado como Inactivo y su inscripción se suspendió automáticamente."
            );
          }
        }
      }

      const athlete = data.find((a) => a.id === athleteWithCorrectTypes.id);
      if (
        athlete &&
        athlete.estado === "Inactivo" &&
        athleteWithCorrectTypes.estado === "Activo"
      ) {
        showSuccessAlert(
          "Deportista reactivado",
          "El deportista fue marcado como Activo. IMPORTANTE: Debes ir a 'Gestionar Inscripción' para reactivar su inscripción si corresponde."
        );
      }

      // CLAVE: Actualizar el estado de data completamente
      setData((prev) =>
        prev.map((a) =>
          a.id === athleteWithCorrectTypes.id
            ? {
                ...a,
                ...athleteWithCorrectTypes,
                inscripciones:
                  athleteWithCorrectTypes.inscripciones || a.inscripciones || [],
              }
            : a
        )
      );

      if (
        !updatedAthlete.shouldUpdateInscription &&
        !(
          athlete &&
          athlete.estado === "Inactivo" &&
          athleteWithCorrectTypes.estado === "Activo"
        )
      ) {
        showSuccessAlert(
          "Deportista actualizado",
          "El deportista se actualizó correctamente."
        );
      }

      setIsModalOpen(false);
      // Actualizar la vista si estaba abierta
      if (athleteToView && athleteToView.id === athleteWithCorrectTypes.id) {
        setAthleteToView(athleteWithCorrectTypes);
      }
    } catch (error) {
      console.error("Error al actualizar deportista:", error);
      showErrorAlert("Error", "Ocurrió un error al actualizar el deportista");
    }
  };

  const handleEdit = (athlete) => {
    if (!athlete || athlete.target) return;
    setAthleteToEdit(athlete);
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const handleView = (athlete) => {
    if (!athlete || athlete.target) return;
    // Obtener los datos más recientes del atleta
    const currentAthlete = data.find(a => a.id === athlete.id) || athlete;
    setAthleteToView(currentAthlete);
    setIsViewModalOpen(true);
  };

  const handleDelete = async (athlete) => {
    if (!athlete || !athlete.id)
      return showErrorAlert("Error", "Deportista no válido");

    const confirmResult = await showDeleteAlert(
      "¿Estás seguro?",
      `Se eliminará al deportista ${athlete.nombres} ${athlete.apellidos}.`,
      { confirmButtonText: "Sí, eliminar", cancelButtonText: "Cancelar" }
    );

    if (!confirmResult.isConfirmed) return;

    setData(data.filter((a) => a.id !== athlete.id));
    showSuccessAlert(
      "Deportista eliminado",
      `${athlete.nombres} ${athlete.apellidos} fue eliminado correctamente.`
    );
  };

  const handleSaveGuardian = async (newGuardian) => {
    try {
      const guardianId = guardians.length > 0 
        ? Math.max(...guardians.map(g => Number(g.id) || 0)) + 1 
        : 104;

      const formatted = { 
        ...newGuardian, 
        id: guardianId 
      };

      console.log("🆕 Creando acudiente con ID:", guardianId);

      setGuardians(prevGuardians => {
        const updatedList = [formatted, ...prevGuardians];
        console.log("📋 Lista actualizada de acudientes:", updatedList);
        return updatedList;
      });

      setNewlyCreatedGuardianId(guardianId);
      console.log("🎯 ID establecido para selección automática:", guardianId);

      showSuccessAlert(
        "Acudiente creado",
        "El acudiente se creó correctamente y fue seleccionado automáticamente."
      );

      setIsGuardianModalOpen(false);

      return formatted;
    } catch (error) {
      console.error(" Error al crear acudiente:", error);
      showErrorAlert("Error", "Ocurrió un error al crear el acudiente");
      return null;
    }
  };

  const handleUpdateGuardian = async (updatedGuardian) => {
    try {
      setGuardians(
        guardians.map((g) =>
          g.id === updatedGuardian.id ? updatedGuardian : g
        )
      );
      
      // Actualizar la vista del acudiente si estaba abierta
      if (guardianToView && guardianToView.id === updatedGuardian.id) {
        setGuardianToView(updatedGuardian);
      }
      
      showSuccessAlert(
        "Acudiente actualizado",
        "El acudiente se actualizó correctamente."
      );
      setIsGuardianModalOpen(false);
    } catch (error) {
      console.error("Error al actualizar acudiente:", error);
      showErrorAlert("Error", "Ocurrió un error al actualizar el acudiente");
    }
  };

  const handleEditGuardian = (guardian) => {
    if (!guardian || guardian.target) return;
    setGuardianToEdit(guardian);
    setGuardianModalMode("edit");
    setIsGuardianModalOpen(true);
  };

  const handleViewGuardian = (guardian) => {
    if (!guardian || guardian.target) return;
    // Obtener los datos más recientes del acudiente
    const currentGuardian = guardians.find(g => g.id === guardian.id) || guardian;
    setGuardianToView(currentGuardian);
    setIsGuardianViewOpen(true);
  };

  const handleDeleteGuardian = async (guardian) => {
    if (!guardian || !guardian.id)
      return showErrorAlert("Error", "Acudiente no válido");

    const associatedAthletes = data.filter((a) => String(a.acudiente) === String(guardian.id));
    if (associatedAthletes.length > 0) {
      return showErrorAlert(
        "No se puede eliminar",
        `Este acudiente tiene ${associatedAthletes.length} deportista(s) asociado(s). Primero debes reasignar o eliminar los deportistas.`
      );
    }

    const confirmResult = await showDeleteAlert(
      "¿Estás seguro?",
      `Se eliminará al acudiente ${guardian.nombreCompleto}.`,
      { confirmButtonText: "Sí, eliminar", cancelButtonText: "Cancelar" }
    );

    if (!confirmResult.isConfirmed) return;

    setGuardians(guardians.filter((g) => g.id !== guardian.id));
    showSuccessAlert(
      "Acudiente eliminado",
      `${guardian.nombreCompleto} fue eliminado correctamente.`
    );
  };

  const handleViewInscriptionHistory = (athlete) => {
    if (!athlete || athlete.target) return;
    const currentAthlete = data.find(a => a.id === athlete.id) || athlete;
    setAthleteForInscription(currentAthlete);
    setIsInscriptionHistoryModalOpen(true);
  };

  const handleOpenInscriptionManagement = (athlete) => {
    if (!athlete || athlete.target) return;
    const currentAthlete = data.find(a => a.id === athlete.id) || athlete;
    setAthleteForInscription(currentAthlete);
    setIsInscriptionManagementOpen(true);
  };

  const handleUpdateAthleteFromManagement = (updatedAthlete) => {
    setData((prev) =>
      prev.map((athlete) =>
        athlete.id === updatedAthlete.id ? updatedAthlete : athlete
      )
    );
    // Actualizar la vista si estaba abierta
    if (athleteForInscription && athleteForInscription.id === updatedAthlete.id) {
      setAthleteForInscription(updatedAthlete);
    }
    // CRÍTICO: Forzar actualización de GuardianViewModal si estaba abierto
    if (guardianToView && guardianToView.id) {
      const updatedGuardianAthletes = data
        .filter((a) => String(a.acudiente) === String(guardianToView.id))
        .map((a) => a.id === updatedAthlete.id ? updatedAthlete : a);
      // Esto fuerza que React detecte el cambio
      setGuardianToView({ ...guardianToView });
    }
  };

  return (
    <div className="p-6 font-questrial w-full max-w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Deportistas</h1>

        <div className="flex flex-col sm:flex-row gap-3 items-center w-full sm:w-auto">
          <div className="w-full sm:w-64">
            <SearchInput
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Buscar deportista..."
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <ReportButton
              data={filteredData.map((athlete) => {
                const guardian = getGuardianById(athlete.acudiente);
                return {
                  nombres: athlete.nombres || "",
                  apellidos: athlete.apellidos || "",
                  nombreCompleto: `${athlete.nombres} ${athlete.apellidos}`,
                  tipoDocumento: athlete.tipoDocumento || "",
                  numeroDocumento: athlete.numeroDocumento || "",
                  correo: athlete.correo || "",
                  telefono: athlete.telefono || "",
                  direccion: athlete.direccion || "",
                  ciudad: athlete.ciudad || "",
                  fechaNacimiento: athlete.fechaNacimiento || "",
                  genero: athlete.genero || "",
                  categoria: athlete.categoria || "",
                  estado: athlete.estado || "",
                  estadoInscripcion: athlete.estadoInscripcion || "",
                  acudienteNombre: guardian?.nombreCompleto || "Sin acudiente",
                  acudienteTipoDoc: guardian?.tipoDocumento || "",
                  acudienteDocumento: guardian?.identificacion || "",
                  acudienteTelefono: guardian?.telefono || "",
                  acudienteCorreo: guardian?.correo || "",
                  acudienteDireccion: guardian?.direccion || "",
                  acudienteParentesco: athlete.parentesco || "",
                  fechaInscripcion:
                    athlete.inscripciones?.[0]?.fechaInscripcion || "",
                  categoriaInscripcion:
                    athlete.inscripciones?.[0]?.categoria || "",
                  conceptoInscripcion:
                    athlete.inscripciones?.[0]?.concepto || "",
                };
              })}
              fileName="Deportistas"
              columns={[
                { header: "Nombres", accessor: "nombres" },
                { header: "Apellidos", accessor: "apellidos" },
                { header: "Tipo Documento", accessor: "tipoDocumento" },
                { header: "Número Documento", accessor: "numeroDocumento" },
                { header: "Correo", accessor: "correo" },
                { header: "Teléfono", accessor: "telefono" },
                { header: "Fecha Nacimiento", accessor: "fechaNacimiento" },
                { header: "Categoría", accessor: "categoria" },
                { header: "Estado", accessor: "estado" },
                { header: "Estado Inscripción", accessor: "estadoInscripcion" },
                { header: "Acudiente", accessor: "acudienteNombre" },
                { header: "Tel. Acudiente", accessor: "acudienteTelefono" },
              ]}
            />

            <button
              onClick={() => setIsGuardiansListOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary-purple text-white rounded-lg shadow hover:opacity-90 transition whitespace-nowrap"
            >
              <FaUsers /> Ver Acudientes
            </button>

            <button
              onClick={() => {
                setModalMode("create");
                setAthleteToEdit(null);
                setNewlyCreatedGuardianId(null);
                setIsModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-primary-blue text-white rounded-lg shadow hover:bg-primary-purple transition-colors"
            >
              <FaPlus /> Crear Deportista
            </button>
          </div>
        </div>
      </div>

      {/* Tabla */}
      {totalRows > 0 ? (
        <>
          <div className="w-full bg-white rounded-lg">
            <Table
              thead={{
                titles: [
                  "Nombre Completo",
                  "Categoría",
                  "Teléfono",
                  "Acudiente",
                  "Estado Inscripción",
                ],
                state: true,
                actions: true,
              }}
              tbody={{
                data: paginatedData.map((a) => {
                  const guardian = getGuardianById(a.acudiente);

                  return {
                    ...a,
                    nombreCompleto: `${a.nombres} ${a.apellidos}`,
                    acudienteNombre: guardian?.nombreCompleto || "Sin acudiente",
                    estadoInscripcion: a.estadoInscripcion || "",
                  };
                }),
                dataPropertys: [
                  "nombreCompleto",
                  "categoria",
                  "telefono",
                  "acudienteNombre",
                  "estadoInscripcion",
                ],
                state: true,
                stateMap: {
                  Vigente: "bg-green-100 text-green-800",
                  Suspendida: "bg-orange-100 text-orange-800",
                  Vencida: "bg-yellow-100 text-yellow-800",
                },
              }}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onView={handleView}
              customActions={[
                {
                  onClick: (athlete) => handleOpenInscriptionManagement(athlete),
                  label: <FaClipboardList className="w-4 h-4" />,
                  className:
                    "p-2 text-[#FF9BF8] hover:text-[#E08CE0] rounded transition-colors",
                },
                {
                  onClick: (athlete) => handleViewInscriptionHistory(athlete),
                  label: <FaHistory className="w-4 h-4" />,
                  className:
                    "p-2 text-purple-600 hover:text-purple-900 hover:bg-purple-50 rounded transition-colors",
                },
              ]}
            />
          </div>
          <div className="mt-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              totalRows={totalRows}
              rowsPerPage={rowsPerPage}
              startIndex={startIndex}
            />
          </div>
        </>
      ) : (
        <div className="text-center text-gray-500 mt-10 py-8 bg-white rounded-2xl shadow border border-gray-200">
          No hay deportistas registrados todavía.
        </div>
      )}

      {/* Modales */}
      <AthleteModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setNewlyCreatedGuardianId(null);
        }}
        onSave={handleSave}
        onUpdate={handleUpdate}
        athleteToEdit={athleteToEdit}
        guardians={guardians}
        mode={modalMode}
        newlyCreatedGuardianId={newlyCreatedGuardianId}
        onCreateGuardian={() => {
          setGuardianToEdit(null);
          setGuardianModalMode("create");
          setIsGuardianModalOpen(true);
        }}
        onViewGuardian={(guardian) => {
          if (guardian) {
            setGuardianToView(guardian);
            setIsGuardianViewOpen(true);
          }
        }}
      />

      <AthleteViewModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        athlete={athleteToView}
        guardian={
          athleteToView
            ? getGuardianById(athleteToView.acudiente)
            : null
        }
      />

      <GuardiansListModal
        isOpen={isGuardiansListOpen}
        onClose={() => setIsGuardiansListOpen(false)}
        guardians={guardians}
        athletes={data}
        onCreateGuardian={() => {
          setGuardianToEdit(null);
          setGuardianModalMode("create");
          setIsGuardianModalOpen(true);
        }}
        onEditGuardian={handleEditGuardian}
        onViewGuardian={handleViewGuardian}
        onDeleteGuardian={handleDeleteGuardian}
      />

      <GuardianModal
        isOpen={isGuardianModalOpen}
        onClose={() => {
          setIsGuardianModalOpen(false);
        }}
        onSave={handleSaveGuardian}
        onUpdate={handleUpdateGuardian}
        guardianToEdit={guardianToEdit}
        mode={guardianModalMode}
      />

      <GuardianViewModal
        isOpen={isGuardianViewOpen}
        onClose={() => setIsGuardianViewOpen(false)}
        guardian={guardianToView}
        athletes={data.filter((a) => String(a.acudiente) === String(guardianToView?.id))}
      />

      <InscriptionManagementModal
        isOpen={isInscriptionManagementOpen}
        onClose={() => setIsInscriptionManagementOpen(false)}
        athlete={athleteForInscription}
        guardians={guardians}
        onUpdateAthlete={handleUpdateAthleteFromManagement}
      />

      {isInscriptionHistoryModalOpen && athleteForInscription && (
        <InscriptionHistoryModal
          isOpen={isInscriptionHistoryModalOpen}
          onClose={() => setIsInscriptionHistoryModalOpen(false)}
          athlete={athleteForInscription}
          guardians={guardians}
          onUpdateInscription={(athleteId, updatedArray) => {
            setData((prev) =>
              prev.map((a) =>
                a.id === athleteId ? { ...a, inscripciones: updatedArray } : a
              )
            );
          }}
        />
      )}
    </div>
  );
};

export default Athletes;