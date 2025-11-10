import React from "react";
import { motion } from "framer-motion";

const SportsCategoryDetailModal = ({ isOpen, onClose, category }) => {
  if (!isOpen || !category) return null;

  const getField = (...keys) => keys.find((v) => v !== undefined && v !== null && v !== "") || "No especificado";

  const isImage = (file) => {
    if (!file) return false;
    if (typeof file === "object" && file.type?.startsWith("image/")) return true;
    if (typeof file === "string") {
      const lower = file.toLowerCase();
      return lower.endsWith(".jpg") || lower.endsWith(".jpeg") || lower.endsWith(".png") || lower.endsWith(".gif") || lower.endsWith(".webp");
    }
    return false;
  };

  const archivo = category.Archivo || category.archivo || category.file || category.imageUrl || category.image || category.filePath;
  const nombre = getField(category.Nombre, category.nombre, category.name);
  const edadMinima = getField(category.EdadMinima, category.edadMinima, category.minAge);
  const edadMaxima = getField(category.EdadMaxima, category.edadMaxima, category.maxAge);
  const estado = getField(category.Estado, category.estado, category.status);
  const descripcion = getField(category.Descripcion, category.descripcion, category.description, "No hay descripción disponible");
  const publicar = category.Publicar ?? category.publicar ?? category.publish ?? false;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50 px-4">
      <motion.div
        initial={{ opacity: 0, y: -60 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -60 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-4xl overflow-y-auto max-h-[90vh]"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-[#9BE9FF]">Detalles de Categoría Deportiva</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl font-bold transition-colors">✖</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-xl">
              <h3 className="text-sm font-semibold text-gray-600 mb-2">NOMBRE DE CATEGORÍA</h3>
              <p className="text-lg font-medium text-gray-900">{nombre}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-xl">
                <h3 className="text-sm font-semibold text-blue-600 mb-2">EDAD MÍNIMA</h3>
                <p className="text-2xl font-bold text-blue-700">{edadMinima} años</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-xl">
                <h3 className="text-sm font-semibold text-purple-600 mb-2">EDAD MÁXIMA</h3>
                <p className="text-2xl font-bold text-purple-700">{edadMaxima} años</p>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl">
              <h3 className="text-sm font-semibold text-gray-600 mb-2">ESTADO</h3>
              <span className={`inline-flex px-4 py-2 rounded-full text-sm font-semibold ${estado.toLowerCase() === "activo" || estado.toLowerCase() === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                {estado}
              </span>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl">
              <h3 className="text-sm font-semibold text-gray-600 mb-2">PUBLICACIÓN</h3>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${publicar ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                <span className={`w-2 h-2 rounded-full mr-2 ${publicar ? "bg-green-500" : "bg-yellow-500"}`}></span>
                {publicar ? "Publicado" : "No publicado"}
              </span>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl">
              <h3 className="text-sm font-semibold text-gray-600 mb-2">DESCRIPCIÓN</h3>
              <p className="text-gray-700 leading-relaxed">{descripcion}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-xl">
              <h3 className="text-sm font-semibold text-gray-600 mb-4">IMAGEN / ARCHIVO</h3>
              {archivo ? (
                <div className="relative w-full h-64 rounded-lg overflow-hidden shadow-md">
                  {isImage(archivo) ? (
                    <img
                      src={typeof archivo === "object" ? URL.createObjectURL(archivo) : archivo}
                      alt={nombre}
                      className="w-full h-full object-cover"
                      onError={(e) => (e.target.style.display = "none")}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-blue-100 to-purple-100 text-gray-600">
                      <div className="text-4xl mb-2">📄</div>
                      <p className="text-sm font-medium">Archivo adjunto</p>
                      <p className="text-xs opacity-80">{typeof archivo === "object" ? archivo.name : "Documento"}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full h-64 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg shadow-md flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <div className="text-6xl mb-2">📁</div>
                    <p className="text-lg font-medium">Sin archivo</p>
                    <p className="text-sm">No se ha subido ningún archivo</p>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-gray-50 p-4 rounded-xl">
              <h3 className="text-sm font-semibold text-gray-600 mb-2">INFORMACIÓN DEL ARCHIVO</h3>
              {archivo ? (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nombre:</span>
                    <span className="font-medium">{typeof archivo === "object" ? archivo.name : archivo.split("/").pop()}</span>
                  </div>
                  {typeof archivo === "object" && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tipo:</span>
                        <span className="font-medium">{archivo.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tamaño:</span>
                        <span className="font-medium">{(archivo.size / 1024).toFixed(2)} KB</span>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">No hay archivo adjunto</p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 rounded-lg bg-[#9BE9FF] text-gray-900 font-semibold hover:bg-[#80dfff] transition-colors"
          >
            Cerrar
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default SportsCategoryDetailModal;
