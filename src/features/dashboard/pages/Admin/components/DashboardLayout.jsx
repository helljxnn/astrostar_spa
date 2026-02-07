import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import DynamicSideBar from "../../../components/DynamicSideBar";
import { TopBar } from "../components/TopBar";
import Portal from "../../../../../shared/components/Portal";
import ViewProfileModal from "../../../../auth/pages/ViewProfileModal";
import EditProfileModal from "../../../../auth/pages/EditProfileModal";
import { useAuth } from "../../../../../shared/contexts/authContext";
import { useSidebarState } from "../../../../../shared/hooks/useSidebarState";
import "./FinalFix.css";

function DashboardLayout() {
  const [isViewModalOpen, setViewModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const { user, updateUser } = useAuth();

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
    <div className="min-h-screen bg-gray-50 flex">
      {/* Overlay con blur para móvil */}
      {sidebarOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm lg:hidden sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <DynamicSideBar
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        isExpanded={isExpanded}
        setIsExpanded={setIsExpanded}
      />

      {/* Contenido Principal - CON ATRIBUTOS PARA CSS */}
      <div
        className="flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out dashboard-main-content"
        data-sidebar={getSidebarState()}
        style={{
          marginLeft: getMarginLeft(),
          width: `calc(100vw - ${getMarginLeft()})`,
        }}
        key={`${sidebarOpen}-${isExpanded}-${isMobile}`} // Force re-render on state change
      >
        <TopBar
          toggleSidebar={toggleSidebar}
          isMobile={isMobile}
          onOpenProfileModals={{
            setView: setViewModalOpen,
            setEdit: setEditModalOpen,
          }}
        />
        <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 md:pt-8 pb-16 sm:pb-8">
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
