import React from "react";

const Form = ()=>{
    return(
        <div className="w-full h-auto p-4 grid grid-rows-3 gap-4 bg-none" id='containerForm'>
            {/* Contenedor de formulario */}
            <div className="w-full h-auto" id="header">
                {/* Cabecera del formulario */}
                <h1 className="text-lg ">Iniciar sesion</h1>

            </div>
            <div className="w-full h-auto" id="body">
                {/* Cuerpo del formulario */}
            </div>
            <div className="w-full h-auto" id="footer">
                {/* Pie del formulario */}
                <button className="w-full h-auto bg-gradient-to-r from-primary-blue to-primary-purple">
                    <p>Entrar</p>
                </button>
            </div>
        </div>
    )
}

export { Form }