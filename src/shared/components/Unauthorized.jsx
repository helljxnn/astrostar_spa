import PropTypes from "prop-types";
import { Link } from "react-router-dom";

export const Unauthorized = ({
  title = "No tienes acceso a esta vista",
  description = "Tu usuario no cuenta con permisos para entrar aqui. Si crees que es un error, contacta al administrador.",
  primaryHref = "/dashboard",
  primaryLabel = "Volver al dashboard",
  secondaryHref = "/",
  secondaryLabel = "Ir al inicio",
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-blue-100 flex items-center justify-center p-6">
      <div className="w-full max-w-3xl relative">
        <div className="absolute -top-10 -left-8 w-36 h-36 bg-amber-200/40 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -right-8 w-40 h-40 bg-blue-200/40 rounded-full blur-2xl pointer-events-none" />

        <div className="relative bg-white/95 backdrop-blur rounded-3xl shadow-xl border border-white px-8 py-10 md:px-12 md:py-12 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-lg mb-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-10 h-10"
            >
              <path
                fillRule="evenodd"
                d="M12.516 2.17a1 1 0 00-1.032 0l-7.5 4.5A1 1 0 003.5 7.53v4.97c0 5.097 3.296 8.923 7.808 10.247a1 1 0 00.384 0C16.204 21.423 19.5 17.597 19.5 12.5V7.53a1 1 0 00-.484-.86l-7.5-4.5zM12 8a1.25 1.25 0 011.25 1.25V12a1.25 1.25 0 11-2.5 0V9.25A1.25 1.25 0 0112 8zm0 8a1.25 1.25 0 100-2.5A1.25 1.25 0 0012 16z"
                clipRule="evenodd"
              />
            </svg>
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

Unauthorized.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  primaryHref: PropTypes.string,
  primaryLabel: PropTypes.string,
  secondaryHref: PropTypes.string,
  secondaryLabel: PropTypes.string,
};


