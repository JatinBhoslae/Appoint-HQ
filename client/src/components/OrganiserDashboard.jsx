import { useState, useEffect } from 'react';
import axios from 'axios';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera,
  XCircle,
  Plus,
  QrCode,
  CheckCircle2,
  Calendar,
  Building,
  Users
} from 'lucide-react';
import { API_URL } from '../config';

// Sub-components
import ServiceList from './dashboard/ServiceList';
import ServiceForm from './dashboard/ServiceForm';
import CalendarView from './dashboard/CalendarView';
import Reports from './dashboard/Reports';

const OrganiserDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [userCategory, setUserCategory] = useState(null);

  const [appointments, setAppointments] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [pastAppointments, setPastAppointments] = useState([]);

  const [showScanner, setShowScanner] = useState(false);
  const [checkInId, setCheckInId] = useState('');
  const [scannedDetails, setScannedDetails] = useState(null);
  const [checkInSuccess, setCheckInSuccess] = useState(false);

  const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
  const config = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    fetchAppointments();
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      if (userInfo?.category) {
        const { data } = await axios.get(`${API_URL}/api/admin/categories/${userInfo.category}`, config);
        setUserCategory(data);
      }
    } catch (error) {
      console.error('Failed to fetch user category:', error);
    }
  };

  useEffect(() => {
    let scanner;
    if (showScanner) {
      scanner = new Html5QrcodeScanner(
        'reader',
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false
      );
      scanner.render(onScanSuccess, () => { });
    }
    return () => {
      if (scanner) scanner.clear().catch(console.error);
    };
  }, [showScanner]);

  const fetchAppointments = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/appointments/provider`, config);
      const all = res.data;
      setAppointments(all);

      const now = new Date();
      const upcoming = [];
      const past = [];

      all.forEach(appt => {
        const apptDate = new Date(`${appt.date}T${appt.startTime}`);
        if (apptDate < now || appt.status === 'completed' || appt.status === 'cancelled') {
          past.push(appt);
        } else {
          upcoming.push(appt);
        }
      });
      setUpcomingAppointments(upcoming);
      setPastAppointments(past);
    } catch (err) {
      console.error(err);
    }
  };

  const onScanSuccess = (decodedText) => {
    setCheckInId(decodedText);
    setShowScanner(false);

    const apt = appointments.find(a => a._id === decodedText);
    setScannedDetails(
      apt || {
        _id: decodedText,
        customer: { name: 'Loading...' },
        service: { name: 'Service' },
        status: 'unknown',
        date: new Date(),
        startTime: '--:--'
      }
    );
  };

  const handleCheckInSubmit = async (id) => {
    try {
      await axios.put(
        `${API_URL}/api/appointments/${id}/status`,
        { status: 'completed' },
        config
      );
      setScannedDetails(null);
      setCheckInId('');
      setCheckInSuccess(true);
      fetchAppointments();
      setTimeout(() => setCheckInSuccess(false), 3000);
    } catch (err) {
      alert('Check-in failed!');
    }
  };

  return (
    <motion.div
      className="container mx-auto px-4 py-8 space-y-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Organizer Dashboard
          </h1>
          <p className="text-muted-foreground">Manage services & check-ins</p>
        </div>

        {activeTab === 'services' && !showCreateForm && !editingService && (
          <button onClick={() => setShowCreateForm(true)} className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2">
            <Plus className="h-4 w-4" /> Create Service
          </button>
        )}
      </div>

      {/* Check-in */}
      <div className="bg-card rounded-lg border border-border shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-card-foreground">
          <QrCode /> Quick Check-in
        </h3>
        <div className="space-y-4">
          <div className="flex gap-4 flex-wrap">
            <input
              type="text"
              placeholder="Enter Booking ID"
              value={checkInId}
              onChange={(e) => setCheckInId(e.target.value)}
              className="px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
            />
            <button onClick={() => handleCheckInSubmit(checkInId)} className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
              Check In
            </button>
            <button onClick={() => setShowScanner(!showScanner)} className="px-4 py-2 border border-border rounded-md hover:bg-accent transition-colors flex items-center gap-2 text-foreground">
              <Camera className="h-4 w-4" /> Scan QR
            </button>
          </div>

          {showScanner && (
            <div className="relative max-w-sm mx-auto">
              <div id="reader" />
              <button
                className="absolute top-2 right-2 p-2 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90 transition-colors"
                onClick={() => setShowScanner(false)}
              >
                <XCircle />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="space-y-6">
        <div className="flex space-x-1 border-b border-border">
          {['overview', 'services', 'calendar', 'reports'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === tab
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-6">
            {userCategory && (
              <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-lg p-6">
                <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div>
                    <h3 className="text-sm font-medium text-foreground">Your Category</h3>
                    <p className="text-xs text-muted-foreground mt-1">Service specialization</p>
                  </div>
                  <Building className="h-4 w-4 text-primary" />
                </div>
                <div className="pt-2">
                  <div className="text-2xl font-bold text-foreground">{userCategory.name}</div>
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-card rounded-lg border border-border shadow-sm p-6">
                <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <h3 className="text-sm font-medium text-card-foreground">Total Appointments</h3>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">{appointments.length}</div>
                  <p className="text-xs text-muted-foreground">Lifetime bookings</p>
                </div>
              </div>
              <div className="bg-card rounded-lg border border-border shadow-sm p-6">
                <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <h3 className="text-sm font-medium text-card-foreground">Upcoming</h3>
                  <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">{upcomingAppointments.length}</div>
                  <p className="text-xs text-muted-foreground">Active bookings</p>
                </div>
              </div>
              <div className="bg-card rounded-lg border border-border shadow-sm p-6">
                <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <h3 className="text-sm font-medium text-card-foreground">Completed/Past</h3>
                  <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">{pastAppointments.length}</div>
                  <p className="text-xs text-muted-foreground">Finished bookings</p>
                </div>
              </div>
            </div>

            {/* Upcoming Section */}
            <div className="bg-card rounded-lg border border-border shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4 text-card-foreground">Upcoming Appointments</h3>
              <div>
                {upcomingAppointments.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No upcoming appointments</p>
                ) : (
                  <div className="space-y-4">
                    {upcomingAppointments.map(appt => (
                      <div key={appt._id} className="flex justify-between items-center border-b border-border pb-4 last:border-0">
                        <div>
                          <div className="font-semibold text-foreground">{appt.service?.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(appt.date).toDateString()} at {appt.startTime}
                          </div>
                          <div className="text-sm text-foreground">Customer: {appt.customer?.name}</div>
                        </div>
                        <div className="text-right">
                          <span className="inline-block px-2 py-1 rounded text-xs bg-primary/10 text-primary capitalize">
                            {appt.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* History Section */}
            <div className="bg-card rounded-lg border border-border shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4 text-card-foreground">Booking History</h3>
              <div>
                {pastAppointments.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No past history</p>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                    {pastAppointments.map(appt => (
                      <div key={appt._id} className="flex justify-between items-center border-b border-border pb-4 last:border-0 opacity-75">
                        <div>
                          <div className="font-semibold text-foreground">{appt.service?.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(appt.date).toDateString()} at {appt.startTime}
                          </div>
                          <div className="text-sm text-foreground">Customer: {appt.customer?.name}</div>
                        </div>
                        <div className="text-right">
                          <span className={`inline-block px-2 py-1 rounded text-xs capitalize ${appt.status === 'completed' ? 'bg-green-500/10 text-green-500' :
                              appt.status === 'cancelled' ? 'bg-destructive/10 text-destructive' :
                                'bg-muted text-muted-foreground'
                            }`}>
                            {appt.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'services' && (
          <div>
            {showCreateForm || editingService ? (
              <ServiceForm
                serviceToEdit={editingService}
                onCancel={() => {
                  setShowCreateForm(false);
                  setEditingService(null);
                }}
                onSuccess={() => {
                  setShowCreateForm(false);
                  setEditingService(null);
                }}
              />
            ) : (
              <ServiceList onEdit={setEditingService} />
            )}
          </div>
        )}

        {activeTab === 'calendar' && (
          <div>
            <CalendarView />
          </div>
        )}

        {activeTab === 'reports' && (
          <div>
            <Reports />
          </div>
        )}
      </div>

      {/* Check-in success */}
      <AnimatePresence>
        {checkInSuccess && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="bg-card rounded-lg border border-border shadow-sm p-8 text-center">
              <CheckCircle2 className="mx-auto text-green-500 h-16 w-16" />
              <h2 className="text-2xl font-bold mt-4 text-card-foreground">Check-in Complete!</h2>
              <button className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors" onClick={() => setCheckInSuccess(false)}>
                Close
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default OrganiserDashboard;