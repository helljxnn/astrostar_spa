import React, { useState, useMemo, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Table from "../../../../../../shared/components/Table/table";
import { SiGoogleforms } from "react-icons/si";
import { FaMinusCircle } from "react-icons/fa";
import { IoMdDownload } from "react-icons/io";
import FormCreate from "./components/formCreate";
import FormEdit from "./components/formEdit";
import DarDeBajaModal from "./components/DarDeBajaModal"; // Importar el nuevo modal
import ViewDetails from "../../../../../../shared/components/ViewDetails";
import ReportButton from "../../../../../../shared/components/ReportButton";
import SearchInput from "../../../../../../shared/components/SearchInput";
import PermissionGuard from "../../../../../../shared/components/PermissionGuard";
import { usePermissions } from "../../../../../../shared/hooks/usePermissions";
import {
  showSuccessAlert,
  showConfirmAlert,
  showErrorAlert
} from "../../../../../../shared/utils/alerts";

// Clave para guardar los datos en localStorage
const LOCAL_STORAGE_KEY = 'sportsEquipmentData';

function SportsEquipment() {
  const location = useLocation();
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();

  // Estado para la lista de datos, inicializado desde localStorage
  const [equipmentList, setEquipmentList] = useState(() => {
    try {
      const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);
      // Si existe 'storedData' (incluso si es '[]'), lo usamos.
      if (storedData) {
        return JSON.parse(storedData);
      }
    } catch (error) {
      console.error("Error al leer desde localStorage:", error);
    }
    // Si no hay datos en localStorage, empezamos con una lista vacía.
    return [];
  });

  // Estados para controlar la visibilidad de los modales
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDarDeBajaModalOpen, setIsDarDeBajaModalOpen] = useState(false); // Estado para el nuevo modal
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  // Estado para el término de búsqueda
  const [searchTerm, setSearchTerm] = useState("");

  // useEffect para guardar los cambios en localStorage cada vez que la lista se modifica
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(equipmentList));
    } catch (error) {
      console.error("Error al guardar en localStorage:", error);
    }
  }, [equipmentList]);

  // useEffect para abrir el modal de creación si se navega con el estado adecuado
  useEffect(() => {
    if (location.state?.openCreateModal) {
      setIsCreateModalOpen(true);
      // Limpiar el estado de la ubicación para que no se vuelva a abrir al recargar
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);



  // Filtramos los datos basándonos en el término de búsqueda.
  // Usamos useMemo para evitar recalcular en cada render si los datos o el término no cambian.
  const filteredEquipment = useMemo(() => {
    const term = searchTerm.toLowerCase();
    if (!term) return equipmentList;
    // Busca en todos los valores de cada objeto
    return equipmentList.filter(item => Object.values(item).some(value => String(value).toLowerCase().includes(term)));
  }, [equipmentList, searchTerm]);

  const handleOpenCreateModal = () => {
    setIsCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  const handleCreate = (newData) => {
    // En una app real, aquí también validarías que el nombre no exista ya.
    const newEquipment = {
      id: Date.now(), // Asignamos un ID único
      NombreMaterial: newData.nombre,
      CantidadInicial: 0, // Se establece en 0 por reglas de negocio.
      CantidadComprado: 0,
      CantidadDonado: 0,
      Total: 0, // El total inicial es 0, se actualizará con compras/donaciones.
      estado: newData.estado,
      bajaHistory: [], // Inicializar el historial de bajas
    };

    // Añadimos el nuevo equipo al principio de la lista
    setEquipmentList(prevList => [newEquipment, ...prevList]);
    handleCloseCreateModal();
    showSuccessAlert("¡Creado!", "El nuevo material deportivo se ha registrado correctamente.");
  };

  const handleDarDeBajaSubmit = (lossData) => {
    const { equipmentId, quantity, reason, images } = lossData;

    setEquipmentList(prevList =>
      prevList.map(item => {
        if (item.id === equipmentId) {
          const newTotal = Math.max(0, item.Total - quantity);
          const newHistoryEntry = {
            date: new Date().toISOString(),
            quantity: Number(quantity),
            reason,
            images,
          };
          // Asegurarse de que bajaHistory exista antes de añadir
          const existingHistory = item.bajaHistory || [];
          return {
            ...item,
            Total: newTotal,
            bajaHistory: [...existingHistory, newHistoryEntry],
          };
        }
        return item;
      })
    );

    setIsDarDeBajaModalOpen(false);
    showSuccessAlert("¡Baja Registrada!", `Se han dado de baja ${quantity} unidades de "${lossData.equipmentName}".`);
  }

  // --- Lógica para Editar y Eliminar ---
  // Estas funciones se pasarán como props a la tabla.
  // La tabla las usará para los botones de acción de cada fila.

  const handleEdit = (item) => {
    setSelectedEquipment(item); // Guardamos el item completo
    setIsEditModalOpen(true); // Abrimos el modal de edición
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedEquipment(null); // Limpiamos el item seleccionado al cerrar
  };

  const handleUpdate = (updatedData) => {
    // Lógica para actualizar el item en nuestra lista de estado
    const updatedList = equipmentList.map(item => {
      // Usamos el ID para garantizar que actualizamos el item correcto.
      if (item.id === selectedEquipment.id) {
        return {
          ...item, // Mantenemos las cantidades y otros datos intactos
          NombreMaterial: updatedData.nombre,
          estado: updatedData.estado,
        };
      }
      return item;
    });
    setEquipmentList(updatedList);
    handleCloseEditModal(); // Cerramos el modal
    showSuccessAlert(
      "¡Actualizado!",
      "El material deportivo se ha actualizado correctamente."
    );
  };

  const handleDelete = async (itemToDelete) => {
    const result = await showConfirmAlert(
      "¿Estás seguro de eliminar?",
      `El material "${itemToDelete.NombreMaterial}" se eliminará permanentemente.`,
      {
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar",
      }
    );

    if (result.isConfirmed) {
      try {
        // Filtramos la lista para excluir el item a eliminar.
        const updatedList = equipmentList.filter(
          (item) => item.id !== itemToDelete.id // Usamos el ID para eliminar
        );
        setEquipmentList(updatedList);
        showSuccessAlert(
          "¡Eliminado!",
          `El material "${itemToDelete.NombreMaterial}" ha sido eliminado con éxito.`
        );
      } catch (error) {
        console.error("Error al eliminar el material:", error);
        showErrorAlert("Error", "Ocurrió un error al eliminar el material.");
      }
    }
  };

  const handleView = (item) => {
    setSelectedEquipment(item);
    setIsViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedEquipment(null);
  };

  // Configuración para el modal de detalles reutilizable
  const equipmentDetailConfig = [
    { label: "Nombre del Material", key: "NombreMaterial" },
    { label: "Cantidad Inicial", key: "CantidadInicial" },
    { label: "Cantidad Comprada", key: "CantidadComprado" },
    { label: "Cantidad Donada", key: "CantidadDonado" },
    { label: "Total en Inventario", key: "Total" },
    { label: "Estado", key: "estado" },
    { label: "Historial de Bajas", key: "bajaHistory", type: "history", historyKeys: { date: 'date', quantity: 'quantity', reason: 'reason', images: 'images' } },
  ];

  // Prepara los datos para el reporte, asegurando que no haya valores nulos/undefined
  const reportData = useMemo(() => {
    return filteredEquipment.map(item => ({
      NombreMaterial: item.NombreMaterial || '',
      CantidadComprado: item.CantidadComprado || 0,
      CantidadDonado: item.CantidadDonado || 0,
      Total: item.Total || 0,
      estado: item.estado || '',
    }));
  }, [filteredEquipment]);

  return (
    <div
      id="contentSportsEquipment"
      className="w-full h-auto grid grid-rows-[auto_1fr] relative"
    >
      {/* Contenedor index */}
      <div id="header" className="w-full h-auto p-8">
        {/* Cabecera */}
        <h1 className="text-4xl font-bold text-gray-800">Material deportivo</h1>
      </div>
      <div
        id="body"
        className="w-full h-auto grid grid-rows-[auto_1fr] gap-2 p-4"
      >
        {/* Cuerpo */}
        <div
          id="actionButtons"
          className="w-full h-auto p-2 flex flex-row justify-between items-center"
        >
          {/* Botones */}
          <div className="w-1/3">
            <SearchInput
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar material..."
            />
          </div>
          <div id="buttons" className="h-auto flex flex-row items-center justify-end gap-4">
            <PermissionGuard module="sportsEquipment" action="Ver">
              <ReportButton
                data={reportData}
                fileName="Material_Deportivo"
                columns={[
                  { header: "Nombre", accessor: "NombreMaterial" },
                  { header: "Comprado", accessor: "CantidadComprado" },
                  { header: "Donado", accessor: "CantidadDonado" },
                  { header: "Total", accessor: "Total" },
                  { header: "Estado", accessor: "estado" },
                ]}
              />
            </PermissionGuard>
            <PermissionGuard module="sportsEquipment" action="Eliminar">
              <button onClick={() => setIsDarDeBajaModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg shadow hover:bg-red-600 transition whitespace-nowrap">
                Dar de Baja <FaMinusCircle size={18} />
              </button>
            </PermissionGuard>
            <PermissionGuard module="sportsEquipment" action="Crear">
              <button onClick={handleOpenCreateModal} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-purple to-primary-blue text-white rounded-lg shadow hover:opacity-90 transition whitespace-nowrap">
                Crear <SiGoogleforms size={20} />
              </button>
            </PermissionGuard>
          </div>
        </div>
        {/* Tabla */}
        <Table
          rowsPerPage={4}
          paginationFrom={4}
          thead={{
            titles: [
              "Nombre",
              "Comprado",
              "Donado",
              "Total",
            ],
            state: true,
          }}
          tbody={{
            data: filteredEquipment,
            dataPropertys: [
              "NombreMaterial",
              "CantidadComprado",
              "CantidadDonado",
              "Total",
            ],
            state: true,
          }}
          onEdit={hasPermission('sportsEquipment', 'Editar') ? handleEdit : null}
          onDelete={hasPermission('sportsEquipment', 'Eliminar') ? handleDelete : null}
          onView={hasPermission('sportsEquipment', 'Ver') ? handleView : null}
          buttonConfig={{
            edit: (item) => ({
              show: hasPermission('sportsEquipment', 'Editar'),
              disabled: false,
              className: '',
              title: 'Editar material deportivo'
            }),
            delete: (item) => ({
              show: hasPermission('sportsEquipment', 'Eliminar'),
              disabled: false,
              className: '',
              title: 'Eliminar material deportivo'
            }),
            view: (item) => ({
              show: hasPermission('sportsEquipment', 'Ver'),
              disabled: false,
              className: '',
              title: 'Ver detalles del material'
            })
          }}
        />
      </div>
      {/* Modal para Crear Material */}
      <FormCreate
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        onSave={handleCreate}
      />
      {/* Modal para Editar Material. Se renderiza aquí y se controla con estado. */}
      <FormEdit
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        onSave={handleUpdate}
        equipmentData={selectedEquipment}
      />
      {/* Modal para Dar de Baja */}
      <DarDeBajaModal
        isOpen={isDarDeBajaModalOpen}
        onClose={() => setIsDarDeBajaModalOpen(false)}
        onSave={handleDarDeBajaSubmit}
        equipmentList={equipmentList}
      />
      {/* Modal reutilizable para Ver Detalles */}
      <ViewDetails
        isOpen={isViewModalOpen}
        onClose={handleCloseViewModal}
        data={selectedEquipment}
        detailConfig={equipmentDetailConfig}
        title="Detalles del Material Deportivo"
      />
    </div>
  );
}

export default SportsEquipment;
