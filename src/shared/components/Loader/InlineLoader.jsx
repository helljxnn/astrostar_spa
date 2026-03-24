import "./Loader.css";

const InlineLoader = ({ message = "Cargando...", size = "medium" }) => {
  const sizeClass =
    size === "small"
      ? "astro-inline-loader--small"
      : size === "large"
        ? "astro-inline-loader--large"
        : "astro-inline-loader--medium";

  return (
    <div className={`astro-inline-loader ${sizeClass}`}>
      <div className="astro-inline-loader-content">
        <div className="astro-inline-loader-spinner" />
        {message && <p className="astro-inline-loader-message">{message}</p>}
      </div>
    </div>
  );
};

export default InlineLoader;
