import PropTypes from "prop-types";
import { Link } from "react-router-dom";

export const NotFound = ({
  title = "Pagina no encontrada",
  description = "La ruta que intentas abrir no existe o fue movida.",
  primaryHref = "/",
  primaryLabel = "Ir al inicio",
  secondaryHref = "/dashboard",
  secondaryLabel = "Ir al dashboard",
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-6">
      <div className="w-full max-w-3xl relative">
        <div className="absolute -top-12 -left-10 w-40 h-40 bg-blue-200/40 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-6 w-44 h-44 bg-indigo-200/40 rounded-full blur-2xl pointer-events-none" />

        <div className="relative bg-white/90 backdrop-blur border border-white rounded-3xl shadow-xl px-8 py-10 md:px-12 md:py-12 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg mb-6">
            <span className="text-3xl font-bold">404</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
            {title}
          </h1>
          <p className="text-slate-600 max-w-xl mx-auto mb-8">{description}</p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to={primaryHref}
              className="px-6 py-3 rounded-xl bg-slate-900 text-white font-medium hover:bg-slate-800 transition-colors"
            >
              {primaryLabel}
            </Link>
            <Link
              to={secondaryHref}
              className="px-6 py-3 rounded-xl border border-slate-300 bg-white text-slate-700 font-medium hover:bg-slate-50 transition-colors"
            >
              {secondaryLabel}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;

NotFound.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  primaryHref: PropTypes.string,
  primaryLabel: PropTypes.string,
  secondaryHref: PropTypes.string,
  secondaryLabel: PropTypes.string,
};


