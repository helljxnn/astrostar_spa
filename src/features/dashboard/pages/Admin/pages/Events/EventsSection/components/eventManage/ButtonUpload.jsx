import { useRef, useState, useEffect } from "react";
import styled from "styled-components";

const CargadorArchivos = ({ archivo: propArchivo, onChange, disabled }) => {
  const fileInputRef = useRef(null);
  const [archivo, setArchivo] = useState(propArchivo || null);
  const [isDragOver, setIsDragOver] = useState(false);

  useEffect(() => {
    setArchivo(propArchivo || null);
  }, [propArchivo]);

  const manejarClick = () => {
    if (!disabled) fileInputRef.current.click();
  };

  const manejarCambioArchivo = (e) => {
    if (disabled) return;
    const seleccionado = e.target.files[0];
    if (seleccionado) {
      setArchivo(seleccionado);
      if (onChange) onChange(seleccionado);
    }
  };

  const procesarArchivo = (file) => {
    if (disabled) return;
    if (file) {
      setArchivo(file);
      if (onChange) onChange(file);
    }
  };

  const manejarDragOver = (e) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  };

  const manejarDragEnter = (e) => {
    e.preventDefault();
    if (!disabled) {
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

    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      procesarArchivo(files[0]);
    }
  };

  const eliminarArchivo = () => {
    if (disabled) return;
    setArchivo(null);
    fileInputRef.current.value = "";
    if (onChange) onChange(null);
  };

  return (
    <ContenedorSubida>
      <div
        className={`zona-arrastre ${isDragOver ? "drag-over" : ""} ${
          disabled ? "disabled" : ""
        }`}
        onClick={manejarClick}
        onDragOver={manejarDragOver}
        onDragEnter={manejarDragEnter}
        onDragLeave={manejarDragLeave}
        onDrop={manejarDrop}
      >
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
            : "Arrastra archivos aquí"}
          <br />
          {!isDragOver && !disabled && (
            <span className="link">o selecciona archivo</span>
          )}
        </p>

        <input
          type="file"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={manejarCambioArchivo}
        />
      </div>

      {archivo && (
        <div className={`archivo-cargado ${disabled ? "disabled" : ""}`}>
          <span>{archivo.name}</span>
          {!disabled && (
            <button className="btn-eliminar" onClick={eliminarArchivo}>
              ✕
            </button>
          )}
        </div>
      )}

      {archivo && (
        <button className="btn-subir" disabled={disabled}>
          Subir archivo
        </button>
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

  .btn-eliminar {
    background: none;
    border: none;
    color: #a855f7;
    font-size: 16px;
    cursor: pointer;
    transition: color 0.2s ease;
    padding: 0;
    margin-left: 8px;
  }

  .btn-eliminar:hover:not(:disabled) {
    color: #7c3aed;
  }

  .btn-eliminar:disabled {
    color: #9ca3af;
    cursor: not-allowed;
  }

  .btn-subir {
    background: linear-gradient(90deg, #a78bfa, #c084fc);
    border: none;
    color: white;
    font-size: 12px;
    font-weight: 500;
    padding: 8px 16px;
    border-radius: 20px;
    cursor: pointer;
    transition: transform 0.2s ease;
  }

  .btn-subir:hover {
    transform: scale(1.05);
  }

  .btn-subir:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

export default CargadorArchivos;
