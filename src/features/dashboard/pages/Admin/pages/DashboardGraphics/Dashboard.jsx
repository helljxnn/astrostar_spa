import React from 'react';
import EventsGraphic from "./components/EventsGraphic";
import AthletesTrackingGraphic from "./components/AthletesTrackingGraphic";
import HealthServicesGraphic from "./components/HealthServicesGraphic";
import HealthServicesYearGraphic from "./components/HealthServicesYearGraphic";

function Dashboard() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Dashboard</h1>
      
      {/* Grid con proporciones más equilibradas */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
        <div className="min-h-[400px]">
          <EventsGraphic />
        </div>
        
        <div className="min-h-[400px]">
          <AthletesTrackingGraphic />
        </div>

        <div className="min-h-[400px]">
          <HealthServicesGraphic />
        </div>
        
        <div className="min-h-[400px]">
          <HealthServicesYearGraphic />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;