import { useState, useEffect } from "react";
import { convertTo24Hour } from "../../../../../shared/utils/helpers/eventsHelper";
import {
  combineDateAndTime,
  getTimeRemaining,
} from "../../../../../shared/utils/helpers/dateHelpers";

export const CountdownTimer = ({ selectedEvent, selectedDate }) => {
  const initial = { days: 0, hours: 0, minutes: 0, seconds: 0, expired: false };
  const [timeLeft, setTimeLeft] = useState(initial);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!selectedEvent?.date || !selectedEvent?.time) {
      setTimeLeft(initial);
      setProgress(0);
      return;
    }

    const tick = () => {
      const targetTime = combineDateAndTime(
        selectedEvent.date,
        convertTo24Hour(selectedEvent.time)
      );
      const t = getTimeRemaining(targetTime);
      setTimeLeft(t);

      if (t.expired) {
        setProgress(100);
        return;
      }

      const diff = targetTime.getTime() - Date.now();
      const oneWeek = 7 * 24 * 60 * 60 * 1000;

      if (diff <= oneWeek) {
        setProgress(((oneWeek - diff) / oneWeek) * 100);
      } else {
        setProgress(5);
      }
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [selectedEvent]);

  const TimeUnit = ({ value, label }) => (
    <div className="flex flex-col items-center">
      <span className="text-2xl sm:text-3xl md:text-4xl font-extrabold font-montserrat bg-gradient-to-r from-[#b595ff] to-[#9be9ff] bg-clip-text text-transparent">
        {String(value ?? 0).padStart(2, "0")}
      </span>
      <span className="text-[10px] sm:text-xs md:text-sm text-gray-500 font-semibold mt-1 sm:mt-2">{label}</span>
    </div>
  );

  const titleText = selectedEvent
    ? `Tiempo para: ${selectedEvent.title} (${selectedEvent.time})`
    : "No hay eventos";

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-[16rem] sm:max-w-xs md:max-w-sm lg:max-w-md">
      <p className="text-base sm:text-lg md:text-xl font-bold font-montserrat text-gray-700 mb-3 sm:mb-4 md:mb-6 text-center px-2 sm:px-4">
        {titleText}
      </p>

      <div className="flex items-center gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-4 md:mb-6">
        <TimeUnit value={timeLeft.days} label="DÍAS" />
        <span className="text-xl sm:text-2xl md:text-3xl font-light text-gray-300">:</span>
        <TimeUnit value={timeLeft.hours} label="HRS" />
        <span className="text-xl sm:text-2xl md:text-3xl font-light text-gray-300">:</span>
        <TimeUnit value={timeLeft.minutes} label="MIN" />
        <span className="text-xl sm:text-2xl md:text-3xl font-light text-gray-300">:</span>
        <TimeUnit value={timeLeft.seconds} label="SEG" />
      </div>

      <div className="w-full bg-gray-200 rounded-full h-1 sm:h-1.5 md:h-2 overflow-hidden">
        <div
          className="h-1 sm:h-1.5 md:h-2 rounded-full bg-gradient-to-r from-[#b595ff] to-[#9be9ff] transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};