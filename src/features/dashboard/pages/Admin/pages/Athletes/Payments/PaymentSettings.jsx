import { useState, useEffect } from "react";
import { FaSave, FaUndo } from "react-icons/fa";

import PermissionGuard from "../../../../../../../shared/components/PermissionGuard.jsx";
import { usePermissions } from "../../../../../../../shared/hooks/usePermissions.js";

import {
  showSuccessAlert,
  showErrorAlert,
} from "../../../../../../../shared/utils/alerts.js";

const PaymentSettings = () => {
  const { hasPermission } = usePermissions();

  const [formData, setFormData] = useState({
    monthlyAmount: 50000,
    enrollmentAmount: 100000,
    graceDays: 5
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (formData.monthlyAmount < 1000) {
      newErrors.monthlyAmount = 'Debe ser mayor a $1,000';
    }
    
    if (formData.enrollmentAmount < 1000) {
      newErrors.enrollmentAmount = 'Debe ser mayor a $1,000';
    }
    
    if (formData.graceDays < 1 || formData.graceDays > 15) {
      newErrors.graceDays = 'Debe estar entre 1 y 15 días';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!hasPermission("paymentsManagement", "Aprobar")) {
      showErrorAlert(
        "Sin permisos",
        "No tienes permisos para modificar la configuración"
      );
      return;
    }
    
    if (!validateForm()) return;
    
    setSaving(true);
    
    // Simular guardado
    setTimeout(() => {
      setSaving(false);
      showSuccessAlert(
        "Configuración guardada",
        "Los cambios se han guardado correctamente"
      );
    }, 1000);
  };

  const handleReset = () => {
    setFormData({
      monthlyAmount: 50000,
      enrollmentAmount: 100000,
      graceDays: 5
    });
    setErrors({});
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="p-6 font-questrial w-full max-w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Configuración de Pagos</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow border border-gray-200 p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Valores de Pago */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Valores de Pago
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mensualidad
                    </label>
                    <input
                      type="number"
                      value={formData.monthlyAmount}
                      onChange={(e) => setFormData({...formData, monthlyAmount: parseInt(e.target.value) || 0})}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent ${
                        errors.monthlyAmount ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="50000"
                      min="1000"
                      step="1000"
                    />
                    {errors.monthlyAmount && (
                      <p className="text-red-500 text-sm mt-1">{errors.monthlyAmount}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Renovación Matrícula
                    </label>
                    <input
                      type="number"
                      value={formData.enrollmentAmount}
                      onChange={(e) => setFormData({...formData, enrollmentAmount: parseInt(e.target.value) || 0})}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent ${
                        errors.enrollmentAmount ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="100000"
                      min="1000"
                      step="1000"
                    />
                    {errors.enrollmentAmount && (
                      <p className="text-red-500 text-sm mt-1">{errors.enrollmentAmount}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Políticas de Tiempo */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Políticas de Tiempo
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Días de Gracia
                    </label>
                    <input
                      type="number"
                      value={formData.graceDays}
                      onChange={(e) => setFormData({...formData, graceDays: parseInt(e.target.value) || 0})}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent ${
                        errors.graceDays ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="5"
                      min="1"
                      max="15"
                    />
                    {errors.graceDays && (
                      <p className="text-red-500 text-sm mt-1">{errors.graceDays}</p>
                    )}
                    <p className="text-sm text-gray-500 mt-1">
                      Días del 1 al X del mes sin mora
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <FaUndo className="w-4 h-4" />
                  Restablecer
                </button>
                
                <PermissionGuard module="paymentsManagement" action="Aprobar">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 text-white bg-primary-purple rounded-lg shadow hover:bg-primary-blue transition-colors disabled:opacity-50"
                  >
                    <FaSave className="w-4 h-4" />
                    {saving ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                </PermissionGuard>
              </div>
            </form>
          </div>
        </div>

        {/* Info Panel */}
        <div className="space-y-6">
          {/* Vista Previa */}
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
            <h4 className="font-semibold text-blue-900 mb-3">
              Vista Previa
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-blue-700">Mensualidad:</span>
                <span className="font-medium text-blue-900">
                  {formatCurrency(formData.monthlyAmount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Renovación:</span>
                <span className="font-medium text-blue-900">
                  {formatCurrency(formData.enrollmentAmount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Días de gracia:</span>
                <span className="font-medium text-blue-900">
                  {formData.graceDays} días
                </span>
              </div>
            </div>
          </div>

          {/* Valores Fijos */}
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
            <h4 className="font-semibold text-gray-800 mb-3">
              Valores Fijos del Negocio
            </h4>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Mora diaria:</span>
                <span className="font-medium">$2,000</span>
              </div>
              <div className="flex justify-between">
                <span>Días máximos mora:</span>
                <span className="font-medium">15 días</span>
              </div>
            </div>
          </div>

          {/* Notas Importantes */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
            <h4 className="font-semibold text-yellow-900 mb-2">
              Notas Importantes
            </h4>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• Los cambios afectan solo a nuevas obligaciones</li>
              <li>• Las obligaciones existentes mantienen su valor original</li>
              <li>• La mora se calcula automáticamente</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSettings;

