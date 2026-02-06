import React from "react";

const AttendanceSummary = ({ summary }) => (
  <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm mb-6">
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="rounded-lg border border-gray-200 p-3 bg-gray-50">
        <p className="text-xs text-gray-500">Total</p>
        <p className="text-xl font-semibold text-gray-800">
          {summary.total}
        </p>
      </div>
      <div className="rounded-lg border border-gray-200 p-3 bg-gray-50">
        <p className="text-xs text-gray-500">Presentes</p>
        <p className="text-xl font-semibold text-gray-800">
          {summary.present}
        </p>
      </div>
      <div className="rounded-lg border border-gray-200 p-3 bg-gray-50">
        <p className="text-xs text-gray-500">Ausentes</p>
        <p className="text-xl font-semibold text-gray-800">
          {summary.absent}
        </p>
      </div>
      <div className="rounded-lg border border-gray-200 p-3 bg-gray-50">
        <p className="text-xs text-gray-500">Cumplimiento</p>
        <p className="text-xl font-semibold text-gray-800">
          {summary.percent}%
        </p>
      </div>
    </div>
  </div>
);

export default AttendanceSummary;
