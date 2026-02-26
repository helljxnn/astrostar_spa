import { useState, useEffect, useMemo } from "react";
import { FaPlus, FaFilter } from "react-icons/fa";
import MovementModal from "./components/MovementModal";
import MovementViewModal from "./components/MovementViewModal";
import Table from "../../../../../../../shared/components/Table/table";
import SearchInput from "../../../../../../../shared/components/SearchInput";
import ReportButton from "../../../../../../../shared/components/ReportButton";
import PermissionGuard from "../../../../../../../shared/components/PermissionGuard";
import { usePermissions } from "../../../../../../../shared/hooks/usePermissions";
import {
  showSuccessAlert,
  showErrorAlert,
} from "../../../../../../../shared/utils/alerts";
import movementsService from "./services/MovementsService";
import { formatDate, formatDateTime } from "../shared/utils/stockCalculations";
import { formatStock } from "../../../../../../../shared/utils/numberFormat";
import { getTipoBajaLabel } from "../shared/utils/tipoBajaLabels";
import { PAGINATION_CONFIG } from "../../../../../../../shared/constants/paginationConfig";

const MaterialsMovements = () => {
  const { hasPermission } = usePermissions();

  // Estado para pestañas
  const [activeTab, setActiveTab] = useState("ingresos"); // 'ingresos' | 'salidas'

  const [movements, setMovements] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedMovement, setSelectedMovement] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(
    PAGINATION_CONFIG.DEFAULT_PAGE,
  );
  const [loading, setLoading] = useState(false);
  const [totalRows, setTotalRows] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    tipoSalida: "",
    inventarioDestino: "",
    fechaDesde: "",
    fechaHasta: "",
  });

  useEffect(() => {
    fetchMovements();
  }, [
    currentPage,
    activeTab,
    filters.fechaDesde,
    filters.fechaHasta,
    searchTerm,
  ]); // Recargar cuando cambian estos valores

  const fetchMovements = async () => {
    try {
      setLoading(true);

      const params = {
        page: currentPage,
        limit: PAGINATION_CONFIG.ROWS_PER_PAGE,
        search: searchTerm, // Enviar búsqueda al backend
      };

      // Filtrar por tipo según la pestaña activa
      if (activeTab === "ingresos") {
        params.tipo = "entrada";
      } else if (activeTab === "salidas") {
        params.tipo = "salida";
      }

      // Enviar filtros de fecha al backend (mejor práctica)
      if (filters.fechaDesde) {
        params.dateFrom = filters.fechaDesde;
      }
      if (filters.fechaHasta) {
        params.dateTo = filters.fechaHasta;
      }

      const response = await movementsService.getMovements(params);

      if (response.success) {
        const data = response.data || [];

        setMovements(data);

        const total =
          response.pagination?.total ||
          response.total ||
          response.count ||
          data.length;

        setTotalRows(total);
      }
    } catch (error) {
      console.error("Error al cargar movimientos:", error);
      setMovements([]);
      setTotalRows(0);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar datos localmente si hay término de búsqueda o filtros locales
  const filteredData = useMemo(() => {
    let result = movements;

    // Aplicar búsqueda local
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase().trim();
      result = result.filter((movement) => {
        const textFields = [
          movement.materialNombre,
          movement.categoria,
          movement.proveedor,
          movement.observaciones,
          movement.descripcion,
        ];
        const textMatch = textFields.some(
          (field) => field && String(field).toLowerCase().includes(searchLower),
        );
        const cantidadMatch = movement.cantidad
          ?.toString()
          .includes(searchLower);
        let dateMatch = false;
        if (movement.fechaIngreso || movement.fecha) {
          const fecha = new Date(movement.fechaIngreso || movement.fecha);
          const fechaStr = fecha.toLocaleDateString("es-ES");
          dateMatch = fechaStr.includes(searchLower);
        }
        let tipoMatch = false;
        if (activeTab === "salidas") {
          const tipoMovimiento =
            movement.tipoMovimiento || movement.tipo_movimiento || "";
          if (tipoMovimiento === "BAJA" || movement.tipo_baja) {
            tipoMatch = "baja".includes(searchLower);
            const tipoBajaLabel = getTipoBajaLabel(
              movement.tipo_baja || movement.tipoBaja,
            );
            if (tipoBajaLabel.toLowerCase().includes(searchLower))
              tipoMatch = true;
          } else if (tipoMovimiento === "TRANSFERENCIA") {
            tipoMatch = "transferencia".includes(searchLower);
          } else if (tipoMovimiento === "SALIDA_EVENTO") {
            tipoMatch =
              "salida por evento".includes(searchLower) ||
              "evento".includes(searchLower);
            const eventoNombre =
              movement.evento_nombre || movement.eventoNombre || "";
            if (eventoNombre.toLowerCase().includes(searchLower))
              tipoMatch = true;
          }
          const inventarioOrigen =
            movement.inventario_origen || movement.inventarioOrigen || "";
          const inventarioDestino =
            movement.inventario_destino || movement.inventarioDestino || "";
          if (inventarioOrigen.toLowerCase().includes(searchLower))
            tipoMatch = true;
          if (inventarioDestino.toLowerCase().includes(searchLower))
            tipoMatch = true;
        }
        let destinoMatch = false;
        if (activeTab === "ingresos") {
          const destino =
            movement.inventario_destino || movement.inventarioDestino || "";
          destinoMatch = destino.toLowerCase().includes(searchLower);
        }
        return (
          textMatch || cantidadMatch || dateMatch || tipoMatch || destinoMatch
        );
      });
    }

    // Aplicar filtro de inventario destino (ingresos) - Local
    if (activeTab === "ingresos" && filters.inventarioDestino) {
      result = result.filter(
        (m) =>
          (m.inventario_destino || m.inventarioDestino) ===
          filters.inventarioDestino,
      );
    }

    // Aplicar filtro de tipo de salida - Local
    if (activeTab === "salidas" && filters.tipoSalida) {
      result = result.filter((m) => {
        const tipoMovimiento = m.tipoMovimiento || m.tipo_movimiento || "";
        if (filters.tipoSalida === "BAJA") {
          return tipoMovimiento === "BAJA" || m.tipo_baja;
        } else if (filters.tipoSalida === "TRANSFERENCIA") {
          return tipoMovimiento === "TRANSFERENCIA";
        } else if (filters.tipoSalida === "SALIDA_EVENTO") {
          return tipoMovimiento === "SALIDA_EVENTO";
        }
        return false;
      });
    }

    return result;
  }, [
    movements,
    searchTerm,
    activeTab,
    filters.inventarioDestino,
    filters.tipoSalida,
  ]);

  // Usar datos filtrados cuando hay búsqueda o filtros locales activos
  const hasLocalFilters =
    searchTerm || filters.inventarioDestino || filters.tipoSalida;
  const displayData = hasLocalFilters ? filteredData : movements;

  const handleRegister = () => {
    if (!hasPermission("materialsRegistry", "Crear")) {
      showErrorAlert(
        "Sin permisos",
        "No tienes permisos para registrar movimientos",
      );
      return;
    }
    setIsEditing(false);
    setSelectedMovement(null);
    setIsModalOpen(true);
  };

  const handleEdit = (movement) => {
    if (!hasPermission("materialsRegistry", "Editar")) {
      showErrorAlert(
        "Sin permisos",
        "No tienes permisos para editar movimientos",
      );
      return;
    }
    setIsEditing(true);
    setSelectedMovement(movement);
    setIsModalOpen(true);
  };

  const handleSave = async (movementData) => {
    if (isEditing) {
      if (!hasPermission("materialsRegistry", "Editar")) {
        showErrorAlert(
          "Sin permisos",
          "No tienes permisos para editar movimientos",
        );
        return false;
      }

      try {
        const response = await movementsService.updateMovement(
          selectedMovement.id,
          movementData,
        );

        if (response.success) {
          showSuccessAlert(
            "Ingreso Actualizado",
            "Los cambios fueron guardados correctamente",
          );
          setIsModalOpen(false);
          setIsEditing(false);
          setSelectedMovement(null);
          fetchMovements();
          return true;
        } else {
          showErrorAlert(
            "Error",
            response.message || "No se pudo actualizar el ingreso",
          );
          return false;
        }
      } catch (error) {
        console.error("Error al actualizar ingreso:", error);
        showErrorAlert(
          "Error",
          error.message || "No se pudo actualizar el ingreso",
        );
        return false;
      }
    } else {
      if (!hasPermission("materialsRegistry", "Crear")) {
        showErrorAlert(
          "Sin permisos",
          "No tienes permisos para registrar movimientos",
        );
        return false;
      }

      try {
        const response = await movementsService.createMovement(movementData);

        if (response.success) {
          showSuccessAlert(
            "Ingreso Registrado",
            "El ingreso de material fue registrado correctamente",
          );
          setIsModalOpen(false);
          fetchMovements();
          return true;
        } else {
          showErrorAlert(
            "Error",
            response.message || "No se pudo registrar el ingreso",
          );
          return false;
        }
      } catch (error) {
        console.error("Error al registrar ingreso:", error);
        showErrorAlert(
          "Error",
          error.message || "No se pudo registrar el ingreso",
        );
        return false;
      }
    }
  };

  const handleView = (movement) => {
    if (!hasPermission("materialsRegistry", "Ver")) {
      showErrorAlert(
        "Sin permisos",
        "No tienes permisos para ver detalles de movimientos",
      );
      return;
    }
    setSelectedMovement(movement);
    setIsViewModalOpen(true);
  };

  // Preparar datos para tabla de INGRESOS con truncado
  const ingresosTableData = displayData.map((m) => ({
    ...m,
    fechaFormatted: formatDate(m.fechaIngreso || m.fecha),
    materialNombreTruncated:
      m.materialNombre && m.materialNombre.length > 35
        ? m.materialNombre.substring(0, 35) + "..."
        : m.materialNombre || "",
    categoriaTruncated:
      m.categoria && m.categoria.length > 25
        ? m.categoria.substring(0, 25) + "..."
        : m.categoria || "",
    cantidadFormatted: formatStock(m.cantidad),
    proveedorDisplay: m.proveedor || "Sin proveedor",
  }));

  // Preparar datos para tabla de SALIDAS con truncado
  const salidasTableData = displayData.map((m) => {
    const tipoMovimiento = m.tipoMovimiento || m.tipo_movimiento || "";

    // Determinar el tipo de salida de forma simple
    let tipoDisplay = "Otro";

    if (tipoMovimiento === "BAJA" || m.tipo_baja) {
      tipoDisplay = "Baja";
    } else if (tipoMovimiento === "TRANSFERENCIA") {
      tipoDisplay = "Transferencia";
    } else if (tipoMovimiento === "SALIDA_EVENTO") {
      tipoDisplay = "Salida por Evento";
    }

    return {
      ...m,
      fechaFormatted: formatDate(m.fechaIngreso || m.fecha),
      materialNombreTruncated:
        m.materialNombre && m.materialNombre.length > 35
          ? m.materialNombre.substring(0, 35) + "..."
          : m.materialNombre || "",
      categoriaTruncated:
        m.categoria && m.categoria.length > 25
          ? m.categoria.substring(0, 25) + "..."
          : m.categoria || "",
      cantidadFormatted: formatStock(m.cantidad),
      tipoDisplay,
    };
  });

  // Datos para reporte
  const reportData = displayData.map((m) => {
    const baseData = {
      fecha: formatDateTime(m.fechaIngreso || m.fecha),
      material: m.materialNombre,
      categoria: m.categoria,
      cantidad: m.cantidad,
      stockAnterior: m.stockAnterior,
      stockNuevo: m.stockNuevo,
    };

    if (activeTab === "ingresos") {
      return {
        ...baseData,
        proveedor: m.proveedor || "Sin proveedor",
        destino: m.inventario_destino || m.inventarioDestino || "N/A",
        observaciones: m.observaciones || "N/A",
      };
    } else {
      // Salidas
      const tipoMovimiento = m.tipoMovimiento || m.tipo_movimiento || "";
      let tipo = "Otro";
      let detalles = "";

      if (tipoMovimiento === "BAJA" || m.tipo_baja) {
        tipo = "Baja";
        const tipoBaja = getTipoBajaLabel(m.tipo_baja || m.tipoBaja);
        const origen = m.inventario_origen || m.inventarioOrigen || "";
        detalles = `${tipoBaja} - Origen: ${origen} - ${m.descripcion || m.observaciones || "Sin descripción"}`;
      } else if (tipoMovimiento === "TRANSFERENCIA") {
        tipo = "Transferencia";
        const desde = m.inventario_origen || m.inventarioOrigen || "N/A";
        const hacia = m.inventario_destino || m.inventarioDestino || "N/A";
        detalles = `De ${desde} a ${hacia}${m.observaciones ? " - " + m.observaciones : ""}`;
      } else if (tipoMovimiento === "SALIDA_EVENTO") {
        tipo = "Salida por Evento";
        detalles = m.evento_nombre || m.eventoNombre || "Evento finalizado";
      }

      return {
        ...baseData,
        tipo,
        detalles,
      };
    }
  });

  return (
    <div className="p-6 font-questrial">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">
          Movimientos de Materiales
        </h1>

        <div className="flex flex-col sm:flex-row gap-3 items-center w-full sm:w-auto">
          <SearchInput
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder={`Buscar por fecha, material, categoría${activeTab === "ingresos" ? ", proveedor" : ", tipo"}...`}
          />

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 border-2 rounded-lg font-medium transition-all ${
              showFilters
                ? "bg-primary-blue text-white border-primary-blue"
                : "border-gray-300 text-gray-700 hover:border-primary-blue hover:text-primary-blue"
            }`}
          >
            <FaFilter className="h-4 w-4" />
            <span className="hidden sm:inline">Filtros</span>
          </button>

          <div className="flex items-center gap-3">
            <PermissionGuard module="materialsRegistry" action="Ver">
              <ReportButton
                data={reportData}
                fileName={`Reporte_${activeTab === "ingresos" ? "Ingresos" : "Salidas"}_Materiales`}
                columns={
                  activeTab === "ingresos"
                    ? [
                        { header: "Fecha", accessor: "fecha" },
                        { header: "Material", accessor: "material" },
                        { header: "Categoría", accessor: "categoria" },
                        { header: "Cantidad", accessor: "cantidad" },
                        { header: "Destino", accessor: "destino" },
                        { header: "Proveedor", accessor: "proveedor" },
                        { header: "Observaciones", accessor: "observaciones" },
                        { header: "Stock Anterior", accessor: "stockAnterior" },
                        { header: "Stock Nuevo", accessor: "stockNuevo" },
                      ]
                    : [
                        { header: "Fecha", accessor: "fecha" },
                        { header: "Material", accessor: "material" },
                        { header: "Categoría", accessor: "categoria" },
                        { header: "Cantidad", accessor: "cantidad" },
                        { header: "Tipo", accessor: "tipo" },
                        { header: "Detalles", accessor: "detalles" },
                        { header: "Stock Anterior", accessor: "stockAnterior" },
                        { header: "Stock Nuevo", accessor: "stockNuevo" },
                      ]
                }
              />
            </PermissionGuard>

            {activeTab === "ingresos" && (
              <PermissionGuard module="materialsRegistry" action="Crear">
                <button
                  onClick={handleRegister}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-blue text-white rounded-lg shadow hover:bg-primary-purple transition-colors"
                >
                  <FaPlus /> Registrar Ingreso
                </button>
              </PermissionGuard>
            )}
          </div>
        </div>
      </div>

      {/* Panel de Filtros */}
      {showFilters && (
        <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Filtros</h3>
            <button
              onClick={() => {
                setFilters({
                  tipoSalida: "",
                  inventarioDestino: "",
                  fechaDesde: "",
                  fechaHasta: "",
                });
                setShowFilters(false);
              }}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              Limpiar filtros
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Filtro por Rango de Fechas */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Desde
              </label>
              <input
                type="date"
                value={filters.fechaDesde}
                onChange={(e) =>
                  setFilters({ ...filters, fechaDesde: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hasta
              </label>
              <input
                type="date"
                value={filters.fechaHasta}
                onChange={(e) =>
                  setFilters({ ...filters, fechaHasta: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
              />
            </div>

            {/* Filtro por Inventario Destino (solo ingresos) */}
            {activeTab === "ingresos" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Inventario Destino
                </label>
                <select
                  value={filters.inventarioDestino}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      inventarioDestino: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                >
                  <option value="">Todos los destinos</option>
                  <option value="FUNDACION">Fundación</option>
                  <option value="EVENTOS">Eventos</option>
                </select>
              </div>
            )}

            {/* Filtro por Tipo de Salida (solo salidas) */}
            {activeTab === "salidas" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Salida
                </label>
                <select
                  value={filters.tipoSalida}
                  onChange={(e) =>
                    setFilters({ ...filters, tipoSalida: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                >
                  <option value="">Todos los tipos</option>
                  <option value="BAJA">Baja</option>
                  <option value="TRANSFERENCIA">Transferencia</option>
                  <option value="SALIDA_EVENTO">Salida por Evento</option>
                </select>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Pestañas */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        <button
          onClick={() => {
            setActiveTab("ingresos");
            setCurrentPage(1);
            setSearchTerm("");
            setFilters({
              tipoSalida: "",
              inventarioDestino: "",
              fechaDesde: "",
              fechaHasta: "",
            });
          }}
          className={`px-6 py-3 font-medium transition-all ${
            activeTab === "ingresos"
              ? "text-primary-blue border-b-2 border-primary-blue"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Ingresos
        </button>
        <button
          onClick={() => {
            setActiveTab("salidas");
            setCurrentPage(1);
            setSearchTerm("");
            setFilters({
              tipoSalida: "",
              inventarioDestino: "",
              fechaDesde: "",
              fechaHasta: "",
            });
          }}
          className={`px-6 py-3 font-medium transition-all ${
            activeTab === "salidas"
              ? "text-primary-blue border-b-2 border-primary-blue"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Salidas
        </button>
      </div>

      {/* Tabla de INGRESOS */}
      {activeTab === "ingresos" && (
        <Table
          thead={{
            titles: ["Fecha", "Material", "Categoría", "Cantidad", "Proveedor"],
            state: false,
            actions: true,
          }}
          tbody={{
            data: ingresosTableData,
            dataPropertys: [
              "fechaFormatted",
              "materialNombreTruncated",
              "categoriaTruncated",
              "cantidadFormatted",
              "proveedorDisplay",
            ],
            state: false,
          }}
          onView={hasPermission("materialsRegistry", "Ver") ? handleView : null}
          onEdit={
            hasPermission("materialsRegistry", "Editar") ? handleEdit : null
          }
          buttonConfig={{
            view: () => ({
              show: hasPermission("materialsRegistry", "Ver"),
              disabled: false,
              title: "Ver detalles",
            }),
            edit: () => ({
              show: hasPermission("materialsRegistry", "Editar"),
              disabled: false,
              title: "Editar ingreso",
            }),
            delete: () => ({
              show: false,
            }),
          }}
        />
      )}

      {/* Tabla de SALIDAS */}
      {activeTab === "salidas" && (
        <Table
          thead={{
            titles: ["Fecha", "Material", "Categoría", "Cantidad", "Tipo"],
            state: false,
            actions: true,
          }}
          tbody={{
            data: salidasTableData,
            dataPropertys: [
              "fechaFormatted",
              "materialNombreTruncated",
              "categoriaTruncated",
              "cantidadFormatted",
              "tipoDisplay",
            ],
            state: false,
          }}
          onView={hasPermission("materialsRegistry", "Ver") ? handleView : null}
          buttonConfig={{
            view: () => ({
              show: hasPermission("materialsRegistry", "Ver"),
              disabled: false,
              title: "Ver detalles",
            }),
            edit: () => ({
              show: false,
            }),
            delete: () => ({
              show: false,
            }),
          }}
        />
      )}

      {/* Modales */}
      <MovementModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setIsEditing(false);
          setSelectedMovement(null);
        }}
        onSave={handleSave}
        movement={isEditing ? selectedMovement : null}
        isEditing={isEditing}
      />

      <MovementViewModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedMovement(null);
        }}
        movement={selectedMovement}
      />
    </div>
  );
};

export default MaterialsMovements;
