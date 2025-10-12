import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../features/landing/components/Navbar';
import { Footer } from '../features/landing/components/Footer';
import { ScrollTop } from '../features/landing/components/ScrollTop';

const PageLayout = () => {
    return (
        <div className="flex flex-col min-h-screen bg-white">
            <Navbar />
            <main className="flex-1 w-full">
                <Outlet />
            </main>
            <Footer />
            <ScrollTop />
        </div>
    );
};

export default PageLayout;