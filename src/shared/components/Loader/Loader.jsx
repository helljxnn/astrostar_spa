import "./Loader.css";

const Loader = ({ isVisible = false, message = "Cargando..." }) => {
  if (!isVisible) return null;

  return (
    <div className="astro-loader-overlay">
      <div className="astro-loader-content">
        <div className="astro-loader-spinner" />
        {message && <p className="astro-loader-message">{message}</p>}
      </div>
    </div>
  );
};

export default Loader;
