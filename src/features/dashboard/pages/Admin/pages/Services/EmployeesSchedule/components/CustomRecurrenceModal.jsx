import { useState } from "react";
import { motion } from "framer-motion";

const diasSemana = [
  { value: 0, label: "Domingo" },
  { value: 1, label: "Lunes" },
  { value: 2, label: "Martes" },
  { value: 3, label: "Miércoles" },
  { value: 4, label: "Jueves" },
  { value: 5, label: "Viernes" },
  { value: 6, label: "Sábado" },
];

export default function CustomRecurrenceModal({ isOpen, onClose, onSave }) {
  const [frequency, setFrequency] = useState("semana"); // día, semana, mes, año
  const [interval, setInterval] = useState(1);
  const [repeticiones, setRepeticiones] = useState(10);
  const [dias, setDias] = useState([]); // solo si es personalizado

  if (!isOpen) return null;

  const toggleDia = (value) => {
    setDias((prev) =>
      prev.includes(value) ? prev.filter((d) => d !== value) : [...prev, value]
    );
  };

  const handleSave = () => {
    onSave({
      repeticion: dias.length > 0 ? "personalizado" : frequency,
      dias,
      repeticiones,
      intervalo: interval,
      label:
        dias.length > 0
          ? `Personalizado: ${dias
              .map((d) => diasSemana.find((x) => x.value === d)?.label)
              .join(", ")}`
          : `Cada ${interval} ${frequency}${interval > 1 ? "s" : ""}`,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <motion.div
        initial={{ opacity: 0, y: -60 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -60 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md"
      >
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Personalizar repetición
        </h2>

        <div className="space-y-4">
          {/* 🔹 Frecuencia */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Frecuencia
            </label>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
            >
              <option value="dia">Día</option>
              <option value="semana">Semana</option>
              <option value="mes">Mes</option>
              <option value="anio">Año</option>
              <option value="personalizado">Personalizado</option>
            </select>
          </div>

          {/* 🔹 Intervalo */}
          {frequency !== "personalizado" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cada cuántos {frequency}s
              </label>
              <input
                type="number"
                min="1"
                value={interval}
                onChange={(e) => setInterval(Number(e.target.value))}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
              />
            </div>
          )}

          {/* 🔹 Días específicos si es personalizado */}
          {frequency === "personalizado" && (
            <div>
              <p className="font-medium mb-2">Selecciona los días:</p>
              <div className="grid grid-cols-2 gap-2">
                {diasSemana.map((dia) => (
                  <label
                    key={dia.value}
                    className="flex items-center gap-2 text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={dias.includes(dia.value)}
                      onChange={() => toggleDia(dia.value)}
                    />
                    {dia.label}
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* 🔹 Número de repeticiones */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Número de repeticiones
            </label>
            <input
              type="number"
              min="1"
              value={repeticiones}
              onChange={(e) => setRepeticiones(Number(e.target.value))}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
            />
          </div>
        </div>

        {/* Botones */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-600 transition"
          >
            Guardar
          </button>
        </div>
      </motion.div>
    </div>
  );
}
