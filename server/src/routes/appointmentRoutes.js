import express from 'express';
import {
  createAppointment,
  getMyAppointments,
  getProviderAppointments,
  updateAppointmentStatus,
  holdSlot,
  confirmBooking,
  getQueueStatus,
  deleteAppointment,
  getAppointmentById,
  scanTicket
} from '../controllers/appointmentController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import { checkBookingSpam } from '../middlewares/spamCheck.js';

const router = express.Router();

router.post('/scan', protect, authorize('organiser', 'admin'), scanTicket);
router.post('/', protect, checkBookingSpam, createAppointment);
router.post('/hold', protect, checkBookingSpam, holdSlot);
router.put('/:id/confirm', protect, confirmBooking);
router.get('/:id/queue', protect, getQueueStatus);
router.get('/my', protect, getMyAppointments);
router.delete('/:id', protect, deleteAppointment);
router.get('/provider', protect, authorize('organiser', 'admin'), getProviderAppointments);
router.put('/:id/status', protect, authorize('organiser', 'admin'), updateAppointmentStatus);
router.get('/:id', protect, getAppointmentById);

export default router;
//export