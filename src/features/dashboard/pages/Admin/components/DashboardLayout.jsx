import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import DynamicSideBar from "../../../components/DynamicSideBar";
import { TopBar } from "../components/TopBar";
import Portal from "../../../../../shared/components/Portal";
import ViewProfileModal from "../../../../auth/pages/ViewProfileModal";
import EditProfileModal from "../../../../auth/pages/EditProfileModal";
import { useAuth } from "../../../../../shared/contexts/authContext";
import "./SidebarFix.css";

function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [isViewModalOpen, setViewModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const { user, updateUser } = useAuth();

  useEffect(() => {
    const checkIfMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false);
        setIsExpanded(true);
      } else {
        setSidebarOpen(true);
        setIsExpanded(true);
      }
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);

    return () => {
      window.removeEventListener("resize", checkIfMobile);
    };
  }, []);

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
        data-sidebar={
          isMobile
            ? "closed"
            : sidebarOpen && isExpanded
              ? "expanded"
              : sidebarOpen && !isExpanded
                ? "collapsed"
                : "closed"
        }
        style={{
          marginLeft: isMobile
            ? "0px"
            : sidebarOpen && isExpanded
              ? "288px"
              : sidebarOpen && !isExpanded
                ? "80px"
                : "0px",
        }}
      >
        <TopBar
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          isMobile={isMobile}
          onOpenProfileModals={{
            setView: setViewModalOpen,
            setEdit: setEditModalOpen,
          }}
        />
        <main className="flex-1 w-full px-0 sm:px-4 lg:px-6 pt-4 sm:pt-6 md:pt-8 pb-16 sm:pb-8">
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
