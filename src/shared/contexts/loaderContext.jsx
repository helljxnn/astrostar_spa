import React, { useContext, useState } from "react";
import { createContext } from "react";


const LoadingContext = createContext();

const LoadingProvider = ({ children }) => {
    const [loader, setLoader] = useState(false);
    const ShowLoading = () => setLoader(true);
    const HideLoading = () => setLoader(false);
    return (
        <LoadingContext.Provider value={{ loader, ShowLoading, HideLoading }}>
            { children }
        </LoadingContext.Provider>
    )
}

const useLoading = ()=>{
    const context = useContext(LoadingContext);
    if(context === undefined){
        throw new Error("useLoading must be used within a LoadingProvider");
    }
    return context;
}

export default LoadingProvider;
export { useLoading }