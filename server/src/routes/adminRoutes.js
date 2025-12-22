import express from 'express';
import { 
  getAdminStats, 
  getAllUsers, 
  toggleUserStatus,
  getAllServicesAdmin,
  updateServiceStatus,
  createCategory,
  getCategories,
  deleteCategory,
  getAnalytics,
  getReviews,
  deleteReview
} from '../controllers/adminController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Stats & Analytics
router.get('/stats', protect, authorize('admin'), getAdminStats);
router.get('/analytics', protect, authorize('admin'), getAnalytics);

// Users
router.get('/users', protect, authorize('admin'), getAllUsers);
router.put('/users/:id/status', protect, authorize('admin'), toggleUserStatus);

// Services
router.get('/services', protect, authorize('admin'), getAllServicesAdmin);
router.put('/services/:id/status', protect, authorize('admin'), updateServiceStatus);

// Categories
router.route('/categories')
  .get(getCategories) // Public
  .post(protect, authorize('admin'), createCategory);

router.delete('/categories/:id', protect, authorize('admin'), deleteCategory);

// Reviews
router.get('/reviews', protect, authorize('admin'), getReviews);
router.delete('/reviews/:id', protect, authorize('admin'), deleteReview);

export default router;
