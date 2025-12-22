import User from '../models/User.js';
import Appointment from '../models/Appointment.js';
import Service from '../models/Service.js';
import Category from '../models/Category.js';
import Review from '../models/Review.js';

// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
// @access  Private (Admin)
export const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalAppointments = await Appointment.countDocuments();
    const totalServices = await Service.countDocuments();
    
    // Calculate total revenue
    const revenue = await Appointment.aggregate([
      { $match: { status: { $in: ['confirmed', 'completed'] } } },
      { $lookup: { from: 'services', localField: 'service', foreignField: '_id', as: 'serviceData' } },
      { $unwind: '$serviceData' },
      { $group: { _id: null, total: { $sum: '$serviceData.price' } } }
    ]);
    
    const totalRevenue = revenue.length > 0 ? revenue[0].total : 0;

    res.json({
      totalUsers,
      totalAppointments,
      totalServices,
      totalRevenue
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort('-createdAt');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle user ban status
// @route   PUT /api/admin/users/:id/status
// @access  Private (Admin)
export const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Toggle status
    user.status = user.status === 'active' ? 'banned' : 'active';
    await user.save();

    res.json({ message: `User ${user.status === 'active' ? 'activated' : 'banned'}`, status: user.status });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all services (including pending/rejected)
// @route   GET /api/admin/services
// @access  Private (Admin)
export const getAllServicesAdmin = async (req, res) => {
  try {
    const services = await Service.find({})
      .populate('provider', 'name email')
      .populate('category', 'name')
      .sort('-createdAt');
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update service approval status
// @route   PUT /api/admin/services/:id/status
// @access  Private (Admin)
export const updateServiceStatus = async (req, res) => {
  const { status } = req.body; // 'approved' or 'rejected'
  
  if (!['approved', 'rejected', 'pending'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    service.approvalStatus = status;
    // If rejected, maybe set isPublished to false too? 
    // For now, approvalStatus is the gatekeeper for public API.
    
    await service.save();
    res.json({ message: `Service ${status}`, service });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a category
// @route   POST /api/admin/categories
// @access  Private (Admin)
export const createCategory = async (req, res) => {
  const { name, description } = req.body;
  try {
    const category = new Category({ name, description });
    const createdCategory = await category.save();
    res.status(201).json(createdCategory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all categories
// @route   GET /api/admin/categories
// @access  Private (Admin/Public) - Maybe public for dropdowns?
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({}).sort('name');
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete category
// @route   DELETE /api/admin/categories/:id
// @access  Private (Admin)
export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    
    await category.deleteOne();
    res.json({ message: 'Category removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get analytics data
// @route   GET /api/admin/analytics
// @access  Private (Admin)
export const getAnalytics = async (req, res) => {
  try {
    // 1. Daily Bookings & Revenue (Last 7 Days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const dailyStats = await Appointment.aggregate([
      { $match: { 
          createdAt: { $gte: sevenDaysAgo },
          status: 'confirmed' 
      }},
      { $lookup: { from: 'services', localField: 'service', foreignField: '_id', as: 'serviceData' } },
      { $unwind: '$serviceData' },
      { $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          bookings: { $sum: 1 },
          revenue: { $sum: "$serviceData.price" }
      }},
      { $sort: { _id: 1 } }
    ]);

    // 2. Top Performing Services
    const topServices = await Appointment.aggregate([
      { $match: { status: 'confirmed' } },
      { $lookup: { from: 'services', localField: 'service', foreignField: '_id', as: 'serviceData' } },
      { $unwind: '$serviceData' },
      { $group: {
          _id: "$serviceData.name",
          bookings: { $sum: 1 },
          revenue: { $sum: "$serviceData.price" }
      }},
      { $sort: { revenue: -1 } },
      { $limit: 5 }
    ]);

    // 3. Peak Hours (based on startTime)
    const peakHours = await Appointment.aggregate([
      { $group: {
          _id: { $substr: ["$startTime", 0, 2] }, // Extract HH
          count: { $sum: 1 }
      }},
      { $sort: { _id: 1 } }
    ]);

    res.json({ dailyStats, topServices, peakHours });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all reviews
// @route   GET /api/admin/reviews
// @access  Private (Admin)
export const getReviews = async (req, res) => {
  try {
    const reviews = await Review.find({})
      .populate('user', 'name')
      .populate('service', 'name')
      .sort('-createdAt');
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete review
// @route   DELETE /api/admin/reviews/:id
// @access  Private (Admin)
export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    
    await review.deleteOne();
    res.json({ message: 'Review removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
