"use client";

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
      <span className="text-7xl font-extrabold font-montserrat bg-gradient-to-r from-[#b595ff] to-[#9be9ff] bg-clip-text text-transparent">
        {String(value ?? 0).padStart(2, "0")}
      </span>{" "}
      <span className="text-sm text-gray-500 font-semibold mt-2">{label}</span>
    </div>
  );
  const titleText = selectedEvent
    ? `Tiempo para: ${selectedEvent.title} (${selectedEvent.time})`
    : "No hay eventos";

  return (
    <div className="flex flex-col items-center justify-center mt-12 w-full max-w-lg">
      <p className="text-2xl font-bold font-montserrat text-gray-700 mb-6 text-center">
        {titleText}
      </p>

      <div className="flex items-center gap-8 mb-6">
        <TimeUnit value={timeLeft.days} label="DÍAS" />
        <span className="text-5xl font-light text-gray-300">:</span>
        <TimeUnit value={timeLeft.hours} label="HRS" />{" "}
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
