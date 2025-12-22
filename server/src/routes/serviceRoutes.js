import express from 'express';
import {
  createService,
  getServices,
  getMyServices,
  getServiceById,
  updateService,
  deleteService,
  getServiceSlots,
  createServiceReview,
  getTopOrganizers
} from '../controllers/serviceController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/top-organizers', getTopOrganizers);

router.route('/')
  .get(getServices)
  .post(protect, authorize('organiser', 'admin'), createService);

router.get('/my', protect, authorize('organiser', 'admin'), getMyServices);

router.get('/:id/slots', getServiceSlots);

router.post('/:id/reviews', protect, createServiceReview);

router.route('/:id')
  .get(getServiceById)
  .put(protect, authorize('organiser', 'admin'), updateService)
  .delete(protect, authorize('organiser', 'admin'), deleteService);

export default router;
