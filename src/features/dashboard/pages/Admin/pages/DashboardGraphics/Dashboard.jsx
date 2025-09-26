import React from 'react';
import ReportButton from '../../../../../../shared/components/ReportButton';
import EventsGraphic from "./components/EventsGraphic";

function Dashboard() {
  return (
    <div className="p-6">
      <div className="grid grid-cols-1 gap-6">
        <EventsGraphic />
      </div>
    </div>
  );
}

export default Dashboard;

