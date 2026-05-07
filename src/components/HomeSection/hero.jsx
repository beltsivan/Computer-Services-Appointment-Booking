import { FiArrowRight } from 'react-icons/fi';
import bg from "/src/assets/pc.jpg";
import { useNavigate } from "react-router-dom";

export const Hero = () => {
  const navigate = useNavigate();

  return (
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
      <div className="relative z-10 py-12 md:py-20 h-full flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-4 md:space-y-6 pt-8 md:pt-0">
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                Book Your <span className="text-orange-400">Perfect</span> Appointment
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-gray-200 leading-relaxed">
                Schedule appointments with ease. Our intuitive platform connects you with professionals instantly. No waiting, no hassle.
              </p>

              {/* Features List */}
              <div className="space-y-3 md:space-y-4 pt-4">
                <div className="flex items-center gap-3">
                  <div className="bg-orange-500/20 rounded-full p-2 flex-shrink-0">
                    <FiArrowRight className="text-orange-400" size={18} />
                  </div>
                  <span className="text-sm md:text-base text-gray-200">Quick and easy booking process</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-orange-500/20 rounded-full p-2 flex-shrink-0">
                    <FiArrowRight className="text-orange-400" size={18} />
                  </div>
                  <span className="text-sm md:text-base text-gray-200">24/7 availability</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-orange-500/20 rounded-full p-2 flex-shrink-0">
                    <FiArrowRight className="text-orange-400" size={18} />
                  </div>
                  <span className="text-sm md:text-base text-gray-200">Secure and reliable platform</span>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 pt-6">
                <button
                  onClick={() => navigate('/Auth')}
                  className="bg-orange-600 text-white px-6 md:px-8 py-2 md:py-3 rounded-lg hover:bg-orange-700 transition-colors duration-200 font-semibold text-sm md:text-base"
                >
                  Get Started
                </button>
                <button
                  onClick={() => {
                    document.getElementById("about")?.scrollIntoView({
                      behavior: "smooth",
                    });
                  }}

                  className="border-2 border-orange-400 text-orange-400 px-6 md:px-8 py-2 md:py-3 rounded-lg hover:bg-orange-500/10 transition-colors duration-200 font-semibold text-sm md:text-base">
                  Learn More
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="hidden md:flex absolute bottom-12 lg:bottom-16 left-1/2 -translate-x-1/2 animate-bounce pointer-events-none">
        <div className="w-6 h-10 rounded-full border-2 border-white flex items-start justify-center p-2">
          <div className="w-1 h-2 bg-orange-400 rounded-full animate-pulse" />
        </div>
      </div>
    </section>
  );
};
