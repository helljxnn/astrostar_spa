import React from "react";

const Loader = () => {
    return (
        <div
            id="containerLoader"
            className="fixed inset-0 w-full h-screen bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center"
            aria-label="Cargando contenido"
        >
            <div id="boxLoader" className="w-24 h-24">
                <img src="/assets/Icons/LoaderWhite.png" alt="Animación de carga" id="IconLoader" className="w-full h-full animate-bounce" />
            </div>
        </div>
    )
}

export default Loader;