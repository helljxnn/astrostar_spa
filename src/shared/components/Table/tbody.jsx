import React from "react";


const Tbody = ({ options }) => {
    return (
        <tbody id="tbody" className={`w-full h-auto`}>
            {options.tbody.data.length > 0 ?
                options.tbody.data.map((item, index) => (
                    <tr>
                        <td className="w-full h-auto p-4">{item.NombreMaterial}</td>
                        <td className="w-full h-auto p-4">{item.CantidadComprado}</td>
                        <td className="w-full h-auto p-4">{item.NombreMaterial}</td>
                        <td className="w-full h-auto p-4">{item.NombreMaterial}</td>
                        {options.tbody.state ? (
                            <td className="w-full h-auto p-4">{item.Estado}</td>
                        ) : null}
                        <td className="w-full h-auto p-4">
                            <button>See more</button>
                            <button>Edit</button>
                            <button>Delete</button>
                        </td>
                    </tr>
                ))
                : null}
        </tbody>
    );
}

export default Tbody;