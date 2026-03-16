import React from "react";

const AttendanceToggle = ({ checked, onChange, gradient, disabled = false }) => (
  <label
    className={`relative inline-flex items-center select-none ${
      disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"
    }`}
  >
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      disabled={disabled}
      className="sr-only"
    />
    <span
      className="relative h-6 w-11 rounded-full transition-colors duration-200"
      style={{ background: checked ? gradient : "#e2e6f2" }}
    >
      <span
        className={`absolute top-1/2 left-0.5 -translate-y-1/2 h-5 w-5 rounded-full bg-white shadow-[0_2px_6px_rgba(0,0,0,0.2)] transition-all duration-200 ${
          checked ? "translate-x-5" : ""
        }`}
      />
    </span>
  </label>
);

export default AttendanceToggle;
