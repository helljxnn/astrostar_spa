import { useNavigate } from 'react-router-dom';
import Form from "../components/form";

function Login() {
  const navigate = useNavigate();

  const handleLogin = (userData) => {
    console.log('Datos del login:', userData);
    
    // Aquí puedes agregar validaciones básicas si quieres
    // Por ejemplo, verificar que los campos no estén vacíos
    if (userData.email && userData.password) {
      // Simular login exitoso y redirigir al home
      console.log('Login exitoso, redirigiendo...');
      navigate('/'); // Redirige al home
    } else {
      console.log('Por favor completa todos los campos');
      // Aquí podrías mostrar un mensaje de error si quisieras
    }
  };

  return (
    <div className='w-4/5 h-auto m-auto grid grid-cols-1 gap-0 p-8 justify-items-center bg-gradient-to-r from-primary-purple to-primary-blue rounded-lg border-none' id='mainContainer'>
      <div className='w-full h-auto grid grid-cols-2 gap-1 border-2 rounded-lg border-primary-purple/50 bg-opacity-0' id='subContainer'>
        <div className='w-auto h-auto p-4' id='formLogin'>
          {/* Formulario de login */}
          <Form />
        </div>
        <div className='w-auto h-auto p-4' id='imageContainer'>
          {/* Aquí puedes agregar una imagen o ilustración */}
          <img className='w-full h-full' src="public\assets\images\Convocatoria.png" alt="Convocatoria" />
        </div>
      </div>
    </div>
  );
}

export default Login;