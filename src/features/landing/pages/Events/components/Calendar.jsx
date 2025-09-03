// src/pages/Events/components/Calendar.jsx
import { hookCalendar } from "../hooks/hookCalendar";

// Constants
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const DAY_NAMES = ['DO', 'LU', 'MA', 'MI', 'JU', 'VI', 'SA'];

const CalendarHeader = ({ currentDate, onPrevious, onNext }) => (
  <div className="flex items-center justify-between mb-6">
    <button 
      onClick={onPrevious}
      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
      aria-label="Mes anterior"
    >
      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
    </button>
    
    <h3 className="text-xl font-semibold text-gray-700 font-questrial">
      {MONTH_NAMES[currentDate.getMonth()]} {currentDate.getFullYear()}
    </h3>
    
    <button 
      onClick={onNext}
      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
      aria-label="Mes siguiente"
    >
      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </button>
  </div>
);

const CalendarDaysHeader = () => (
  <div className="grid grid-cols-7 gap-1 mb-2">
    {DAY_NAMES.map(day => (
      <div key={day} className="h-8 flex items-center justify-center text-sm font-semibold text-gray-500">
        {day}
      </div>
    ))}
  </div>
);

const CalendarDay = ({ day, isEventDay, onEventClick }) => (
  <div
    onClick={isEventDay ? onEventClick : undefined}
    className={`h-10 w-10 flex items-center justify-center text-sm relative ${
      isEventDay 
        ? "bg-[#B595FF] text-white rounded-md font-semibold cursor-pointer hover:bg-[#9d7fe6] transition-colors" 
        : "text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer"
    }`}
    role={isEventDay ? "button" : undefined}
    tabIndex={isEventDay ? 0 : undefined}
    onKeyDown={isEventDay ? (e) => e.key === 'Enter' && onEventClick() : undefined}
  >
    {day}
    {isEventDay && (
      <div className="absolute -bottom-1 text-xs text-white font-bold">
        {day === 19 ? "FEST" : "COPA"}
      </div>
    )}
  </div>
);

export const Calendar = ({ onEventClick }) => {
  const {
    currentDate,
    getDaysInMonth,
    getFirstDayOfMonth,
    previousMonth,
    nextMonth
  } = hookCalendar();

  const isEventDay = (day) => {
    // This logic should be dynamic based on actual event dates
    return day === 19 || day === 23;
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];
    
    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-10" />);
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const hasEvent = isEventDay(day);
      days.push(
        <CalendarDay
          key={day}
          day={day}
          isEventDay={hasEvent}
          onEventClick={onEventClick}
        />
      );
    }
    
    return days;
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg">
      <CalendarHeader
        currentDate={currentDate}
        onPrevious={previousMonth}
        onNext={nextMonth}
      />

      <CalendarDaysHeader />

      {/* Calendar Days */}
      <div className="grid grid-cols-7 gap-1">
        {renderCalendar()}
      </div>

      {/* Legend */}
      <div className="mt-4 text-xs text-gray-500 text-center">
        Haz click en los días marcados para ver los eventos
      </div>
    </div>
  );
};