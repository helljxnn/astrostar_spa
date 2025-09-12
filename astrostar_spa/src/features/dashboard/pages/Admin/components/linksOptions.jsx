import React from "react";



const LinksOptions = ({ url, option }) => {
    return (
        <a href={url} className="w-full block px-4 py-2 text-sm text-gray-700 rounded-md hover:bg-primary-purple hover:text-white transition-colors duration-200">
            {option}
        </a>
    );
}

export default LinksOptions;