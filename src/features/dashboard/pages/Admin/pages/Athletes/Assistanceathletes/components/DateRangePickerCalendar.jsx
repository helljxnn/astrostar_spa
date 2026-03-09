import { useState, useRef, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./DateRangePickerCalendar.css";
import { FaCalendarAlt } from "react-icons/fa";

const DateRangePickerCalendar = ({ startDate, endDate, onStartDateChange, onEndDateChange, className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Convertir formato YYYY-MM-DD a Date
  const parseISODate = (isoString) => {
    if (!isoString) return null;
    const date = new Date(isoString + 'T00:00:00');
    return isNaN(date.getTime()) ? null : date;
  };

  // Convertir Date a formato YYYY-MM-DD
  const toISOString = (date) => {
    if (!date) return "";
    const d = new Date(date);
    if (isNaN(d.getTime())) return "";
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Formatear para mostrar DD/MM/YYYY
  const formatDisplay = (isoString) => {
    if (!isoString) return "";
    const date = parseISODate(isoString);
    if (!date) return "";
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleStartDateChange = (date) => {
    if (date) {
      onStartDateChange(toISOString(date));
    } else {
      onStartDateChange("");
    }
  };

  const handleEndDateChange = (date) => {
    if (date) {
      onEndDateChange(toISOString(date));
    } else {
      onEndDateChange("");
    }
  };

  const displayText = () => {
    const start = formatDisplay(startDate);
    const end = formatDisplay(endDate);
    
    if (start && end) {
      return `${start} - ${end}`;
    } else if (start) {
      return `Desde ${start}`;
    } else if (end) {
      return `Hasta ${end}`;
    }
    return "Seleccionar rango de fechas";
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white text-left flex items-center justify-between hover:bg-gray-50 transition-colors text-sm"
      >
        <span className={`${!startDate && !endDate ? 'text-gray-400' : 'text-gray-700'}`}>
          {displayText()}
        </span>
        <FaCalendarAlt className="text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 bg-white border border-gray-300 rounded-lg shadow-xl p-4 date-range-calendar-dropdown left-0">
          <div className="flex gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">
                Fecha Desde
              </label>
              <DatePicker
                selected={parseISODate(startDate)}
                onChange={handleStartDateChange}
                selectsStart
                startDate={parseISODate(startDate)}
                endDate={parseISODate(endDate)}
                maxDate={parseISODate(endDate) || new Date()}
                dateFormat="dd/MM/yyyy"
                inline
                locale="es"
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">
                Fecha Hasta
              </label>
              <DatePicker
                selected={parseISODate(endDate)}
                onChange={handleEndDateChange}
                selectsEnd
                startDate={parseISODate(startDate)}
                endDate={parseISODate(endDate)}
                minDate={parseISODate(startDate)}
                maxDate={new Date()}
                dateFormat="dd/MM/yyyy"
                inline
                locale="es"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-3 mt-3 border-t">
            <button
              type="button"
              onClick={() => {
                const today = new Date().toISOString().split('T')[0];
                onStartDateChange(today);
                onEndDateChange(today);
              }}
              className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
            >
              Hoy
            </button>
            <button
              type="button"
              onClick={() => {
                onStartDateChange("");
                onEndDateChange("");
                setIsOpen(false);
              }}
              className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
            >
              Limpiar
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="flex-1 px-3 py-2 bg-primary-purple text-white rounded-lg hover:bg-primary-blue transition-colors text-sm font-medium"
            >
              Aplicar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateRangePickerCalendar;
