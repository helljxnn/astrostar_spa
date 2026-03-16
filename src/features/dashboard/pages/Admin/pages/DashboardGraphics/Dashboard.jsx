import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaCalendarAlt,
  FaRunning,
  FaHeartbeat,
  FaHandHoldingHeart,
  FaChartLine,
} from "react-icons/fa";
import EventsSection from "./sections/EventsSection";
import AthletesSection from "./sections/AthletesSection";
import HealthSection from "./sections/HealthSection";
import DonationsSection from "./sections/DonationsSection";
import OverviewSection from "./sections/OverviewSection";

function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  const tabs = [
    {
      id: "overview",
      label: "Resumen General",
      icon: FaChartLine,
      color: "purple",
    },
    { id: "events", label: "Eventos", icon: FaCalendarAlt, color: "blue" },
    { id: "athletes", label: "Deportistas", icon: FaRunning, color: "pink" },
    {
      id: "health",
      label: "Servicios de Salud",
      icon: FaHeartbeat,
      color: "green",
    },
    {
      id: "donations",
      label: "Donaciones",
      icon: FaHandHoldingHeart,
      color: "yellow",
    },
  ];

  const renderSection = () => {
    switch (activeTab) {
      case "overview":
        return <OverviewSection />;
      case "events":
        return <EventsSection />;
      case "athletes":
        return <AthletesSection />;
      case "health":
        return <HealthSection />;
      case "donations":
        return <DonationsSection />;
      default:
        return <OverviewSection />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-purple/5 p-3 sm:p-6">
      {/* Header con decoración */}
      <div className="mb-8 relative">
        <div className="absolute -top-4 -left-4 w-24 h-24 bg-primary-purple/10 rounded-full blur-2xl"></div>
        <div className="absolute -top-4 -right-4 w-32 h-32 bg-primary-blue/10 rounded-full blur-2xl"></div>

        <div className="relative">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primary-purple to-primary-blue bg-clip-text text-transparent mb-2">
            Dashboard Analítico
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Visualiza y analiza las métricas clave de tu organización
          </p>
        </div>
      </div>

      {/* Tabs Navigation Mejorado */}
      <div className="mb-8 overflow-x-auto scrollbar-hide">
        <div className="flex gap-3 min-w-max pb-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`
                  relative flex items-center gap-3 px-5 py-3.5 rounded-2xl font-semibold
                  transition-all duration-300 whitespace-nowrap overflow-hidden
                  ${
                    isActive
                      ? "bg-gradient-to-r from-primary-purple to-primary-blue text-white shadow-lg shadow-primary-purple/30"
                      : "bg-white text-gray-700 hover:bg-gray-50 hover:shadow-md border border-gray-200"
                  }
                `}
              >
                {/* Efecto de brillo en hover */}
                {isActive && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    initial={{ x: "-100%" }}
                    animate={{ x: "100%" }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      repeatDelay: 1,
                    }}
                  />
                )}

                <div
                  className={`
                  p-2 rounded-xl transition-all duration-300
                  ${isActive ? "bg-white/20" : "bg-gray-100"}
                `}
                >
                  <Icon
                    className={`text-lg ${isActive ? "text-white" : "text-primary-purple"}`}
                  />
                </div>

                <span className="text-sm sm:text-base relative z-10">
                  {tab.label}
                </span>

                {/* Indicador activo */}
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-1 bg-white/50 rounded-full"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Content Section with Animation */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          {renderSection()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default Dashboard;

