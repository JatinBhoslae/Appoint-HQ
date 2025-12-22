import Appointment from '../models/Appointment.js';
import Service from '../models/Service.js';
import crypto from 'crypto';

// @route   POST /api/appointments
// @access  Private
export const createAppointment = async (req, res) => {
  const { serviceId, date, startTime, answers } = req.body;

  try {
    const service = await Service.findById(serviceId);

    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    // Basic validation for double booking can be added here
    // For now, assuming simple creation
    
    // Calculate End Time based on duration
    const start = new Date(`1970-01-01T${startTime}:00`);
    const end = new Date(start.getTime() + service.duration * 60000);
    const endTime = end.toTimeString().slice(0, 5);

    // Check for double booking / Capacity check
    const overlappingAppointments = await Appointment.find({
      provider: service.provider,
      date: date,
      startTime: { $lt: endTime },
      endTime: { $gt: startTime },
      $or: [
        { status: { $in: ['pending', 'confirmed', 'completed'] } },
        { status: 'held', expiresAt: { $gt: new Date() } }
      ]
    });

    if (overlappingAppointments.length >= service.capacity) {
      return res.status(400).json({ message: 'Time slot is fully booked' });
    }

    const appointment = new Appointment({
      customer: req.user._id,
      service: serviceId,
      provider: service.provider,
      date,
      startTime,
      endTime,
      answers,
      status: 'pending', // Default status
    });

    const createdAppointment = await appointment.save();
    res.status(201).json(createdAppointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Hold a slot for 5 minutes
// @route   POST /api/appointments/hold
// @access  Private
export const holdSlot = async (req, res) => {
    const { serviceId, date, startTime } = req.body;
  
    try {
      const service = await Service.findById(serviceId);
      if (!service) return res.status(404).json({ message: 'Service not found' });
  
      const start = new Date(`1970-01-01T${startTime}:00`);
      const end = new Date(start.getTime() + service.duration * 60000);
      const endTime = end.toTimeString().slice(0, 5);
  
      // Check availability
      const overlappingAppointments = await Appointment.find({
        provider: service.provider,
        date: date,
        startTime: { $lt: endTime },
        endTime: { $gt: startTime },
        $or: [
            { status: { $in: ['pending', 'confirmed', 'completed'] } },
            { status: 'held', expiresAt: { $gt: new Date() } }
        ]
      });
  
      if (overlappingAppointments.length >= service.capacity) {
        return res.status(400).json({ message: 'Slot unavailable' });
      }
  
      // Create Held Appointment
      const appointment = new Appointment({
        customer: req.user._id,
        service: serviceId,
        provider: service.provider,
        date,
        startTime,
        endTime,
        status: 'held',
        expiresAt: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes from now
      });
  
      await appointment.save();
      res.status(201).json(appointment);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
};

// @desc    Get real-time queue status
// @route   GET /api/appointments/:id/queue
// @access  Private
export const getQueueStatus = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Get all appointments for the same provider on the same date
    const todayAppointments = await Appointment.find({
      provider: appointment.provider,
      date: appointment.date,
      status: { $in: ['confirmed', 'pending', 'completed', 'held'] }
    }).sort({ startTime: 1 });

    // Find index of current appointment
    const currentIndex = todayAppointments.findIndex(
      app => app._id.toString() === appointment._id.toString()
    );

    if (currentIndex === -1) {
      return res.json({ peopleAhead: 0, estimatedWaitTime: 0 });
    }

    // Count people ahead who haven't completed
    let peopleAhead = 0;
    for (let i = 0; i < currentIndex; i++) {
      if (todayAppointments[i].status !== 'completed' && todayAppointments[i].status !== 'cancelled') {
        peopleAhead++;
      }
    }

    // Calculate time remaining
    const now = new Date();
    
    // Parse date and startTime to get a proper Date object
    // appointment.date is usually UTC midnight, e.g., 2023-10-27T00:00:00.000Z
    // We need to combine it with startTime "HH:mm"
    const appDate = new Date(appointment.date);
    const [hours, minutes] = appointment.startTime.split(':');
    
    const appointmentDateTime = new Date(appDate);
    appointmentDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    // Adjust for today if needed (if date storage is tricky, but let's assume date is correct)
    
    let diffMs = appointmentDateTime - now;
    let estimatedWaitTime = Math.ceil(diffMs / 60000); // minutes

    // If it's already past time but not completed, show 0 or "Delay"
    // For simplicity, we just show minutes left. If negative, it means "Overdue by X mins"
    
    res.json({
      peopleAhead,
      estimatedWaitTime, 
      status: appointment.status,
      startTime: appointment.startTime
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single appointment details
// @route   GET /api/appointments/:id
// @access  Private
export const getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('service', 'name duration price')
      .populate('provider', 'name email')
      .populate('customer', 'name email');

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Authorization check
    if (appointment.customer._id.toString() !== req.user._id.toString() &&
        appointment.provider._id.toString() !== req.user._id.toString() &&
        req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized' });
    }

    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Scan ticket QR code
// @route   POST /api/appointments/scan
// @access  Private (Provider/Admin)
export const scanTicket = async (req, res) => {
  const { ticketId } = req.body;

  try {
    const appointment = await Appointment.findOne({ ticketId });

    if (!appointment) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Check if provider is authorized to scan
    if (appointment.provider.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized to scan this ticket' });
    }

    if (appointment.isScanned) {
      return res.status(400).json({ message: 'Ticket already scanned', scannedAt: appointment.scannedAt });
    }

    if (appointment.status === 'cancelled') {
        return res.status(400).json({ message: 'Ticket is cancelled' });
    }

    // Update status
    appointment.isScanned = true;
    appointment.scannedAt = new Date();
    appointment.status = 'completed'; // Mark as completed for analytics
    
    await appointment.save();

    res.json({ message: 'Ticket scanned successfully', appointment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Confirm a held appointment
// @route   PUT /api/appointments/:id/confirm
// @access  Private
export const confirmBooking = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id);
        
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        if (appointment.status === 'held') {
            if (new Date() > appointment.expiresAt) {
                return res.status(400).json({ message: 'Reservation expired' });
            }
            appointment.status = 'confirmed';
            appointment.paymentStatus = 'paid';
            // Generate unique ticket ID
            appointment.ticketId = `TKT-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

            appointment.answers = req.body.answers || []; // Save answers now if provided
            if (typeof req.body.notes === 'string') {
              appointment.notes = req.body.notes;
            }
            await appointment.save();
            return res.json(appointment);
        } else if (appointment.status === 'pending' || appointment.status === 'confirmed') {
            return res.json(appointment); // Already confirmed
        }

        res.status(400).json({ message: 'Invalid appointment status' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete appointment (customer only)
// @route   DELETE /api/appointments/:id
// @access  Private (Customer only)
export const deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    // Check if the appointment belongs to the logged-in customer
    if (appointment.customer.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to delete this appointment' });
    }
    
    // Only allow deletion of upcoming appointments
    if (appointment.status === 'completed' || appointment.status === 'cancelled') {
      return res.status(400).json({ message: 'Cannot delete completed or cancelled appointments' });
    }
    
    await appointment.deleteOne();
    res.json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged in user appointments
// @route   GET /api/appointments/my
// @access  Private
export const getMyAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ customer: req.user._id })
        .populate('service', 'name duration price')
        .populate('provider', 'name email');
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get appointments for provider
// @route   GET /api/appointments/provider
// @access  Private (Organiser)
export const getProviderAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ provider: req.user._id })
        .populate('service', 'name duration price')
        .populate('customer', 'name email');
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update appointment status
// @route   PUT /api/appointments/:id/status
// @access  Private (Provider/Admin)
export const updateAppointmentStatus = async (req, res) => {
    const { status } = req.body;
  
    try {
      const appointment = await Appointment.findById(req.params.id);
  
      if (appointment) {
        if (appointment.provider.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
             return res.status(401).json({ message: 'Not authorized' });
        }

        appointment.status = status;
        const updatedAppointment = await appointment.save();
        res.json(updatedAppointment);
      } else {
        res.status(404).json({ message: 'Appointment not found' });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
};
