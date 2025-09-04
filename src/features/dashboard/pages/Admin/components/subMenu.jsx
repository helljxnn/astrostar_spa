import React from "react";
import LinksOptions from "./linksOptions";

const SubMenu = () => {
    return (
        <div id="options" className="w-48 h-auto bg-white rounded-lg shadow-lg border border-gray-200">
            <ul className="w-full h-auto flex flex-col list-none space-y-1">
                <li>
                    <LinksOptions url="/" option="Ver perfil" />
                </li>
                <li>
                    <LinksOptions url="/" option="Editar perfil" />
                </li>
            </ul>
        </div>
    );
}

export default SubMenu;