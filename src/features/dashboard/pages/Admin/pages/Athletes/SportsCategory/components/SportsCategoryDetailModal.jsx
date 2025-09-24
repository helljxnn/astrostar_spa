import React from "react";
import { motion } from "framer-motion";

const SportsCategoryDetailModal = ({ isOpen, onClose, category }) => {
  if (!isOpen || !category) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50 px-4">
      <motion.div
        initial={{ opacity: 0, y: -60 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -60 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-4xl overflow-y-auto max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-[#9BE9FF]">
            Detalles de Categoría Deportiva
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold transition-colors"
          >
            ✖
          </button>
        </div>

        {/* Body - Información de la categoría */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Columna izquierda - Información básica */}
          <div className="space-y-4">
            {/* Nombre */}
            <div className="bg-gray-50 p-4 rounded-xl">
              <h3 className="text-sm font-semibold text-gray-600 mb-2">NOMBRE DE CATEGORÍA</h3>
              <p className="text-lg font-medium text-gray-900">
                {category.Nombre || category.nombreCategoria || "No especificado"}
              </p>
            </div>

            {/* Edades */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-xl">
                <h3 className="text-sm font-semibold text-blue-600 mb-2">EDAD MÍNIMA</h3>
                <p className="text-2xl font-bold text-blue-700">
                  {category.EdadMinima || category.edadMinima || "0"} años
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded-xl">
                <h3 className="text-sm font-semibold text-purple-600 mb-2">EDAD MÁXIMA</h3>
                <p className="text-2xl font-bold text-purple-700">
                  {category.EdadMaxima || category.edadMaxima || "0"} años
                </p>
              </div>
            </div>

            {/* Estado */}
            <div className="bg-gray-50 p-4 rounded-xl">
              <h3 className="text-sm font-semibold text-gray-600 mb-2">ESTADO</h3>
              <span className={`inline-flex px-4 py-2 rounded-full text-sm font-semibold ${
                (category.Estado || category.estado || "").toLowerCase() === "activo"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}>
                {category.Estado || category.estado || "Sin estado"}
              </span>
            </div>

            {/* Publicación */}
            <div className="bg-gray-50 p-4 rounded-xl">
              <h3 className="text-sm font-semibold text-gray-600 mb-2">PUBLICACIÓN</h3>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                category.Publicar || category.publicar
                  ? "bg-green-100 text-green-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}>
                {category.Publicar || category.publicar ? (
                  <>
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Publicado
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                    No publicado
                  </>
                )}
              </span>
            </div>

            {/* Descripción */}
            <div className="bg-gray-50 p-4 rounded-xl">
              <h3 className="text-sm font-semibold text-gray-600 mb-2">DESCRIPCIÓN</h3>
              <p className="text-gray-700 leading-relaxed">
                {category.Descripcion || category.descripcion || "No hay descripción disponible"}
              </p>
            </div>
          </div>

          {/* Columna derecha - Imagen y archivo */}
          <div className="space-y-4">
            {/* Imagen de la categoría */}
            <div className="bg-gray-50 p-4 rounded-xl">
              <h3 className="text-sm font-semibold text-gray-600 mb-4">IMAGEN DE CATEGORÍA</h3>
              {category.Archivo || category.archivo ? (
                <div className="relative w-full h-64 rounded-lg overflow-hidden shadow-md">
                  {/* Si es un archivo de imagen (objeto File) */}
                  {typeof (category.Archivo || category.archivo) === 'object' && 
                   (category.Archivo || category.archivo).type?.startsWith('image/') ? (
                    <img
                      src={URL.createObjectURL(category.Archivo || category.archivo)}
                      alt={category.Nombre || "Imagen de categoría"}
                      className="w-full h-full object-cover"
                    />
                  ) : 
                  /* Si es una URL de string que apunta a una imagen */
                  typeof (category.Archivo || category.archivo) === 'string' && 
                  (category.Archivo || category.archivo).match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                    <img
                      src={category.Archivo || category.archivo}
                      alt={category.Nombre || "Imagen de categoría"}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Si la imagen falla al cargar, mostrar placeholder
                        e.target.style.display = 'none';
                        const placeholder = e.target.parentNode.querySelector('.image-placeholder');
                        if (placeholder) placeholder.style.display = 'flex';
                      }}
                    />
                  ) : (
                    /* Placeholder para archivos que no son imágenes */
                    <div className="image-placeholder w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                      <div className="text-center text-gray-600">
                        <div className="text-4xl mb-2">📄</div>
                        <p className="text-sm font-medium">Archivo adjunto</p>
                        <p className="text-xs opacity-80">
                          {typeof (category.Archivo || category.archivo) === 'object' 
                            ? (category.Archivo || category.archivo).name 
                            : 'Documento'}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {/* Placeholder oculto por defecto (para casos de error) */}
                  <div className="image-placeholder w-full h-full bg-gradient-to-br from-[#9BE9FF] to-[#B595FF] flex items-center justify-center" style={{display: 'none'}}>
                    <div className="text-center text-white">
                      <div className="text-6xl mb-2">🏃‍♀️</div>
                      <p className="text-lg font-semibold">Categoría Deportiva</p>
                      <p className="text-sm opacity-80">
                        {category.Nombre || "Sin nombre"}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                /* Placeholder cuando no hay archivo */
                <div className="w-full h-64 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg shadow-md flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <div className="text-6xl mb-2">📁</div>
                    <p className="text-lg font-medium">Sin archivo</p>
                    <p className="text-sm">No se ha subido ningún archivo</p>
                  </div>
                </div>
              )}
            </div>

            {/* Información del archivo */}
            <div className="bg-gray-50 p-4 rounded-xl">
              <h3 className="text-sm font-semibold text-gray-600 mb-2">INFORMACIÓN DEL ARCHIVO</h3>
              {category.Archivo || category.archivo ? (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Nombre:</span>
                    <span className="text-sm font-medium">
                      {typeof (category.Archivo || category.archivo) === 'object' 
                        ? (category.Archivo || category.archivo).name 
                        : (category.Archivo || category.archivo).split('/').pop() || "archivo"}
                    </span>
                  </div>
                  {typeof (category.Archivo || category.archivo) === 'object' && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Tipo:</span>
                        <span className="text-sm font-medium">
                          {(category.Archivo || category.archivo).type || "No especificado"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Tamaño:</span>
                        <span className="text-sm font-medium">
                          {((category.Archivo || category.archivo).size / 1024).toFixed(2)} KB
                        </span>
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

        {/* Footer con botón de cerrar */}
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