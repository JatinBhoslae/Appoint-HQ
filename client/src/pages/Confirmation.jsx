import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { QRCodeCanvas } from 'qrcode.react';
import { CheckCircle, Calendar, Download, Home, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import QueueTracker from '../components/QueueTracker';
import { API_URL } from '../config';

const Confirmation = () => {
  const { id } = useParams();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
        const config = { headers: { Authorization: `Bearer ${token}` } };

        const { data } = await axios.get(`${API_URL}/api/appointments/my`, config);
        const found = data.find(a => a._id === id);

        if (found) {
          setAppointment(found);
        } else {
          setError('Appointment not found');
        }
        setLoading(false);
      } catch (err) {
        setError('Failed to load appointment details');
        setLoading(false);
      }
    };
    fetchAppointment();
  }, [id]);

  const generateGoogleCalendarLink = () => {
    if (!appointment) return '';

    const { service, date, startTime, endTime } = appointment;

    const startDateTime = new Date(`${date.split('T')[0]}T${startTime}:00`);
    const endDateTime = new Date(`${date.split('T')[0]}T${endTime}:00`);

    const formatDate = (d) => d.toISOString().replace(/-|:|\.\d\d\d/g, "");

    const start = formatDate(startDateTime);
    const end = formatDate(endDateTime);

    const text = encodeURIComponent(`Appointment: ${service.name}`);
    const details = encodeURIComponent(`Appointment with ${appointment.provider.name}`);

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${start}/${end}&details=${details}`;
  };

  const downloadTicket = () => {
    window.print();
  };

  if (loading) return (
    <div className="flex justify-center items-center h-[50vh]">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      >
        <Loader2 className="h-16 w-16 text-primary" />
      </motion.div>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center h-[50vh] text-red-500">
      <AlertCircle className="h-16 w-16 mb-4" />
      <p className="text-xl font-semibold">{error}</p>
      <Link to="/dashboard" className="mt-4">
        <button className="border border-gray-300 rounded-md py-2 px-4 hover:bg-gray-50 transition-colors">Back to Dashboard</button>
      </Link>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[80vh]">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
        className="w-full max-w-2xl"
      >
        <div className="w-full bg-card text-card-foreground rounded-lg shadow-2xl p-8 border border-border border-t-8 border-t-green-500 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 to-green-600"></div>
          <div className="text-center pb-2">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mx-auto bg-green-100 dark:bg-green-900/30 p-4 rounded-full w-20 h-20 flex items-center justify-center mb-4 shadow-inner"
            >
              <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
            </motion.div>
            <h2 className="text-3xl text-green-600 dark:text-green-400 font-bold">Booking Confirmed!</h2>
            <p className="text-muted-foreground">Your appointment has been successfully scheduled.</p>
          </div>
          <div className="space-y-8 pt-6">
            <QueueTracker appointmentId={appointment._id} />
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <h3 className="font-semibold text-lg border-b border-border pb-2">Appointment Details</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center p-2 rounded hover:bg-accent transition-colors">
                    <span className="text-muted-foreground">Service:</span>
                    <span className="font-medium text-base text-foreground">{appointment.service.name}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded hover:bg-accent transition-colors">
                    <span className="text-muted-foreground">Provider:</span>
                    <span className="font-medium text-base text-foreground">{appointment.provider.name}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded hover:bg-accent transition-colors">
                    <span className="text-muted-foreground">Date:</span>
                    <span className="font-medium text-base text-foreground">{new Date(appointment.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded hover:bg-accent transition-colors">
                    <span className="text-muted-foreground">Time:</span>
                    <span className="font-medium text-base text-foreground">{appointment.startTime} - {appointment.endTime}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded hover:bg-accent transition-colors">
                    <span className="text-muted-foreground">Booking ID:</span>
                    <span className="font-mono bg-muted px-2 py-0.5 rounded text-xs select-all text-foreground">{appointment._id}</span>
                  </div>
                </div>

                <div className="pt-4 flex flex-col gap-3 print:hidden">
                  <motion.a
                    href={generateGoogleCalendarLink()}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="block"
                  >
                    <button className="w-full gap-2 border border-blue-200 dark:border-blue-900/50 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md py-2 px-4 transition-colors flex items-center justify-center text-blue-600 dark:text-blue-400 font-medium">
                      <Calendar className="w-4 h-4" />
                      Add to Google Calendar
                    </button>
                  </motion.a>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <button className="w-full gap-2 border border-blue-200 dark:border-blue-900/50 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md py-2 px-4 transition-colors flex items-center justify-center text-blue-600 dark:text-blue-400 font-medium" onClick={downloadTicket}>
                      <Download className="w-4 h-4" />
                      Download Ticket
                    </button>
                  </motion.div>
                </div>
              </div>

              <motion.div
                className="flex flex-col items-center justify-center bg-gradient-to-br from-muted/50 to-muted p-6 rounded-xl border border-border/50 shadow-sm"
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <h3 className="font-semibold mb-4 text-primary">Digital Entry Ticket</h3>
                <div className="bg-white p-4 rounded-lg shadow-md">
                  <QRCodeCanvas value={JSON.stringify({ appointmentId: appointment._id, userId: appointment.customer })} size={180} />
                </div>
                <p className="text-xs text-muted-foreground mt-4 text-center max-w-[200px]">
                  Show this QR code at the venue for seamless entry
                </p>
              </motion.div>
            </div>

          </div>
          <div className="flex justify-center print:hidden bg-muted/30 py-6 mt-6 rounded-b-lg">
            <Link to="/dashboard">
              <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 gap-2 px-6 py-3 rounded-md text-white font-medium transition-colors flex items-center">
                <Home className="w-4 h-4" /> Go to Dashboard
              </button>
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Confirmation;
