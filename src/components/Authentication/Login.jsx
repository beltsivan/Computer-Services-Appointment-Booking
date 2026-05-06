import { useState } from 'react';
import { Mail, Lock } from 'lucide-react';
import { supabase } from '../../supabaseClient';
import { useNavigate } from 'react-router-dom';

export const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (signInError) {
        setError(signInError.message);
        return;
      }

      if (data.user) {
        // Fetch user role from database
        const { data: userData, error: fetchError } = await supabase
          .from('users')
          .select('role')
          .eq('id', data.user.id);

        if (fetchError) {
          console.error('Error fetching user role:', fetchError);
          setError(`Failed to fetch user role: ${fetchError.message}`);
          return;
        }

        // Check if user record exists
        if (!userData || userData.length === 0) {
          console.error('User record not found in database for ID:', data.user.id);
          setError('User record not found. Please contact administrator.');
          return;
        }

        alert('Login successful!');
        setFormData({
          email: '',
          password: '',
        });

        // Redirect based on user role
        if (userData[0]?.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err) {
      setError(err.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="flex flex-col justify-center items-center h-screen bg-gray-900 text-white p-8">
      <div className="w-full max-w-md">
        <h2 className="text-4xl font-bold mb-2">Welcome Back</h2>
        <p className="text-gray-400 mb-8">Sign in to your account</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-orange-500 text-white transition"
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-orange-500 text-white transition"
                required
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center">
              <input type="checkbox" className="mr-2" />
              <span>Remember me</span>
            </label>
            <button type="button" className="text-orange-500 hover:text-orange-400 transition">
              Forgot password?
            </button>
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-orange-900 text-white font-bold py-2 rounded-lg transition"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
