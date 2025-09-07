import React from "react";
import { MapPin } from "lucide-react";
import { SiGmail } from "react-icons/si";
import { FaYoutube, FaInstagram, FaWhatsapp } from "react-icons/fa";

export const Footer = () => {
  return (
    <div className="bg-white border-t-4 border-primary-blue">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 py-4 space-x-8 ">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-20">
          {/* Brand Section */}
          <div className="space-y-6">
            <p className="mb-4">
              <img
                src="/assets/images/Logo2LFundacionMV.png"
                alt="Logo Fundación MV 1"
                className="h-auto max-h-20 mx-auto md:mx-0 left-4 right-4"
              />
            </p>

            <div className="space-y-3">
              <h3 className="font-semibold text-gray-700">Contactános</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                PARA MÁS INFORMACIÓN SOBRE EL PROCESO DE INSCRIPCIÓN, MATRÍCULA,
                UNIFORMES Y TEMAS VARIOS.
              </p>
            </div>
          </div>

          {/* Contact Section with Map */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-700">Encuentranos en</h3>

            {/* Contact Information */}
            <div className="space-y-3">
              <div className="flex items-start gap-3 text-sm text-gray-600">
                <MapPin className="w-4 h-4 text-primary-blue mt-0.5" />
                <span>Unidad Deportiva Cristo Rey, Copacabana, Antioquia</span>
              </div>
            </div>

            {/* Mini Map */}
            <div className="mt-4">
              <div className="w-full h-32 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3965.404433080868!2d-75.5059052!3d6.341635!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e44256d17c088b3%3A0x99837355f923fefe!2sUnidad%20Deportiva%20Cristo%20Rey!5e0!3m2!1ses-419!2sco!4v1756949665315!5m2!1ses-419!2sco"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Ubicación FMV"
                ></iframe>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Haz clic para ver el mapa completo
              </p>
            </div>
          </div>

          {/* Social Media Section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-700">Nuestras Redes</h3>
            <p className="text-sm text-gray-600">
              Síguenos en nuestras redes sociales para estar al día con nuestras
              novedades.
            </p>

            <div className="flex gap-8">
              {/* Instagram */}
              <a
                href="https://www.instagram.com/fundacionmv.co"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-primary-purple hover:opacity-75 rounded-full flex items-center justify-center transition-colors"
              >
                <FaInstagram className="w-5 h-5 text-white" />
              </a>

              {/* WhatsApp */}
              <a
                href="https://wa.me/573245721322"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-primary-purple hover:opacity-75 rounded-full flex items-center justify-center transition-colors"
              >
                <FaWhatsapp className="w-5 h-5 text-white" />
              </a>  

              {/* Gmail */}
              <a
                href="mailto:fundacionmanuelavanuelvanegas@gmail.com"
                className="w-10 h-10 bg-primary-purple hover:opacity-75 rounded-full flex items-center justify-center transition-colors"
              >
                <SiGmail className="w-5 h-5 text-white" />
              </a>

              {/* YouTube */}
              <a
                href="https://www.youtube.com/@FundacionManuelaVanegas"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-primary-purple hover:opacity-75 rounded-full flex items-center justify-center transition-colors"
              >
                <FaYoutube className="w-5 h-5 text-white" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};