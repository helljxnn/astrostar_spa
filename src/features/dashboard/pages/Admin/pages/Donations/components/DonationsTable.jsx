import React from "react";

export default function DonationsTable({ donations }) {
  return (
    <table className="w-full border-collapse border">
      <thead>
        <tr className="bg-gray-100">
          <th className="border px-3 py-2 text-left">Donante</th>
          <th className="border px-3 py-2 text-left">Tipo</th>
          <th className="border px-3 py-2 text-left">Cantidad</th>
          <th className="border px-3 py-2 text-left">Fecha Donación</th>
          <th className="border px-3 py-2 text-left">Fecha Registro</th>
          <th className="border px-3 py-2 text-left">Extra</th>
        </tr>
      </thead>
      <tbody>
        {donations.length === 0 ? (
          <tr>
            <td colSpan="6" className="text-center py-4">
              No hay donaciones registradas.
            </td>
          </tr>
        ) : (
          donations.map((d, i) => (
            <tr key={i} className="border-t">
              <td className="border px-3 py-2">{d.donorName}</td>
              <td className="border px-3 py-2">{d.type}</td>
              <td className="border px-3 py-2">{d.quantity}</td>
              <td className="border px-3 py-2">{d.donationDate}</td>
              <td className="border px-3 py-2">{d.registerDate}</td>
              <td className="border px-3 py-2">{d.extraInfo}</td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}
