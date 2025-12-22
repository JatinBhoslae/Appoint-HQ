import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import {
  CheckCircle2,
  XCircle,
  Trash2,
  Plus,
  Users,
  Calendar,
  Activity,
  DollarSign,
  TrendingUp,
  Search,
  Filter,
  MoreVertical,
  Shield,
  Briefcase,
  Layers,
  Settings,
  LayoutDashboard
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_URL } from '../config';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { cn } from '../lib/utils';

import { Label } from './ui/label';
import { Input } from './ui/input';

/* ---------- Static Chart Data ---------- */
const data = [
  { name: 'Mon', bookings: 4, revenue: 240 },
  { name: 'Tue', bookings: 3, revenue: 139 },
  { name: 'Wed', bookings: 2, revenue: 980 },
  { name: 'Thu', bookings: 2, revenue: 390 },
  { name: 'Fri', bookings: 1, revenue: 480 },
  { name: 'Sat', bookings: 2, revenue: 380 },
  { name: 'Sun', bookings: 3, revenue: 430 }
];

const pieData = [
  { name: 'Consultation', value: 400 },
  { name: 'Therapy', value: 300 },
  { name: 'Massage', value: 300 },
  { name: 'Training', value: 200 }
];

const COLORS = ['#8b5cf6', '#ec4899', '#3b82f6', '#10b981'];

