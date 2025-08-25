import { Outlet } from 'react-router-dom';
import Navbar from "./Navbar";
import Footer from "./Footer";


function LayoutLanding(){
    return (
        <div className="flex flex-col min-h-screen bg-white"> 
            {/* 👆 Fondo blanco en todo el layout */}
            <Navbar />

            <main className="flex-1 p-6 bg-gray-50 w-full">
                <Outlet />
            </main>

            <Footer />
        </div>
    );
}

export default LayoutLanding;
