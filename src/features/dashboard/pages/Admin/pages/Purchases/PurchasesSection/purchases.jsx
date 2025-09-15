import React, { useState, useMemo, useEffect } from 'react';
import { SiGoogleforms } from "react-icons/si";
import { IoMdDownload } from "react-icons/io";
import FormCreate from "./components/formCreate";
import { showSuccessAlert, showConfirmAlert, showErrorAlert } from '../../../../../../../shared/utils/alerts';
import ViewDetails from '../../../../../../../shared/components/ViewDetails';
import Pagination from '../../../../../../../shared/components/Table/Pagination';
import SearchInput from "../../../../../../../shared/components/SearchInput";

const PURCHASES_STORAGE_KEY = 'purchasesData';
const EQUIPMENT_STORAGE_KEY = 'sportsEquipmentData';

const Purchases = () => {
  const [purchasesList, setPurchasesList] = useState(() => {
    try {
      const storedData = localStorage.getItem(PURCHASES_STORAGE_KEY);
      return storedData ? JSON.parse(storedData) : [];
    } catch (error) {
      console.error("Error al leer compras de localStorage:", error);
      return [];
    }
  });

  const [equipmentList, setEquipmentList] = useState(() => {
    try {
      const storedData = localStorage.getItem(EQUIPMENT_STORAGE_KEY);
      return storedData ? JSON.parse(storedData) : [];
    } catch (error) {
      console.error("Error al leer material deportivo de localStorage:", error);
      return [];
    }
  });

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5; // Número de filas por página

  useEffect(() => {
    try {
      localStorage.setItem(PURCHASES_STORAGE_KEY, JSON.stringify(purchasesList));
    } catch (error) {
      console.error("Error al guardar compras en localStorage:", error);
    }
  }, [purchasesList]);

  useEffect(() => {
    try {
      localStorage.setItem(EQUIPMENT_STORAGE_KEY, JSON.stringify(equipmentList));
    } catch (error) {
      console.error("Error al guardar material deportivo en localStorage:", error);
    }
  }, [equipmentList]);

  const filteredPurchases = useMemo(() =>
    purchasesList.filter(item =>
      (item.proveedor && item.proveedor.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.concepto && item.concepto.toLowerCase().includes(searchTerm.toLowerCase()))
    ), [purchasesList, searchTerm]);

  // Lógica de paginación
  const totalRows = filteredPurchases.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage);
  const showPagination = totalRows > rowsPerPage;

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedData = filteredPurchases.slice(startIndex, startIndex + rowsPerPage);


  const handleOpenCreateModal = () => {
    setIsCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  const handleCreateSubmit = (formData) => {
    const selectedEquipment = equipmentList.find(e => e.id === Number(formData.NombreProducto));
    if (!selectedEquipment) {
      return showErrorAlert("Error", "El material deportivo seleccionado no es válido.");
    }

    const newPurchase = {
      id: Date.now(),
      proveedor: formData.Proveedor,
      monto: `$${(Number(formData.Cantidad) * Number(formData.PrecioUnitario)).toLocaleString('es-CO')}`,
      fecha: formData.FechaCompra,
      concepto: selectedEquipment.NombreMaterial,
      estado: formData.estado,
      materialId: selectedEquipment.id,
      cantidad: Number(formData.Cantidad),
      precioUnitario: Number(formData.PrecioUnitario),
    };

    setPurchasesList(prev => [newPurchase, ...prev]);

    // Actualizar el stock si la compra se marca como "Recibido"
    if (newPurchase.estado === 'Recibido') {
      setEquipmentList(prevEquipment =>
        prevEquipment.map(eq =>
          eq.id === newPurchase.materialId
            ? {
              ...eq,
              CantidadComprado: (eq.CantidadComprado || 0) + newPurchase.cantidad,
              Total: (eq.Total || 0) + newPurchase.cantidad,
            }
            : eq
        )
      );
    }

    showSuccessAlert("¡Creado!", "La nueva compra se ha registrado correctamente.");
    handleCloseCreateModal();
  };

  const handleChangeState = async (purchaseToUpdate, newState) => {
    const originalState = purchaseToUpdate.estado;

    if (originalState === newState || originalState === 'Cancelado') {
      return;
    }

    let confirmTitle = `¿Cambiar estado a "${newState}"?`;
    let confirmText = `La compra de "${purchaseToUpdate.concepto}" cambiará su estado.`;
    let confirmButtonText = "Sí, cambiar";

    if (newState === 'Cancelado') {
      confirmTitle = '¿Anular Compra?';
      confirmText = `La compra de "${purchaseToUpdate.concepto}" se marcará como cancelada. Esta acción no se puede deshacer.`;
      confirmButtonText = "Sí, anular";
    }

    const result = await showConfirmAlert(
      confirmTitle,
      confirmText,
      { confirmButtonText, cancelButtonText: "Cancelar" }
    );

    if (result.isConfirmed) {
      // De no-recibido a recibido -> Aumentar stock
      if (originalState !== 'Recibido' && newState === 'Recibido') {
        setEquipmentList(prevEquipment =>
          prevEquipment.map(eq =>
            eq.id === purchaseToUpdate.materialId
              ? { ...eq, CantidadComprado: (eq.CantidadComprado || 0) + purchaseToUpdate.cantidad, Total: (eq.Total || 0) + purchaseToUpdate.cantidad }
              : eq
          )
        );
      }
      // De recibido a no-recibido (Pendiente o Cancelado) -> Disminuir stock
      else if (originalState === 'Recibido' && newState !== 'Recibido') {
        setEquipmentList(prevEquipment =>
          prevEquipment.map(eq =>
            eq.id === purchaseToUpdate.materialId
              ? { ...eq, CantidadComprado: Math.max(0, (eq.CantidadComprado || 0) - purchaseToUpdate.cantidad), Total: Math.max(0, (eq.Total || 0) - purchaseToUpdate.cantidad) }
              : eq
          )
        );
      }

      setPurchasesList(prev =>
        prev.map(p => (p.id === purchaseToUpdate.id ? { ...p, estado: newState } : p))
      );

      showSuccessAlert("¡Estado Actualizado!", `La compra ahora está en estado "${newState}".`);
    }
  };

  const handleView = (item) => {
    setSelectedPurchase(item);
    setIsViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedPurchase(null);
  };

  // Configuración para el modal de detalles
  const purchaseDetailConfig = [
    { label: "Concepto (Material)", key: "concepto" },
    { label: "Proveedor", key: "proveedor" },
    { label: "Fecha", key: "fecha" },
    { label: "Monto Total", key: "monto" },
    { label: "Cantidad", key: "cantidad" },
    { label: "Precio Unitario ($)", key: "precioUnitario", format: (val) => val ? `$${Number(val).toLocaleString('es-CO')}` : '$0' },
    { label: "Estado", key: "estado" },
  ];

  const statusStyles = {
    'Recibido': 'bg-green-100 text-green-800',
    'Pendiente': 'bg-yellow-100 text-yellow-800',
    'Cancelado': 'bg-red-100 text-red-800',
  };

  return (
    <div id="contentPurchases" className="w-full h-auto grid grid-rows-[auto_1fr] relative">
      {/* Contenedor index */}
      <div id="header" className="w-full h-auto p-8">
        {/* Cabecera */}
        <h1 className="text-5xl">Compras</h1>
      </div>
      <div id="body" className="w-full h-auto grid grid-rows-[auto_1fr] gap-2 p-4">
        {/* Cuerpo */}
        <div id="actionButtons" className="w-full h-auto p-2 flex flex-row justify-between items-center">
          <SearchInput
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por proveedor o concepto..."
          />
          <div id="buttons" className="h-auto flex flex-row items-center justify-end gap-4">
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-700 font-semibold hover:bg-gray-200 transition-colors"><IoMdDownload size={25} color="#b595ff" /> Generar reporte</button>
            <button onClick={handleOpenCreateModal} className="flex items-center gap-2 px-4 py-2 bg-primary-blue text-white rounded-lg shadow hover:bg-primary-purple transition-colors">
              Crear <SiGoogleforms size={20} />
            </button>
          </div>
        </div>
        {/* Contenedor de la tabla con diseño unificado */}
        <div className="shadow-lg rounded-2xl bg-white flex flex-col border border-gray-200 overflow-hidden">
          {/* Vista para Desktop */}
          <div className="overflow-x-auto hidden sm:block w-full scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            <table className="w-full border-collapse text-sm font-monserrat">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left font-medium tracking-wider">Concepto</th>
                  <th scope="col" className="px-6 py-3 text-left font-medium tracking-wider">Proveedor</th>
                  <th scope="col" className="px-6 py-3 text-left font-medium tracking-wider">Monto</th>
                  <th scope="col" className="px-6 py-3 text-left font-medium tracking-wider">Fecha</th>
                  <th scope="col" className="px-6 py-3 text-left font-medium tracking-wider">Estado</th>
                  <th scope="col" className="px-6 py-3 text-center font-medium tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedData.length > 0 ? (
                  paginatedData.map((purchase) => (
                    <tr key={purchase.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{purchase.concepto}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{purchase.proveedor}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{purchase.monto}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{purchase.fecha}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 font-semibold leading-tight rounded-full text-xs ${statusStyles[purchase.estado] || 'bg-gray-100 text-gray-800'}`}>
                          {purchase.estado}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center space-x-2">
                        <button onClick={() => handleView(purchase)} className="px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors">
                          Ver Detalles
                        </button>
                        {purchase.estado === 'Pendiente' && (
                          <>
                            <button onClick={() => handleChangeState(purchase, 'Recibido')} className="px-3 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-lg hover:bg-green-200 transition-colors">
                              Marcar Recibido
                            </button>
                            <button onClick={() => handleChangeState(purchase, 'Cancelado')} className="px-3 py-1 text-xs font-medium text-red-600 bg-red-100 rounded-lg hover:bg-red-200 transition-colors">
                              Anular
                            </button>
                          </>
                        )}
                        {purchase.estado === 'Recibido' && (
                          <>
                            <button onClick={() => handleChangeState(purchase, 'Pendiente')} className="px-3 py-1 text-xs font-medium text-yellow-700 bg-yellow-100 rounded-lg hover:bg-yellow-200 transition-colors">
                              Revertir a Pendiente
                            </button>
                            <button onClick={() => handleChangeState(purchase, 'Cancelado')} className="px-3 py-1 text-xs font-medium text-red-600 bg-red-100 rounded-lg hover:bg-red-200 transition-colors">
                              Anular
                            </button>
                          </>
                        )}
                        {purchase.estado === 'Cancelado' && (
                          <span className="px-3 py-1 text-xs font-medium text-gray-500">
                            Acción no disponible
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-10 text-gray-400 italic">
                      No hay compras para mostrar.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Vista para Móviles */}
          <div className="block sm:hidden p-3 space-y-4">
            {paginatedData.length > 0 ? (
              paginatedData.map((purchase) => (
                <div key={purchase.id} className="border rounded-xl shadow-sm p-4 bg-gray-50 text-gray-700">
                  <p className="text-sm mb-1"><span className="font-semibold">Concepto:</span> {purchase.concepto}</p>
                  <p className="text-sm mb-1"><span className="font-semibold">Proveedor:</span> {purchase.proveedor}</p>
                  <p className="text-sm mb-1"><span className="font-semibold">Monto:</span> {purchase.monto}</p>
                  <p className="text-sm mb-1"><span className="font-semibold">Fecha:</span> {purchase.fecha}</p>
                  <p className="mt-1 text-sm font-medium">
                    <span className="font-semibold">Estado: </span>
                    <span className={`px-2 py-1 font-semibold leading-tight rounded-full text-xs ${statusStyles[purchase.estado] || 'bg-gray-100 text-gray-800'}`}>
                      {purchase.estado}
                    </span>
                  </p>
                  <div className="flex flex-wrap items-center gap-2 mt-3 border-t pt-3">
                    <button onClick={() => handleView(purchase)} className="px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors">
                      Ver
                    </button>
                    {purchase.estado === 'Pendiente' && (
                      <>
                        <button onClick={() => handleChangeState(purchase, 'Recibido')} className="px-3 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-lg hover:bg-green-200 transition-colors">
                          Marcar Recibido
                        </button>
                        <button onClick={() => handleChangeState(purchase, 'Cancelado')} className="px-3 py-1 text-xs font-medium text-red-600 bg-red-100 rounded-lg hover:bg-red-200 transition-colors">
                          Anular
                        </button>
                      </>
                    )}
                    {purchase.estado === 'Recibido' && (
                      <>
                        <button onClick={() => handleChangeState(purchase, 'Pendiente')} className="px-3 py-1 text-xs font-medium text-yellow-700 bg-yellow-100 rounded-lg hover:bg-yellow-200 transition-colors">
                          Revertir
                        </button>
                        <button onClick={() => handleChangeState(purchase, 'Cancelado')} className="px-3 py-1 text-xs font-medium text-red-600 bg-red-100 rounded-lg hover:bg-red-200 transition-colors">
                          Anular
                        </button>
                      </>
                    )}
                    {purchase.estado === 'Cancelado' && (
                      <span className="px-3 py-1 text-xs font-medium text-gray-500">
                        Acción no disponible
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-gray-400 italic">
                No hay compras para mostrar.
              </div>
            )}
          </div>

          {/* Paginación */}
          {showPagination && (
            <div className="w-full border-t border-gray-100 bg-gray-50">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                totalRows={totalRows}
                rowsPerPage={rowsPerPage}
                startIndex={startIndex}
              />
            </div>
          )}
        </div>
      </div>
      {/* Modal para Crear Compra */}
      <FormCreate
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        onSubmit={handleCreateSubmit}
        equipmentList={equipmentList}
      />
      {/* Modal para Ver Detalles */}
      <ViewDetails
        isOpen={isViewModalOpen}
        onClose={handleCloseViewModal}
        data={selectedPurchase}
        detailConfig={purchaseDetailConfig}
        title="Detalles de la Compra"
      />
    </div>
  );
}

export default Purchases;