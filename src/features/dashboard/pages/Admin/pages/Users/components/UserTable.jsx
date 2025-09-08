// components/UserTable.jsx
import React from "react";

export const UserTable = ({ users }) => {
  return (
    <div className="mt-8 bg-white shadow-lg rounded-2xl p-6">
      <h3 className="text-xl font-bold text-[#9BE9FF] mb-4">Lista de Usuarios</h3>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-[#f3e8ff] text-[#6b21a8]">
            <th className="p-2 text-left">Nombre</th>
            <th className="p-2 text-left">Correo</th>
            <th className="p-2 text-left">Rol</th>
            <th className="p-2 text-left">Estado</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr>
              <td colSpan="4" className="p-3 text-center text-gray-500">
                No hay usuarios registrados
              </td>
            </tr>
          ) : (
            users.map((user, index) => (
              <tr key={index} className="border-b hover:bg-gray-50">
                <td className="p-2">{user.nombre}</td>
                <td className="p-2">{user.email}</td>
                <td className="p-2">{user.rol}</td>
                <td
                  className={`p-2 font-medium ${
                    user.estado === "Activo"
                      ? "text-blue-500"
                      : user.estado === "Inactivo"
                      ? "text-red-500"
                      : "text-black"
                  }`}
                >
                  {user.estado}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
