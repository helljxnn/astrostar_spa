import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { SiGoogleforms } from "react-icons/si";
import { IoMdDownload } from "react-icons/io";
import { FaEye, FaCheckCircle, FaTimesCircle, FaUndo } from 'react-icons/fa';
import FormCreate from "./components/formCreate";
import ViewInvoiceDetails from "./components/ViewInvoiceDetails"; // Importar el nuevo modal
import { showSuccessAlert, showConfirmAlert, showErrorAlert } from '../../../../../../../shared/utils/alerts';
import Pagination from '../../../../../../../shared/components/Table/Pagination';
import SearchInput from "../../../../../../../shared/components/SearchInput";

const PURCHASES_STORAGE_KEY = 'purchasesData';
const EQUIPMENT_STORAGE_KEY = 'sportsEquipmentData';
const PROVIDERS_STORAGE_KEY = 'providersData'; // Clave específica para proveedores

// Datos de ejemplo que se usarán si el localStorage de proveedores está vacío
const sampleProviders = [
  { id: 1, razonSocial: 'Insumos Deportivos S.A.', nit: '900.111.222-3', estado: 'Activo' },
  { id: 2, razonSocial: 'Dotaciones Atléticas Ltda.', nit: '800.333.444-5', estado: 'Activo' },
  { id: 3, razonSocial: 'Equipamiento Total', nit: '901.555.666-7', estado: 'Inactivo' },
];

