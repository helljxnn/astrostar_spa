import { Outlet } from 'react-router-dom';
import {Navbar} from './Navbar';
import { Hero } from './Hero';
import { Footer } from "./Footer";
import { useLoading } from '../../../shared/contexts/loaderContext';
import { Loader } from '../../../shared/components/loader';


function LayoutLanding(){
    const { loader } = useLoading();
    return (
        <div className="flex flex-col min-h-screen bg-white"> 
            {loader && <Loader />}
            <Navbar />

            <main className="flex-1 p-6 bg-gray-50 w-full">
                <Outlet />
                <Hero/>
            </main>
            

            <Footer />
        </div>
    );
}

export default LayoutLanding;
