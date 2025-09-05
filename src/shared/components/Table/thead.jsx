import React from "react";


const Thead = ({ options })=>{
    return(
        <thead id="thead" className={`w-${options.width} h-${options.height} font-questrial text-gray-400 text-sm border-b border-gray-300`}>
            <tr className="w-full h-auto">
                {options.thead.titles.map((item) => (
                    <th className="w-full h-auto p-4">{item}</th>    
                ))}
                {options.thead.state ? (
                    <th className="w-full h-auto p-4">Estado</th>
                ): null}
                <th className="w-full h-auto p-4">Acciones</th>
            </tr>
        </thead>
    );
}

export default Thead;