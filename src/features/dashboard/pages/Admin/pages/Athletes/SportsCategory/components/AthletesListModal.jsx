import { useEffect, useMemo, useState } from "react";
import { FaCalendarAlt, FaEnvelope, FaIdCard, FaSearch, FaTimes, FaUser } from "react-icons/fa";
import { Modal } from "../../../../../../../../shared/components/Modal";

const getFirstValue = (...values) => {
  for (const value of values) {
    if (value === undefined || value === null) continue;
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (!trimmed) continue;
      return trimmed;
    }
    return value;
  }
  return "";
};

const calculateAge = (birthDate) => {
  if (!birthDate) return null;
  const birth = new Date(birthDate);
  if (Number.isNaN(birth.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

const normalizeCategory = (category) => {
  const nombre = getFirstValue(
    category?.nombre,
    category?.name,
    category?.Nombre,
    "Categoría deportiva",
  );
  const minAgeRaw = getFirstValue(category?.edadMinima, category?.minAge, category?.EdadMinima);
  const maxAgeRaw = getFirstValue(category?.edadMaxima, category?.maxAge, category?.EdadMaxima);
  const minAge = Number(minAgeRaw);
  const maxAge = Number(maxAgeRaw);

  return {
    nombre,
    edadMinima: Number.isFinite(minAge) ? minAge : null,
    edadMaxima: Number.isFinite(maxAge) ? maxAge : null,
  };
};

const normalizeAthlete = (athlete, fallbackCategory) => {
  const user = athlete?.user || athlete?.usuario || {};
  const nameFromParts = [
    athlete?.nombre,
    athlete?.apellido,
    user?.firstName,
    user?.middleName,
    user?.lastName,
    user?.secondLastName,
  ]
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

  const name = nameFromParts || getFirstValue(athlete?.name, athlete?.fullName, "Sin nombre");
  const email = getFirstValue(athlete?.email, user?.email);
  const document = getFirstValue(
    athlete?.documento,
    athlete?.identificacion,
    athlete?.identification,
    user?.identification,
  );
  const docType = getFirstValue(
    athlete?.tipoDocumento,
    athlete?.documentType,
    user?.documentType?.name,
    user?.documentTypeName,
  );
  const ageRaw = getFirstValue(athlete?.edad, athlete?.age, user?.age);
  const birthDate = getFirstValue(
    athlete?.fechaNacimiento,
    athlete?.birthDate,
    user?.birthDate,
  );
  const ageValue = Number.isFinite(Number(ageRaw)) ? Number(ageRaw) : calculateAge(birthDate);
  const categoryName = getFirstValue(
    athlete?.categoria,
    athlete?.category,
    athlete?.sportsCategory?.nombre,
    fallbackCategory,
  );

  return {
    id: athlete?.id ?? athlete?.athleteId ?? athlete?.userId ?? document ?? name,
    nombre: name,
    email: email || "",
    documento: document || "",
    tipoDocumento: docType || "",
    edad: ageValue,
    categoria: categoryName || "",
  };
};

const AthletesListModal = ({ isOpen, onClose, category, athletes = [] }) => {
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!isOpen) setSearchTerm("");
  }, [isOpen]);

  if (!isOpen || !category) return null;

  const categoryData = normalizeCategory(category);
  const ageRangeClass = (() => {
    const min = categoryData.edadMinima;
    if (!Number.isFinite(min)) return "bg-gray-100 text-gray-700";
    if (min <= 12) return "bg-emerald-100 text-emerald-800";
    if (min <= 17) return "bg-blue-100 text-blue-800";
    if (min <= 35) return "bg-purple-100 text-purple-800";
    return "bg-orange-100 text-orange-800";
  })();

  const ageRangeLabel =
    categoryData.edadMinima !== null && categoryData.edadMaxima !== null
      ? `${categoryData.edadMinima} - ${categoryData.edadMaxima} años`
      : "Rango de edad no definido";

  const normalizedAthletes = useMemo(
    () => athletes.map((athlete) => normalizeAthlete(athlete, categoryData.nombre)),
    [athletes, categoryData.nombre],
  );

  const filteredAthletes = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return normalizedAthletes;
    return normalizedAthletes.filter((athlete) => {
      const matchesName = String(athlete.nombre || "").toLowerCase().includes(term);
      const matchesDoc = String(athlete.documento || "").toLowerCase().includes(term);
      const matchesEmail = String(athlete.email || "").toLowerCase().includes(term);
      const matchesCategory = String(athlete.categoria || "").toLowerCase().includes(term);
      return matchesName || matchesDoc || matchesEmail || matchesCategory;
    });
  }, [normalizedAthletes, searchTerm]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-5xl">
      <div className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-2xl max-h-[90vh]">
        <div className="flex-shrink-0 bg-white border-b border-gray-200 p-4 relative">
          <button
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-full"
            onClick={onClose}
            type="button"
            aria-label="Cerrar"
          >
            <FaTimes size={16} />
          </button>
          <h2 className="text-xl font-bold bg-gradient-to-r from-primary-purple to-primary-blue bg-clip-text text-transparent text-center">
            Deportistas por categoría
          </h2>
          <p className="text-center text-gray-600 mt-1 text-sm">{categoryData.nombre}</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-white border border-gray-200 rounded-xl p-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Rango de edad
              </p>
              <div className="mt-2">
                <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${ageRangeClass}`}>
                  {ageRangeLabel}
                </span>
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Total deportistas
              </p>
              <p className="mt-2 text-sm font-semibold text-gray-800">
                {normalizedAthletes.length}{" "}
                {normalizedAthletes.length === 1 ? "deportista" : "deportistas"}
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Coincidencias
              </p>
              <p className="mt-2 text-sm font-semibold text-gray-800">
                {filteredAthletes.length} de {normalizedAthletes.length}
              </p>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Buscar
            </label>
            <div className="relative mt-2">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nombre, documento, correo o categoría..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-primary-purple focus:border-transparent"
              />
            </div>
          </div>

          {filteredAthletes.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center shadow-sm">
              <div className="bg-gray-100 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <FaUser size={28} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                {searchTerm ? "No se encontraron resultados" : "No hay deportistas registrados"}
              </h3>
              <p className="text-gray-500">
                {searchTerm
                  ? "Intenta con otro término de búsqueda."
                  : `Aún no hay deportistas en la categoría "${categoryData.nombre}".`}
              </p>
            </div>
          ) : (
            <div className="border border-gray-200 rounded-2xl bg-white shadow-sm overflow-hidden">
              <table className="w-full text-sm table-fixed">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="px-3 py-2.5 text-left font-semibold w-[24%]">Nombre</th>
                    <th className="px-3 py-2.5 text-left font-semibold w-[16%] hidden lg:table-cell">
                      Tipo doc
                    </th>
                    <th className="px-3 py-2.5 text-left font-semibold w-[16%] hidden md:table-cell">
                      Documento
                    </th>
                    <th className="px-3 py-2.5 text-left font-semibold w-[10%]">Edad</th>
                    <th className="px-3 py-2.5 text-left font-semibold w-[22%]">Correo</th>
                    <th className="px-3 py-2.5 text-left font-semibold w-[12%]">Categoría</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredAthletes.map((athlete, index) => (
                    <tr
                      key={athlete.id ?? index}
                      className="odd:bg-white even:bg-slate-50/50 hover:bg-slate-100 transition-colors"
                    >
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <FaUser className="text-primary-blue w-4 h-4" />
                          <span className="font-medium text-gray-800 truncate">
                            {athlete.nombre || "N/A"}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 hidden lg:table-cell">
                        <div className="flex items-center gap-2 text-gray-700 min-w-0">
                          <FaIdCard className="w-4 h-4 text-gray-500" />
                          <span className="truncate">{athlete.tipoDocumento || "N/A"}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 font-mono text-gray-700 hidden md:table-cell truncate">
                        {athlete.documento || "N/A"}
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2 text-gray-700">
                          <FaCalendarAlt className="w-4 h-4 text-primary-purple" />
                          <span>
                            {Number.isFinite(athlete.edad) ? `${athlete.edad} años` : "N/A"}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <FaEnvelope className="w-4 h-4 text-green-600" />
                          <span className="text-blue-600 hover:text-blue-800 truncate">
                            {athlete.email || "N/A"}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-2.5">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${ageRangeClass}`}>
                          {athlete.categoria || "N/A"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
          <span className="text-sm text-gray-600">
            Mostrando {filteredAthletes.length} de {normalizedAthletes.length} deportistas
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-purple transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default AthletesListModal;
