import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Hero } from "./Hero";
import { Footer } from "./Footer";
import { ScrollTop } from "./ScrollTop";

function LayoutLanding() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, behavior: "auto" });
      return;
    }

    const scrollToHashTarget = () => {
      const targetId = decodeURIComponent(hash.slice(1));
      const targetElement =
        document.getElementById(targetId) || document.querySelector(hash);

      if (!targetElement) {
        return false;
      }

      targetElement.scrollIntoView({ behavior: "auto", block: "start" });
      return true;
    };

    if (scrollToHashTarget()) {
      return;
    }

    const rafId = window.requestAnimationFrame(scrollToHashTarget);
    const timeoutId = window.setTimeout(scrollToHashTarget, 180);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.clearTimeout(timeoutId);
    };
  }, [pathname, hash]);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />
      <Hero />
      <main className="flex-1 w-full">
        <Outlet />
      </main>
      <Footer />
      <ScrollTop />
    </div>
  );
}

export default LayoutLanding;
