import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { motion } from 'framer-motion';
import { User, Mail, Lock, UserCircle2, Phone, Calendar, ArrowRight } from 'lucide-react';
import { API_URL } from '../config';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { Input } from '../components/ui/input';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/api/admin/categories`);
        setCategories(data);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };
    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Process mobile number - allow country code
      let processedMobile = null;
      const cleanMobile = mobile ? mobile.replace(/\s+/g, '') : '';
      if (cleanMobile && /^\+?[0-9]{10,15}$/.test(cleanMobile)) {
        processedMobile = cleanMobile;
      }
      
      const data = await register(name, email, processedMobile, password, role, role === 'organiser' ? category : null);
      if (data.userId) {
        navigate('/verify-otp', { state: { userId: data.userId, email: data.email, mobile: data.mobile } });
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden py-12">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
      <div className="absolute top-0 left-0 w-full h-full bg-background/80 backdrop-blur-[1px]" />
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] animate-float" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-secondary/20 rounded-full blur-[100px] animate-float" style={{ animationDelay: '2s' }} />

      <div className="w-full max-w-md relative z-10 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="p-2 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
                <Calendar className="h-8 w-8 text-primary" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                AppointHQ
              </span>
            </Link>
          </div>

          {/* Card */}
          <Card className="bg-card/50 backdrop-blur-md border-white/10 p-8 shadow-2xl">
            <div className="space-y-2 text-center mb-8">
              <h2 className="text-3xl font-bold">Create an account</h2>
              <p className="text-muted-foreground">Enter your details to get started</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium"
                >
                  {error}
                </motion.div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground ml-1">Full Name</label>
                <Input
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  icon={<UserCircle2 className="h-4 w-4" />}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground ml-1">Email</label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  icon={<Mail className="h-4 w-4" />}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground ml-1">Mobile Number</label>
                <Input
                  type="tel"
                  placeholder="+91 1234567890"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  icon={<Phone className="h-4 w-4" />}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground ml-1">Password</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  icon={<Lock className="h-4 w-4" />}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground ml-1">Role</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setRole('customer')}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
                      role === 'customer'
                        ? 'bg-primary/20 border-primary text-primary'
                        : 'bg-background/50 border-white/10 text-muted-foreground hover:bg-background/80'
                    }`}
                  >
                    <User className="h-4 w-4" />
                    <span className="text-sm font-medium">Customer</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('organiser')}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
                      role === 'organiser'
                        ? 'bg-primary/20 border-primary text-primary'
                        : 'bg-background/50 border-white/10 text-muted-foreground hover:bg-background/80'
                    }`}
                  >
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm font-medium">Organizer</span>
                  </button>
                </div>
              </div>

              {role === 'organiser' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-2"
                >
                  <label className="text-sm font-medium text-muted-foreground ml-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                    className="w-full h-11 px-3 bg-background/50 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </motion.div>
              )}

              <Button
                type="submit"
                className="w-full h-11 text-base shadow-lg shadow-primary/25 mt-4"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <span>Creating account...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span>Create Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                )}
              </Button>

              <div className="text-center text-sm text-muted-foreground mt-4">
                Already have an account?{' '}
                <Link to="/login" className="text-primary hover:underline font-medium">
                  Sign in
                </Link>
              </div>
            </form>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
