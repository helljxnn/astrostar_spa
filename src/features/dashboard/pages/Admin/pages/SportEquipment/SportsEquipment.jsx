import React, { useState, useMemo, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Table from "../../../../../../shared/components/Table/table";
import { SiGoogleforms } from "react-icons/si";
import { FaMinusCircle } from "react-icons/fa";
import { IoMdDownload } from "react-icons/io";
import FormCreate from "./components/formCreate";
import FormEdit from "./components/formEdit";
import Disposals from "./components/disposals"; // Importar el nuevo modal
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
import Requests from "../../../../../../shared/hooks/requests";


function SportsEquipment() {

  // ----- HOOKS -----
  const location = useLocation();
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();

  // ----- VARIABLES DE ESTADO -----

  // Estado de modal de crear esta abierto
  const [modalCreate, setModalCreate] = useState(false);

  // Estado para guardar los datos de los materiales deportivos
  const [dataSportsEquipment, setDataSportsEquipment] = useState([]);

  // Estado de modal para dar de baja esta abierto
  const [disposals, setDisposals] = useState(false);

  // Estado de modal de editar esta abierto
  const [modalEdit, setModalEdit] = useState(false);

  // Estado de modal de ver detalles esta abierto
  const [isViewDetailsOpen, setIsViewDetailsOpen] = useState(false);

  // Estado para guardar el material deportivo seleccionado para editar
  const [selectedEquipment, setSelectedEquipment] = useState(null);

  // --- ESTADOS PARA PAGINACIÓN Y BÚSQUEDA ---
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const rowsPerPage = 4; // Puedes ajustar esto

  // Prepara los datos para el reporte, asegurando que no haya valores nulos/undefined
  // const reportData = useMemo(() => {
  //   return filteredEquipment.map(item => ({
  //     NombreMaterial: item.name || '', // Usamos 'name' del backend
  //     CantidadComprado: item.CantidadComprado || 0,
  //     CantidadDonado: item.CantidadDonado || 0,
  //     Total: item.Total || 0,
  //     estado: item.estado || '',
  //   }));
  // }, [filteredEquipment]);


  // ----- USEEFFECTS -----

  useEffect(() => {
    FetchData(currentPage, search);
  }, [currentPage, search]) // Se ejecuta cada vez que la página o la búsqueda cambian

  // ----- FUCNTIONS -----

  // Funcion para el crear material deportivo
  const CreateSportEquipment = async (dataForm) => {
    // Peticion para crear el material deportivo
    const response = await Requests(
      "http://localhost:3000/api/sportsEquipment",
      dataForm,
      "POST"
    )
    if (!response.success) {
      // Para cerrar el modal del formulario
      setModalCreate(false);

      // Para mostrar la alerta
      showErrorAlert(
        "No se pudo guardar el material deportivo",
        response.message
      )
    }
    setModalCreate(false);
    FetchData(1, ""); // Volver a la página 1 y limpiar búsqueda
    return showSuccessAlert(
      "Material deportivo guardado satisfactoriamente",
      response.message
    )
  }

  // Funcion para traer todos los datos de los materiales deportivos
  const GetAllSportsEquipment = async (page, searchValue) => {
    // Construimos la URL con los parámetros de paginación y búsqueda
    // La ruta base en tu archivo de rutas es /api/sports-equipment
    const url = new URL("http://localhost:3000/api/sportsEquipment");
    url.searchParams.append('page', page);
    url.searchParams.append('limit', rowsPerPage);
    if (searchValue) url.searchParams.append('search', searchValue);

    const response = await Requests(
      url.toString(),
      null,
      "GET"
    )
    // Si la peticion no es exitosa
    if (!response.success) {
      // Para mostrar la alerta
      showErrorAlert(
        "No se pudieron obtener los materiales deportivos",
        response.message
      )
    }

    return response; // Devolvemos la respuesta completa (incluye data y pagination)

  }

  // Funcion para extraer los datos y guardarlos en una variable de estado
  const FetchData = async (page, search) => {
    const response = await GetAllSportsEquipment(page, search);
    if (response && response.success) {
      setDataSportsEquipment(response.data);
      setTotalPages(response.pagination.pages || 1);
      setTotalRecords(response.pagination.total || 0);
    }
  }

  // Funcion para traer un material deportivo por su Id
  const GetByIdSportsEquipment = async (id) => {
    // Se hace la peticion
    const response = await Requests(
      `http://localhost:3000/api/sportsEquipment/${id}`,
      null,
      "GET"
    );
    // Se verifica si fue exitosa la peticion
    if (!response.success) {
      showErrorAlert("No se encontro el material deportivo", response.message);
      return null;
    }
    setSelectedEquipment(response.data);
    // Se devuelve la informacion del material deportivo
    return response.data
  }

  // Funcion para manejar la edicion de un material deportivo
  const handleEdit = (item) => {
    setSelectedEquipment(item);
    setModalEdit(true);
  };

  // Funcion para actualizar un material deportivo
  const UpdateSportEquipment = async (dataForm) => {
    // Se hace la peticion
    const response = await Requests(
      `http://localhost:3000/api/sportsEquipment/${selectedEquipment.id}`,
      dataForm,
      "PUT"
    )
    // Se verifica si la peticion funciono
    if (!response.success) {
      setModalEdit(false);
      showErrorAlert("No se actualizo el material deportivo", response.message);
      return;
    }
    // Se guarda el modal y muestra una alerta
    setModalEdit(false);
    // Refrescar los datos de la tabla
    FetchData(currentPage, search);
    return showSuccessAlert("Material deportivo actualizado exitosamente", response.message);

  }

  // Funcion para manejar la visualización de detalles
  const handleViewDetails = async (item) => {
    await GetByIdSportsEquipment(item.id);
    setIsViewDetailsOpen(true);
  };

  // Funcion para manejar la eliminación de un material deportivo
  const handleDelete = (item) => {
    showConfirmAlert(
      '¿Estás seguro?',
      `Se eliminará el material deportivo "${item.name}". Esta acción no se puede deshacer.`,
      async () => {
        const response = await Requests(
          `http://localhost:3000/api/sportsEquipment/${item.id}`,
          null,
          "DELETE"
        );
        if (response.success) {
          showSuccessAlert('Eliminado', 'El material deportivo ha sido eliminado.');
          FetchData(currentPage, search); // Recargar datos
        } else {
          showErrorAlert('Error', response.message);
        }
      }
    );
  };

  // Configuración para el modal de detalles
  const detailConfig = [
    { label: 'Nombre', key: 'name' },
    { label: 'Cantidad Inicial', key: 'quantityInitial' },
    { label: 'Cantidad Total', key: 'quantityTotal' },
    { label: 'Estado', key: 'status' },
    { label: 'Fecha de Creación', key: 'createdAt', format: (date) => new Date(date).toLocaleDateString() },
    { label: 'Última Actualización', key: 'updatedAt', format: (date) => new Date(date).toLocaleDateString() },
  ];

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
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar material..."
            />
          </div>
          <div id="buttons" className="h-auto flex flex-row items-center justify-end gap-4">
            <PermissionGuard module="sportsEquipment" action="Ver">
              <ReportButton
                data
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
              <button onClick={() => setDisposals(true)} className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg shadow hover:bg-red-600 transition whitespace-nowrap">
                Dar de Baja <FaMinusCircle size={18} />
              </button>
            </PermissionGuard>
            <PermissionGuard module="sportsEquipment" action="Crear">
              <button onClick={() => setModalCreate(true)} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-purple to-primary-blue text-white rounded-lg shadow hover:opacity-90 transition whitespace-nowrap">
                Crear <SiGoogleforms size={20} />
              </button>
            </PermissionGuard>
          </div>
        </div>
        {/* Tabla */}
        <Table
          rowsPerPage={rowsPerPage}
          pagination={{
            currentPage, setCurrentPage, totalPages
          }}
          thead={{
            titles: [
              "Nombre",
              "Cantidad inicial",
              "Total",
              "Creado",
              "Estado"
            ]
          }}
          tbody={{
            data: dataSportsEquipment,
            dataPropertys: [
              "name",
              "quantityInitial",
              "quantityTotal",
              "createdAt",
              "status"
            ],
            customRenderers: {
              createdAt: (date) => {
                if (!date) return "-";
                return new Date(date).toLocaleDateString("es-ES", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                });
              },
            },
          }}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleViewDetails}
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
        isOpen={modalCreate}
        onClose={() => setModalCreate(false)}
        onSave={CreateSportEquipment}
      />
      {/* Modal para Editar Material. Se renderiza aquí y se controla con estado. */}
      <FormEdit
        isOpen={modalEdit}
        onClose={() => setModalEdit(false)}
        onSave={UpdateSportEquipment}
        equipmentData={selectedEquipment}
      />
      {/* Modal para Dar de Baja */}
      <Disposals
        isOpen={disposals}
        onClose={() => setDisposals(false)}
        onSave
        equipmentList
      />
      {/* Modal para Ver Detalles */}
      <ViewDetails
        isOpen={isViewDetailsOpen}
        onClose={() => setIsViewDetailsOpen(false)}
        data={selectedEquipment}
        detailConfig={detailConfig}
        title="Detalles del Material Deportivo"
      />
    </div>
  );
}

export default SportsEquipment;
