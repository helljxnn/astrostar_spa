import { useEffect, useMemo, useState } from "react";
import { FaCalendarAlt, FaEnvelope, FaIdCard, FaSearch, FaTimes, FaUser } from "react-icons/fa";
import { MdSports } from "react-icons/md";
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
    "Categoria deportiva",
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
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-6xl">
      <div className="flex flex-col">
        <div className="bg-gradient-to-r from-primary-purple to-primary-blue text-white p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-3 rounded-full">
                <MdSports size={28} />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Deportistas por categoria</h2>
                <p className="text-white/80 mt-1">{categoryData.nombre}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors p-2"
            >
              <FaTimes size={20} />
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-3 mt-4 text-sm">
            <span className={`px-3 py-1 rounded-full font-medium ${ageRangeClass}`}>
              {ageRangeLabel}
            </span>
            <span className="text-white/80">
              {normalizedAthletes.length}{" "}
              {normalizedAthletes.length === 1 ? "deportista" : "deportistas"}
            </span>
          </div>
        </div>

        <div className="border-b bg-white p-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre, documento, correo o categoria..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-purple focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {filteredAthletes.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <FaUser size={32} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                {searchTerm ? "No se encontraron resultados" : "No hay deportistas registrados"}
              </h3>
              <p className="text-gray-500">
                {searchTerm
                  ? "Intenta con otro termino de busqueda."
                  : `Aun no hay deportistas en la categoria "${categoryData.nombre}".`}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto border border-gray-200 rounded-xl">
              <table className="min-w-[900px] w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">Nombre</th>
                    <th className="px-4 py-3 text-left font-semibold">Tipo Doc</th>
                    <th className="px-4 py-3 text-left font-semibold">Documento</th>
                    <th className="px-4 py-3 text-left font-semibold">Edad</th>
                    <th className="px-4 py-3 text-left font-semibold">Correo</th>
                    <th className="px-4 py-3 text-left font-semibold">Categoria</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredAthletes.map((athlete) => (
                    <tr key={athlete.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <FaUser className="text-primary-blue w-4 h-4" />
                          <span className="font-medium text-gray-800">
                            {athlete.nombre || "N/A"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 text-gray-700">
                          <FaIdCard className="w-4 h-4 text-gray-500" />
                          <span>{athlete.tipoDocumento || "N/A"}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-gray-700">
                        {athlete.documento || "N/A"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 text-gray-700">
                          <FaCalendarAlt className="w-4 h-4 text-primary-purple" />
                          <span>
                            {Number.isFinite(athlete.edad) ? `${athlete.edad} años` : "N/A"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <FaEnvelope className="w-4 h-4 text-green-600" />
                          <span className="text-blue-600 hover:text-blue-800 truncate">
                            {athlete.email || "N/A"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
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

        <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t">
          <span className="text-sm text-gray-600">
            Mostrando {filteredAthletes.length} de {normalizedAthletes.length} deportistas
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-purple transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default AthletesListModal;
