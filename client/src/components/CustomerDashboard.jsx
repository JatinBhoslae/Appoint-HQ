import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import VoiceSearchBar from './VoiceSearchBar';
import ReviewForm from './ReviewForm';
import { QrCode, Calendar, Clock, DollarSign, Search, User, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_URL } from '../config';
import { Card } from './ui/card';
import { Button } from './ui/button';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

const CustomerDashboard = () => {
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedServiceType, setSelectedServiceType] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [appointments, setAppointments] = useState([]);
  const [pastAppointments, setPastAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('Customer');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [servicesRes, categoriesRes] = await Promise.all([
          axios.get(`${API_URL}/api/services`),
          axios.get(`${API_URL}/api/admin/categories`)
        ]);

        const servicesData = Array.isArray(servicesRes.data) ? servicesRes.data : [];
        setServices(servicesData);
        setFilteredServices(servicesData);
        setCategories(Array.isArray(categoriesRes.data) ? categoriesRes.data : []);

        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
        setUserName(userInfo.name || 'Customer');

        if (!userInfo.token) {
          setLoading(false);
          return;
        }

        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        const appointmentsRes = await axios.get(`${API_URL}/api/appointments/my`, config);

        const now = new Date();
        const upcoming = [];
        const past = [];

        (Array.isArray(appointmentsRes.data) ? appointmentsRes.data : []).forEach(appt => {
          if (!appt?.date || !appt?.startTime) return;
          const apptDate = new Date(`${appt.date}T${appt.startTime}`);

          if (apptDate < now || appt.status === 'completed' || appt.status === 'cancelled') {
            past.push(appt);
          } else {
            upcoming.push(appt);
          }
        });

        setAppointments(upcoming);
        setPastAppointments(past);
      } catch (error) {
        console.error('Dashboard fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    let result = [...services];

    if (selectedCategory !== 'All') {
      result = result.filter(service => service?.category?._id === selectedCategory);
    }

    if (selectedServiceType !== 'All') {
      result = result.filter(service => {
        const serviceType = service?.type || 'user';
        return serviceType.toLowerCase() === selectedServiceType.toLowerCase();
      });
    }

    if (searchQuery.trim()) {
      const lower = searchQuery.toLowerCase();
      result = result.filter(service =>
        service?.name?.toLowerCase().includes(lower) ||
        service?.description?.toLowerCase().includes(lower) ||
        service?.provider?.name?.toLowerCase().includes(lower)
      );
    }

    setFilteredServices(result);
  }, [services, selectedCategory, selectedServiceType, searchQuery]);

  const handleSearch = query => setSearchQuery(query);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-background">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 bg-primary/10 rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background py-8">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px] pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-full bg-background/80 backdrop-blur-[1px] pointer-events-none" />
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] animate-float pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-secondary/20 rounded-full blur-[100px] animate-float pointer-events-none" style={{ animationDelay: '2s' }} />

      <motion.div 
        className="container mx-auto px-4 space-y-12 relative z-10"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-primary via-purple-500 to-secondary bg-clip-text text-transparent">
            Customer Dashboard
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Welcome back, <span className="text-foreground font-semibold">{userName}</span>
          </p>
        </motion.div>

        {/* Services Section */}
        <motion.section variants={containerVariants} className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-card/30 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-lg">
            <motion.h2 variants={itemVariants} className="text-2xl font-bold flex items-center gap-2 text-white">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Search className="h-6 w-6 text-primary" />
              </div>
              Available Services
            </motion.h2>
            <div className="w-full md:w-auto">
              <VoiceSearchBar onSearch={handleSearch} />
            </div>
          </div>

          {/* Filters Container */}
          <motion.div variants={itemVariants} className="space-y-4">
            {/* Service Type Filter */}
            <div className="flex flex-wrap gap-2">
              {['All', 'user', 'resource'].map(type => {
                let count = 0;
                if (type === 'All') {
                  count = services.length;
                } else {
                  count = services.filter(service => {
                    const serviceType = service?.type || 'user';
                    return serviceType.toLowerCase() === type.toLowerCase();
                  }).length;
                }
                
                return (
                  <button
                    key={type}
                    onClick={() => setSelectedServiceType(type)}
                    className={`
                      relative px-6 py-2 rounded-full text-sm font-medium transition-all duration-300
                      ${selectedServiceType === type
                        ? 'bg-primary text-primary-foreground shadow-[0_0_20px_rgba(var(--primary),0.5)] scale-105'
                        : 'bg-card/50 text-muted-foreground hover:bg-card hover:text-foreground border border-white/10'
                      }
                    `}
                  >
                    {type === 'All' ? `All Types (${count})` : `${type}-based (${count})`}
                  </button>
                );
              })}
            </div>

            {/* Categories Filter */}
            <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
              <button
                onClick={() => setSelectedCategory('All')}
                className={`
                  whitespace-nowrap px-6 py-2 rounded-full text-sm font-medium transition-all duration-300
                  ${selectedCategory === 'All'
                    ? 'bg-secondary text-secondary-foreground shadow-[0_0_20px_rgba(var(--secondary),0.5)] scale-105'
                    : 'bg-card/50 text-muted-foreground hover:bg-card hover:text-foreground border border-white/10'
                  }
                `}
              >
                All Categories
              </button>
              {categories.map(cat => (
                <button
                  key={cat._id}
                  onClick={() => setSelectedCategory(cat._id)}
                  className={`
                    whitespace-nowrap px-6 py-2 rounded-full text-sm font-medium transition-all duration-300
                    ${selectedCategory === cat._id
                      ? 'bg-secondary text-secondary-foreground shadow-[0_0_20px_rgba(var(--secondary),0.5)] scale-105'
                      : 'bg-card/50 text-muted-foreground hover:bg-card hover:text-foreground border border-white/10'
                    }
                  `}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Service Cards Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode='popLayout'>
              {filteredServices.map(service => (
                <motion.div
                  key={service._id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card containerClassName="bg-card/40 backdrop-blur-md border-white/10 hover:border-primary/50 transition-colors group overflow-hidden" className="h-full flex flex-col h-full">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    <div className="p-6 border-b border-white/5 relative z-10">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors">
                          {service?.name}
                        </h3>
                        <span className="px-2 py-1 rounded-md bg-primary/10 text-primary text-xs font-medium border border-primary/20">
                          {service?.category?.name || 'General'}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <User className="h-3 w-3" />
                        by {service?.provider?.name || 'Unknown'}
                      </p>
                    </div>

                    <div className="p-6 flex-grow space-y-4 relative z-10">
                      <p className="text-sm text-muted-foreground/80 line-clamp-3">
                        {service?.description || 'No description available'}
                      </p>

                      <div className="flex justify-between items-center text-sm font-medium">
                        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary/10 text-secondary border border-secondary/20">
                          <Clock className="h-4 w-4" />
                          {service?.duration || 0} mins
                        </span>
                        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/10 text-green-500 border border-green-500/20">
                          <DollarSign className="h-4 w-4" />
                          ₹{service?.price || 0}
                        </span>
                      </div>
                    </div>

                    <div className="p-6 pt-0 mt-auto relative z-10">
                      <Link to={`/book/${service._id}`} className="block w-full">
                        <Button className="w-full" variant="glow">
                          Book Appointment
                        </Button>
                      </Link>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {filteredServices.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <div className="w-20 h-20 mx-auto bg-muted/20 rounded-full flex items-center justify-center mb-4">
                <Search className="h-10 w-10 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-lg">
                No services found matching your criteria.
              </p>
            </motion.div>
          )}
        </motion.section>

        {/* Appointments Section */}
        <motion.section variants={containerVariants} className="space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-white">
              Upcoming Appointments
            </h2>
          </div>

          {appointments.length === 0 ? (
            <Card className="bg-card/30 backdrop-blur-md border-white/10 p-12 text-center">
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Calendar className="h-8 w-8 text-primary" />
              </div>
              <p className="text-muted-foreground text-lg mb-4">No upcoming appointments.</p>
              <Button 
                variant="outline" 
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                Browse Services
              </Button>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {appointments.map(appt => (
                <motion.div key={appt._id} variants={itemVariants}>
                  <Card containerClassName="h-full bg-card/40 backdrop-blur-md border-white/10 hover:border-primary/50 transition-all duration-300 group">
                    <div className="p-6 border-b border-white/5">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors">
                          {appt?.service?.name || 'Service'}
                        </h3>
                        <span className={`
                          px-2 py-1 rounded text-xs font-medium border
                          ${appt.status === 'confirmed' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                            appt.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : 
                            'bg-muted/10 text-muted-foreground border-white/10'}
                        `}>
                          {appt.status}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        {new Date(appt.date).toDateString()}
                      </p>
                    </div>

                    <div className="p-6 space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="space-y-1">
                          <p className="text-muted-foreground text-xs uppercase tracking-wider">Time</p>
                          <p className="font-medium text-white flex items-center gap-1">
                            <Clock className="h-3 w-3 text-primary" />
                            {appt.startTime} - {appt.endTime}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-muted-foreground text-xs uppercase tracking-wider">Provider</p>
                          <p className="font-medium text-white truncate">
                            {appt?.provider?.name || 'N/A'}
                          </p>
                        </div>
                      </div>

                      {appt?.service && (
                        <div className="pt-2">
                          <ReviewForm serviceId={appt.service._id} serviceName={appt.service.name} />
                        </div>
                      )}

                      <Link to={`/appointment/${appt._id}`}>
                        <Button variant="secondary" className="w-full mt-2 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                          <QrCode className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.section>
      </motion.div>
    </div>
  );
};

export default CustomerDashboard;