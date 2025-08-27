import React from "react";

export const Hero = ({ title, imageUrl, subtitle }) => {
  return (
    <section
      className="relative w-screen min-h-screen overflow-hidden"
      style={{
        margin: 0,
        padding: 0,
        marginLeft: "calc(-50vw + 50%)",
        marginRight: "calc(-50vw + 50%)",
        width: "100vw",
        maxWidth: "none",
      }}
    >
      <img
        src={imageUrl}
        alt="Hero Background"
        className="absolute inset-0 w-full h-full object-cover"
        style={{
          width: "100vw",
          height: "100vh",
          objectFit: "cover",
          objectPosition: "center",
        }}
      />

      <div
        className="relative flex justify-center items-end text-center pb-16 min-h-screen z-10"
        style={{ paddingLeft: "24px", paddingRight: "24px" }}
      >
        <div
          className="bg-white p-12 rounded-2xl shadow-lg"
          style={{ width: "100%", maxWidth: "1280px" }}
        >
          <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#B595FF] to-[#9BE9FF] mb-6 font-questrial">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xl text-gray-700 font-questrial mb-4">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </section>
  );
};
