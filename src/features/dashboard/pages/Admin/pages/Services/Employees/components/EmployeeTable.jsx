import { FaEdit, FaTrash, FaEye } from "react-icons/fa";

export const EmployeesTable = ({ employees }) => {
  return (
    <div className="mt-8 bg-white shadow-lg rounded-2xl p-6">
      <h3 className="text-xl font-bold text-[#9BE9FF] mb-4">Lista de Empleados</h3>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-[#f3e8ff] text-[#6b21a8]">
            <th className="p-2 text-left">Nombre</th>
            <th className="p-2 text-left">Identificación</th>
            <th className="p-2 text-left">Tipo de empleado</th>
            <th className="p-2 text-left">Rol</th>
            <th className="p-2 text-left">Estado</th>
            <th className="p-2 text-left">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {employees.length === 0 ? (
            <tr>
              <td colSpan="6" className="p-3 text-center text-gray-500">
                No hay empleados registrados
              </td>
            </tr>
          ) : (
            employees.map((emp, index) => (
              <tr key={index} className="border-b hover:bg-gray-50">
                <td className="p-2">{emp.nombre}</td>
                <td className="p-2">{emp.identificacion}</td>
                <td className="p-2">{emp.tipoEmpleado}</td>
                <td className="p-2">{emp.rol}</td>
                <td
                  className={`p-2 font-medium ${
                    emp.estado === "Activo"
                      ? "text-blue-500"
                      : emp.estado === "Incapacitado"
                      ? "text-red-500"
                      : emp.estado === "Vacaciones"
                      ? "text-purple-500"
                      : emp.estado === "Retirado"
                      ? "text-gray-500"
                      : "text-black"
                  }`}
                >
                  {emp.estado}
                </td>
                <td className="p-2 flex gap-3">
                  <button className="text-blue-500 hover:text-blue-700">
                    <FaEdit />
                  </button>
                  <button className="text-red-500 hover:text-red-700">
                    <FaTrash />
                  </button>
                  <button className="text-purple-500 hover:text-purple-700">
                    <FaEye />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
