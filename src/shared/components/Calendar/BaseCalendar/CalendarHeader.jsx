import React from "react";
import { motion } from "framer-motion";

const CalendarHeader = ({ title, subtitle, colorScheme, className = "" }) => {
  return (
    <motion.div
      className={`text-center mb-6 ${className}`}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
    >
      <h1
        className={`text-2xl sm:text-3xl md:text-4xl font-montserrat font-bold bg-gradient-to-r ${colorScheme.primary} bg-clip-text text-transparent mb-2`}
      >
        {title}
      </h1>
      {subtitle && (
        <p className="text-gray-600 text-sm sm:text-base">{subtitle}</p>
      )}
      <div
        className={`w-16 sm:w-20 md:w-24 h-0.5 sm:h-0.5 md:h-1 bg-gradient-to-r ${colorScheme.primary} mx-auto rounded-full mt-3`}
      ></div>
    </motion.div>
  );
};

export default CalendarHeader;
