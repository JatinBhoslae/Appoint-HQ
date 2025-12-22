import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { API_URL } from '../config';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { resetToken } = useParams();
  const navigate = useNavigate();
  const { loginWithData } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data } = await axios.put(`${API_URL}/api/auth/reset-password/${resetToken}`, {
        password
      });

      // Auto login after reset
      if (data.token) {
        // Ideally backend returns full user info on reset similar to login
        // For now, redirecting to login to be safe and clear
        navigate('/login', { state: { message: 'Password reset successful! Please login.' } });
      } else {
        navigate('/login');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Password reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[80vh] px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-lg shadow-2xl p-8 border border-gray-200 border-t-4 border-t-blue-600">
          <div className="text-center space-y-2 mb-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Reset Password</h2>
            <p className="text-gray-600">Enter your new password below</p>
          </div>
          <div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-red-50 text-red-600 p-3 rounded-md text-sm flex items-center gap-2"
                  >
                    <AlertCircle className="h-4 w-4" /> {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-4">
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                  <input
                    type="password"
                    placeholder="New Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="pl-9 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                  <input
                    type="password"
                    placeholder="Confirm New Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    className="pl-9 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 transition-all duration-300 mt-2 text-white rounded-md py-2 font-medium disabled:opacity-50"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="inline mr-2 h-4 w-4 animate-spin" /> Resetting...
                  </>
                ) : 'Reset Password'}
              </button>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
