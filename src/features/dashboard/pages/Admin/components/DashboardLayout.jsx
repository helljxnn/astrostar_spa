import React from "react";
import DynamicSideBar from "../../../components/DynamicSideBar";
import { Outlet } from "react-router-dom";
import { TopBar } from "./TopBar";

function DashboardLayout() {
  return (
    <div id="dashboard-layout" className="flex h-screen w-full bg-gray-50">
      {/* Sidebar */}
      <div
        id="col-sidebar"
        className="fixed lg:static inset-y-0 left-0 z-40 lg:z-30"
      >
        <DynamicSideBar />
      </div>

      {/* Contenedor principal */}
      <div
        id="col-main"
        className="flex flex-col flex-1 min-h-screen lg:ml-0"
      >
        {/* Barra superior */}
        <div
          id="topBar"
          className="w-full bg-white shadow-md sticky top-0 z-30"
        >
          <TopBar />
        </div>

        {/* Contenido dinámico */}
        <div
          id="content"
          className="flex-1 w-full overflow-y-auto px-4 py-6 sm:px-6 lg:px-8"
        >
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default DashboardLayout;
