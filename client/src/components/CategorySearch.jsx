import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Filter, Star, Clock, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { API_URL } from '../config';

const CategorySearch = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, servicesRes] = await Promise.all([
          axios.get(`${API_URL}/api/admin/categories`),
          axios.get(`${API_URL}/api/services`)
        ]);

        setCategories(categoriesRes.data);
        setServices(servicesRes.data);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getServicesByCategory = (categoryId) => {
    if (categoryId === 'All') return services;
    return services.filter(service =>
      service.category && service.category._id === categoryId
    );
  };

  const getCategoryStats = (categoryId) => {
    const categoryServices = getServicesByCategory(categoryId);
    const totalProviders = new Set(categoryServices.map(s => s.provider._id)).size;
    const avgRating = categoryServices.reduce((acc, s) => acc + (s.rating || 0), 0) / categoryServices.length || 0;

    return {
      services: categoryServices.length,
      providers: totalProviders,
      avgRating: avgRating.toFixed(1)
    };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent mb-2">
          Find Services by Category
        </h2>
        <p className="text-muted-foreground">Browse services by professional categories</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div
            className={`bg-card rounded-lg border border-border shadow-sm cursor-pointer transition-all duration-300 hover:shadow-lg p-6 ${selectedCategory === 'All'
                ? 'bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-300 dark:border-blue-700'
                : 'hover:border-blue-300 dark:hover:border-blue-700'
              }`}
            onClick={() => setSelectedCategory('All')}
          >
            <div className="pb-3 border-b border-border">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground">
                <Filter className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                All Services
              </h3>
            </div>
            <div className="pt-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Services</span>
                  <span className="font-semibold text-foreground">{services.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Providers</span>
                  <span className="font-semibold text-foreground">
                    {new Set(services.map(s => s.provider._id)).size}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {categories.map((category) => {
          const stats = getCategoryStats(category._id);
          return (
            <motion.div
              key={category._id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div
                className={`bg-card rounded-lg border border-border shadow-sm cursor-pointer transition-all duration-300 hover:shadow-lg p-6 ${selectedCategory === category._id
                    ? 'bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-300 dark:border-blue-700'
                    : 'hover:border-blue-300 dark:hover:border-blue-700'
                  }`}
                onClick={() => setSelectedCategory(category._id)}
              >
                <div className="pb-3 border-b border-border">
                  <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                      {category.name.charAt(0)}
                    </div>
                    {category.name}
                  </h3>
                </div>
                <div className="pt-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Services</span>
                      <span className="font-semibold text-foreground">{stats.services}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Providers</span>
                      <span className="font-semibold text-foreground">{stats.providers}</span>
                    </div>
                    {stats.avgRating > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Avg Rating</span>
                        <span className="font-semibold flex items-center gap-1 text-foreground">
                          <Star className="h-3 w-3 text-yellow-500 fill-current" />
                          {stats.avgRating}
                        </span>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-3 line-clamp-2">
                    {category.description}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {selectedCategory !== 'All' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6"
        >
          <div className="bg-muted/30 rounded-lg p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Search className="h-4 w-4" />
              Services in {categories.find(c => c._id === selectedCategory)?.name}
            </h3>
            <div className="grid gap-3">
              {getServicesByCategory(selectedCategory).slice(0, 3).map((service) => (
                <div key={service._id} className="bg-background rounded-lg p-3 border">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{service.name}</h4>
                      <p className="text-sm text-muted-foreground">{service.provider?.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${service.price || 0}</p>
                      <p className="text-xs text-muted-foreground">{service.duration} min</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button
              className="w-full mt-3 border border-gray-300 rounded-md px-4 py-2 hover:bg-gray-50 transition-colors"
              onClick={() => window.location.href = '/dashboard'}
            >
              View All Services
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default CategorySearch;
