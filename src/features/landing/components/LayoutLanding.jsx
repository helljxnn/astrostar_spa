<<<<<<< HEAD
    import { Outlet } from 'react-router-dom';
    import {Navbar} from './Navbar';
    import { Hero } from './Hero';
    import { Footer } from "./Footer";
=======
import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Hero } from "./Hero";
import { Footer } from "./Footer";
import { ScrollTop } from "./ScrollTop";
>>>>>>> 73ae107f40a21c17fb8a5dbe3df097009be08a5b

function LayoutLanding() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />

<<<<<<< HEAD
    function LayoutLanding(){
        return (
            <div className="flex flex-col min-h-screen bg-white"> 
                
                <Navbar />

                <main className="flex-1 p-6 bg-gray-50 w-full">
                    <Outlet />
                    <Hero/>
                </main>
                

                <Footer />
            </div>
        );
    }
=======
      {/* Hero directamente después del navbar */}
      <Hero />

      {/* Contenido dinámico de las páginas */}
      <main className="flex-1 w-full">
        <Outlet />
      </main>

      <Footer />
      <ScrollTop />
    </div>
  );
}
>>>>>>> 73ae107f40a21c17fb8a5dbe3df097009be08a5b

    export default LayoutLanding;
