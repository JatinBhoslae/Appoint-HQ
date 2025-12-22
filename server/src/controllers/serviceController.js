import Service from '../models/Service.js';
import Appointment from '../models/Appointment.js';
import Review from '../models/Review.js';

// @desc    Create a new service
// @route   POST /api/services
// @access  Private (Organiser/Admin)
export const createService = async (req, res) => {
  const { 
    name, description, duration, price, capacity, questions, 
    type, resources, isPublished, maxBookingsPerSlot, manualConfirmation, 
    assignmentType, availability, date, category, pricing 
  } = req.body;

  try {
    const service = new Service({
      name,
      description,
      duration,
      price,
      capacity,
      questions,
      type, 
      resources, 
      isPublished, 
      maxBookingsPerSlot, 
      manualConfirmation, 
      assignmentType, 
      availability,
      date,
      category,
      pricing,
      approvalStatus: 'approved',
      provider: req.user._id,
    });

    const createdService = await service.save();
    res.status(201).json(createdService);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all services
// @route   GET /api/services
// @access  Public
export const getServices = async (req, res) => {
  try {
    const services = await Service.find({ isActive: true, isPublished: true, approvalStatus: 'approved' })
      .populate('provider', 'name email')
      .populate('category', 'name');
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged in provider's services (all)
// @route   GET /api/services/my
// @access  Private (Provider)
export const getMyServices = async (req, res) => {
  try {
    const services = await Service.find({ provider: req.user._id, isActive: true });
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get service by ID
// @route   GET /api/services/:id
// @access  Public
export const getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id).populate('provider', 'name email');
    if (service) {
      res.json(service);
    } else {
      res.status(404).json({ message: 'Service not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get available slots for a service on a specific date
// @route   GET /api/services/:id/slots
// @access  Public
export const getServiceSlots = async (req, res) => {
  const { date } = req.query;
  if (!date) return res.status(400).json({ message: 'Date is required' });

  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ message: 'Service not found' });

    // Get day of week for the requested date
    const dateObj = new Date(date);
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = days[dateObj.getDay()];

    const dayConfig = service.availability.find(d => d.day === dayName);

    if (!dayConfig || !dayConfig.isActive) {
      return res.json([]);
    }

    // Get all appointments for the provider on that date
    const appointments = await Appointment.find({
      provider: service.provider,
      date: date,
      status: { $ne: 'cancelled' }
    });

    const slots = [];
    const duration = service.duration; // in minutes

    const [startHour, startMinute] = dayConfig.startTime.split(':');
    const [endHour, endMinute] = dayConfig.endTime.split(':');
    
    // Create Date objects for comparison
    let currentTime = new Date(`${date}T${startHour}:${startMinute}:00`);
    const endOfDay = new Date(`${date}T${endHour}:${endMinute}:00`);

    while (currentTime < endOfDay) {
      const slotStart = currentTime.toTimeString().slice(0, 5);
      const nextTime = new Date(currentTime.getTime() + duration * 60000);
      const slotEnd = nextTime.toTimeString().slice(0, 5);

      if (nextTime > endOfDay) break;

      // Check overlap with existing appointments
      // Overlap condition: (StartA < EndB) and (EndA > StartB)
      const overlappingAppointments = appointments.filter(appt => {
        return (appt.startTime < slotEnd && appt.endTime > slotStart);
      });

      if (overlappingAppointments.length < service.capacity) {
        slots.push({ time: slotStart, status: 'available' });
      } else {
        slots.push({ time: slotStart, status: 'booked' });
      }

      // Move to next slot
      currentTime = nextTime;
    }

    res.json(slots);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update service
// @route   PUT /api/services/:id
// @access  Private (Provider/Admin)
export const updateService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (service) {
      if (service.provider.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
         return res.status(401).json({ message: 'Not authorized to update this service' });
      }

      service.name = req.body.name || service.name;
      service.description = req.body.description || service.description;
      service.duration = req.body.duration || service.duration;
      service.price = req.body.price || service.price;
      service.capacity = req.body.capacity || service.capacity;
      service.questions = req.body.questions || service.questions;
      
      if (req.body.type !== undefined) service.type = req.body.type;
      if (req.body.resources !== undefined) service.resources = req.body.resources;
      if (req.body.isPublished !== undefined) service.isPublished = req.body.isPublished;
      if (req.body.maxBookingsPerSlot !== undefined) service.maxBookingsPerSlot = req.body.maxBookingsPerSlot;
      if (req.body.manualConfirmation !== undefined) service.manualConfirmation = req.body.manualConfirmation;
      if (req.body.assignmentType !== undefined) service.assignmentType = req.body.assignmentType;
      if (req.body.availability !== undefined) service.availability = req.body.availability;
      if (req.body.date !== undefined) service.date = req.body.date;
      if (req.body.category !== undefined) service.category = req.body.category;
      if (req.body.pricing !== undefined) service.pricing = req.body.pricing;

      const updatedService = await service.save();
      res.json(updatedService);
    } else {
      res.status(404).json({ message: 'Service not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete service
// @route   DELETE /api/services/:id
// @access  Private (Provider/Admin)
export const deleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (service) {
      if (service.provider.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
         return res.status(401).json({ message: 'Not authorized to delete this service' });
      }

      await service.deleteOne();
      res.json({ message: 'Service removed' });
    } else {
      res.status(404).json({ message: 'Service not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new review
// @route   POST /api/services/:id/reviews
// @access  Private
export const createServiceReview = async (req, res) => {
  const { rating, comment } = req.body;
  
  try {
      const service = await Service.findById(req.params.id);

      if (service) {
        const alreadyReviewed = await Review.findOne({
          user: req.user._id,
          service: req.params.id
        });

        if (alreadyReviewed) {
          return res.status(400).json({ message: 'Service already reviewed' });
        }

        const review = new Review({
          name: req.user.name,
          rating: Number(rating),
          comment,
          user: req.user._id,
          service: req.params.id
        });

        await review.save();

        res.status(201).json({ message: 'Review added' });
      } else {
        res.status(404).json({ message: 'Service not found' });
      }
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
};

// @desc    Get top rated organizers
// @route   GET /api/services/top-organizers
// @access  Public
export const getTopOrganizers = async (req, res) => {
    try {
        const topProviders = await Review.aggregate([
            {
                $lookup: {
                    from: 'services',
                    localField: 'service',
                    foreignField: '_id',
                    as: 'serviceData'
                }
            },
            { $unwind: '$serviceData' },
            {
                $group: {
                    _id: '$serviceData.provider',
                    averageRating: { $avg: '$rating' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { averageRating: -1 } },
            { $limit: 3 },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'providerData'
                }
            },
            { $unwind: '$providerData' },
            {
                $project: {
                    _id: 1,
                    averageRating: 1,
                    count: 1,
                    name: '$providerData.name',
                    email: '$providerData.email'
                }
            }
        ]);
        
        res.json(topProviders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
