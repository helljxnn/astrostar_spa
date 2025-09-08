import React from "react";
import { motion } from "framer-motion";
import LinksOptions from "./linksOptions";

const SubMenu = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
      transition={{ duration: 0.2 }}
      className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden"
    >
      <ul className="flex flex-col">
        <li>
          <LinksOptions
            url="/"
            option="Ver perfil"
            className="block px-4 py-2 hover:bg-primary-purple/10 text-gray-700 transition"
          />
        </li>
        <li>
          <LinksOptions
            url="/"
            option="Editar perfil"
            className="block px-4 py-2 hover:bg-primary-blue/10 text-gray-700 transition"
          />
        </li>
      </ul>
    </motion.div>
  );
};

export default SubMenu;
