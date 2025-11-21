import { useRef, useState, useEffect } from "react";
import styled from "styled-components";
import { showErrorAlert, showSuccessAlert } from "../../../../../../../../shared/utils/alerts";
import apiClient from "../../../../../../../../shared/services/apiClient";

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
          showErrorAlert("Archivo inválido", "Solo se permiten imágenes");
          return;
        }
      } else if (type === "schedule") {
        if (seleccionado.type !== 'application/pdf') {
          showErrorAlert("Archivo inválido", "Solo se permiten archivos PDF");
          return;
        }
      }
      
      // Validar tamaño (5MB máximo)
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
          showErrorAlert("Archivo inválido", "Solo se permiten imágenes");
          return;
        }
      } else if (type === "schedule") {
        if (file.type !== 'application/pdf') {
          showErrorAlert("Archivo inválido", "Solo se permiten archivos PDF");
          return;
        }
      }
      
      // Validar tamaño (5MB máximo)
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
      // Extraer nombre del archivo de la URL
      const parts = archivo.split('/');
      return parts[parts.length - 1];
    }
    return archivo.name || "archivo";
  };

  return (
    <ContenedorSubida>
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
                ? "Suelta el archivo aquí"
                : type === "image" 
                  ? "Arrastra una imagen aquí"
                  : "Arrastra un PDF aquí"}
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
          style={{ display: "none" }}
          onChange={manejarCambioArchivo}
          accept={type === "image" ? "image/*" : "application/pdf"}
        />
      </div>

      {archivo && (
        <div className={`archivo-cargado ${disabled ? "disabled" : ""}`}>
          {type === "image" && preview && (
            <img 
              src={preview} 
              alt="Preview" 
              style={{ 
                width: "50px", 
                height: "50px", 
                objectFit: "cover", 
                borderRadius: "4px",
                marginRight: "8px"
              }} 
            />
          )}
          <span className="file-name">{getFileName()}</span>
          {!disabled && !uploading && (
            <button className="btn-eliminar" onClick={eliminarArchivo}>
              ✕
            </button>
          )}
        </div>
      )}
    </ContenedorSubida>
  );
};

const ContenedorSubida = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  font-family: "Poppins", sans-serif;
  width: 100%;

  .zona-arrastre {
    border: 2px dashed #c4b5fd;
    background: #faf5ff;
    border-radius: 12px;
    padding: 20px 16px;
    text-align: center;
    width: 100%;
    max-width: 280px;
    min-height: 120px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    transition: background 0.3s ease;
    cursor: pointer;
  }

  .zona-arrastre:hover:not(.disabled) {
    background: #f3e8ff;
  }

  .zona-arrastre.disabled {
    border-color: #d1d5db;
    background: #f9fafb;
    cursor: not-allowed;
    opacity: 0.6;
  }

  .zona-arrastre.disabled p {
    color: #6b7280;
  }

  .zona-arrastre.disabled svg {
    fill: #9ca3af;
  }

  .zona-arrastre.drag-over {
    background: #e879f9;
    border-color: #a855f7;
    transform: scale(1.02);
  }

  .zona-arrastre.drag-over p {
    color: white;
  }

  .zona-arrastre.drag-over svg {
    fill: white;
  }

  .zona-arrastre svg {
    width: 32px;
    height: 32px;
  }

  .zona-arrastre p {
    font-size: 12px;
    color: #4b0082;
    margin-top: 8px;
    line-height: 1.4;
  }

  .zona-arrastre .link {
    color: #8b5cf6;
    cursor: pointer;
    text-decoration: underline;
  }

  .spinner {
    border: 3px solid #f3f3f3;
    border-top: 3px solid #8b5cf6;
    border-radius: 50%;
    width: 32px;
    height: 32px;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .archivo-cargado {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #ede9fe;
    padding: 8px 12px;
    border-radius: 8px;
    width: 100%;
    max-width: 280px;
    color: #4b0082;
    font-size: 12px;
  }

  .archivo-cargado.disabled {
    background: #f3f4f6;
    color: #6b7280;
  }

  .file-name {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .btn-eliminar {
    background: none;
    border: none;
    color: #a855f7;
    font-size: 16px;
    cursor: pointer;
    transition: color 0.2s ease;
    padding: 0;
    margin-left: 8px;
    flex-shrink: 0;
  }

  .btn-eliminar:hover:not(:disabled) {
    color: #7c3aed;
  }

  .btn-eliminar:disabled {
    color: #9ca3af;
    cursor: not-allowed;
  }
`;

export default CloudinaryUpload;
