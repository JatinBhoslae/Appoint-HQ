import express from 'express';
import { signup, verifyOTP, forgotPassword, resetPassword } from '../controllers/otpController.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/verify-otp', verifyOTP);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;