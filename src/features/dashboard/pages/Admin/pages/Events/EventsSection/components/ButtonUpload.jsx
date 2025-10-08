import React, { useRef, useState, useEffect } from "react";
import styled from "styled-components";

const ButtonUpload = ({ file: propFile, onChange, disabled }) => {
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(propFile || null);
  const [preview, setPreview] = useState(null);

  // Sincronizar con prop
  useEffect(() => {
    setFile(propFile || null);
    setPreview(null); // No generamos previews
  }, [propFile]);

  // Abrir selector de archivo
  const handleButtonClick = () => {
    if (disabled) return;
    fileInputRef.current.click();
  };

  // Guardar archivo seleccionado
  const handleFileChange = (e) => {
    if (disabled) return;
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      // No creamos preview
      
      // Notificar al componente padre
      if (onChange) onChange(selectedFile);
    }
  };

  // Eliminar archivo cargado
  const handleRemoveFile = () => {
    if (disabled) return;
    
    setFile(null);
    setPreview(null);
    fileInputRef.current.value = ""; // limpiar input
    
    // Notificar al componente padre
    if (onChange) onChange(null);
  };

  return (
    <StyledWrapper>
      <div className="upload-container">
        {/* Botón principal */}
        <button 
          className={`cssbuttons-io-button ${disabled ? 'disabled' : ''}`} 
          onClick={handleButtonClick}
          disabled={disabled}
        >
          <svg
            viewBox="0 0 640 512"
            fill="white"
            height="1em"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M144 480C64.5 480 0 415.5 0 336c0-62.8 40.2-116.2 96.2-135.9c-.1-2.7-.2-5.4-.2-8.1c0-88.4 71.6-160 160-160c59.3 0 111 32.2 138.7 80.2C409.9 102 428.3 96 448 96c53 0 96 43 96 96c0 12.2-2.3 23.8-6.4 34.6C596 238.4 640 290.1 640 352c0 70.7-57.3 128-128 128H144zm79-217c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l39-39V392c0 13.3 10.7 24 24 24s24-10.7 24-24V257.9l39 39c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-80-80c-9.4-9.4-24.6-9.4-33.9 0l-80 80z" />
          </svg>
          <span>Subir Archivo</span>
        </button>

        {/* Input oculto */}
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleFileChange}
        />

        {/* Archivo seleccionado */}
        {file && (
          <div className="file-info">
            <span>{typeof file === 'string' ? 'Archivo cargado' : file.name}</span>
            <button 
              className={`delete-btn ${disabled ? 'disabled' : ''}`} 
              onClick={handleRemoveFile}
              disabled={disabled}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 448 512"
                fill="white"
                height="14"
              >
                <path d="M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64s14.3 
                32 32 32h384c17.7 0 32-14.3 32-32s-14.3-32-32-32h-96l-7.2-14.3C307.4 
                6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 
                128H32l21.2 339c1.6 25.5 22.8 45 48.4 
                45h244.8c25.6 0 46.8-19.5 48.4-45L416 128z" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .upload-container {
    display: flex;
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .cssbuttons-io-button {
    display: flex;
    align-items: center;
    font-family: inherit;
    font-weight: 500;
    font-size: 17px;
    padding: 0.8em 1.5em 0.8em 1.2em;
    color: white;
    background: linear-gradient(0deg, #b595ff 0%, #d8c0ff 100%);
    border: none;
    box-shadow: 0 0.7em 1.5em -0.5em rgba(181, 149, 255, 0.8);
    letter-spacing: 0.05em;
    border-radius: 20em;
    transition: all 0.3s ease;
    cursor: pointer;
  }

  .cssbuttons-io-button svg {
    margin-right: 8px;
  }

  .cssbuttons-io-button:hover {
    box-shadow: 0 0.5em 1.5em -0.5em rgba(181, 149, 255, 1);
    transform: translateY(-2px);
  }

  .cssbuttons-io-button:active {
    box-shadow: 0 0.3em 1em -0.5em rgba(181, 149, 255, 0.9);
    transform: scale(0.97);
  }
  
  .cssbuttons-io-button.disabled {
    background: #d8d8d8;
    box-shadow: 0 0.7em 1.5em -0.5em rgba(200, 200, 200, 0.8);
    cursor: not-allowed;
    opacity: 0.7;
  }

  .cssbuttons-io-button.disabled:hover {
    box-shadow: 0 0.7em 1.5em -0.5em rgba(200, 200, 200, 0.8);
    transform: none;
  }

  .file-info {
    display: flex;
    align-items: center;
    gap: 8px;
    background: #f8f5ff;
    padding: 6px 12px;
    border-radius: 8px;
    font-size: 14px;
    color: #4b0082;
  }

  .delete-btn {
    background: #b595ff;
    border: none;
    border-radius: 6px;
    padding: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background 0.2s ease;
  }

  .delete-btn:hover {
    background: #a073ff;
  }
  
  .delete-btn.disabled {
    background: #d8d8d8;
    cursor: not-allowed;
    opacity: 0.7;
  }

  .delete-btn.disabled:hover {
    background: #d8d8d8;
  }
`;

export default ButtonUpload;
