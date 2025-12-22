import Appointment from '../models/Appointment.js';
import User from '../models/User.js';
import Service from '../models/Service.js';

export const checkBookingSpam = async (req, res, next) => {
  try {
    // Ensure user is authenticated
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Check if user is already banned
    if (req.user.status === 'banned') {
       return res.status(403).json({ message: 'You are banned from making appointments.' });
    }

    const { serviceId } = req.body;
    if (!serviceId) {
        return next();
    }

    const service = await Service.findById(serviceId);
    if (!service) {
        return res.status(404).json({ message: 'Service not found' });
    }

    const providerId = service.provider;

    // Time window: 24 hours ago
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const count = await Appointment.countDocuments({
      customer: req.user._id,
      provider: providerId,
      createdAt: { $gte: twentyFourHoursAgo }
    });

    if (count >= 3) {
      // Ban the user
      await User.findByIdAndUpdate(req.user._id, { status: 'banned' });
      
      // Emit socket event
      if (req.io) {
          const provider = await User.findById(providerId);
          const providerName = provider ? provider.name : 'Unknown';
          
          req.io.emit('admin-alert', {
              message: `User ${req.user.name} banned for spamming Dr. ${providerName}`,
              severity: 'critical'
          });
      }

      return res.status(403).json({ message: 'Account banned due to spamming behavior.' });
    }

    next();
  } catch (error) {
    console.error('Spam check error:', error);
    res.status(500).json({ message: 'Server error during spam check' });
  }
};
