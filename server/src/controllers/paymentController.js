import Razorpay from 'razorpay';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Razorpay lazily or with check to prevent startup crash if keys are missing
const getRazorpayInstance = () => {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
        throw new Error('RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be defined in .env');
    }
    return new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
};

export const createOrder = async (req, res) => {
    try {
        const razorpay = getRazorpayInstance();
        const { amount, currency = 'INR', receipt } = req.body;

        const options = {
            amount: amount * 100, // Amount in smallest currency unit (paise)
            currency,
            receipt,
        };

        const order = await razorpay.orders.create(options);

        res.json(order);
    } catch (error) {
        console.error('Razorpay Order Error:', error);
        
        // Check for specific Razorpay authentication error
        if (error.statusCode === 401) {
            return res.status(500).json({ 
                message: 'Razorpay Authentication Failed. Please check RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in server/.env', 
                error: error.message 
            });
        }
        
        res.status(500).json({ message: 'Something went wrong processing payment', error: error.message });
    }
};

export const verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest("hex");

        const isAuthentic = expectedSignature === razorpay_signature;

        if (isAuthentic) {
            // Payment Verified
            res.json({
                message: "Payment verified successfully",
                success: true,
                paymentId: razorpay_payment_id,
                orderId: razorpay_order_id
            });
        } else {
            res.status(400).json({
                message: "Invalid signature",
                success: false,
            });
        }
    } catch (error) {
        console.error('Verify Payment Error:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};
