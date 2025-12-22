import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
  provider: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true }, // The specific date of appointment
  startTime: { type: String, required: true }, // HH:mm format
  endTime: { type: String, required: true }, // HH:mm format
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'cancelled', 'completed', 'held'], 
    default: 'pending' 
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  ticketId: { type: String, unique: true },
  scannedAt: { type: Date },
  isScanned: { type: Boolean, default: false },
  expiresAt: { type: Date }, // For 'held' status
  answers: [{ 
    question: String,
    answer: String
  }],
  // Optional free-text note from the customer (e.g. reason, additional info)
  notes: { type: String },
}, { timestamps: true });

const Appointment = mongoose.model('Appointment', appointmentSchema);
export default Appointment;
