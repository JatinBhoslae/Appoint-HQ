import express from 'express';
import { createOrder, verifyPayment } from '../controllers/paymentController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/orders', protect, createOrder);
router.post('/verify', protect, verifyPayment);

export default router;
