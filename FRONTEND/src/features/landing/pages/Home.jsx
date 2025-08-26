import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="p-10 text-center">
      <h1 className="text-4xl font-extrabold text-teal-700 mb-4">
        Bienvenido a la Página Principal
      </h1>
      <p className="mt-4">
        <Link to="/about"  className="text-blue-600 font-semibold hover:text-blue-800 underline" >About</Link>
      </p>
      
      <p className="mt-4">
         <Link to="/dashboard"  className="text-blue-600 font-semibold hover:text-blue-800 underline"> Admin</Link>
</p>
      <p className="mt-4">
         <Link to="/dashboard/sportsprofessional"  className="text-blue-600 font-semibold hover:text-blue-800 underline"> Profesional deportivo </Link>
</p>
      <p className="mt-4">
         <Link to="/dashboard/athletes"  className="text-blue-600 font-semibold hover:text-blue-800 underline"> Deportistas/Acudientes </Link>
</p>
    </div>
  );
}

export default Home;
