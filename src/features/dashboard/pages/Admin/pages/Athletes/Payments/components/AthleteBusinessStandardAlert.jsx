import { FaInfoCircle, FaExclamationTriangle } from "react-icons/fa";

/**
 * Componente de alerta para atletas sobre el Sistema de Mora Empresarial Estándar
 * Explica las reglas de manera clara y amigable
 */
const AthleteBusinessStandardAlert = ({ className = "" }) => {
  return (
    <div className={`bg-amber-50 border border-amber-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <FaInfoCircle className="w-5 h-5 text-amber-600 mt-0.5" />
        </div>
        
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-amber-900 mb-2">
            📋 Información Importante sobre Mora
          </h4>
          
          <div className="space-y-2 text-sm text-amber-800">
            <p>
              <strong>¿Cómo se calcula la mora?</strong> La mora se cuenta desde la fecha de vencimiento hasta que tu pago sea aprobado, sin importar cuándo subas el comprobante.
            </p>
            
            <p>
              <strong>Tarifa:</strong> $2,000 pesos por cada día de retraso.
            </p>
            
            <div className="flex items-start gap-2 mt-3">
              <FaExclamationTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Recomendación:</p>
                <p>Sube comprobantes claros y legibles desde la primera vez para evitar rechazos que aumenten la mora.</p>
              </div>
            </div>
          </div>

          {/* Ejemplo Visual */}
          <div className="mt-4 p-3 bg-white rounded border border-amber-200">
            <p className="text-xs font-medium text-amber-900 mb-2">Ejemplo:</p>
            <div className="text-xs text-amber-700 space-y-1">
              <p>• Vencimiento: 5 de marzo</p>
              <p>• Subes comprobante: 10 de marzo</p>
              <p>• Se rechaza por borroso: 15 de marzo</p>
              <p>• Resubes comprobante: 20 de marzo</p>
              <p>• Se aprueba: 22 de marzo</p>
              <p className="font-medium text-red-700">• Mora total: 17 días = $34,000</p>
            </div>
          </div>

          {/* Consejos */}
          <div className="mt-3 text-xs text-amber-700">
            <p className="font-medium mb-1">💡 Consejos para evitar rechazos:</p>
            <ul className="list-disc list-inside space-y-0.5 ml-2">
              <li>Toma fotos con buena iluminación</li>
              <li>Asegúrate de que todos los datos sean visibles</li>
              <li>Usa formato JPG, PNG o PDF</li>
              <li>Máximo 5MB de tamaño</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AthleteBusinessStandardAlert;
