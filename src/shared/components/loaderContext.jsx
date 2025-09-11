import React, { createContext, useState, useContext, useMemo } from 'react';
import Loader from '../components/loader';

const LoaderContext = createContext(null);

export const LoaderProvider = ({ children }) => {
    const [isLoading, setIsLoading] = useState(false);

    // Usamos useMemo para optimizar y evitar que el valor del contexto cambie en cada render.
    const contextValue = useMemo(() => ({
        showLoading: () => setIsLoading(true),
        hideLoading: () => setIsLoading(false),
    }), []);

    return (
        <LoaderContext.Provider value={contextValue}>
            {children}
            {isLoading && <Loader />}
        </LoaderContext.Provider>
    );
};

export const useLoading = () => {
    const context = useContext(LoaderContext);
    if (context === null) {
        throw new Error('useLoading debe ser usado dentro de un LoaderProvider');
    }
    return context;
};