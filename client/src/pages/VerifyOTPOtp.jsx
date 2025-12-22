import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Loader2, AlertCircle, KeyRound, CheckCircle, ArrowRight } from 'lucide-react';
import { API_URL } from '../config';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/button';
import Card from '../components/ui/card';

const VerifyOTPOtp = () => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { loginWithData } = useAuth();

  const email = location.state?.email;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const { data } = await axios.post(`${API_URL}/api/otp/verify-otp`, {
        email,
        otp
      });
      
      setSuccess(true);
      // Auto-login after successful verification
      loginWithData(data);
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background relative overflow-hidden py-12">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
        <div className="absolute top-0 left-0 w-full h-full bg-background/80 backdrop-blur-[1px]" />
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-green-500/20 rounded-full blur-[100px] animate-float" />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md relative z-10 px-4"
        >
          <Card className="bg-card/50 backdrop-blur-md border-green-500/30 p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-green-500/5" />
            <div className="relative z-10 text-center">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 10 }}
                className="mx-auto w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6 ring-1 ring-green-500/30"
              >
                <CheckCircle className="h-10 w-10 text-green-500" />
              </motion.div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Verification Successful!</h2>
              <p className="text-muted-foreground mb-8">Redirecting to your dashboard...</p>
              
              <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                <motion.div 
                  className="bg-green-500 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 2 }}
                />
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-background relative overflow-hidden py-12">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
      <div className="absolute top-0 left-0 w-full h-full bg-background/80 backdrop-blur-[1px]" />
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] animate-float" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[100px] animate-float" style={{ animationDelay: '2s' }} />

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
              <Mail className="h-10 w-10 text-primary" />
            </motion.div>
            <h2 className="text-2xl font-bold text-foreground">Verify Email</h2>
            <p className="text-sm text-muted-foreground mt-2">
              Enter the 6-digit OTP sent to <span className="font-semibold text-primary">{email}</span>
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
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6}
                    required
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
                    <Loader2 className="w-5 h-5 animate-spin" />
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

export default VerifyOTPOtp;
