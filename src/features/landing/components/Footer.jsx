import React from "react";

export const Footer = () => {
  return (
    <footer className="relative mt-0 w-full">
      {/* Contenedor principal del footer */}
      <div className="relative w-full" style={{ height: "290px" }}>
        {/* Onda morada (fondo) - usando el SVG original */}
        <svg
          className="absolute top-0 left-0 w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 509"
          fill="none"
          preserveAspectRatio="none"
        >
          <path
            d="M0 19.5429L20 35.8286C40 52.1143 80 84.6857 120 93.3714C160 102.057 200 86.8571 240 104.229C280 121.6 320 171.543 360 158.949C400 146.137 440 71.0057 480 52.5486C520 34.0915 560 72.3086 600 93.3714C640 114.434 680 117.909 720 136.366C760 154.823 800 188.263 840 176.971C880 165.68 920 110.091 960 74.9143C1000 39.7371 1040 25.4057 1080 36.2629C1120 47.12 1160 83.1657 1200 105.966C1240 128.766 1280 138.32 1320 118.343C1360 98.3657 1400 49.2914 1420 24.5371L1440 0V508.114H1420C1400 508.114 1360 508.114 1320 508.114C1280 508.114 1240 508.114 1200 508.114C1160 508.114 1120 508.114 1080 508.114C1040 508.114 1000 508.114 960 508.114C920 508.114 880 508.114 840 508.114C800 508.114 760 508.114 720 508.114C680 508.114 640 508.114 600 508.114C560 508.114 520 508.114 480 508.114C440 508.114 400 508.114 360 508.114C320 508.114 280 508.114 240 508.114C200 508.114 160 508.114 120 508.114C80 508.114 40 508.114 20 508.114H0V19.5429Z"
            fill="#B595FF"
          />
        </svg>

        {/* Onda celeste (frente) - usando el SVG original con ligero desplazamiento */}
        <svg
          className="absolute top-0 left-0 w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 509"
          fill="none"
          preserveAspectRatio="none"
          style={{ transform: "translateY(15px)" }}
        >
          <path
            d="M0 19.5429L20 35.8286C40 52.1143 80 84.6857 120 93.3714C160 102.057 200 86.8571 240 104.229C280 121.6 320 171.543 360 158.949C400 146.137 440 71.0057 480 52.5486C520 34.0915 560 72.3086 600 93.3714C640 114.434 680 117.909 720 136.366C760 154.823 800 188.263 840 176.971C880 165.68 920 110.091 960 74.9143C1000 39.7371 1040 25.4057 1080 36.2629C1120 47.12 1160 83.1657 1200 105.966C1240 128.766 1280 138.32 1320 118.343C1360 98.3657 1400 49.2914 1420 24.5371L1440 0V508.114H1420C1400 508.114 1360 508.114 1320 508.114C1280 508.114 1240 508.114 1200 508.114C1160 508.114 1120 508.114 1080 508.114C1040 508.114 1000 508.114 960 508.114C920 508.114 880 508.114 840 508.114C800 508.114 760 508.114 720 508.114C680 508.114 640 508.114 600 508.114C560 508.114 520 508.114 480 508.114C440 508.114 400 508.114 360 508.114C320 508.114 280 508.114 240 508.114C200 508.114 160 508.114 120 508.114C80 508.114 40 508.114 20 508.114H0V19.5429Z"
            fill="#9BE9FF"
          />
        </svg>

        {/* Contenido del Footer */}
        <div className="absolute inset-0 flex flex-col justify-center px-4 lg:px-8">
          <div className="max-w-7xl mx-auto w-full">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-start pt-8 lg:pt-12">
              {/* Sección Contáctanos */}
              <div className="lg:col-span-4">
                <h2
                  className="text-2xl lg:text-3xl font-bold mb-4 text-black border-b-2 border-black pb-1 inline-block"
                  style={{ fontFamily: "Questrial, sans-serif" }}
                >
                  Contáctanos
                </h2>

                <div className="space-y-3">
                  {/* Instagram */}
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 flex-shrink-0">
                      <svg
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-full h-full text-black"
                      >
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                      </svg>
                    </div>
                    <a
                      href="https://www.instagram.com/fundacionmv.co"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-black font-medium text-sm"
                    >
                      fundacionmv.co
                    </a>
                  </div>

                  {/* Email */}
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 flex-shrink-0">
                      <svg
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-full h-full text-black"
                      >
                        <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                      </svg>
                    </div>
                    <a
                      href="mailto:fundacionmanuelavanuelvanegas@gmail.com" 
                      target="_blank"
                      className="text-black font-medium text-sm"
                    >
                      fundacionmanuelavanegas@gmail.com
                    </a>
                  </div>

                  {/* Teléfono */}
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 flex-shrink-0">
                      <svg
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-full h-full text-black"
                      >
                        <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                      </svg>
                    </div>
                    <a
                      href="https://wa.me/573245721322" 
                      target="_blank"
                      className="text-black font-bold text-lg"
                    >
                      3245721322
                    </a>
                  </div>
                </div>
              </div>

              {/* Sección Ubicación */}
              <div className="lg:col-span-4 lg:pl-4 pt-5">
                <h3 className="text-sm font-semibold mb-2 text-black flex items-center gap-2 border-b border-black pb-1 lg:text-2xl">
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-4 h-4"
                  >
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </svg>
                  Encuéntranos en:
                </h3>
                <a
                  href="https://maps.app.goo.gl/UL4ZJaMrm5ndLEUE7"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-black font-medium text-sm leading-relaxed block"
                >
                  Cra. 49 #39- 45, Unidad Deportiva Cristo Rey
                  <br />
                  Copacabana, Antioquia - Colombia
                </a>
              </div>

              {/* Sección Información */}
              <div className="lg:col-span-4">
                <div className="bg-primary-purple rounded-lg p-6 w-25 h-30 text-center shadow-lg mt-2 border-r-2 border-b-2 border-primary-blue">
                  <p className="text-black font-bold text-xs uppercase leading-tight">
                    PARA MÁS INFORMACIÓN
                    <br />
                    SOBRE EL PROCESO DE
                    <br />
                    INSCRIPCIÓN,
                    <br />
                    MATRÍCULA, UNIFORMES Y<br />
                    TEMAS VARIOS.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Línea de desarrolladores con línea negra */}
        <div
          className="absolute bottom-0 left-0 right-0 px-6"
          style={{ fontFamily: "Questrial, sans-serif" }}
        >
          {/* Línea negra delgada */}
          <div className="w-full h-px bg-black mb-2"></div>
          {/* Texto de desarrolladores */}
          <div className="text-center pb-2">
            <p className="text-black text-xs">
              Developed By: Jennifer Lascarro - Anderson Murillo - Valeria
              Barrientos - Alejandro Granada
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};