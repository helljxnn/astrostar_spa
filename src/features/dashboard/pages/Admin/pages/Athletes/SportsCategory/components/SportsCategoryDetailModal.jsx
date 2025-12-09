import React from "react";
import { motion } from "framer-motion";

const getFieldValue = (...values) => {
  for (const val of values) {
    if (val === undefined || val === null) continue;
    const str = String(val).trim();
    if (str !== "") return val;
  }
  return "No especificado";
};

const formatDateValue = (value) => {
  if (!value) return "No especificado";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return typeof value === "string" ? value : "No especificado";
  }
  return date.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const isImageFile = (file) => {
  if (!file) return false;
  if (typeof file === "object" && file.type?.startsWith("image/")) return true;
  if (typeof file === "string") {
    const lower = file.toLowerCase();
    return (
      lower.endsWith(".jpg") ||
      lower.endsWith(".jpeg") ||
      lower.endsWith(".png") ||
      lower.endsWith(".gif") ||
      lower.endsWith(".webp")
    );
  }
  return false;
};

const ReadOnlyField = ({ label, value }) => (
  <div className="space-y-1">
    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</p>
    <div className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-800 min-h-[46px] flex items-center">
      {value || "No especificado"}
    </div>
  </div>
);

const SportsCategoryDetailModal = ({ isOpen, onClose, category }) => {
  if (!isOpen || !category) return null;

  const archivo =
    category.Archivo ||
    category.archivo ||
    category.file ||
    category.imageUrl ||
    category.image ||
    category.filePath;

  const archivoNombre =
    typeof archivo === "object"
      ? archivo.name
      : (archivo || "").toString().split("/").pop() || "Sin nombre";

  const nombre = getFieldValue(category.Nombre, category.nombre, category.name);
  const edadMinima = getFieldValue(category.EdadMinima, category.edadMinima, category.minAge);
  const edadMaxima = getFieldValue(category.EdadMaxima, category.edadMaxima, category.maxAge);
  const estado = getFieldValue(category.Estado, category.estado, category.status);
  const descripcion = getFieldValue(
    category.Descripcion,
    category.descripcion,
    category.description,
    "No hay descripcion disponible"
  );
  const publicar = category.Publicar ?? category.publicar ?? category.publish ?? false;

  const createdAtRaw =
    category.createdAt ??
    category.created_at ??
    category.creationDate ??
    category.fechaCreacion ??
    category.FechaCreacion ??
    null;
  const updatedAtRaw =
    category.updatedAt ??
    category.updated_at ??
    category.updateDate ??
    category.fechaActualizacion ??
    category.FechaActualizacion ??
    null;
  const statusAssignedAtRaw =
    category.statusAssignedAt ??
    category.status_assigned_at ??
    category.estadoAsignadoFecha ??
    category.estadoFecha ??
    category.estadoFechaAsignacion ??
    category.statusDate ??
    category.statusAssignedDate ??
    null;
  const publishedAtRaw =
    category.publishedAt ??
    category.published_at ??
    category.publishDate ??
    category.fechaPublicacion ??
    category.publicacionFecha ??
    null;

  const formattedCreatedAt = formatDateValue(createdAtRaw);
  const formattedUpdatedAt = formatDateValue(updatedAtRaw);
  const formattedStatusAssignedAt = formatDateValue(statusAssignedAtRaw || updatedAtRaw || createdAtRaw);
  const formattedPublishedAt = formatDateValue(publishedAtRaw || updatedAtRaw || createdAtRaw);

  const estadoLower = typeof estado === "string" ? estado.toLowerCase() : "";
  const estadoClass =
    estadoLower === "activo" || estadoLower === "active"
      ? "bg-green-100 text-green-800"
      : estadoLower === "inactivo" || estadoLower === "inactive"
      ? "bg-red-100 text-red-800"
      : "bg-gray-100 text-gray-700";
  const estadoDot =
    estadoLower === "activo" || estadoLower === "active"
      ? "bg-green-500"
      : estadoLower === "inactivo" || estadoLower === "inactive"
      ? "bg-red-500"
      : "bg-gray-400";

  const publishClass = publicar ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800";
  const publishDot = publicar ? "bg-green-500" : "bg-yellow-500";

  const edadMinimaLabel =
    edadMinima === "No especificado" ? edadMinima : `${edadMinima} anos`;
  const edadMaximaLabel =
    edadMaxima === "No especificado" ? edadMaxima : `${edadMaxima} anos`;

  return (
    <motion.div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      style={{ zIndex: 9999 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden relative flex flex-col"
        initial={{ scale: 0.9, opacity: 0, y: 40 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 40 }}
        transition={{ type: "spring", damping: 24, stiffness: 260 }}
      >
        <div className="flex-shrink-0 bg-white rounded-t-2xl border-b border-gray-200 p-4 relative">
          <button
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-full"
            onClick={onClose}
            type="button"
          >
            x
          </button>
          <h2 className="text-xl font-bold bg-gradient-to-r from-primary-purple to-primary-blue bg-clip-text text-transparent text-center">
            Ver Categoria Deportiva
          </h2>
          <p className="text-center text-gray-600 mt-1 text-sm">{nombre}</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <ReadOnlyField label="Nombre" value={nombre} />

                <div className="space-y-1">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Estado
                  </p>
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${estadoClass}`}
                    >
                      <span className={`w-2 h-2 rounded-full ${estadoDot}`}></span>
                      {estado}
                    </span>
                  </div>
                </div>

                <ReadOnlyField label="Edad minima" value={edadMinimaLabel} />
                <ReadOnlyField label="Edad maxima" value={edadMaximaLabel} />

                <div className="space-y-1">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Publicacion
                  </p>
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${publishClass}`}
                    >
                      <span className={`w-2 h-2 rounded-full ${publishDot}`}></span>
                      {publicar ? "Publicado" : "No publicado"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Descripcion
                </p>
                <p className="text-gray-800 leading-relaxed whitespace-pre-line">
                  {descripcion}
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Informacion del sistema
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <ReadOnlyField label="Fecha de creacion" value={formattedCreatedAt} />
                  <ReadOnlyField label="Ultima actualizacion" value={formattedUpdatedAt} />
                  <ReadOnlyField label="Fecha estado/publicacion" value={formattedStatusAssignedAt} />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Imagen / Archivo
                </p>
                {archivo ? (
                  <div className="rounded-xl overflow-hidden border border-gray-200 bg-white h-64 flex items-center justify-center">
                    {isImageFile(archivo) ? (
                      <img
                        src={typeof archivo === "object" ? URL.createObjectURL(archivo) : archivo}
                        alt={nombre}
                        className="w-full h-full object-cover"
                        onError={(e) => (e.currentTarget.style.display = "none")}
                      />
                    ) : (
                      <div className="text-center text-gray-600 p-4">
                        <p className="font-semibold">Archivo adjunto</p>
                        <p className="text-sm">{archivoNombre}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-64 rounded-xl border border-dashed border-gray-300 flex items-center justify-center text-gray-500 text-sm">
                    No hay archivo adjunto
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex-shrink-0 border-t border-gray-200 p-4">
          <div className="flex justify-center">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-purple transition-colors font-medium"
            >
              Cerrar
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SportsCategoryDetailModal;
