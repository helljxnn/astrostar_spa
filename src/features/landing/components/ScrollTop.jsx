import { useState, useEffect } from "react"
import { ChevronUp } from "lucide-react"

export const ScrollTop = () => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener("scroll", toggleVisibility)
    return () => window.removeEventListener("scroll", toggleVisibility)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  return (
    <button
      onClick={scrollToTop}
      className={`fixed bottom-20 right-20 z-50 p-4 bg-gray-400 text-white rounded-full shadow-2xl border-2 border-transparent
        transition-all duration-700 ease-in-out hover:scale-110 
        focus:outline-none
        hover:border-violet-400 hover:shadow-[0_0_20px_rgba(167,139,250,0.7)] hover:ring-4 hover:ring-violet-300 hover:ring-offset-2
        ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-32"}
      `}
      aria-label="Volver al inicio"
    >
      <ChevronUp className="w-8 h-8" />
    </button>
  )
}
