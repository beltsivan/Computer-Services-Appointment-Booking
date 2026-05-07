import { useState } from 'react';
import { Login } from '../components/Authentication/Login';
import { Register } from '../components/Authentication/Register';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export const Auth = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);

  const handleBack = () => {
    navigate('/');
  }

  return (
    <div className="flex min-h-screen bg-gray-900 overflow-hidden">
      {/* Left Side */}
      <div className="w-1/2 relative">
        {/* Login Form */}
        <div
          className={`absolute inset-0 flex flex-col justify-center items-center p-8 transition-all duration-500 ease-in-out ${
            isLogin
              ? 'opacity-100 translate-x-0 z-10 pointer-events-auto'
              : 'opacity-0 translate-x-12 z-0 pointer-events-none'
          }`}
        >
          <Login />
        </div>

        {/* Welcome Message - Left Side */}
        <div
          className={`absolute inset-0 flex flex-col justify-center items-center p-8 transition-all duration-500 ease-in-out ${
            !isLogin
              ? 'opacity-100 translate-x-0 z-10 pointer-events-auto'
              : 'opacity-0 -translate-x-12 z-0 pointer-events-none'
          }`}
        >
          <div className="bg-gradient-to-br from-orange-600 to-orange-800 rounded-3xl p-12 border border-orange-400 border-opacity-30 max-w-md text-center shadow-2xl">
            <h1 className="text-5xl font-bold mb-6 text-white">Hello, Welcome!</h1>
            <p className="text-orange-100 text-lg mb-8">
              Already have an account? Click the button below to sign in
            </p>
            <button
              onClick={() => setIsLogin(true)}
              className="w-full bg-white text-orange-600 font-bold py-3 px-8 rounded-xl hover:bg-orange-50 transition text-lg shadow-lg transform hover:scale-105 duration-300"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>

      {/* Right Side */}
      <div className="w-1/2 relative">
        {/* Welcome Message - Right Side */}
        <div
          className={`absolute inset-0 flex flex-col justify-center items-center p-8 transition-all duration-500 ease-in-out ${
            isLogin
              ? 'opacity-100 translate-x-0 z-10 pointer-events-auto'
              : 'opacity-0 translate-x-12 z-0 pointer-events-none'
          }`}
        >
          <div className="bg-gradient-to-br from-orange-600 to-orange-800 rounded-3xl p-12 border border-orange-400 border-opacity-30 max-w-md text-center shadow-2xl">
            <h1 className="text-5xl font-bold mb-6 text-white">Hello, Welcome!</h1>
            <p className="text-orange-100 text-lg mb-8">
              Don't have an account? Click the button below to register
            </p>
            <button
              onClick={() => setIsLogin(false)}
              className="w-full bg-white text-orange-600 font-bold py-3 px-8 rounded-xl hover:bg-orange-50 transition text-lg shadow-lg transform hover:scale-105 duration-300"
            >
              Register
            </button>
          </div>
        </div>

        {/* Register Form */}
        <div
          className={`absolute inset-0 flex flex-col justify-center items-center p-8 transition-all duration-500 ease-in-out ${
            !isLogin
              ? 'opacity-100 translate-x-0 z-10 pointer-events-auto'
              : 'opacity-0 -translate-x-12 z-0 pointer-events-none'
          }`}
        >
          <Register />
        </div>
      </div>

      {/* Back Button */}
      <div className='absolute top-8 left-8 z-50'>
        <button
          onClick={handleBack}
          className="flex items-center gap-2 bg-gray-800 hover:bg-orange-600 text-white py-3 px-6 rounded-lg transition duration-300 shadow-lg transform hover:scale-105"
          title="Back to Home"
        >
          <ArrowLeft size={20} />
          <span className="font-semibold">Back</span>
        </button>
      </div>
    </div>
  );
};

export default Auth;
