import { Phone, MapPin } from "lucide-react";   
import { FaFacebook } from "react-icons/fa";

export const Footer = () => {
    return(
        <footer className="bg-gradient-to-br from-orange-50 border-t border-border">
            <div className="container px-4 py-12 mx-auto">
        <div className="grid md:grid-cols-3 gap-8 items-center">
         
          <div className="">
            <h3 className="text-xl font-bold text-gradient mb-2">
              Name sa Store
            </h3>
            <p className="text-muted-foreground text-sm">
              Computer Services
            </p>
          </div>

          {/* Quick Contact */}
          <div className="flex flex-wrap justify-center gap-6">
            <a
              href="tel:09688512104"
              className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span>0968 851 2104</span>
            </a>
            <a
              href="https://www.facebook.com/BeltTechnologyAutoCarAirconServices"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
            >
              <FaFacebook className="w-4 h-4" />
              <span>Facebook</span>
            </a>
            <a
              href=""
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
            >
              <MapPin className="w-4 h-4" />
              <span>Directions</span>
            </a>
          </div>

          {/* Copyright */}
          <div className="text-center md:text-right">
            <p className="text-muted-foreground text-sm">
              © {new Date().getFullYear()} Computer Retail Store Services
            </p>
            <p className="text-muted-foreground/70 text-xs mt-1">
              Address to be fill in
            </p>
          </div>
          <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-md border-t border-border z-40">
        <a
          href="tel:09688512104"
          className="flex items-center justify-center gap-2 w-full h-14 bg-primary text-primary-foreground font-bold rounded-xl shadow-lg glow-orange animate-pulse-glow"
        >
          <Phone className="w-5 h-5" />
          Call Now - 0968 851 2104
        </a>
      </div>
        </div>
      </div>

      
        </footer>
    );
}