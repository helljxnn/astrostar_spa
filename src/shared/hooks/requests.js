const Requests = async (url, data = null, method, customHeaders = {}) => {
  const headers = { ...customHeaders };
  let body;

  try {
    if (data) {
      // Si los datos no son FormData, los convertimos a JSON.
      // Esto permite enviar archivos si pasamos un FormData directamente.
      if (!(data instanceof FormData)) {
        headers["Content-Type"] = "application/json";
        body = JSON.stringify(data);
      } else {
        // Si es FormData, fetch se encarga del Content-Type (multipart/form-data)
        body = data;
      }
    }

    const response = await fetch(url, {
      method: method,
      headers: headers,
      body: body, // puede ser undefined, una cadena JSON, o FormData
      credentials: "include", // Correcto para enviar cookies
    });

    // Intentamos parsear la respuesta como JSON en cualquier caso.
    // Esto es útil para obtener el mensaje de error del cuerpo si la petición falla.
    const responseData = await response.json().catch(() => null);

    if (!response.ok) {
      // Usamos el mensaje del backend si está disponible, si no, el statusText del navegador.
      const errorMessage =
        responseData?.message ||
        response.statusText ||
        "Ocurrió un error en la petición";
      const error = new Error(errorMessage);
      error.status = response.status;
      error.response = responseData; // Adjuntamos la respuesta completa al error
      throw error;
    }

    return responseData;
  } catch (error) {
    // Si el error ya fue procesado arriba, tendrá un mensaje. Si no (ej. error de red), usamos el mensaje por defecto.
    console.error("Error en la petición a:", url, error); // Registrar el error para depuración
    throw error; // Volver a lanzar el error para que lo maneje el código que llama a Requests
  }
};

export default Requests;
