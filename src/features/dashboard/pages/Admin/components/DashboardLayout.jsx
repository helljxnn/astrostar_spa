import React, { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import DynamicSideBar from "../../../components/DynamicSideBar";
import { TopBar } from "../components/TopBar";
import Portal from "../../../../../shared/components/Portal";
import ViewProfileModal from "../../../../auth/pages/ViewProfileModal";
import EditProfileModal from "../../../../auth/pages/EditProfileModal";
import { useAuth } from "../../../../../shared/contexts/authContext";
import { useSidebarState } from "../../../../../shared/hooks/useSidebarState";

function DashboardLayout() {
  const [isViewModalOpen, setViewModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const { user, updateUser } = useAuth();
  const location = useLocation();

  const {
    sidebarOpen,
    setSidebarOpen,
    isExpanded,
    setIsExpanded,
    isMobile,
    getSidebarState,
    getMarginLeft,
    toggleSidebar,
  } = useSidebarState();

  // Aplicar margin-left con JavaScript para máxima prioridad
  useEffect(() => {
    const content = document.querySelector(".dashboard-main-content");
    if (content) {
      const marginValue = getMarginLeft();
      content.style.setProperty("margin-left", marginValue, "important");
    }
  }, [getMarginLeft, location.pathname]);

  // Removed flickering prevention useEffect - was causing more issues

  const handleUpdateProfile = async (updatedData) => {
    try {
      if (updateUser) {
        updateUser(updatedData);
      }
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const userObj = JSON.parse(storedUser);
        localStorage.setItem(
          "user",
          JSON.stringify({ ...userObj, ...updatedData }),
        );
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Overlay con blur para móvil */}
      {sidebarOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm lg:hidden sidebar-overlay z-[999]"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <DynamicSideBar
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        isExpanded={isExpanded}
        setIsExpanded={setIsExpanded}
      />

      {/* Contenido Principal */}
      <div
        className="min-h-screen dashboard-main-content transition-all duration-300"
        data-sidebar={getSidebarState()}
      >
        <TopBar
          toggleSidebar={toggleSidebar}
          isMobile={isMobile}
          onOpenProfileModals={{
            setView: setViewModalOpen,
            setEdit: setEditModalOpen,
          }}
        />
        <main className="px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 md:pt-8 pb-16 sm:pb-8">
          <Outlet />
        </main>
      </div>

      {/* Portal para los modales */}
      <Portal>
        <ViewProfileModal
          isOpen={isViewModalOpen}
          onClose={() => setViewModalOpen(false)}
          user={user}
        />
        <EditProfileModal
          isOpen={isEditModalOpen}
          onClose={() => setEditModalOpen(false)}
          user={user}
          onSave={handleUpdateProfile}
        />
      </Portal>
    </div>
  );
}

export default DashboardLayout;

