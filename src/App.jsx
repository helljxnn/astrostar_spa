<<<<<<< HEAD
import React from "react";
import AppRoutes from "./routes/Router";
import AuthProvider from "./shared/contexts/authContext";
import LoadingProvider from "./shared/contexts/loaderContext";


function App() {
  return (
    <AuthProvider>
      <LoadingProvider>
        <AppRoutes />
      </LoadingProvider>
    </AuthProvider>
  );
}

export default App;
=======
// import React from 'react';
// import { Footer } from './shared/components/Footer/Footer'; // Ajusta la ruta según tu estructura

// function App() {
//   return (
    
//     <div className="min-h-screen flex flex-col">
//       <main className="flex-grow">
        
//       </main>
//       <Footer />
//     </div>
//   );
// }

// export default App;

import AppRoutes from "./routes/Router";

function App() {
  return <AppRoutes />;
}

export default App;
       
>>>>>>> 4cbd1a9142e14a672f15310c8802af1acf53352c
