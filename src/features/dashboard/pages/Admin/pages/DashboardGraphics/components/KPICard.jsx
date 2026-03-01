import { motion } from "framer-motion";

const KPICard = ({ title, value, icon: Icon, color, trend, trendValue }) => {
  const colorClasses = {
    purple: {
      gradient: "from-primary-purple to-primary-purple-light",
      bg: "bg-primary-purple/10",
      text: "text-primary-purple",
      shadow: "shadow-primary-purple/20",
    },
    blue: {
      gradient: "from-primary-blue to-blue-400",
      bg: "bg-primary-blue/10",
      text: "text-primary-blue",
      shadow: "shadow-primary-blue/20",
    },
    green: {
      gradient: "from-primary-green to-emerald-400",
      bg: "bg-primary-green/10",
      text: "text-primary-green",
      shadow: "shadow-primary-green/20",
    },
    pink: {
      gradient: "from-primary-pink to-pink-400",
      bg: "bg-primary-pink/10",
      text: "text-primary-pink",
      shadow: "shadow-primary-pink/20",
    },
    yellow: {
      gradient: "from-primary-yellow to-yellow-400",
      bg: "bg-primary-yellow/10",
      text: "text-primary-yellow",
      shadow: "shadow-primary-yellow/20",
    },
    red: {
      gradient: "from-primary-red to-red-400",
      bg: "bg-primary-red/10",
      text: "text-primary-red",
      shadow: "shadow-primary-red/20",
    },
  };

  const selectedColor = colorClasses[color] || colorClasses.purple;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ duration: 0.3 }}
      className={`bg-white rounded-2xl shadow-lg hover:shadow-xl ${selectedColor.shadow} transition-all duration-300 p-6 relative overflow-hidden border border-gray-100`}
    >
      {/* Background gradient decoration */}
      <div
        className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${selectedColor.gradient} opacity-10 rounded-full -mr-12 -mt-12`}
      />
      <div
        className={`absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr ${selectedColor.gradient} opacity-5 rounded-full -ml-8 -mb-8`}
      />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div
            className={`p-3.5 rounded-xl bg-gradient-to-br ${selectedColor.gradient} text-white shadow-md`}
          >
            <Icon className="text-2xl" />
          </div>
          {trend && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className={`text-xs font-bold px-3 py-1.5 rounded-full ${
                trend === "up"
                  ? "bg-primary-green/20 text-green-700"
                  : "bg-primary-red/20 text-red-700"
              }`}
            >
              {trend === "up" ? "↑" : "↓"} {trendValue}
            </motion.div>
          )}
        </div>

        <h3 className="text-sm text-gray-500 font-medium mb-2">{title}</h3>
        <p className="text-3xl font-bold text-gray-800">{value}</p>
      </div>
    </motion.div>
  );
};

export default KPICard;
