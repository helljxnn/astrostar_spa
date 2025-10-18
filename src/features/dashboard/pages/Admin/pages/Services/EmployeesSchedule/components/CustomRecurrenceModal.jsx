import { useState } from "react";
import { motion } from "framer-motion";

const diasSemana = [
  { value: 1, label: "L" },
  { value: 2, label: "M" },
  { value: 3, label: "M" },
  { value: 4, label: "J" },
  { value: 5, label: "V" },
  { value: 6, label: "S" },
  { value: 0, label: "D" },
];

export default function CustomRecurrenceModal({ onClose, onSave }) {
  const [interval, setInterval] = useState(1);
  const [frequency, setFrequency] = useState("semana");
  const [dias, setDias] = useState([]);
  const [endType, setEndType] = useState("nunca");
  const [endDate, setEndDate] = useState("");
  const [afterDate, setAfterDate] = useState("");

  const toggleDia = (value) => {
    setDias((prev) =>
      prev.includes(value) ? prev.filter((d) => d !== value) : [...prev, value]
    );
  };

  const handleSave = () => {
    const label = `Cada ${interval} ${frequency}${
      interval > 1 ? "s" : ""
    }${dias.length > 0 ? `, los ${dias.map((d) => diasSemana.find(x => x.value === d)?.label).join(", ")}` : ""}`;
    onSave({ interval, frequency, dias, endType, endDate, afterDate, label });
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 px-4">
      <motion.div
        initial={{ opacity: 0, y: -60 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -60 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-[20px] shadow-2xl p-8 w-full max-w-md relative"
      >
        {/* Título */}
        <h2 className="text-2xl font-semibold text-center text-[#9BE9FF] mb-8">
          Periodicidad personalizada
        </h2>

        {/* Repetir cada */}
        <div className="flex items-center gap-3 mb-6 justify-center">
          <label className="text-gray-700 text-sm font-medium">
            Repetir cada
          </label>
          <input
            type="number"
            min="1"
            value={interval}
            onChange={(e) => setInterval(Number(e.target.value))}
            className="w-16 border border-gray-300 rounded-lg px-2 py-1 text-center focus:ring-2 focus:ring-[#c8a9ff] outline-none"
          />
          <select
            value={frequency}
            onChange={(e) => setFrequency(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-[#c8a9ff] outline-none"
          >
            <option value="dia">Día</option>
            <option value="semana">Semana</option>
            <option value="mes">Mes</option>
            <option value="año">Año</option>
          </select>
        </div>

        {/* Se repite el */}
        <div className="mb-6">
          <p className="text-gray-700 text-sm font-medium text-center mb-3">
            Se repite el
          </p>
          <div className="flex justify-center gap-2">
            {diasSemana.map((dia) => (
              <button
                key={dia.value}
                onClick={() => toggleDia(dia.value)}
                className={`w-8 h-8 rounded-full border text-sm font-semibold transition ${
                  dias.includes(dia.value)
                    ? "bg-[#c8a9ff] text-white border-[#c8a9ff]"
                    : "border-gray-300 text-gray-600 hover:bg-gray-100"
                }`}
              >
                {dia.label}
              </button>
            ))}
          </div>
        </div>

        {/* Se termina */}
        <div className="mb-8">
          <p className="text-gray-700 text-sm font-medium mb-3">Se termina</p>

          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input
                type="radio"
                name="end"
                value="nunca"
                checked={endType === "nunca"}
                onChange={() => setEndType("nunca")}
              />
              Nunca
            </label>

            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input
                type="radio"
                name="end"
                value="el"
                checked={endType === "el"}
                onChange={() => setEndType("el")}
              />
              El
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                disabled={endType !== "el"}
                className={`ml-2 border rounded-lg px-2 py-1 text-sm ${
                  endType !== "el"
                    ? "bg-gray-100 cursor-not-allowed"
                    : "focus:ring-2 focus:ring-[#c8a9ff]"
                }`}
              />
            </label>

            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input
                type="radio"
                name="end"
                value="despues"
                checked={endType === "despues"}
                onChange={() => setEndType("despues")}
              />
              Después de
              <input
                type="date"
                value={afterDate}
                onChange={(e) => setAfterDate(e.target.value)}
                disabled={endType !== "despues"}
                className={`ml-2 border rounded-lg px-2 py-1 text-sm ${
                  endType !== "despues"
                    ? "bg-gray-100 cursor-not-allowed"
                    : "focus:ring-2 focus:ring-[#c8a9ff]"
                }`}
              />
            </label>
          </div>
        </div>

        {/* Botones */}
        <div className="flex justify-between mt-6">
          <button
            onClick={onClose}
            className="px-6 py-2 border-2 border-[#c8a9ff] text-[#c8a9ff] rounded-lg font-semibold hover:bg-[#f6f0ff] transition"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-[#c8a9ff] text-white rounded-lg font-semibold hover:bg-[#b896ff] transition"
          >
            Crear
          </button>
        </div>
      </motion.div>
    </div>
  );
}
