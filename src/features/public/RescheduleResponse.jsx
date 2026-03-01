import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import apiClient from '../../shared/services/apiClient';

const RescheduleResponse = () => {
  const { token, action } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const processResponse = async () => {
      try {
        const endpoint = action === 'accept' 
          ? `/appointments/reschedule/${token}/accept`
          : `/appointments/reschedule/${token}/reject`;

        const response = await apiClient.get(endpoint);

        if (response.success) {
          setSuccess(true);
          setMessage(response.message || `Cita ${action === 'accept' ? 'aceptada' : 'rechazada'} exitosamente`);
        } else {
          setSuccess(false);
          setMessage(response.message || 'Hubo un error al procesar tu respuesta');
        }
      } catch (error) {
        setSuccess(false);
        setMessage(error.message || 'Hubo un error al procesar tu respuesta');
      } finally {
        setLoading(false);
      }
    };

    if (token && action) {
      processResponse();
    }
  }, [token, action]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="text-center">
          <Loader2 className="h-16 w-16 text-primary-purple animate-spin mx-auto mb-4" />
          <p className="text-lg text-gray-600">Procesando tu respuesta...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
        {success ? (
          <>
            <div className="flex justify-center mb-6">
              <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="h-12 w-12 text-green-600" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {action === 'accept' ? '¡Cita Confirmada!' : 'Respuesta Registrada'}
            </h1>
            <p className="text-gray-600 mb-8">{message}</p>
            {action === 'accept' && (
              <p className="text-sm text-gray-500 mb-6">
                Recibirás un recordatorio antes de tu cita. ¡Nos vemos pronto!
              </p>
            )}
          </>
        ) : (
          <>
            <div className="flex justify-center mb-6">
              <div className="h-20 w-20 rounded-full bg-red-100 flex items-center justify-center">
                <XCircle className="h-12 w-12 text-red-600" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Error al Procesar
            </h1>
            <p className="text-gray-600 mb-8">{message}</p>
            <p className="text-sm text-gray-500 mb-6">
              Si el problema persiste, por favor contacta con nosotros.
            </p>
          </>
        )}
        
        <button
          onClick={() => navigate('/login')}
          className="w-full px-6 py-3 bg-primary-purple text-white rounded-lg font-semibold hover:bg-[#9d7bff] transition-colors"
        >
          Ir al Portal
        </button>
      </div>
    </div>
  );
};

export default RescheduleResponse;
