import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';
import { motion } from 'framer-motion';
import { Loader2, Download, Calendar, Clock, MapPin, User, CheckCircle, AlertCircle, Share2 } from 'lucide-react';
import { API_URL } from '../config';
import Button from '../components/ui/button';
import { Card } from '../components/ui/card';

const TicketView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const ticketRef = useRef(null);

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (!userInfo || !userInfo.token) {
            navigate('/login');
            return;
        }
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        const { data } = await axios.get(`${API_URL}/api/appointments/${id}`, config);
        setAppointment(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load ticket');
      } finally {
        setLoading(false);
      }
    };
    fetchAppointment();
  }, [id, navigate]);

  const handleDownload = () => {
     window.print();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-background">
        <Loader2 className="animate-spin h-12 w-12 text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background text-destructive gap-4">
        <AlertCircle className="h-16 w-16" />
        <p className="text-xl font-semibold">{error}</p>
        <Button onClick={() => navigate('/dashboard')}>Go Back</Button>
      </div>
    );
  }

  if (!appointment) return null;

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center print:bg-white print:py-0">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="print:hidden mb-6 flex justify-between items-center">
            <Button variant="ghost" onClick={() => navigate('/dashboard')}>
                &larr; Back to Dashboard
            </Button>
            <Button onClick={handleDownload} variant="outline" className="gap-2">
                <Download className="h-4 w-4" /> Download Ticket
            </Button>
        </div>

        <div id="ticket-content" className="bg-card text-card-foreground rounded-3xl overflow-hidden shadow-2xl relative print:shadow-none border border-border">
            {/* Header */}
            <div className="bg-primary p-6 text-primary-foreground text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-white/10 backdrop-blur-sm"></div>
                <div className="relative z-10">
                    <h1 className="text-2xl font-bold uppercase tracking-wider">{appointment.service?.name || 'Service Ticket'}</h1>
                    <p className="text-primary-foreground/80 text-sm mt-1">Ticket ID: {appointment.ticketId || appointment._id}</p>
                </div>
            </div>

            {/* Content */}
            <div className="p-8 space-y-6">
                <div className="flex justify-center py-4">
                    <div className="p-4 bg-white rounded-xl shadow-inner border border-gray-100">
                        {appointment.ticketId ? (
                            <QRCodeSVG 
                                value={JSON.stringify({ ticketId: appointment.ticketId, id: appointment._id })} 
                                size={180}
                                level={"H"}
                                includeMargin={true}
                            />
                        ) : (
                            <div className="w-48 h-48 bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
                                QR Code Unavailable
                            </div>
                        )}
                    </div>
                </div>
                
                <div className="text-center">
                     <p className={`text-sm font-bold uppercase tracking-widest py-1 px-3 rounded-full inline-block ${
                         appointment.isScanned ? 'bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-300' : 
                         appointment.status === 'confirmed' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                     }`}>
                         {appointment.isScanned ? 'SCANNED / EXPIRED' : appointment.status}
                     </p>
                </div>

                <div className="space-y-4 border-t border-dashed border-border pt-6">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-400">
                            <Calendar className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground uppercase">Date</p>
                            <p className="font-semibold text-foreground">{new Date(appointment.date).toDateString()}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-purple-50 dark:bg-purple-900/30 rounded-full text-purple-600 dark:text-purple-400">
                            <Clock className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground uppercase">Time</p>
                            <p className="font-semibold text-foreground">{appointment.startTime} - {appointment.endTime}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-orange-50 dark:bg-orange-900/30 rounded-full text-orange-600 dark:text-orange-400">
                            <User className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground uppercase">Provider</p>
                            <p className="font-semibold text-foreground">{appointment.provider?.name}</p>
                        </div>
                    </div>
                </div>
                
                {/* Cutout circles decoration */}
                <div className="absolute top-1/2 left-0 w-6 h-6 bg-background rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute top-1/2 right-0 w-6 h-6 bg-background rounded-full translate-x-1/2 -translate-y-1/2"></div>
            </div>

            {/* Footer */}
            <div className="bg-muted/50 p-6 text-center border-t border-border">
                <p className="text-xs text-muted-foreground">
                    Please show this QR code at the entrance. 
                    <br/>One-time use only.
                </p>
            </div>
        </div>
      </motion.div>
    </div>
  );
};

export default TicketView;
