import AttendanceToggle from "./AttendanceToggle";

const AttendanceTable = ({
  paginatedData,
  startIndex,
  gradient,
  onAttendanceChange,
  onObservationChange,
  canEdit = true,
}) => (
  <div className="shadow-lg rounded-2xl bg-white flex flex-col border border-gray-200 overflow-hidden max-w-full">
    <div className="overflow-x-auto w-full scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
      <table className="w-full border-collapse text-sm font-monserrat text-left text-gray-700">
        <thead className="text-gray-700 text-sm uppercase tracking-wider bg-gradient-to-r from-primary-purple to-primary-blue">
          <tr>
            <th className="px-6 py-4 text-left font-semibold text-white">#</th>
            <th className="px-6 py-4 text-left font-semibold text-white">Nombre</th>
            <th className="px-6 py-4 text-left font-semibold text-white">Documento</th>
            <th className="px-6 py-4 text-center font-semibold text-white">Edad</th>
            <th className="px-6 py-4 text-center font-semibold text-white">Categoría</th>
            <th className="px-6 py-4 text-center font-semibold text-white w-40">
              Asistencia
            </th>
            <th className="px-6 py-4 text-left font-semibold text-white">
              Observación
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {paginatedData.map((a, idx) => (
            <tr
              key={a.id}
              className="bg-white hover:bg-primary-purple-light/30 transition-colors"
            >
              <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                {startIndex + idx + 1}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                {a.nombre}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">{a.documento}</td>
              <td className="px-6 py-4 text-center">{a.edad}</td>
              <td className="px-6 py-4 text-center">{a.categoria}</td>

              <td className="px-6 py-4 text-center">
                <div className="flex items-center justify-center">
                  <AttendanceToggle
                    checked={a.asistencia}
                    onChange={() => onAttendanceChange(a.id)}
                    gradient={gradient}
                    disabled={!canEdit}
                  />
                </div>
              </td>

              <td className="px-6 py-4">
                <textarea
                  value={a.observacion}
                  onChange={(e) => onObservationChange(a.id, e.target.value)}
                  placeholder="Observación..."
                  disabled={!canEdit}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 text-sm resize-none bg-gray-50"
                  rows="1"
                  style={{ minHeight: "34px", maxHeight: "60px" }}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>


  </div>
);

export default AttendanceTable;

