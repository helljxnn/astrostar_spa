import React from "react";
import { useLoading } from "../contexts/loaderContext";

const Requests = async (url, data = null, method) => {
    const { ShowLoading, HideLoading } = useLoading(); // Asegúrate de obtener HideLoading

    let formData = null;

    try {
        ShowLoading();

        if (data) {
            formData = new FormData();
            for (const key in data) {
                formData.append(key, data[key]);
            }
        }

        const response = await fetch(url, {
            method: method,
            body: formData,
        });

        if (!response.ok) {
            // Manejar errores HTTP (ej., 404, 500)
            const errorText = await response.text();
            throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorText}`);
        }

        const responseData = await response.json();
        return responseData;

    } catch (error) {
        console.error("Request failed:", error); // Registrar el error para depuración
        throw error; // Volver a lanzar el error para que lo maneje el componente que llama a Requests
    } finally {
        HideLoading();
    }
};

export default Requests;