import { useState } from 'react';
import { FiMenu, FiX, FiArrowRight } from 'react-icons/fi';

export const Hero = () => {
    
{/* Hero Section */}
   return(
      <div className="pt-16">
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Left Content */}
              <div className="space-y-6">
                <h2 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
                  Book Your <span className="text-orange-600">Perfect</span> Appointment
                </h2>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Schedule appointments with ease. Our intuitive platform connects you with professionals instantly. No waiting, no hassle.
                </p>
                
                {/* Features List */}
                <div className="space-y-4 pt-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-orange-100 rounded-full p-2">
                      <FiArrowRight className="text-orange-600" size={20} />
                    </div>
                    <span className="text-gray-700">Quick and easy booking process</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-orange-100 rounded-full p-2">
                      <FiArrowRight className="text-orange-600" size={20} />
                    </div>
                    <span className="text-gray-700">24/7 availability</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-orange-100 rounded-full p-2">
                      <FiArrowRight className="text-orange-600" size={20} />
                    </div>
                    <span className="text-gray-700">Secure and reliable platform</span>
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
                  <button className="border-2 border-orange-600 text-orange-600 px-8 py-3 rounded-lg hover:bg-orange-50 transition-colors duration-200 font-semibold">
                    Learn More
                  </button>
                </div>
              </div>

              {/* Right Illustration */}
              <div className="hidden md:flex justify-center">
                <div className="w-96 h-96 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full opacity-20"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
   );
};
