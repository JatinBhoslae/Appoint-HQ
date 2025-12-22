import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Loader2, AlertCircle, KeyRound, ArrowRight, Phone } from 'lucide-react';
import { API_URL } from '../config';
import Button from '../components/ui/button';
import Card from '../components/ui/card';

const VerifyOTP = () => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { loginWithData } = useAuth();

  const email = location.state?.email;
  const mobile = location.state?.mobile;

  if (!email) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center space-y-4 relative z-10 p-8 bg-card/50 backdrop-blur-md rounded-xl border border-white/10"
        >
          <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
          <h2 className="text-xl font-bold text-foreground">Invalid access</h2>
          <Button variant="ghost" onClick={() => navigate('/login')}>Go to Login</Button>
        </motion.div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data } = await axios.post(`${API_URL}/api/otp/verify-otp`, {
        email,
        otp
      });
      loginWithData(data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed');
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
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
        className="w-full max-w-md relative z-10 px-4"
      >
        <Card className="bg-card/50 backdrop-blur-md border-white/10 p-8 shadow-2xl">
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="mx-auto bg-primary/10 p-4 rounded-full w-20 h-20 flex items-center justify-center mb-4 ring-1 ring-primary/20"
            >
              <Phone className="h-10 w-10 text-primary" />
            </motion.div>
            <h2 className="text-2xl font-bold text-white">Verify Mobile</h2>
            <p className="text-sm text-muted-foreground mt-2">
              Enter the 6-digit OTP sent to <span className="font-semibold text-primary">{mobile || 'your mobile number'}</span>
            </p>
          </div>
          <div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium flex items-center gap-2"
                  >
                    <AlertCircle className="h-4 w-4" /> {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-2">
                <div className="relative group">
                  <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <input
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={6}
                    className="pl-10 text-center text-lg tracking-widest w-full px-3 py-2 bg-background/50 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all text-foreground placeholder:text-muted-foreground/50 font-mono"
                  />
                </div>
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
                    <span>Verifying...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <span>Verify OTP</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                )}
              </Button>
            </form>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default VerifyOTP;
