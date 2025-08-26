import React from 'react';
import { Form } from '../components/form';

function Login  ()  {
  return (
    <div className='w-1/2 h-auto grid grid-cols-1 gap-0 p-4 bg-gradient-to-r from-primary-purple to-primary-blue rounded-lg border-none' id='mainContainer'>
      {/* Contenedor principal */}
      <div className='grid grid-cols-2 gap-1 border-gray-800 bg-opacity-0' id='subContainer'>
        {/* Subcontenedor */}
        <div id='formLogin'>
          {/* Contenedor de formulario */}
          <Form />
        </div>
        <div id='imageContainer'>
          {/* Contenedor de imagenes */}
          
        </div>
      </div>
    </div>
  );
}
export default Login;