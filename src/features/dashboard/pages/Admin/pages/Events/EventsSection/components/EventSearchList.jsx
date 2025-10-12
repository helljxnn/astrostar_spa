import React from 'react';

const EventSearchList = ({ events, onEdit, onDelete }) => {
  if (!events || events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow">
        <p className="text-gray-500 text-lg">No se encontraron eventos</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="grid gap-4 p-4">
        {events.map((event, index) => (
          <div 
            key={event.id || index} 
            className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-800 truncate">{event.nombre}</h3>
              <div className="mt-1 flex flex-wrap gap-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {event.tipo}
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  {new Date(event.fechaInicio).toLocaleDateString()}
                </span>
                {/* Estado del evento con colores según su valor */}
                {event.estado === "programado" && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                    Programado
                  </span>
                )}
                {event.estado === "en-curso" && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                    En curso
                  </span>
                )}
                {event.estado === "finalizado" && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                    Finalizado
                  </span>
                )}
                {event.estado === "cancelado" && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                    Cancelado
                  </span>
                )}
                {event.estado === "en-pausa" && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                    En pausa
                  </span>
                )}
                {!["programado", "en-curso", "finalizado", "cancelado", "en-pausa"].includes(event.estado) && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                    {event.estado}
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-gray-600 line-clamp-2">{event.descripcion}</p>
            </div>
            
            <div className="flex space-x-2 mt-3 sm:mt-0">
              <button
                onClick={() => onEdit(event)}
                className="px-3 py-1 bg-gradient-to-r from-primary-purple to-primary-blue text-white rounded-lg text-sm font-medium shadow-sm"
                title="Gestionar evento"
              >
                Gestionar
              </button>
              <button
                onClick={() => onDelete(event)}
                className="px-3 py-1 bg-gradient-to-r from-primary-purple to-primary-blue text-white rounded-lg text-sm font-medium shadow-sm"
                title="Inscribir a evento"
              >
                Inscribir
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventSearchList;