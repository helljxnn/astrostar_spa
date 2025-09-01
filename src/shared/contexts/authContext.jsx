import React, { createContext } from "react";

//*: Creamos el contexto
const AuthContext = createContext();

//*: Creamos el provider que sera el que contiene nuestras variables de estado y funciones
function AuthProvider({ children }) {


    //*: Retornamos el provider con las variables de estado y funciones donde el children
    //*: sera el componenete de RoutesApp
    return (
        <AuthContext.Provider value={{}}>
            {children}
        </AuthContext.Provider>

    )
}

export default AuthProvider;
export { AuthContext };