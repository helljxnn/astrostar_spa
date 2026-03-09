import { useState, useRef, useEffect } from "react";
import { FaSearch, FaTimes, FaBoxOpen, FaChevronDown } from "react-icons/fa";

/**
 * Componente reutilizable para buscar y seleccionar materiales
 * @param {Object} props
 * @param {Array} props.materials - Lista de materiales disponibles
 * @param {string} props.value - ID del material seleccionado
 * @param {Function} props.onChange - Callback cuando se selecciona un material
 * @param {boolean} props.disabled - Si el componente está deshabilitado
 * @param {string} props.placeholder - Texto placeholder
 * @param {boolean} props.loading - Si está cargando materiales
 * @param {string} props.error - Mensaje de error
 */
const MaterialSearchSelector = ({
  materials = [],
  value = "",
  onChange,
  disabled = false,
  placeholder = "Buscar material...",
  loading = false,
  error = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Obtener el material seleccionado
  const selectedMaterial = materials.find((m) => m.id === Number(value));

  // Filtrar materiales según el término de búsqueda
  const filteredMaterials = materials.filter((material) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      material.nombre?.toLowerCase().includes(searchLower) ||
      material.categoria?.toLowerCase().includes(searchLower) ||
      material.descripcion?.toLowerCase().includes(searchLower)
    );
  });

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
        setSearchTerm("");
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Scroll automático al item resaltado
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const highlightedElement = listRef.current.children[highlightedIndex];
      if (highlightedElement) {
        highlightedElement.scrollIntoView({
          block: "nearest",
          behavior: "smooth",
        });
      }
    }
  }, [highlightedIndex]);

  const handleSelect = (material) => {
    onChange(String(material.id));
    setIsOpen(false);
    setSearchTerm("");
    setHighlightedIndex(-1);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange("");
    setSearchTerm("");
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e) => {
    if (disabled) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredMaterials.length - 1 ? prev + 1 : prev,
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && filteredMaterials[highlightedIndex]) {
          handleSelect(filteredMaterials[highlightedIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        setSearchTerm("");
        setHighlightedIndex(-1);
        break;
      default:
        break;
    }
  };

  const handleInputClick = () => {
    if (!disabled) {
      setIsOpen(true);
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Input principal */}
      <div
        onClick={handleInputClick}
        className={`
          flex items-center gap-2 w-full border-2 rounded-xl px-4 py-3
          transition-all cursor-pointer
          ${
            disabled
              ? "bg-gray-100 cursor-not-allowed opacity-60"
              : isOpen
                ? "border-primary-purple ring-2 ring-primary-purple/20"
                : "border-gray-200 hover:border-primary-purple/50"
          }
          ${error ? "border-red-500" : ""}
        `}
      >
        <FaSearch className="text-gray-400 flex-shrink-0" />

        {selectedMaterial && !isOpen ? (
          // Mostrar material seleccionado
          <div className="flex-1 flex items-center gap-2">
            <FaBoxOpen className="text-primary-purple" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">
                {selectedMaterial.nombre}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {selectedMaterial.categoria}
              </p>
            </div>
          </div>
        ) : (
          // Input de búsqueda
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setIsOpen(true);
              setHighlightedIndex(-1);
            }}
            onKeyDown={handleKeyDown}
            placeholder={loading ? "Cargando..." : placeholder}
            disabled={disabled || loading}
            className="flex-1 outline-none bg-transparent text-sm text-gray-800 placeholder-gray-400"
          />
        )}

        {/* Botones de acción */}
        <div className="flex items-center gap-1">
          {selectedMaterial && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              aria-label="Limpiar selección"
            >
              <FaTimes className="text-gray-400 text-sm" />
            </button>
          )}
          <FaChevronDown
            className={`text-gray-400 text-sm transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>
      </div>

      {/* Dropdown de resultados */}
      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-2 bg-white border-2 border-primary-purple/30 rounded-xl shadow-lg max-h-64 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-500 text-sm">
              <div className="animate-spin w-5 h-5 border-2 border-primary-purple border-t-transparent rounded-full mx-auto mb-2"></div>
              Cargando materiales...
            </div>
          ) : filteredMaterials.length > 0 ? (
            <ul ref={listRef} className="py-2">
              {filteredMaterials.map((material, index) => (
                <li key={material.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(material)}
                    className={`
                      w-full px-4 py-3 text-left transition-colors
                      flex items-start gap-3 hover:bg-primary-purple/10
                      ${
                        highlightedIndex === index ? "bg-primary-purple/10" : ""
                      }
                      ${
                        selectedMaterial?.id === material.id
                          ? "bg-primary-purple/5"
                          : ""
                      }
                    `}
                  >
                    <FaBoxOpen className="text-primary-purple mt-1 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800">
                        {material.nombre}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {material.categoria}
                        {material.stockActual !== undefined && (
                          <span className="ml-2">
                            · Stock: {material.stockActual}
                          </span>
                        )}
                      </p>
                      {material.descripcion && (
                        <p className="text-xs text-gray-400 mt-1 line-clamp-1">
                          {material.descripcion}
                        </p>
                      )}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-center text-gray-500 text-sm">
              {searchTerm
                ? `No se encontraron materiales con "${searchTerm}"`
                : "No hay materiales disponibles"}
            </div>
          )}
        </div>
      )}

      {/* Mensaje de error */}
      {error && (
        <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
          {error}
        </p>
      )}
    </div>
  );
};

export default MaterialSearchSelector;
