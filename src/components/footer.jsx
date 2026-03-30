import { Phone, MapPin } from "lucide-react";   
import { FaFacebook } from "react-icons/fa";

export const Footer = () => {
    return(
        <>
        <footer className="bg-gray-900 border-t border-orange-500">
            <div className="container px-4 py-12 mx-auto">
        <div className="grid md:grid-cols-3 gap-8 items-center">
         
          <div className="">
            <h3 className="text-xl font-bold text-orange-400 mb-2">
              Name sa COmputer Store Services
            </h3>
            <p className="text-gray-300 text-sm">
              Computer Services
            </p>
          </div>

          {/* Quick Contact */}
          <div className="flex flex-wrap justify-center gap-6">
            <a
              href="tel:09688512104"
              className="flex items-center gap-2 text-gray-300 hover:text-orange-400 transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span>0968 851 2104</span>
            </a>
            <a
              href="https://www.facebook.com/BeltTechnologyAutoCarAirconServices"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-gray-300 hover:text-orange-400 transition-colors"
            >
              <FaFacebook className="w-4 h-4" />
              <span>Facebook</span>
            </a>
            <a
              href=""
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-gray-300 hover:text-orange-400 transition-colors"
            >
              <MapPin className="w-4 h-4" />
              <span>Nice Directions</span>
            </a>
          </div>

          {/* Copyright */}
          <div className="text-center md:text-right">
            <p className="text-gray-300 text-sm">
              © {new Date().getFullYear()} Computer Retail Store Services
            </p>
            <p className="text-gray-400 text-xs mt-1">
              Address to be fill in later
            </p>
          </div>
        </div>
      </div>
        </footer>
        
        {/* Mobile Call Button */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-gray-900 backdrop-blur-md border-t border-orange-500 z-40">
          <a
            href="tel:09688512104"
            className="flex items-center justify-center gap-2 w-full h-14 bg-orange-600 text-white font-bold rounded-xl shadow-lg hover:bg-orange-700 transition-colors"
          >
            <Phone className="w-5 h-5" />
            Call Now - 0968 851 2104
          </a>
        </div>
        
        {/* Bottom spacer for mobile fixed button */}
        <div className="md:hidden h-24" />
        </>
    );
}