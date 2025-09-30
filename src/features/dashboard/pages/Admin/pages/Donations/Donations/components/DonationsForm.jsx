

const DonationsFrom = () => {
  return (
    <div className="p-6 bg-gray-100 min-h-screen font-questrial">
      {/* 🔹 Título */}
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">
        Crear Donación
      </h1>

      {/* 🔹 Formulario */}
      <form className="bg-white shadow rounded-lg p-6 max-w-lg">
        {/* Campo de ejemplo */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">
            Nombre del Donante
          </label>
          <input
            type="text"
            placeholder="Escribe el nombre..."
            className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary-blue"
          />
        </div>

        {/* Botón */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 bg-primary-blue text-white rounded-lg shadow hover:bg-primary-purple transition-colors"
          >
            Guardar
          </button>
        </div>
      </form>
    </div>
  );
};

export default DonationsFrom;
