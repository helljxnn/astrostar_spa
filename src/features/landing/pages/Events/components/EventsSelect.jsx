// src/pages/Events/components/EventsSelect.jsx

export const EventsSelect = ({ eventTypes, selectedType, onTypeChange }) => (
  <div className="flex justify-center mb-12">
    <div className="bg-white rounded-full p-2 shadow-lg">
      <div className="flex gap-2">
        {eventTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => onTypeChange(type.id)}
            className={`px-6 py-3 rounded-full transition-all duration-300 font-semibold text-sm ${
              selectedType === type.id
                ? "bg-gradient-to-r from-[#B595FF] to-[#9BE9FF] text-white shadow-md"
                : "text-gray-600 hover:bg-gray-100"
            }`}
            aria-pressed={selectedType === type.id}
          >
            <span className="mr-2" aria-hidden="true">{type.icon}</span>
            {type.label}
          </button>
        ))}
      </div>
    </div>
  </div>
);