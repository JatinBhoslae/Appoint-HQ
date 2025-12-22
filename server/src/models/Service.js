import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  duration: { type: Number, required: true }, // in minutes
  provider: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  price: { type: Number, default: 0 },
  capacity: { type: Number, default: 1 },
  workStartHour: { type: Number, default: 9 }, // 0-23
  workEndHour: { type: Number, default: 17 }, // 0-23
  requiresConfirmation: { type: Boolean, default: false },
  advancePayment: { type: Boolean, default: false },
  questions: [{ type: String }],
  isActive: { type: Boolean, default: true },
  
  // New Configuration Fields
  isPublished: { type: Boolean, default: true },
  approvalStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  type: { type: String, enum: ['user', 'resource'], default: 'user' },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  resources: [{ type: String }], // Array of resource names/IDs
  date: { type: Date }, // Optional specific date for the service
  
  // Booking Rules
  maxBookingsPerSlot: { type: Number, default: 1 },
  manualConfirmation: { type: Boolean, default: false }, // Renamed from requiresConfirmation for clarity, but keeping both for backward compat if needed or just use this
  advancePayment: { type: Boolean, default: false },
  assignmentType: { type: String, enum: ['auto', 'manual'], default: 'auto' },
  
  // Schedule
  availability: [{
      day: { type: String }, // mon, tue, wed, etc.
      startTime: { type: String }, // "09:00"
      endTime: { type: String },   // "17:00"
      isActive: { type: Boolean, default: true }
  }],
  
  // Pricing Configuration
  pricing: {
    type: { type: String, enum: ['fixed', 'dynamic'], default: 'fixed' },
    basePrice: { type: Number, default: 0 },
    ratePerUnit: { type: Number, default: 0 },
    unitDuration: { type: Number, default: 15 }, // minutes
  },
}, { timestamps: true });

const Service = mongoose.model('Service', serviceSchema);
export default Service;
