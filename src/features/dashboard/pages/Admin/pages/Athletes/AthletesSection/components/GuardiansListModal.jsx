import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { FaUserShield, FaPlus, FaTimes } from "react-icons/fa";
import SearchInput from "../../../../../../../../shared/components/SearchInput.jsx";
import Table from "../../../../../../../../shared/components/Table/table.jsx";
import Pagination from "../../../../../../../../shared/components/Table/Pagination.jsx";

const GuardiansListModal = ({
  isOpen,
  onClose,
  guardians = [],
  athletes = [],
  onCreateGuardian,
  onEditGuardian,
  onViewGuardian,
  onDeleteGuardian,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 8;

  const filteredData = useMemo(() => {
    if (!searchTerm) return guardians;

    return guardians.filter((item) =>
      Object.entries(item).some(([key, value]) => {
        const stringValue = String(value || "").trim();

        if (key.toLowerCase() === "estado") {
          return (
            (stringValue === "Activo" && searchTerm === "Activo") ||
            (stringValue === "Inactivo" && searchTerm === "Inactivo")
          );
        }

        return stringValue.toLowerCase().includes(searchTerm.toLowerCase());
      })
    );
  }, [guardians, searchTerm]);

  const totalRows = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / rowsPerPage));
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedData = filteredData.slice(
    startIndex,
    startIndex + rowsPerPage
  );

  const handlePageChange = (page) => setCurrentPage(page);

  const handleClose = () => {
    setSearchTerm("");
    setCurrentPage(1);
    onClose();
  };

  const handleEdit = (guardian) => {
    if (!guardian || guardian.target) return;
    onEditGuardian(guardian);
  };

  const handleView = (guardian) => {
    if (!guardian || guardian.target) return;
    onViewGuardian(guardian);
  };

  const handleDelete = (guardian) => {
    if (!guardian || guardian.target) return;
    onDeleteGuardian(guardian);
  };

  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden relative"
        initial={{ scale: 0.8, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: 50 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
      >
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-primary-purple to-primary-blue rounded-xl flex items-center justify-center">
                <FaUserShield className="text-white" size={20} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Lista de Acudientes
                </h2>
                <p className="text-gray-600">
                  Administra todos los acudientes registrados
                </p>
              </div>
            </div>
            <button
              className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
              onClick={handleClose}
            >
              <FaTimes size={18} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div
          className="p-6 overflow-y-auto"
          style={{ maxHeight: "calc(90vh - 140px)" }}
        >
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="w-full sm:w-80">
              <SearchInput
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Buscar acudiente..."
              />
            </div>
            <motion.button
              onClick={onCreateGuardian}
              className="flex items-center gap-2 px-4 py-2 bg-primary-blue text-white rounded-lg shadow hover:bg-primary-purple transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FaPlus size={16} />
              Crear Acudiente
            </motion.button>
          </div>

          {/* Tabla */}
          {totalRows > 0 ? (
            <>
              <div className="w-full overflow-x-auto bg-white rounded-lg">
                <div className="w-full">
                  <Table
                    className="w-full table-auto"
                    thead={{
                      titles: [
                        "Nombre Completo",
                        "Identificación",
                        "Correo",
                        "Teléfono",
                        "Deportistas",
                      ],
                      state: true,
                      actions: true,
                    }}
                    tbody={{
                      data: paginatedData.map((guardian) => {
                        const deportistasAsociados = athletes.filter(
                          (a) => String(a.acudiente) === String(guardian.id)
                        );
                        
                        console.log(`✅ Acudiente: ${guardian.nombreCompleto} (ID: ${guardian.id}) - Deportistas: ${deportistasAsociados.length}`);
                        
                        return {
                          ...guardian,
                          deportistasCount: deportistasAsociados.length,
                        };
                      }),
                      dataPropertys: [
                        "nombreCompleto",
                        "identificacion",
                        "correo",
                        "telefono",
                        "deportistasCount",
                      ],
                      state: true,
                      stateMap: {
                        Activo: "",
                        Inactivo: "",
                      },
                    }}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onView={handleView}
                  />
                </div>
              </div>

              {totalPages > 1 && (
                <div className="mt-4">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="text-center p-8 text-gray-500">
              {searchTerm ? (
                <p>No se encontraron acudientes que coincidan con la búsqueda.</p>
              ) : (
                <p>No hay acudientes registrados en este momento.</p>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default GuardiansListModal;