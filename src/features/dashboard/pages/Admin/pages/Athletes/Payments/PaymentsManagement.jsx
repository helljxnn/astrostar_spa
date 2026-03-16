import React from "react";

const PaymentsManagement = () => {

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            🧾 Gestión de Pagos
          </h1>
          <p className="text-gray-600 mt-1">
            Administra los comprobantes de pago de los atletas
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center py-8">
          <div className="text-6xl mb-4">🧾</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Vista Admin - Gestión de Pagos
          </h2>
          <p className="text-gray-600 mb-4">
            Lista de pagos pendientes, aprobar/rechazar comprobantes
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-medium text-blue-900">Filtros</h3>
              <p className="text-sm text-blue-700">Por estado, tipo y búsqueda</p>
            </div>
            
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-medium text-green-900">Acciones</h3>
              <p className="text-sm text-green-700">Aprobar/rechazar pagos</p>
            </div>
            
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <h3 className="font-medium text-purple-900">Reportes</h3>
              <p className="text-sm text-purple-700">Exportar datos</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentsManagement;
