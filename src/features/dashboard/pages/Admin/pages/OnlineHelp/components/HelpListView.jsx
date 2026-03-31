import { FaSearch } from "react-icons/fa";
import EmptyHelpState from "./EmptyHelpState";
import HelpCard from "./HelpCard";

const HelpListView = ({
  searchInputRef,
  searchTerm,
  onSearchTermChange,
  filteredItems,
  onSelectAction,
}) => (
  <div className="space-y-4">
    <p className="text-sm text-slate-600">
      Selecciona una acción para ver pasos rápidos y video.
    </p>

    <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-3">
      <label className="relative block">
        <span className="sr-only">Buscar ayuda</span>
        <FaSearch
          size={12}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          ref={searchInputRef}
          type="text"
          value={searchTerm}
          onChange={(event) => onSearchTermChange(event.target.value)}
          placeholder="Buscar por título o descripción"
          className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-8 pr-3 text-sm text-slate-700 outline-none focus:border-primary-purple/50 focus:ring-2 focus:ring-primary-purple/20"
        />
      </label>
    </div>

    <div className="space-y-2">
      {filteredItems.length === 0 ? (
        <EmptyHelpState message="No hay ayudas que coincidan con la búsqueda actual." />
      ) : (
        filteredItems.map((item) => (
          <HelpCard
            key={`${item.moduleId}-${item.actionId}`}
            item={item}
            onSelect={onSelectAction}
          />
        ))
      )}
    </div>
  </div>
);

export default HelpListView;
