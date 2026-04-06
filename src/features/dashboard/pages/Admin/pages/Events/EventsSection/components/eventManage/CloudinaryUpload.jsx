import { useRef, useState, useEffect } from "react";
import { showErrorAlert, showSuccessAlert } from "../../../../../../../../../shared/utils/alerts.js";
import apiClient from "../../../../../../../../../shared/services/apiClient";
import "./CloudinaryUpload.css";

const CloudinaryUpload = ({ 
  archivo: propArchivo, 
  onChange, 
  disabled,
  type = "image" // "image" o "schedule"
}) => {
  const fileInputRef = useRef(null);
  const [archivo, setArchivo] = useState(propArchivo || null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    setArchivo(propArchivo || null);
    // Si es una URL, mostrarla como preview
    if (propArchivo && typeof propArchivo === 'string') {
      setPreview(propArchivo);
    }
  }, [propArchivo]);

  const manejarClick = () => {
    if (!disabled && !uploading) fileInputRef.current.click();
  };

  const subirArchivo = async (file) => {
    setUploading(true);
    
    try {
      const formData = new FormData();
      const fieldName = type === "image" ? "image" : "schedule";
      formData.append(fieldName, file);

      const endpoint = type === "image" 
        ? "/events/upload/image" 
        : "/events/upload/schedule";

      const response = await apiClient.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // Verificar si la respuesta tiene la estructura correcta
      const responseData = response.data;
      
      if (responseData && responseData.success && responseData.data) {
        const cloudinaryUrl = responseData.data.url;
        
        setArchivo(cloudinaryUrl);
        setPreview(cloudinaryUrl);
        
        if (onChange) onChange(cloudinaryUrl);
      } else if (responseData && responseData.url) {
        // Fallback: si la respuesta tiene directamente la URL (sin wrapper success)
        setArchivo(responseData.url);
        setPreview(responseData.url);
        
        if (onChange) onChange(responseData.url);
      } else {
        throw new Error(responseData?.message || "Error al subir archivo");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message 
        || error.message 
        || "No se pudo subir el archivo";
      
      showErrorAlert(
        "Error al subir", 
        errorMessage
      );
      setArchivo(null);
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const manejarCambioArchivo = (e) => {
    if (disabled || uploading) return;
    const seleccionado = e.target.files[0];
    if (seleccionado) {
      // Validar tipo de archivo
      if (type === "image") {
        if (!seleccionado.type.startsWith('image/')) {
          showErrorAlert("Archivo invalido", "Solo se permiten imagenes");
          return;
        }
      } else if (type === "schedule") {
        if (seleccionado.type !== 'application/pdf') {
          showErrorAlert("Archivo invalido", "Solo se permiten archivos PDF");
          return;
        }
      }
      
      // Validar tamano (5MB maximo)
      if (seleccionado.size > 5 * 1024 * 1024) {
        showErrorAlert("Archivo muy grande", "El archivo no debe superar 5MB");
        return;
      }

      subirArchivo(seleccionado);
    }
  };

  const procesarArchivo = (file) => {
    if (disabled || uploading) return;
    if (file) {
      // Validar tipo de archivo
      if (type === "image") {
        if (!file.type.startsWith('image/')) {
          showErrorAlert("Archivo invalido", "Solo se permiten imagenes");
          return;
        }
      } else if (type === "schedule") {
        if (file.type !== 'application/pdf') {
          showErrorAlert("Archivo invalido", "Solo se permiten archivos PDF");
          return;
        }
      }
      
      // Validar tamano (5MB maximo)
      if (file.size > 5 * 1024 * 1024) {
        showErrorAlert("Archivo muy grande", "El archivo no debe superar 5MB");
        return;
      }

      subirArchivo(file);
    }
  };

  const manejarDragOver = (e) => {
    e.preventDefault();
    if (!disabled && !uploading) {
      setIsDragOver(true);
    }
  };

  const manejarDragEnter = (e) => {
    e.preventDefault();
    if (!disabled && !uploading) {
      setIsDragOver(true);
    }
  };

  const manejarDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const manejarDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);

    if (disabled || uploading) return;

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      procesarArchivo(files[0]);
    }
  };

  const eliminarArchivo = () => {
    if (disabled || uploading) return;
    setArchivo(null);
    setPreview(null);
    fileInputRef.current.value = "";
    if (onChange) onChange(null);
  };

  const getFileName = () => {
    if (!archivo) return "";
    if (typeof archivo === 'string') {
      // Mostrar un nombre descriptivo en lugar del hash
      return type === "image" ? "Imagen del evento" : "Cronograma del evento";
    }
    return archivo.name || "archivo";
  };

  const handleDownload = async (e) => {
    e.stopPropagation();
    if (!archivo || typeof archivo !== 'string') return;
    
    try {
      // Determinar la extension y nombre del archivo
      let fileName = '';
      
      if (type === "image") {
        const urlParts = archivo.split('.');
        const urlExtension = urlParts[urlParts.length - 1].split('?')[0].toLowerCase();
        const extension = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(urlExtension) 
          ? urlExtension 
          : 'jpg';
        fileName = `imagen-evento.${extension}`;
      } else {
        fileName = 'cronograma-evento.pdf';
      }
      
      // Descargar usando fetch para controlar el nombre del archivo
      showSuccessAlert("Descargando...", "Por favor espera un momento");
      
      const response = await fetch(archivo);
      if (!response.ok) throw new Error('Error al obtener el archivo');
      
      const blob = await response.blob();
      
      // Crear un blob con el tipo MIME correcto
      const blobWithType = type === "schedule" 
        ? new Blob([blob], { type: 'application/pdf' })
        : blob;
      
      // Crear URL temporal del blob
      const blobUrl = window.URL.createObjectURL(blobWithType);
      
      // Crear link temporal para descarga
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      
      // Limpiar despues de un pequeno delay
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
      }, 100);
      
      showSuccessAlert("Descarga completada", `Archivo guardado como "${fileName}"`);
    } catch (error) {
      console.error("Error al descargar:", error);
      
      // Fallback: intentar descarga directa
      try {
        const link = document.createElement('a');
        link.href = archivo;
        link.download = type === "schedule" ? 'cronograma-evento.pdf' : 'imagen-evento';
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showErrorAlert(
          "Descarga alternativa", 
          "El archivo se abrira en una nueva pestana. Usa 'Guardar como' para elegir el nombre."
        );
      } catch {
        showErrorAlert("Error al descargar", "No se pudo descargar el archivo. Usa el boton 'Ver' para abrirlo.");
      }
    }
  };

  return (
    <div className="cloudinary-upload-container">
      <div
        className={`zona-arrastre ${isDragOver ? "drag-over" : ""} ${
          disabled || uploading ? "disabled" : ""
        }`}
        onClick={manejarClick}
        onDragOver={manejarDragOver}
        onDragEnter={manejarDragEnter}
        onDragLeave={manejarDragLeave}
        onDrop={manejarDrop}
      >
        {uploading ? (
          <>
            <div className="spinner"></div>
            <p>Subiendo...</p>
          </>
        ) : (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="40"
              viewBox="0 0 640 512"
              fill="#a78bfa"
            >
              <path
                d="M144 480C64.5 480 0 415.5 0 336c0-62.8 
              40.2-116.2 96.2-135.9c-.1-2.7-.2-5.4-.2-8.1
              c0-88.4 71.6-160 160-160c59.3 0 111 
              32.2 138.7 80.2C409.9 102 428.3 96 
              448 96c53 0 96 43 96 96c0 12.2-2.3 
              23.8-6.4 34.6C596 238.4 640 290.1 
              640 352c0 70.7-57.3 128-128 
              128H144zm79-217c-9.4 9.4-9.4 24.6 
              0 33.9s24.6 9.4 33.9 0l39-39V392c0 
              13.3 10.7 24 24 24s24-10.7 
              24-24V257.9l39 39c9.4 9.4 24.6 
              9.4 33.9 0s9.4-24.6 0-33.9l-80-80
              c-9.4-9.4-24.6-9.4-33.9 
              0l-80 80z"
              />
            </svg>

            <p>
              {disabled
                ? "Solo lectura"
                : isDragOver
                ? "Suelta el archivo aqui"
                : type === "image" 
                  ? "Arrastra una imagen aqui"
                  : "Arrastra un PDF aqui"}
              <br />
              {!isDragOver && !disabled && (
                <span className="link">o selecciona archivo</span>
              )}
            </p>
          </>
        )}

        <input
          type="file"
          ref={fileInputRef}
          className="cloudinary-upload-input"
          onChange={manejarCambioArchivo}
          accept={type === "image" ? "image/*" : "application/pdf"}
        />
      </div>

      {archivo && (
        <div className={`archivo-cargado ${disabled ? "disabled" : ""}`}>
          <div className="file-info">
            {type === "image" && preview && (
              <img 
                src={preview} 
                alt="Preview" 
                className="preview-image"
              />
            )}
            {type === "schedule" && (
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="40" 
                height="40" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="#a855f7" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                className="schedule-icon"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
            )}
            <span className="file-name">{getFileName()}</span>
          </div>
          <div className="file-actions">
            <button 
              className="btn-descargar" 
              onClick={handleDownload}
              title="Descargar archivo"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
            </button>
            {!disabled && !uploading && (
              <button className="btn-eliminar" onClick={eliminarArchivo} title="Eliminar archivo">
                x
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CloudinaryUpload;

