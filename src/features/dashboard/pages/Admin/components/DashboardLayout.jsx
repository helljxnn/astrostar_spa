// DashboardLayout.jsx
import React from 'react';
import SideBar from "./SideBar";
import { Outlet } from 'react-router-dom';
import { TopBar } from './TopBar';

function DashboardLayout() {

  return (
    <>
      <div id="dashboard-layout" className="w-full h-screen grid grid-cols-[auto_1fr] gap-0">
        {/* Contenedor layout */}
        <div id="col-sidebar" className="h-full">
          {/* Sidebar */}
          <SideBar />
        </div>
        <div id="col-main" className="w-full h-full grid grid-rows-[auto_1fr]">
          {/* Contenedor principal */}
          <div id="topBar" className="w-full h-auto bg-primay-color shadow-md ">
            {/* Contenedor de la barra superior */}
            <TopBar />
          </div>
          <div id="content" className="w-full p-4 overflow-y-auto">
            {/* Contenedor del contendio */}
            <Outlet />
          </div>
        </div>
      </div>
    </>
  );
}

export default DashboardLayout;