/* ---------- Animations ---------- */
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

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAppointments: 0,
    totalServices: 0,
    totalRevenue: 0
  });
  const [users, setUsers] = useState([]);
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });
  const [isLoading, setIsLoading] = useState(true);

  const token = JSON.parse(localStorage.getItem('userInfo'))?.token;

  const config = token
    ? { headers: { Authorization: `Bearer ${token}` } }
    : null;

  useEffect(() => {
    if (!config) return;
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([
        fetchStats(),
        fetchUsers(),
        fetchServices(),
        fetchCategories()
      ]);
      setIsLoading(false);
    };
    loadData();
  }, []);

  /* ---------- API Calls ---------- */
  const fetchStats = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/admin/stats`, config);
      setStats(data);
    } catch (err) {
      console.error('Stats error:', err);
      // Fallback for demo if API fails
      setStats({
        totalUsers: 124,
        totalAppointments: 45,
        totalServices: 12,
        totalRevenue: 12500
      });
    }
  };

  const fetchUsers = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/admin/users`, config);
      setUsers(data);
    } catch (err) {
      console.error('Users error:', err);
    }
  };

  const fetchServices = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/admin/services`, config);
      setServices(data);
    } catch (err) {
      console.error('Services error:', err);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/admin/categories`, config);
      setCategories(data);
    } catch (err) {
      console.error('Categories error:', err);
    }
  };

  /* ---------- Actions ---------- */
  const handleUserStatus = async (id) => {
    try {
      await axios.put(`${API_URL}/api/admin/users/${id}/status`, {}, config);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user');
    }
  };

  const handleServiceStatus = async (id, status) => {
    try {
      await axios.put(
        `${API_URL}/api/admin/services/${id}/status`,
        { status },
        config
      );
      fetchServices();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update service');
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/api/admin/categories`, newCategory, config);
      setNewCategory({ name: '', description: '' });
      fetchCategories();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create category');
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      await axios.delete(`${API_URL}/api/admin/categories/${id}`, config);
      fetchCategories();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete category');
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'services', label: 'Services', icon: Briefcase },
    { id: 'categories', label: 'Categories', icon: Layers }
  ];

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background py-8">
      {/* Background Elements */}
      <div className="absolute inset-0 dark:bg-grid-white/[0.02] bg-grid-black/[0.02] bg-[size:30px_30px]" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/20 rounded-full blur-[100px] opacity-30 animate-blob" />
      <div className="absolute top-40 -left-40 w-96 h-96 bg-purple-500/20 rounded-full blur-[100px] opacity-30 animate-blob animation-delay-2000" />

      <motion.div
        className="container mx-auto px-4 space-y-8 relative z-10"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <motion.h1 
              className="text-4xl font-bold bg-gradient-to-r from-primary via-purple-500 to-blue-500 bg-clip-text text-transparent"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              Admin Portal
            </motion.h1>
            <motion.p 
              className="text-muted-foreground mt-1"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Manage your system, users, and services with ease
            </motion.p>
          </div>
          <div className="flex items-center gap-3">
             
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 p-1 bg-muted/50 backdrop-blur-md rounded-2xl border border-border w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2",
                activeTab === tab.id 
                  ? "text-primary-foreground" 
                  : "text-muted-foreground hover:text-foreground hover:bg-background/50"
              )}
            >
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTabAdmin"
                  className="absolute inset-0 bg-primary rounded-xl"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <tab.icon className="w-4 h-4 relative z-10" />
              <span className="relative z-10">{tab.label}</span>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* ---------------- OVERVIEW ---------------- */}
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Stats Grid */}
              <div className="grid md:grid-cols-4 gap-6">
                {[
                  { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                  { label: 'Bookings', value: stats.totalAppointments, icon: Calendar, color: 'text-purple-500', bg: 'bg-purple-500/10' },
                  { label: 'Services', value: stats.totalServices, icon: Activity, color: 'text-pink-500', bg: 'bg-pink-500/10' },
                  { label: 'Revenue', value: `₹${stats.totalRevenue}`, icon: DollarSign, color: 'text-green-500', bg: 'bg-green-500/10' }
                ].map((item, i) => (
                  <Card key={i} containerClassName="border-border bg-card backdrop-blur-md hover:bg-accent/50 transition-colors h-full">
                    <div className="p-6 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">{item.label}</p>
                        <h3 className="text-3xl font-bold mt-2">{item.value}</h3>
                      </div>
                      <div className={cn("p-3 rounded-xl", item.bg)}>
                        <item.icon className={cn("w-6 h-6", item.color)} />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Charts */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card containerClassName="border-border bg-card backdrop-blur-md" className="p-6">
                  <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    Weekly Revenue
                  </h3>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={data}>
                        <defs>
                          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" stroke="#888888" />
                        <YAxis stroke="#888888" />
                        <Tooltip 
                          contentStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--popover-foreground))' }}
                        />
                        <Area type="monotone" dataKey="revenue" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorRevenue)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                <Card containerClassName="border-border bg-card backdrop-blur-md" className="p-6">
                  <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-purple-500" />
                    Service Distribution
                  </h3>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--popover-foreground))' }}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </div>
            </motion.div>
          )}

          {/* ---------------- USERS ---------------- */}
          {activeTab === 'users' && (
            <motion.div
              key="users"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card containerClassName="border-border bg-card backdrop-blur-md overflow-hidden">
                <div className="p-6 border-b border-border flex justify-between items-center">
                  <h3 className="text-xl font-semibold">User Management</h3>
                  <div className="w-64">
                    <Input 
                      icon={<Search className="w-4 h-4" />}
                      type="text" 
                      placeholder="Search users..." 
                      className="bg-background border-input text-sm"
                    />
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground">User</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground">Role</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground">Status</th>
                        <th className="px-6 py-4 text-right text-sm font-semibold text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {users.map((user) => (
                        <tr key={user._id} className="hover:bg-muted/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                {user.name.charAt(0)}
                              </div>
                              <div>
                                <p className="font-semibold">{user.name}</p>
                                <p className="text-xs text-muted-foreground">{user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-500 border border-blue-500/20">
                              {user.role || 'User'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {user.status === 'banned' ? (
                              <span className="flex items-center gap-1 text-red-500 text-sm">
                                <XCircle className="w-4 h-4" /> Banned
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-green-500 text-sm">
                                <CheckCircle2 className="w-4 h-4" /> Active
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Button
                              variant={user.status === 'banned' ? "outline" : "destructive"}
                              size="sm"
                              onClick={() => handleUserStatus(user._id)}
                              className="w-24"
                            >
                              {user.status === 'banned' ? 'Unban' : 'Ban Access'}
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </motion.div>
          )}

          {/* ---------------- SERVICES ---------------- */}
          {activeTab === 'services' && (
            <motion.div
              key="services"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="grid gap-6"
            >
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((service) => (
                  <Card key={service._id} className="border-border bg-card backdrop-blur-md overflow-hidden group hover:border-primary/50 transition-colors">
                    <div className="h-40 bg-gray-800 relative">
                      {/* Placeholder for service image */}
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                        <Briefcase className="w-12 h-12 text-gray-700" />
                      </div>
                      <div className="absolute top-4 right-4">
                         <span className={cn(
                           "px-3 py-1 rounded-full text-xs font-medium border backdrop-blur-md",
                           service.approvalStatus === 'approved' ? "bg-green-500/10 text-green-500 border-green-500/20" :
                           service.approvalStatus === 'rejected' ? "bg-red-500/10 text-red-500 border-red-500/20" :
                           "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                         )}>
                           {service.approvalStatus?.charAt(0).toUpperCase() + service.approvalStatus?.slice(1)}
                         </span>
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{service.name}</h3>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {service.description}
                      </p>
                      
                      {service.approvalStatus === 'pending' && (
                        <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                          <Button
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => handleServiceStatus(service._id, 'approved')}
                          >
                            <CheckCircle2 className="w-4 h-4 mr-2" /> Approve
                          </Button>
                          <Button
                            variant="destructive"
                            className="flex-1"
                            onClick={() => handleServiceStatus(service._id, 'rejected')}
                          >
                            <XCircle className="w-4 h-4 mr-2" /> Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}

          {/* ---------------- CATEGORIES ---------------- */}
          {activeTab === 'categories' && (
            <motion.div
              key="categories"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <Card containerClassName="border-border bg-card backdrop-blur-md" className="p-6">
                <h3 className="text-xl font-semibold mb-6">Add New Category</h3>
                <form onSubmit={handleCreateCategory} className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 space-y-2">
                    <Label>Category Name</Label>
                    <Input
                      type="text"
                      placeholder="e.g. Wellness"
                      value={newCategory.name}
                      onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="flex-[2] space-y-2">
                    <Label>Description</Label>
                    <Input
                      type="text"
                      placeholder="Brief description of the category"
                      value={newCategory.description}
                      onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button type="submit" variant="glow" className="w-full md:w-auto">
                      <Plus className="w-4 h-4 mr-2" /> Add Category
                    </Button>
                  </div>
                </form>
              </Card>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((category) => (
                  <Card key={category._id} containerClassName="border-border bg-card backdrop-blur-md hover:border-primary/50 transition-colors group relative overflow-hidden" className="p-6">
                    <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleDeleteCategory(category._id)}
                        className="text-muted-foreground hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
                      <Layers className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold mb-2">{category.name}</h3>
                    <p className="text-sm text-muted-foreground">{category.description || 'No description provided'}</p>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;
