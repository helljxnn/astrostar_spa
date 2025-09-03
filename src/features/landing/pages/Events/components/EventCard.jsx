// src/pages/Events/components/EventCard.jsx

export const EventCard = ({ event, isPast = false, onEventClick }) => (
  <div 
    className={`w-full bg-gradient-to-br from-[#B595FF] to-[#9BE9FF] rounded-3xl shadow-2xl overflow-hidden transform hover:scale-[1.01] transition-all duration-300 ${
      isPast ? 'opacity-80' : ''
    }`}
  >
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 min-h-[500px] max-w-[85rem] mx-auto">
      
      {/* Main Image Section - Left (2/3 width on large screens) */}
      <div className="lg:col-span-2 relative bg-gray-200 flex items-center justify-center">
        {event.image ? (
          <img 
            src={event.image} 
            alt={event.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        {/* Fallback when image fails to load or doesn't exist */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center text-gray-600" style={{ display: event.image ? 'none' : 'flex' }}>
          <div className="text-center">
            <div className="text-8xl mb-4">🏆</div>
            <p className="text-2xl font-semibold">Imagen Principal del Evento</p>
            <p className="text-lg mt-2 opacity-75">Se cargará desde la administración</p>
          </div>
        </div>
        {isPast && (
          <div className="absolute top-6 right-6 bg-gray-800 bg-opacity-80 text-white px-4 py-2 rounded-full text-lg font-semibold">
            Finalizado
          </div>
        )}
        {event.hashtag && (
          <div className="absolute top-6 left-6 bg-white bg-opacity-90 text-[#B595FF] px-4 py-2 rounded-full text-lg font-bold">
            {event.hashtag}
          </div>
        )}
      </div>

      {/* Right Side - Two stacked sections */}
      <div className="flex flex-col">
        
        {/* Top Right - Secondary Image */}
        <div className="flex-1 bg-gray-100 relative flex items-center justify-center min-h-[250px]">
          {event.secondaryImage ? (
            <img 
              src={event.secondaryImage} 
              alt={`${event.title} - imagen secundaria`}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          {/* Fallback for secondary image */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-gray-500" style={{ display: event.secondaryImage ? 'none' : 'flex' }}>
            <div className="text-center p-4">
              <div className="text-4xl mb-2">📸</div>
              <p className="text-sm font-semibold">Imagen Secundaria</p>
              <p className="text-xs mt-1 opacity-75">Administrable</p>
            </div>
          </div>
        </div>

        {/* Bottom Right - Event Information */}
        <div className="flex-1 bg-white bg-opacity-95 p-8 flex flex-col justify-center min-h-[250px]">
          <h3 className="text-2xl font-bold mb-4 font-questrial text-gray-800 leading-tight">{event.title}</h3>
          
          <div className="space-y-3 mb-6">
            <div className="flex items-center text-gray-700">
              <span className="mr-3 text-lg">📅</span>
              <span className="font-questrial font-semibold">{event.date}</span>
            </div>
            <div className="flex items-center text-gray-700">
              <span className="mr-3 text-lg">🕐</span>
              <span className="font-questrial">{event.time}</span>
            </div>
            <div className="flex items-center text-gray-700">
              <span className="mr-3 text-lg">📍</span>
              <span className="font-questrial">{event.location}</span>
            </div>
            {event.contact && (
              <div className="flex items-center text-gray-700">
                <span className="mr-3 text-lg">📞</span>
                <span className="font-questrial text-sm">{event.contact}</span>
              </div>
            )}
          </div>
          
          <p className="text-gray-600 leading-relaxed font-questrial mb-6 flex-grow">
            {event.description}
          </p>
          
          {!isPast && (
            <div className="flex justify-end">
              <button 
                onClick={() => onEventClick?.(event)}
                className="bg-gradient-to-r from-[#B595FF] to-[#9BE9FF] text-white py-3 px-8 rounded-full font-bold hover:shadow-xl transition-all duration-300 text-lg flex items-center gap-2 group"
              >
                Ver Evento
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
);