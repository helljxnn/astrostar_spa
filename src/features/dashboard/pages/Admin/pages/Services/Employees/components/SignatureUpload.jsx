import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { FaUpload, FaTrash, FaImage } from "react-icons/fa";

const SignatureUpload = ({
  mode = "edit",
  employeeId,
  currentSignatureUrl,
  onFileSelect,
  onDeleteSuccess,
  disabled = false,
}) => {
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(currentSignatureUrl);
  const fileInputRef = useRef(null);

  // Update preview when currentSignatureUrl changes
  useEffect(() => {
    setPreviewUrl(currentSignatureUrl);
  }, [currentSignatureUrl]);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!["image/png", "image/jpeg", "image/jpg"].includes(file.type)) {
      alert("Solo se permiten archivos PNG o JPG");
      return;
    }

    // Validate file size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert("El archivo no debe superar los 2MB");
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);

    // Call parent handler
    if (mode === "create") {
      // In create mode, just pass the file to parent
      onFileSelect(file);
    } else {
      // In edit mode, upload immediately
      handleUpload(file);
    }
  };

  const handleUpload = async (file) => {
    setUploading(true);
    try {
      await onFileSelect(file);
    } catch (error) {
      setPreviewUrl(currentSignatureUrl); // Restore previous preview
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("¿Está seguro de eliminar la firma?")) {
      return;
    }

    setDeleting(true);
    try {
      await onDeleteSuccess();
      setPreviewUrl(null);
    } catch (error) {
      // Error handled by parent
    } finally {
      setDeleting(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const isCreateMode = mode === "create";
  const canUpload = isCreateMode || employeeId;

  return (
    <motion.div
      className="col-span-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.85 }}
    >
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Firma Digital
          <span className="text-red-500 ml-1">*</span>
          <span className="text-xs text-gray-500 ml-2">
            (Obligatorio para Administradores)
          </span>
        </label>

        <div className="flex items-center gap-4">
          {/* Preview */}
          <div className="flex-shrink-0">
            {previewUrl ? (
              <div className="relative w-48 h-24 border-2 border-gray-300 rounded-lg overflow-hidden bg-white">
                <img
                  src={previewUrl}
                  alt="Firma"
                  className="w-full h-full object-contain"
                />
                {!disabled && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={deleting}
                    className="absolute top-1 right-1 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition-colors disabled:opacity-50"
                    title="Eliminar firma"
                  >
                    {deleting ? (
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <FaTrash className="w-3 h-3" />
                    )}
                  </button>
                )}
              </div>
            ) : (
              <div className="w-48 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-100">
                <FaImage className="w-8 h-8 text-gray-400" />
              </div>
            )}
          </div>

          {/* Upload button */}
          {!disabled && (
            <div className="flex-1">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                onChange={handleFileSelect}
                className="hidden"
              />
              <button
                type="button"
                onClick={triggerFileInput}
                disabled={uploading || (!canUpload && !isCreateMode)}
                className="flex items-center gap-2 px-4 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-purple transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Subiendo...</span>
                  </>
                ) : (
                  <>
                    <FaUpload />
                    <span>{previewUrl ? "Cambiar Firma" : "Subir Firma"}</span>
                  </>
                )}
              </button>
              <p className="text-xs text-gray-500 mt-2">
                Formatos: PNG, JPG • Tamaño máximo: 2MB
              </p>
              {!isCreateMode && !employeeId && (
                <p className="text-xs text-orange-600 mt-1">
                  Guarde el empleado primero para poder subir la firma
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default SignatureUpload;

