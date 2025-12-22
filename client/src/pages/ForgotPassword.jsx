import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowLeft, CheckCircle, AlertCircle, Loader2, KeyRound, Lock } from 'lucide-react';
import { API_URL } from '../config';
import { useAuth } from '../context/AuthContext';

const ForgotPassword = () => {
  const [step, setStep] = useState('email'); // email, otp, password, success
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordErrors, setPasswordErrors] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const { loginWithData } = useAuth();
  const navigate = useNavigate();

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await axios.post(`${API_URL}/api/otp/forgot-password`, { email });
      setMessage(`OTP sent to ${data.mobile || 'your registered mobile number'}.`);
      setStep('otp');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError('OTP must be 6 digits');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await axios.post(`${API_URL}/api/otp/verify-otp`, { email, otp });
      setMessage('');
      setStep('password');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous errors
    setError('');
    setPasswordErrors([]);

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/otp/reset-password`, {
        email,
        otp,
        newPassword: password
      });
      
      setMessage('Password reset successfully!');
      setStep('success');
    } catch (err) {
      if (err.response?.data?.errors) {
        setPasswordErrors(err.response.data.errors);
      } else {
        setError(err.response?.data?.message || 'Failed to reset password');
      }
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

          <div className="space-y-2 text-center mb-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {step === 'email' && 'Forgot Password'}
              {step === 'otp' && 'Verify OTP'}
              {step === 'password' && 'Reset Password'}
              {step === 'success' && 'Success!'}
            </h2>
            <p className="text-gray-600">
              {step === 'email' && 'Enter your email to receive a verification OTP'}
              {step === 'otp' && `Enter the 6-digit code sent to ${email}`}
              {step === 'password' && 'Create a new password for your account'}
              {step === 'success' && 'Your password has been updated securely.'}
            </p>
          </div>

          <AnimatePresence mode='wait'>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-red-50 text-red-600 p-3 mb-4 rounded-md text-sm flex items-center gap-2"
              >
                <AlertCircle className="h-4 w-4" /> {error}
              </motion.div>
            )}
            
            {passwordErrors.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-red-50 text-red-600 p-3 mb-4 rounded-md text-sm"
              >
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-4 w-4" />
                  <span>Password Requirements:</span>
                </div>
                <ul className="list-disc pl-5 space-y-1">
                  {passwordErrors.map((err, index) => (
                    <li key={index}>{err}</li>
                  ))}
                </ul>
              </motion.div>
            )}
            
            {message && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-green-50 text-green-600 p-3 mb-4 rounded-md text-sm flex items-center gap-2"
              >
                <CheckCircle className="h-4 w-4" /> {message}
              </motion.div>
            )}
          </AnimatePresence>

          {/* STEP 1: EMAIL */}
          {step === 'email' && (
            <motion.form
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              onSubmit={handleEmailSubmit}
              className="space-y-4"
            >
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-9 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white rounded-md py-2 font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                disabled={loading}
              >
                {loading ? <Loader2 className="animate-spin h-5 w-5 mx-auto" /> : 'Send OTP'}
              </button>
            </motion.form>
          )}

          {/* STEP 2: OTP */}
          {step === 'otp' && (
            <motion.form
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              onSubmit={handleOtpSubmit}
              className="space-y-4"
            >
              <div className="relative">
                <KeyRound className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Check your mobile for OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  maxLength={6}
                  required
                  className="pl-9 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 tracking-widest text-lg"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white rounded-md py-2 font-medium hover:bg-blue-700 transition-colors"
              >
                Verify Code
              </button>
              <button
                type="button"
                onClick={() => setStep('email')}
                className="text-sm text-gray-500 hover:text-blue-600 w-full text-center"
              >
                Resend or Change Email
              </button>
            </motion.form>
          )}

          {/* STEP 3: PASSWORD */}
          {step === 'password' && (
            <motion.form
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              onSubmit={handlePasswordSubmit}
              className="space-y-4"
            >
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                <input
                  type="password"
                  placeholder="New Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-9 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Password must contain at least 8 characters, 1 uppercase letter, 1 number, and 1 special character.
                </p>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                <input
                  type="password"
                  placeholder="Confirm New Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="pl-9 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-green-600 text-white rounded-md py-2 font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                disabled={loading}
              >
                {loading ? <Loader2 className="animate-spin h-5 w-5 mx-auto" /> : 'Reset Password'}
              </button>
            </motion.form>
          )}

          {/* STEP 4: SUCCESS */}
          {step === 'success' && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center space-y-4"
            >
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <p className="text-gray-600">You can now login with your new password.</p>
              <Link to="/login">
                <button className="w-full bg-blue-600 text-white rounded-md py-2 font-medium hover:bg-blue-700 transition-colors">
                  Back to Login
                </button>
              </Link>
            </motion.div>
          )}

          <div className="flex justify-center border-t border-gray-200 pt-4 mt-6">
            <Link to="/login" className="text-sm text-gray-600 hover:text-blue-600 flex items-center gap-2 transition-colors">
              <ArrowLeft className="h-4 w-4" /> Back to Login
            </Link>
          </div>

        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;