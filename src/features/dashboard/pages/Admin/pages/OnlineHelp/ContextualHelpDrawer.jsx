import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import { FaTimes } from "react-icons/fa";
import {
  buildHelpModuleCatalog,
  getCurrentModuleFromPath,
} from "../../../../../../shared/constants/permissionStructure";
import { buildHelpItemsForModule } from "./helpAdapter";
import EmptyHelpState from "./components/EmptyHelpState";
import HelpDetailView from "./components/HelpDetailView";
import HelpLauncher from "./components/HelpLauncher";
import HelpListView from "./components/HelpListView";

const DRAWER_ANIMATION = {
  hidden: { x: "100%" },
  visible: {
    x: 0,
    transition: { type: "spring", stiffness: 280, damping: 30 },
  },
  exit: {
    x: "100%",
    transition: { duration: 0.2, ease: "easeInOut" },
  },
};

const OVERLAY_ANIMATION = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

const ContextualHelpDrawer = () => {
  const location = useLocation();
  const searchInputRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedActionId, setSelectedActionId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const moduleCatalog = useMemo(() => buildHelpModuleCatalog(), []);

  const currentModule = useMemo(
    () => getCurrentModuleFromPath(location.pathname, moduleCatalog),
    [location.pathname, moduleCatalog],
  );

  const moduleHelpItems = useMemo(
    () => buildHelpItemsForModule(currentModule),
    [currentModule],
  );

  const selectedHelpItem = useMemo(
    () =>
      moduleHelpItems.find((item) => item.actionId === selectedActionId) || null,
    [moduleHelpItems, selectedActionId],
  );

  const filteredItems = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return moduleHelpItems.filter((item) => {
      return (
        normalizedSearch.length === 0 ||
        item.title.toLowerCase().includes(normalizedSearch) ||
        item.description.toLowerCase().includes(normalizedSearch)
      );
    });
  }, [moduleHelpItems, searchTerm]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        if (selectedActionId) {
          setSelectedActionId(null);
          return;
        }
        setIsOpen(false);
      }
    };

    if (isOpen) {
      window.addEventListener("keydown", onKeyDown);
    }

    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, selectedActionId]);

  useEffect(() => {
    setSelectedActionId(null);
    setSearchTerm("");
  }, [location.pathname]);

  useEffect(() => {
    if (isOpen && !selectedActionId && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, selectedActionId]);

  return (
    <>
      <HelpLauncher onOpen={() => setIsOpen(true)} />

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.button
              type="button"
              variants={OVERLAY_ANIMATION}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-[1190] bg-black/20 backdrop-blur-[1px]"
              aria-label="Cerrar ayuda"
            />

            <motion.aside
              variants={DRAWER_ANIMATION}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed right-0 top-0 bottom-0 z-[1200] w-full sm:w-[440px] lg:w-[500px] bg-slate-50 border-l border-slate-200 shadow-2xl"
              role="dialog"
              aria-modal="true"
              aria-label="Panel de ayuda contextual"
            >
              <div className="flex h-full flex-col">
                <header className="flex items-start justify-between gap-3 border-b border-slate-200 bg-white px-4 py-4 sm:px-5">
                  <div>
                    <h2 className="text-base sm:text-lg font-semibold text-slate-800">
                      Ayuda del módulo
                    </h2>
                    <p className="text-sm text-slate-500">
                      {currentModule?.moduleName || "Sin módulo detectado"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-purple/30"
                    aria-label="Cerrar panel de ayuda"
                  >
                    <FaTimes size={13} />
                  </button>
                </header>

                <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-5">
                  {!currentModule ? (
                    <EmptyHelpState message="No hay un módulo activo para mostrar ayuda contextual." />
                  ) : (
                    <AnimatePresence mode="wait" initial={false}>
                      {!selectedHelpItem ? (
                        <motion.div
                          key="help-list"
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.18 }}
                        >
                          <HelpListView
                            searchInputRef={searchInputRef}
                            searchTerm={searchTerm}
                            onSearchTermChange={setSearchTerm}
                            filteredItems={filteredItems}
                            onSelectAction={setSelectedActionId}
                          />
                        </motion.div>
                      ) : (
                        <motion.div
                          key="help-detail"
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.18 }}
                        >
                          <HelpDetailView
                            item={selectedHelpItem}
                            onBack={() => setSelectedActionId(null)}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default ContextualHelpDrawer;
