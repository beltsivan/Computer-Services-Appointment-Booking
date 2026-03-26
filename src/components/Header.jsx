import { useState } from 'react';
import { FiMenu, FiX, FiArrowRight } from 'react-icons/fi';

const navItems = [
  { label: 'Home', link: '#' },
  { label: 'About', link: '#about' },
  { label: 'Services', link: '#services' },
  { label: 'Contact', link: '#contact' },
];

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    console.log('Registration data:', formData);
    // Add your registration logic here
    setFormData({ fullName: '', email: '', phone: '', password: '' });
    setIsRegisterOpen(false);
  };

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
                onClick={() => setIsRegisterOpen(true)}
                className="hidden md:block bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors duration-200 font-medium"
              >
                Register
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
          {isMenuOpen && (
            <div className="md:hidden pb-4 border-t border-gray-200">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.link}
                  className="block py-2 text-gray-700 hover:text-orange-600 font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </a>
              ))}
              <button
                onClick={() => {
                  setIsRegisterOpen(true);
                  setIsMenuOpen(false);
                }}
                className="w-full mt-4 bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors duration-200 font-medium"
              >
                Register
              </button>
            </div>
          )}
        </div>
      </nav>

      

      {/* Registration Modal */}
      {isRegisterOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-8 animate-slideIn">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Create Account</h3>
              <button
                onClick={() => setIsRegisterOpen(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
                  placeholder="Arnold busyet"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
                  placeholder="+1 (555) 000-0000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
                  placeholder="••••••••"
                />
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <input type="checkbox" id="terms" required className="w-4 h-4 cursor-pointer" />
                <label htmlFor="terms" className="cursor-pointer">
                  I agree to the Terms of Service
                </label>
              </div>

              <button
                type="submit"
                className="w-full bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 transition-colors duration-200 font-semibold mt-6"
              >
                Create Account
              </button>

              <p className="text-center text-sm text-gray-600 pt-2">
                Already have an account?{' '}
                <a href="#" className="text-orange-600 hover:text-orange-700 font-semibold">
                  Sign in
                </a>
              </p>
            </form>
          </div>
        </div>
      )}
    </>
  );
};


    
