"use client";

import { useState, useEffect } from "react";
import { calculateTimeRemaining, convertTo24Hour } from "../../../../../shared/utils/helpers/eventsHelper";
import { combineDateAndTime } from "../../../../../shared/utils/helpers/dateHelpers";

export const CountdownTimer = ({ selectedEvent }) => {
  const [timeLeft, setTimeLeft] = useState(
    calculateTimeRemaining(selectedEvent?.date, selectedEvent?.time)
  );
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!selectedEvent?.date || !selectedEvent?.time) return;

    const tick = () => {
      const t = calculateTimeRemaining(selectedEvent.date, selectedEvent.time);
      setTimeLeft(t);

      if (t.isExpired) {
        setProgress(100);
        return;
      }

      // Usar formato 24h para los cálculos internos
      const time24 = convertTo24Hour(selectedEvent.time);
      const targetTime = combineDateAndTime(selectedEvent.date, time24).getTime();
      const nowTime = Date.now();
      const diff = targetTime - nowTime;
      const oneWeek = 7 * 24 * 60 * 60 * 1000;

      if (diff <= 0) {
        setProgress(100);
      } else if (diff <= oneWeek) {
        setProgress(((oneWeek - diff) / oneWeek) * 100);
      } else {
        setProgress(5);
      }
    };

    tick(); // Disparo inicial
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [selectedEvent]);

  const TimeUnit = ({ value, label }) => (
    <div className="flex flex-col items-center">
      <span className="text-7xl font-extrabold font-montserrat bg-gradient-to-r from-[#b595ff] to-[#9be9ff] bg-clip-text text-transparent">
        {Number(value ?? 0).toString().padStart(2, "0")}
      </span>
      <span className="text-sm text-gray-500 font-semibold mt-2">{label}</span>
    </div>
  );

  if (!selectedEvent) {
    return (
      <div className="flex flex-col items-center justify-center mt-12 w-full max-w-lg">
        <p className="text-2xl font-bold font-montserrat text-gray-500 mb-6 text-center">
          No hay eventos disponibles
        </p>
      </div>
    );
  }

  // Usar directamente el tiempo del evento (ya está en formato 12h)
  const titleText = `Tiempo para: ${selectedEvent.title} (${selectedEvent.time})`;

  return (
    <div className="flex flex-col items-center justify-center mt-12 w-full max-w-lg">
      <p className="text-2xl font-bold font-montserrat text-gray-700 mb-6 text-center">
        {titleText}
      </p>

      <div className="flex items-center gap-8 mb-6">
        <TimeUnit value={timeLeft.days} label="DÍAS" />
        <span className="text-5xl font-light text-gray-300">:</span>
        <TimeUnit value={timeLeft.hours} label="HRS" />
        <span className="text-5xl font-light text-gray-300">:</span>
        <TimeUnit value={timeLeft.minutes} label="MIN" />
        <span className="text-5xl font-light text-gray-300">:</span>
        <TimeUnit value={timeLeft.seconds} label="SEG" />
      </div>

      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className="h-2 rounded-full bg-gradient-to-r from-[#b595ff] to-[#9be9ff] transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};