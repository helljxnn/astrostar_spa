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

      // Validacion para saber si es por la expiracion del token
      if(response.status === 403){
        const responseToken = await fetch('http://localhost:3000/api/auth/refreshToken',{
          method: "POST",
          credentials: "include",
        })
        if(responseToken.ok){
          // Reintentar la peticion original despues de refrescar el token
          return await Requests(url, data, method, customHeaders);
        }
      }
    }

    return responseData;
  } catch (error) {
    // Si el error ya fue procesado arriba, tendrá un mensaje. Si no (ej. error de red), usamos el mensaje por defecto.
    console.error("Error en la petición a:", url, error); // Registrar el error para depuración
    throw error; // Volver a lanzar el error para que lo maneje el código que llama a Requests
  }
};

export default Requests;
