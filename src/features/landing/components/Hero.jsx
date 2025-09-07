export const Hero = ({ title, imageUrl, subtitle }) => {
  if (!title && !subtitle) return null; // evita renderizar vacío

  return (
    <section
      className="min-h-screen bg-cover bg-center bg-no-repeat flex justify-center items-center px-6 mb-0 -mt-6"
      style={{
        marginLeft: "calc(-50vw + 50%)",
        marginRight: "calc(-50vw + 50%)",
        width: "100vw",
        backgroundImage: imageUrl ? `url(${imageUrl})` : "none",
      }}
    >
      <div className="bg-white p-12 rounded-2xl shadow-lg w-full max-w-7xl text-center mt-80">
        {title && (
          <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#B595FF] to-[#9BE9FF] mb-6 font-questrial">
            {title}
          </h1>
        )}
        {subtitle && (
          <p className="text-xl text-gray-700 font-questrial mb-4">
            {subtitle}
          </p>
        )}
      </div>
    </section>
  );
};
