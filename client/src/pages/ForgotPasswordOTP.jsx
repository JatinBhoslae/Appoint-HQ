import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowLeft, AlertCircle, Loader2, Send } from 'lucide-react';
import { API_URL } from '../config';
import Button from '../components/ui/button';
import Card from '../components/ui/Card';

const ForgotPasswordOTP = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const { data } = await axios.post(`${API_URL}/api/otp/forgot-password`, { email });
      setMessage(`OTP sent to ${data.mobile || 'your registered mobile number'}.`);
      // Navigate to reset password page
      setTimeout(() => {
        navigate('/reset-password-otp', { state: { email } });
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-background relative overflow-hidden py-12">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
      <div className="absolute top-0 left-0 w-full h-full bg-background/80 backdrop-blur-[1px]" />
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] animate-float" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-secondary/20 rounded-full blur-[100px] animate-float" style={{ animationDelay: '2s' }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10 px-4"
      >
        <Card className="bg-card/50 backdrop-blur-md border-white/10 p-8 shadow-2xl">
          <div className="space-y-2 text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="mx-auto bg-primary/10 p-4 rounded-full w-20 h-20 flex items-center justify-center mb-4 ring-1 ring-primary/20"
            >
              <Mail className="h-10 w-10 text-primary" />
            </motion.div>
            <h2 className="text-2xl font-bold text-white">
              Forgot Password
            </h2>
            <p className="text-muted-foreground">
              Enter your email to receive a verification OTP
            </p>
          </div>

          <AnimatePresence mode='wait'>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-destructive/10 text-destructive border border-destructive/20 p-3 mb-4 rounded-lg text-sm flex items-center gap-2"
              >
                <AlertCircle className="h-4 w-4" /> {error}
              </motion.div>
            )}
            {message && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-green-500/10 text-green-500 border border-green-500/20 p-3 mb-4 rounded-lg text-sm flex items-center gap-2"
              >
                <Send className="h-4 w-4" /> {message}
              </motion.div>
            )}
          </AnimatePresence>

          {!message && (
            <motion.form
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              <div className="relative group">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10 h-11 w-full px-3 py-2 bg-background/50 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all text-foreground placeholder:text-muted-foreground/50"
                />
              </div>
              <Button
                type="submit"
                variant="glow"
                className="w-full h-12 text-base font-medium"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Sending...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <span>Send OTP</span>
                    <Send className="w-4 h-4" />
                  </div>
                )}
              </Button>
            </motion.form>
          )}

          <div className="flex justify-center border-t border-white/10 pt-6 mt-6">
            <Link to="/login" className="text-sm text-muted-foreground hover:text-primary flex items-center gap-2 transition-colors">
              <ArrowLeft className="h-4 w-4" /> Back to Login
            </Link>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordOTP;