import React from 'react';
import { motion } from 'framer-motion';

const CredentialsModal = ({ isOpen, onClose, employeeData, credentials }) => {
  if (!isOpen) return null;

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // Aquí podrías agregar una notificación de "copiado"
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative"
        initial={{ scale: 0.8, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: 50 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">🎉 Empleado Creado</h2>
              <p className="text-green-100">Credenciales generadas</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors p-1"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className="mb-4">
            <h3 className="font-semibold text-gray-800 mb-2">
              Empleado: {employeeData?.firstName} {employeeData?.lastName}
            </h3>
            <p className="text-sm text-gray-600">
              Las credenciales han sido enviadas por email a: <strong>{employeeData?.email}</strong>
            </p>
          </div>

          {process.env.NODE_ENV === 'development' && credentials && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-yellow-800 mb-3 flex items-center">
                🔧 Modo Desarrollo - Credenciales Temporales
              </h4>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Usuario:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={credentials.email}
                      readOnly
                      className="flex-1 p-2 border border-gray-300 rounded bg-gray-50 text-sm"
                    />
                    <button
                      onClick={() => copyToClipboard(credentials.email)}
                      className="px-3 py-2 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
                    >
                      📋
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contraseña Temporal:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={credentials.temporaryPassword}
                      readOnly
                      className="flex-1 p-2 border border-gray-300 rounded bg-gray-50 text-sm font-mono"
                    />
                    <button
                      onClick={() => copyToClipboard(credentials.temporaryPassword)}
                      className="px-3 py-2 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
                    >
                      📋
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-3 text-xs text-yellow-700">
                ⚠️ Esta información solo se muestra en modo desarrollo
              </div>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-2">📧 Próximos Pasos:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• El empleado recibirá un email con sus credenciales</li>
              <li>• Debe cambiar la contraseña en el primer inicio de sesión</li>
              <li>• Las credenciales son válidas inmediatamente</li>
              <li>• Si no recibe el email, verificar la carpeta de spam</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-purple transition-colors"
          >
            Entendido
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CredentialsModal;