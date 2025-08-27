import React from "react";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  // Función para manejar la navegación
  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-cyan-100">
      <div className="p-10 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Header principal */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-8 border border-white/20">
            <h1 className="text-5xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Bienvenido a la Página Principal
            </h1>
            <p className="text-gray-600 text-lg">
              Sistema de Gestión Deportiva
            </p>
          </div>
          
          {/* Grid de navegación */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* About */}
            <div className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-white/20 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">About</h3>
                <p className="text-blue-100 text-sm">Información del sistema</p>
              </div>
              <div className="p-6">
                <p className="text-gray-600 mb-4">
                  Conoce más sobre nuestra plataforma deportiva y sus características.
                </p>
                <button 
                  onClick={() => handleNavigation('/about')}
                  className="w-full py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                >
                  Ir a About
                </button>
              </div>
            </div>

            {/* Admin */}
            <div className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-white/20 overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-500 to-green-500 p-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Administrador</h3>
                <p className="text-emerald-100 text-sm">Panel de control administrativo</p>
              </div>
              <div className="p-6">
                <p className="text-gray-600 mb-4">
                  Gestiona usuarios, configuraciones y supervisión general del sistema.
                </p>
                <button 
                  onClick={() => handleNavigation('/dashboard')}
                  className="w-full py-2 px-4 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors font-medium"
                >
                  Ir a Admin
                </button>
              </div>
            </div>

            {/* Profesional Deportivo */}
            <div className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-white/20 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-500 to-indigo-500 p-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Profesional Deportivo</h3>
                <p className="text-purple-100 text-sm">Herramientas para entrenadores</p>
              </div>
              <div className="p-6">
                <p className="text-gray-600 mb-4">
                  Acceso a herramientas especializadas para profesionales del deporte.
                </p>
                <button 
                  onClick={() => handleNavigation('/dashboard/sportsprofessional')}
                  className="w-full py-2 px-4 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-medium"
                >
                  Ir a Profesional
                </button>
              </div>
            </div>

            {/* Deportistas/Acudientes */}
            <div className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-white/20 overflow-hidden">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Deportistas</h3>
                <p className="text-orange-100 text-sm">Portal para atletas y acudientes</p>
              </div>
              <div className="p-6">
                <p className="text-gray-600 mb-4">
                  Seguimiento de progreso y comunicación con entrenadores.
                </p>
                <button 
                  onClick={() => handleNavigation('/dashboard/athletes')}
                  className="w-full py-2 px-4 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
                >
                  Ir a Deportistas
                </button>
              </div>
            </div>
          </div>

          {/* Footer informativo */}
          <div className="mt-8 bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <p className="text-gray-600 text-sm">
              Selecciona tu rol para acceder a las herramientas correspondientes de gestión deportiva.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;