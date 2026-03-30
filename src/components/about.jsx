import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react"; 
import repPc from "/src/assets/repairPc.webp";
import repLap from "/src/assets/repairLap.jpg";
import upgPc from "/src/assets/upgradePc.jpg";
import cleanPc from "/src/assets/cleaningPc.webp";
import cleanLap from "/src/assets/cleaningLap.avif";


export const About = () => {
  const slides = [
    { img: repPc, type: "Repairing Computer" },
    { img: repLap, type: "Repairing Laptop" },
    { img: upgPc, type: "Upgrading Computer" },
    { img: cleanPc, type: "Cleaning Computer" },
    { img: cleanLap, type: "Cleaning Laptop" },
  ]; // images array
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
    <section className="py-10 min-h-screen bg-gradient-to-br from-orange-950 via-black to-orange-950 
                relative overflow-hidden">
      <div className="container mx-auto grid md:grid-cols-2 gap-25 items-center relative">
        <div className="absolute top-0 left-1/2 w-[400px] h-[400px] 
                  bg-orange-500 opacity-35 blur-3xl rounded-full 
                  -translate-x-1/2"></div>
        
        <div className="relative">
            <div className="mb-3 text-center">
                <span className="inline-block px-4 py-1.5 text-xs md:text-xl font-semibold tracking-wide uppercase 
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
                    className="rounded-2xl shadow-lg w-full h-[700px] object-cover"
                />
            </div>

          <button
            onClick={prevSlide}
            className="absolute top-1/2 left-2 p-2 rounded-full 
                   bg-gray-900 border border-orange-900/20 
                   hover:bg-orange-900/50 transition duration-600"
          >
           <ArrowLeft className="w-10 h-10 text-orange-400 
                        hover:-translate-x-1 transition-transform duration-200" />
          </button>

          <button
            onClick={nextSlide}
            className="absolute top-1/2 right-2 p-2 rounded-full 
                   bg-gray-900 border border-orange-900/20 
                   hover:bg-orange-900/50 transition duration-600"
          >
            <ArrowRight className="w-10 h-10 text-orange-400 
                         hover:translate-x-1 transition-transform duration-200"/>
          </button>
        </div>

        {/* Text */}
        <div class=" px-4 py-6 md:py-0 bg-black-400 rounded-2xl relative z-20 ">
          <div className="max-w-lg p-5">
            <h2 className="text-[80px] font-bold mb-4 text-white">About Us</h2>
          <p className="text-[20px] mb-4 text-white">
            Our system simplifies computer service booking by allowing customers to schedule repairs, 
            upgrades and maintenance online.
          </p>
          <p className="text-[20px] text-white">
            It improves efficiency, reduces waiting time, organizes services, and enhances customer experience.
          </p>

          </div>
        </div>

      </div>
    </section>
  );
};