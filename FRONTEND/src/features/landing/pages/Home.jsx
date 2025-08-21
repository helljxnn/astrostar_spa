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
    </div>
  );
}

export default Home;
