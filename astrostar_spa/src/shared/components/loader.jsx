import React from "react";

const Loader = () =>{
    return (
        <div id="containerLoader" className="fixed top-0 left-0 w-full h-screen bg-gray-900 bg-opacity-50 z-50 flex items-center justify-center">
            <div id="boxLoader" className="w-40 h-40 m-auto p-4 flex flex-col items-center justify-center">
                <img src="/assets/Icons/LoaderWhite.png" alt="Cargando..." id="IconLoader" className="w-full h-full animate-bounce" />
                <h1 className="text-white text-4xl">Cargando...</h1>
            </div>
        </div>
    )
}

export { Loader }