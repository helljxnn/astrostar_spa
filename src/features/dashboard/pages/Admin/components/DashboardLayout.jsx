import React from 'react';
import DynamicSideBar from "../../../components/DynamicSideBar";
import { Outlet } from 'react-router-dom';
import { TopBar } from './TopBar';

function DashboardLayout() {
  return (
    <div id="dashboard-layout" className="w-full h-screen grid grid-cols-[auto_1fr] gap-0">
      {/* Columna sidebar */}
      <div id="col-sidebar" className="h-full">
        <DynamicSideBar />
      </div>

      {/* Columna principal */}
      <div id="col-main" className="w-full h-full grid grid-rows-[auto_1fr]">
        {/* Barra superior */}
        <div id="topBar" className="w-full h-auto bg-primay-color shadow-md ">
          <TopBar />
        </div>

        {/* Contenido dinámico */}
        <div id="content" className="w-full p-4 overflow-y-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default DashboardLayout;
