import { useState } from 'react';
import { FiMenu, FiX, FiArrowRight } from 'react-icons/fi';
import bg from "/src/assets/pc.jpg";

export const Hero = () => {

   return(
    <section id="hero" className="relative min-h-screen w-full overflow-hidden">
      <div className="absolute inset-0">
        <img
          src={bg}
          alt="Auto service workshop"
          className="w-full h-full object-cover opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/15" />
        <div className="absolute inset-0 bg-gradient-to-t from-orange-950/50 via-transparent to-transparent" />
      </div>
      <div className="relative z-10 py-20 h-full flex items-center"> 
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-6">
            <h2 className="text-5xl md:text-6xl font-bold text-white leading-tight">
              Book Your <span className="text-orange-400">Perfect</span> Appointment
            </h2>
            <p className="text-xl text-gray-200 leading-relaxed">
              Schedule appointments with ease. Our intuitive platform connects you with professionals instantly. No waiting, no hassle.
            </p>
            
            {/* Features List */}
            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-3">
                <div className="bg-orange-500/20 rounded-full p-2">
                  <FiArrowRight className="text-orange-400" size={20} />
                </div>
                <span className="text-gray-200">Quick and easy booking process</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-orange-500/20 rounded-full p-2">
                  <FiArrowRight className="text-orange-400" size={20} />
                </div>
                <span className="text-gray-200">24/7 availability</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-orange-500/20 rounded-full p-2">
                  <FiArrowRight className="text-orange-400" size={20} />
                </div>
                <span className="text-gray-200">Secure and reliable platform</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex gap-4 pt-6">
              <button
                onClick={() => setIsRegisterOpen(true)}
                className="bg-orange-600 text-white px-8 py-3 rounded-lg hover:bg-orange-700 transition-colors duration-200 font-semibold"
              >
                Get Started
              </button>
              <button className="border-2 border-orange-400 text-orange-400 px-8 py-3 rounded-lg hover:bg-orange-500/10 transition-colors duration-200 font-semibold">
                Learn More
              </button>
            </div>
          </div>

          
        </div>
      </div>
    </div>
    
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-white flex items-start justify-center p-2">
          <div className="w-1 h-2 bg-orange-400 rounded-full animate-pulse" />
        </div>
      </div>
    </section>
   );
};
