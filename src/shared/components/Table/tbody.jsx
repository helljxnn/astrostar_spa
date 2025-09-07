import React from "react";
import { FaEye } from "react-icons/fa";
import { FaRegEdit } from "react-icons/fa";
import { FaTrash } from "react-icons/fa";



const Tbody = ({ options }) => {
    return (
        <tbody id="tbody" className={`w-full h-auto`}>
            {options.tbody.data && options.tbody.data.length > 0 ? (
                options.tbody.data.map((item, index) => {
                    // Extraemos la propiedad 'estado' para manejarla por separado.
                    const { estado } = item;
                    return (
                        <tr key={index} className="relative w-full h-16 text-center font-semibold after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:w-full after:h-[2px] after:-translate-x-1/2 after:bg-gray-200 last:after:hidden">
                            {options.tbody.dataPropertys.map((property, i) => (
                                <td key={i} className="p-2">{item[property]}</td>
                            ))}

                            {options.tbody.state && (
                                <td className={estado === 'Activo' ? 'text-primary-blue' : 'text-primary-purple'}>{estado}</td>
                            )}

                            <td className="flex items-center justify-center h-16 gap-4">
                                <button className="text-primary-blue hover:opacity-75 transition-opacity"><FaRegEdit /></button>
                                <button className="text-red-600 hover:opacity-75 transition-opacity"><FaTrash /></button>
                                <button className="text-primary-purple hover:opacity-75 transition-opacity"><FaEye /></button>
                            </td>
                        </tr>

                    );
                })
            ) : (
                <tr>
                    <td colSpan="100%" className="p-4 text-center text-gray-500">
                        No hay datos para mostrar.
                    </td>
                </tr>
            )}
        </tbody >
    );
}

export default Tbody;