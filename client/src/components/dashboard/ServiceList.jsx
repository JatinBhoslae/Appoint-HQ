import { useState, useEffect } from 'react';
import axios from 'axios';
import { Edit, Share2, Copy, ExternalLink, Clock, DollarSign, Trash2, MoreVertical, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_URL } from '../../config';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';

const ServiceList = ({ onEdit }) => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);

    const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
    const config = { headers: { Authorization: `Bearer ${token}` } };

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_URL}/api/services/my`, config);
            setServices(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const togglePublish = async (service) => {
        try {
            const updated = { ...service, isPublished: !service.isPublished };
            await axios.put(`${API_URL}/api/services/${service._id}`, updated, config);
            setServices(services.map(s => s._id === service._id ? updated : s));
        } catch (error) {
            console.error(error);
            alert('Failed to update status');
        }
    };

    const copyShareLink = (id) => {
        const link = `${window.location.origin}/book/${id}`;
        navigator.clipboard.writeText(link);
        alert('Link copied to clipboard!');
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 100,
                damping: 15
            }
        }
    };

    if (loading) {
        return (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-[280px] rounded-xl bg-white/5 animate-pulse" />
                ))}
            </div>
        );
    }

    return (
        <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <AnimatePresence>
                {services.map(service => (
                    <motion.div key={service._id} variants={itemVariants} layout>
                        <Card 
                            containerClassName="h-full bg-card/40 backdrop-blur-md border-white/10 hover:border-primary/50 transition-colors duration-300"
                            className="flex flex-col h-full"
                        >
                            {/* Status Indicator */}
                            <div className={cn(
                                "absolute top-4 right-4 px-2 py-1 rounded-full text-xs font-medium border flex items-center gap-1",
                                service.isPublished 
                                    ? "bg-green-500/10 text-green-500 border-green-500/20" 
                                    : "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                            )}>
                                {service.isPublished ? (
                                    <><Eye className="h-3 w-3" /> Published</>
                                ) : (
                                    <><EyeOff className="h-3 w-3" /> Draft</>
                                )}
                            </div>

                            <div className="mb-6">
                                <h3 className="font-bold text-xl text-white mb-2 pr-20 line-clamp-1" title={service.name}>
                                    {service.name}
                                </h3>
                                <p className="text-sm text-muted-foreground line-clamp-2 h-10">
                                    {service.description || "No description provided."}
                                </p>
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5">
                                    <Clock className="h-4 w-4 text-primary" /> 
                                    <span>{service.duration} min</span>
                                </div>
                                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5">
                                    <DollarSign className="h-4 w-4 text-green-500" /> 
                                    <span>₹{service.price}</span>
                                </div>
                            </div>

                            <div className="mt-auto pt-6 border-t border-white/10 flex items-center justify-between gap-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onEdit(service)}
                                    className="flex-1 hover:bg-primary/10 hover:text-primary"
                                >
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                </Button>
                                
                                <div className="w-px h-8 bg-white/10" />

                                <Button 
                                    variant="ghost" 
                                    size="sm"
                                    className="flex-1 hover:bg-primary/10 hover:text-primary"
                                    onClick={() => togglePublish(service)}
                                >
                                    {service.isPublished ? (
                                        <><EyeOff className="h-4 w-4 mr-2" /> Hide</>
                                    ) : (
                                        <><Eye className="h-4 w-4 mr-2" /> Publish</>
                                    )}
                                </Button>

                                <div className="w-px h-8 bg-white/10" />

                                <Button 
                                    variant="ghost" 
                                    size="icon"
                                    onClick={() => copyShareLink(service._id)}
                                    title="Copy Link"
                                    className="hover:bg-primary/10 hover:text-primary"
                                >
                                    <Share2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </AnimatePresence>
            
            {services.length === 0 && (
                <motion.div 
                    variants={itemVariants}
                    className="col-span-full flex flex-col items-center justify-center py-16 text-muted-foreground border-2 border-dashed border-white/10 rounded-2xl bg-white/5"
                >
                    <div className="p-4 rounded-full bg-white/5 mb-4">
                        <Clock className="h-8 w-8 opacity-50" />
                    </div>
                    <p className="text-lg font-medium text-white mb-2">No services yet</p>
                    <p className="text-sm max-w-sm text-center">
                        Create your first service to start accepting bookings from your customers.
                    </p>
                </motion.div>
            )}
        </motion.div>
    );
};

export default ServiceList;