const sampleEquipment = [
  { id: 1, NombreMaterial: 'Balón de Fútbol', CantidadComprado: 10, CantidadDonado: 5, Total: 15, estado: 'Activo' },
  { id: 2, NombreMaterial: 'Conos de Entrenamiento', CantidadComprado: 50, CantidadDonado: 20, Total: 70, estado: 'Activo' },
  { id: 3, NombreMaterial: 'Red de Voleibol', CantidadComprado: 2, CantidadDonado: 1, Total: 3, estado: 'Activo' },
];

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
      const parsedData = storedData ? JSON.parse(storedData) : [];
      // Si no hay datos en localStorage, usar los de ejemplo
      return parsedData.length > 0 ? parsedData : sampleEquipment;
    } catch (error) {
      console.error("Error al leer material deportivo de localStorage:", error);
      return sampleEquipment; // Usar datos de ejemplo en caso de error
    }
  });

  const [providersList, setProvidersList] = useState(() => {
    try {
      const storedData = localStorage.getItem(PROVIDERS_STORAGE_KEY);
      const parsedData = storedData ? JSON.parse(storedData) : [];
      // Si no hay datos en localStorage, usar los de ejemplo
      return parsedData.length > 0 ? parsedData : sampleProviders;
    } catch (error) {
      console.error("Error al leer proveedores de localStorage:", error);
      return sampleProviders; // Usar datos de ejemplo en caso de error
    }
  });

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isInvoiceDetailModalOpen, setIsInvoiceDetailModalOpen] = useState(false);
  const [selectedInvoiceDetails, setSelectedInvoiceDetails] = useState(null);
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
      (item.concepto && item.concepto.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.numeroFactura && item.numeroFactura.toLowerCase().includes(searchTerm.toLowerCase()))
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

  const handleCreateSubmit = (invoiceData) => {
    const newPurchases = invoiceData.productos.map(producto => {
      const itemTotal = producto.cantidad * producto.precioUnitario;
      return {
        id: Date.now() + Math.random(), // Evita colisiones de ID si se crean muy rápido
        numeroFactura: invoiceData.numeroFactura,
        proveedor: invoiceData.proveedor,
        monto: `$${itemTotal.toLocaleString('es-CO')}`,
        fecha: invoiceData.fechaCompra,
        fechaRegistro: invoiceData.fechaRegistro,
        concepto: producto.nombre,
        estado: 'Registrado',
        materialId: producto.id,
        cantidad: producto.cantidad,
        precioUnitario: producto.precioUnitario,
      };
    });

    // La lógica de actualizar stock no se aplica aquí, porque el estado por defecto es 'Pendiente'.
    // Se aplicará cuando el estado cambie a 'Recibido' a través de `handleChangeState`.

    setPurchasesList(prev => [...newPurchases, ...prev]);

    showSuccessAlert("¡Creado!", "La nueva compra se ha registrado correctamente.");
    handleCloseCreateModal();
  };

  const handleChangeState = useCallback(async (purchaseToUpdate, newState) => {
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
  }, [equipmentList]);

  const handleView = useCallback((purchaseItem) => {
    // 1. Encontrar todos los items con el mismo número de factura
    const invoiceItems = purchasesList.filter(p => p.numeroFactura === purchaseItem.numeroFactura);

    if (invoiceItems.length === 0) {
      showErrorAlert("Error", "No se encontraron los detalles de la factura.");
      return;
    }

    // 2. Calcular el total de la factura
    const parseMonto = (montoStr) => Number(String(montoStr).replace(/\$|\./g, '').replace(',', '.'));
    const invoiceTotal = invoiceItems.reduce((sum, p) => sum + parseMonto(p.monto), 0);

    // 3. Preparar los datos para el modal
    const invoiceDetails = {
      numeroFactura: purchaseItem.numeroFactura,
      proveedor: purchaseItem.proveedor,
      fechaCompra: purchaseItem.fecha,
      fechaRegistro: purchaseItem.fechaRegistro,
      productos: invoiceItems,
      total: invoiceTotal,
    };

    // 4. Guardar los datos y abrir el modal
    setSelectedInvoiceDetails(invoiceDetails);
    setIsInvoiceDetailModalOpen(true);
  }, [purchasesList]);

  const handleCloseInvoiceDetailModal = useCallback(() => {
    setIsInvoiceDetailModalOpen(false);
    setSelectedInvoiceDetails(null);
  }, []);

  const statusStyles = {
    'Recibido': 'bg-green-100 text-green-800',
    'Pendiente': 'bg-yellow-100 text-yellow-800',
    'Registrado': 'bg-blue-100 text-blue-800',
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
            placeholder="Buscar por proveedor, concepto o N° factura..."
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
          <div className="overflow-x-auto hidden sm:block w-full">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-gray-700 text-sm uppercase tracking-wider bg-gradient-to-r from-primary-purple to-primary-blue">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left font-semibold text-white">N° Factura</th>
                  <th scope="col" className="px-6 py-4 text-left font-semibold text-white">Proveedor</th>
                  <th scope="col" className="px-6 py-4 text-left font-semibold text-white">Monto</th>
                  <th scope="col" className="px-6 py-4 text-left font-semibold text-white">Fecha Compra</th>
                  <th scope="col" className="px-6 py-4 text-left font-semibold text-white">Fecha Registro</th>
                  <th scope="col" className="px-6 py-4 text-left font-semibold text-white">Estado</th>
                  <th scope="col" className="px-6 py-4 font-semibold text-white text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedData.length > 0 ? (
                  paginatedData.map((purchase) => (
                    <tr key={purchase.id} className="bg-white hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{purchase.numeroFactura}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{purchase.proveedor}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{purchase.monto}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{purchase.fecha}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{purchase.fechaRegistro || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 font-semibold leading-tight rounded-full text-xs ${statusStyles[purchase.estado] || 'bg-gray-100 text-gray-800'}`}>
                          {purchase.estado}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center justify-center space-x-2">
                          <button onClick={() => handleView(purchase)} title="Ver Detalles" className="p-2 text-purple-700 bg-purple-100 rounded-full hover:bg-purple-200 transition-colors">
                            <FaEye />
                          </button>
                          {purchase.estado !== 'Cancelado' && (
                            <button onClick={() => handleChangeState(purchase, 'Cancelado')} title="Anular Compra" className="p-2 text-red-600 bg-red-100 rounded-full hover:bg-red-200 transition-colors">
                              <FaTimesCircle />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-10 text-gray-500">
                      No hay compras para mostrar.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Vista para Móviles */}
          <div className="grid grid-cols-1 gap-4 p-4 sm:hidden">
            {paginatedData.length > 0 ? (
              paginatedData.map((purchase) => (
                <div key={purchase.id} className="bg-white p-4 rounded-lg shadow space-y-3 border border-gray-200/80">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-gray-900">Factura: {purchase.numeroFactura}</h3>
                    <span className={`flex-shrink-0 px-2.5 py-1 font-semibold leading-tight rounded-full text-xs ${statusStyles[purchase.estado] || 'bg-gray-100 text-gray-800'}`}>
                      {purchase.estado}
                    </span>
                  </div>

                  <div className="text-sm text-gray-500 space-y-1">
                    <p><span className="font-medium text-gray-700">Concepto:</span> {purchase.concepto}</p>
                    <p><span className="font-medium text-gray-700">Proveedor:</span> {purchase.proveedor}</p>
                    <p><span className="font-medium text-gray-700">Fecha Compra:</span> {purchase.fecha}</p>
                    <p><span className="font-medium text-gray-700">Fecha Registro:</span> {purchase.fechaRegistro || 'N/A'}</p>
                  </div>

                  <div className="flex items-center gap-2 pt-3 border-t border-gray-200">
                    <div className="flex items-center justify-center space-x-2">
                      <button onClick={() => handleView(purchase)} title="Ver Detalles" className="p-2 text-purple-700 bg-purple-100 rounded-full hover:bg-purple-200 transition-colors">
                        <FaEye />
                      </button>
                      {purchase.estado !== 'Cancelado' && (
                        <button onClick={() => handleChangeState(purchase, 'Cancelado')} title="Anular Compra" className="p-2 text-red-600 bg-red-100 rounded-full hover:bg-red-200 transition-colors">
                          <FaTimesCircle />
                        </button>
                      )}
                      {purchase.estado === 'Cancelado' && (
                        <span className="px-3 py-1 text-xs font-medium text-gray-500">
                          Acción no disponible
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-gray-500">
                No hay compras para mostrar.
              </div>
            )}
          </div>

          {/* Paginación */}
          {showPagination && (
            <div className="w-full border-t border-gray-200 bg-white p-4">
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
        providerList={providersList}
      />
      {/* Modal personalizado para ver detalles de la factura */}
      <ViewInvoiceDetails
        isOpen={isInvoiceDetailModalOpen}
        onClose={handleCloseInvoiceDetailModal}
        invoiceData={selectedInvoiceDetails}
      />
    </div>
  );
}

export default Purchases;