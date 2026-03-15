import { useState, useRef, useEffect } from "react";
import { FaSearch, FaTimes, FaChevronDown } from "react-icons/fa";

/**
 * Select con búsqueda genérico reutilizable.
 * @param {Array}    options     - [{ value, label, sublabel? }]
 * @param {string}   value       - valor seleccionado
 * @param {Function} onChange    - callback(value)
 * @param {string}   placeholder
 * @param {boolean}  disabled
 * @param {boolean}  loading
 * @param {string}   error
 */
const SearchableSelect = ({
  options = [],
  value = "",
  onChange,
  placeholder = "Buscar...",
  disabled = false,
  loading = false,
  error = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const selected = options.find((o) => String(o.value) === String(value));

  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setSearchTerm("");
        setHighlightedIndex(-1);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      listRef.current.children[highlightedIndex]?.scrollIntoView({
        block: "nearest",
        behavior: "smooth",
      });
    }
  }, [highlightedIndex]);

  const handleSelect = (opt) => {
    onChange(String(opt.value));
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
        setHighlightedIndex((p) => (p < filtered.length - 1 ? p + 1 : p));
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((p) => (p > 0 ? p - 1 : 0));
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && filtered[highlightedIndex])
          handleSelect(filtered[highlightedIndex]);
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

  return (
    <div ref={containerRef} className="relative w-full">
      <div
        onClick={() => {
          if (!disabled) {
            setIsOpen(true);
            inputRef.current?.focus();
          }
        }}
        className={`flex items-center gap-2 w-full border-2 rounded-xl px-3 py-2.5 transition-all cursor-pointer
          ${disabled ? "bg-gray-100 cursor-not-allowed opacity-60" : isOpen ? "border-primary-purple ring-2 ring-primary-purple/20" : "border-gray-200 hover:border-primary-purple/50"}
          ${error ? "border-red-500" : ""}
        `}
      >
        <FaSearch className="text-gray-400 flex-shrink-0" />

        {selected && !isOpen ? (
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">{selected.label}</p>
            {selected.sublabel && (
              <p className="text-xs text-gray-500 truncate">{selected.sublabel}</p>
            )}
          </div>
        ) : (
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

        <div className="flex items-center gap-1">
          {selected && !disabled && (
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
            className={`text-gray-400 text-sm transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </div>
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-2 bg-white border-2 border-primary-purple/30 rounded-xl shadow-lg max-h-64 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-500 text-sm">
              <div className="animate-spin w-5 h-5 border-2 border-primary-purple border-t-transparent rounded-full mx-auto mb-2" />
              Cargando...
            </div>
          ) : filtered.length > 0 ? (
            <ul ref={listRef} className="py-2">
              {filtered.map((opt, index) => (
                <li key={opt.value}>
                  <button
                    type="button"
                    onClick={() => handleSelect(opt)}
                    className={`w-full px-4 py-3 text-left transition-colors hover:bg-primary-purple/10
                      ${highlightedIndex === index ? "bg-primary-purple/10" : ""}
                      ${selected?.value === opt.value ? "bg-primary-purple/5" : ""}
                    `}
                  >
                    <p className="text-sm font-medium text-gray-800">{opt.label}</p>
                    {opt.sublabel && (
                      <p className="text-xs text-gray-500 mt-0.5">{opt.sublabel}</p>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-center text-gray-500 text-sm">
              {searchTerm ? `No se encontraron resultados para "${searchTerm}"` : "No hay opciones disponibles"}
            </div>
          )}
        </div>
      )}

      {error && <p className="text-red-500 text-xs mt-1.5">{error}</p>}
    </div>
  );
};

export default SearchableSelect;
