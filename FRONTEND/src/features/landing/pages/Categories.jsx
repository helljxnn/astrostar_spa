import { Link } from "react-router-dom";

function Categories() {
  return (
    <div className="p-10 text-center">
      <h1 className="text-4xl font-extrabold text-teal-700 mb-4">
        Bienvenido a categorias
      </h1>

      <p className="mt-4">
        Ir a la sección <Link to="/about" className="text-blue-500 underline">About</Link>
      </p>
    </div>
  );
}

export default Categories;
