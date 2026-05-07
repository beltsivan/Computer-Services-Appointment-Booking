import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react"; 
import repPc from "/src/assets/repairPc.webp";
import repLap from "/src/assets/repairLap.jpg";
import upgPc from "/src/assets/upgradePc.jpg";
import cleanPc from "/src/assets/cleaningPc.webp";
import cleanLap from "/src/assets/cleaningLap.avif";


export const Service = () => {
  const slides = [
    { img: repPc, type: "Repairing Computer" },
    { img: repLap, type: "Repairing Laptop" },
    { img: upgPc, type: "Upgrading Computer" },
    { img: cleanPc, type: "Cleaning Computer" },
    { img: cleanLap, type: "Cleaning Laptop" },
  ]; // images array

  const brands = ["Intel", "AMD", "NVIDIA", "ASUS", "Acer", "Lenovo", "HP", "Dell"];
  
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState("move");
  const prevSlide = () => {
    setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
    setDirection("prev");
  };

  const nextSlide = () => {
    setCurrent((next) => (next === slides.length - 1 ? 0 : next + 1));
    setDirection("next");
  };
  return (
    <section id="services" className="py-16 md:py-32 pb-1 md:pb-2 bg-gradient-to-br from-orange-950 via-black to-orange-950 
                relative overflow-visible">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start md:items-center relative">
          <div className="absolute top-20 left-1/2 w-[400px] md:w-[400px] h-[400px] md:h-[280px] 
                    bg-orange-700 opacity-45 blur-3xl rounded-full 
                    -translate-x-1/2 -translate-y-1/2"></div>
          
          <div className="relative py-8 md:py-10 w-full">
              <div className="mb-4 md:mb-6 text-center">
                  <span className="inline-block px-3 md:px-4 py-1.5 text-xs md:text-lg font-semibold tracking-wide uppercase 
                                  text-white bg-gradient-to-r from-orange-300 via-orange-500 to-orange-600 
                                  rounded-full shadow-md">
                      {slides[current].type}
                  </span>
              </div>
            <div
                  key={current}
                  className={`${
                      direction === "move" ? "animate-slideLeft" : "animate-slideRight"
                  }`}
                  >
                  <img
                      src={slides[current].img}
                      alt={slides[current].type}
                      className="rounded-2xl shadow-lg w-full h-64 md:h-96 lg:h-[500px] object-cover"
                  />
              </div>

            <button
              onClick={prevSlide}
              className="absolute top-1/2 left-2 p-2 rounded-full 
                     bg-gray-900 border border-orange-900/20 
                     hover:bg-orange-900/50 transition duration-600"
            >
             <ArrowLeft className="w-8 md:w-10 h-8 md:h-10 text-orange-400 
                          hover:-translate-x-1 transition-transform duration-200" />
            </button>

            <button
              onClick={nextSlide}
              className="absolute top-1/2 right-2 p-2 rounded-full 
                     bg-gray-900 border border-orange-900/20 
                     hover:bg-orange-900/50 transition duration-600"
            >
              <ArrowRight className="w-8 md:w-10 h-8 md:h-10 text-orange-400 
                           hover:translate-x-1 transition-transform duration-200"/>
            </button>
          </div>

          {/* Text */}
          <div className="px-4 md:px-0 py-6 md:py-0 bg-black-400 rounded-2xl relative z-20 w-full">
            <div className="max-w-lg p-5">
              <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 text-white">Services</h2>
            <p className="text-base md:text-lg mb-4 text-gray-200">
              Our system simplifies computer service booking by allowing customers to schedule repairs, 
              upgrades and maintenance online.
            </p>
            <p className="text-base md:text-lg text-gray-200">
              It improves efficiency, reduces waiting time, organizes services, and enhances customer experience.
            </p>

            </div>
          </div>

        </div>

      {/* Brands Running Slideshow - Full Width */}
      <div className="mt-12 w-full px-4 sm:px-6 lg:px-8 pb-8">
            <style>
              {`
                @keyframes scroll {
                  0% {
                    transform: translateX(0);
                  }
                  100% {
                    transform: translateX(-100%);
                  }
                }
                
                .brands-scroll {
                  animation: scroll 25s linear infinite;
                  animation-delay: 0s;
                  animation-fill-mode: forwards;
                  will-change: transform;
                  transform: translateX(0);
                }
                
                .brands-scroll:hover {
                  animation-play-state: paused;
                }
              `}
            </style>
            
            <div className="rounded-xl mb-6 p-6 overflow-hidden">
              <div className="brands-scroll flex gap-8 items-center whitespace-nowrap">
                {[...brands, ...brands, ...brands].map((brand, index) => (
                  <div
                    key={index}
                    className="flex-shrink-0 px-8 py-4  transform hover:scale-200 transition-transform duration-500
                               "
                  >
                    <span className="font-mono text-white text-base md:text-3xl italic">
                      {brand}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            </div>
          </div>    
    </section>
  );
};
export default Service;
