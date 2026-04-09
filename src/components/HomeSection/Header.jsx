import { useState } from 'react';
import { FiMenu, FiX, FiArrowRight } from 'react-icons/fi';
import { useNavigate } from "react-router-dom";

const navItems = [
  { label: 'Home', link: '#hero' },
  { label: 'Service', link: '#services' },      
  { label: 'About', link: '#about' }, 
  { label: 'Contact', link: '#contact' },
];


export const Header = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-orange-600">AppointmentHub</h1>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.link}
                  className="text-gray-700 hover:text-orange-600 transition-colors duration-200 font-medium text-sm"
                >
                  {item.label}
                </a>
              ))}
            </div>

            {/* Register & Mobile Menu Button */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/Auth')}
                className="hidden md:block bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors duration-200 font-medium"
              >
                Be Part
              </button>
              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden text-gray-700 hover:text-orange-600"
              >
                {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          
        </div>
      </nav>

      

    </>
  );
};


    
