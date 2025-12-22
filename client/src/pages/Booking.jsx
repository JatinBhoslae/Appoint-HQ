import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Clock,
  DollarSign,
  User,
  AlertCircle,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import ReviewList from '../components/ReviewList';
import { API_URL } from '../config';

const Booking = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [service, setService] = useState(null);
  const [date, setDate] = useState('');
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [error, setError] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [confirmedAppointment, setConfirmedAppointment] = useState(null);

  const [heldAppointment, setHeldAppointment] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef(null);

  /* Fetch service */
  useEffect(() => {
    const fetchService = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/api/services/${id}`);
        setService(data);
      } catch {
        setError('Service not found');
      } finally {
        setLoading(false);
      }
    };
    fetchService();
  }, [id]);

  /* Fetch slots */
  useEffect(() => {
    if (!date) return;

    const fetchSlots = async () => {
      setSlotsLoading(true);
      try {
        const { data } = await axios.get(
          `${API_URL}/api/services/${id}/slots?date=${date}`
        );
        setSlots(data);
      } catch {
        setSlots([]);
      } finally {
        setSlotsLoading(false);
      }
    };

    fetchSlots();
  }, [date, id]);

  /* Seat hold timer */
  useEffect(() => {
    if (heldAppointment && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setHeldAppointment(null);
            alert('Reservation expired. Please select a slot again.');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [heldAppointment, timeLeft]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  /* Hold slot */
  const handleSlotHold = async (slotTime) => {
    if (heldAppointment) {
      const confirm = window.confirm('You already hold a slot. Switch?');
      if (!confirm) return;
    }

    try {
      const token = JSON.parse(localStorage.getItem('userInfo')).token;
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const { data } = await axios.post(
        `${API_URL}/api/appointments/hold`,
        { serviceId: id, date, startTime: slotTime },
        config
      );

      setHeldAppointment(data);

      const expiresAt = new Date(data.expiresAt).getTime();
      const now = Date.now();
      setTimeLeft(Math.max(Math.floor((expiresAt - now) / 1000), 0));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to hold slot');
      setTimeout(() => setError(''), 3000);
    }
  };

  /* Load Razorpay SDK */
  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  /* Confirm booking & Pay */
  const handleConfirmBooking = async () => {
    if (!heldAppointment) return;

    const res = await loadRazorpay();
    if (!res) {
      alert('Razorpay SDK failed to load. Are you online?');
      return;
    }

    try {
      const token = JSON.parse(localStorage.getItem('userInfo')).token;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));

      // 1. Create Order
      const { data: orderData } = await axios.post(
        `${API_URL}/api/payment/orders`,
        { amount: service.price, receipt: `receipt_${heldAppointment._id}` },
        config
      );

      // 2. Open Razorpay
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_YOUR_KEY_HERE", // Replace with env var in production
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Appointment App",
        description: `Booking for ${service.name}`,
        image: "https://example.com/your_logo",
        order_id: orderData.id,
        handler: async function (response) {
          // 3. Verify Payment
          try {
            const verifyData = {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            };

            const { data: verifyRes } = await axios.post(
              `${API_URL}/api/payment/verify`,
              verifyData,
              config
            );

            if (verifyRes.success) {
              // 4. Confirm Appointment in DB
              const { data } = await axios.put(
                `${API_URL}/api/appointments/${heldAppointment._id}/confirm`,
                {
                  answers: [],
                  notes,
                  paymentInfo: {
                    paymentId: response.razorpay_payment_id,
                    orderId: response.razorpay_order_id,
                  }
                },
                config
              );

              setConfirmedAppointment(data);
              setPaymentCompleted(true);
            }

          } catch (err) {
            console.error(err);
            alert("Payment verification failed");
          }
        },
        prefill: {
          name: userInfo.name,
          email: userInfo.email,
          contact: "9999999999" // Ideally get from user profile
        },
        notes: {
          appointment_id: heldAppointment._id
        },
        theme: {
          color: "#2563eb"
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

    } catch (err) {
      setError(err.response?.data?.message || 'Payment initiation failed');
    }
  };

  /* Loading */
  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-red-500">
        <AlertCircle className="h-16 w-16 mb-4" />
        <p className="text-xl font-semibold">Service not found</p>
      </div>
    );
  }

  // Payment completed UI
  if (paymentCompleted && confirmedAppointment) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center min-h-[80vh]">
        <motion.div className="w-full max-w-lg" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <div className="bg-card text-card-foreground rounded-lg shadow-2xl p-8 border border-border border-t-4 border-t-green-500">
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
              </motion.div>
              <h2 className="text-3xl font-bold text-green-600 dark:text-green-400">Payment Completed!</h2>
              <p className="text-muted-foreground">Your appointment has been successfully booked</p>
            </div>

            <div className="space-y-4 mt-6">
              <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                <h3 className="font-semibold text-lg">Appointment Details</h3>
                <div className="flex items-center gap-2"><User className="h-4 w-4" /> {service.provider?.name}</div>
                <div className="flex items-center gap-2"><Calendar className="h-4 w-4" /> {confirmedAppointment.date}</div>
                <div className="flex items-center gap-2"><Clock className="h-4 w-4" /> {confirmedAppointment.startTime}</div>
                <div className="flex items-center gap-2"><DollarSign className="h-4 w-4" /> ₹{service.price}</div>
              </div>

              {notes && (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-200"><strong>Your notes:</strong> {notes}</p>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => navigate(`/appointment/${confirmedAppointment._id}`)} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                View Ticket
              </button>
              <button onClick={() => navigate('/dashboard')} className="flex-1 px-4 py-2 border border-border rounded-md hover:bg-accent transition-colors text-foreground">
                Dashboard
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 flex justify-center min-h-[80vh]">
      <motion.div className="w-full max-w-lg" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="bg-card text-card-foreground rounded-lg shadow-2xl p-8 border border-border border-t-4 border-t-blue-600">
          <div className="text-center">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {service.name}
            </h2>
            <p className="text-muted-foreground">{service.description}</p>
          </div>

          <div className="space-y-6 mt-6">
            <div className="space-y-3 bg-muted/50 p-4 rounded-lg text-sm">
              <div className="flex items-center gap-2"><User className="h-4 w-4" /> {service.provider?.name}</div>
              <div className="flex items-center gap-2"><Clock className="h-4 w-4" /> {service.duration} mins</div>
              <div className="flex items-center gap-2"><DollarSign className="h-4 w-4" /> ₹{service.price}</div>
            </div>

            {/* Optional notes for the provider */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-foreground">Notes for provider (optional)</label>
              <textarea
                className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-foreground"
                placeholder="Describe your issue, preferences, or any important details"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <input
              type="date"
              value={date}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => {
                setDate(e.target.value);
                setHeldAppointment(null);
              }}
              className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-background text-foreground"
            />

            <div className="grid grid-cols-3 gap-3">
              {slots.map((slotObj) => {
                const slotTime = typeof slotObj === 'object' ? slotObj.time : slotObj;
                const isBooked = typeof slotObj === 'object' ? slotObj.status === 'booked' : false;
                const isSelected = heldAppointment?.startTime === slotTime;

                return (
                  <motion.button
                    key={slotTime}
                    onClick={() => !isBooked && handleSlotHold(slotTime)}
                    disabled={(heldAppointment && !isSelected) || isBooked}
                    className={`h-12 rounded-lg border font-bold relative overflow-hidden transition-colors ${isSelected
                      ? 'bg-green-500 text-white'
                      : isBooked
                        ? 'bg-muted text-muted-foreground cursor-not-allowed border-border'
                        : 'bg-card text-card-foreground hover:bg-accent border-border'
                      }`}
                  >
                    {slotTime}
                    {isBooked && (
                      <div className="absolute inset-0 bg-muted/80 flex items-center justify-center">
                        <span className="text-xs font-medium text-muted-foreground bg-card px-1 rounded transform -rotate-12 border border-border">Booked</span>
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>

            {heldAppointment && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900/50 p-3 rounded-lg text-sm flex justify-between text-yellow-800 dark:text-yellow-200">
                <span>Seat Reserved</span>
                <span className="font-mono font-bold">{formatTime(timeLeft)}</span>
              </div>
            )}

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-md flex gap-2 text-sm border border-red-200 dark:border-red-900/50">
                <AlertCircle className="h-4 w-4" /> {error}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4 mt-6">
            <button
              className="w-full h-12 text-lg bg-blue-600 text-white rounded-md font-medium disabled:opacity-50 hover:bg-blue-700 transition-colors"
              disabled={!heldAppointment}
              onClick={handleConfirmBooking}
            >
              Confirm & Pay ₹{service.price}
            </button>
            <div className="w-full pt-6 border-t border-border">
              <ReviewList serviceId={id} />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Booking;
