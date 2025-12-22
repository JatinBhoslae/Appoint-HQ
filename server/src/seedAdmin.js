import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import connectDB from './config/db.js';

dotenv.config();

const seedAdmin = async () => {
  try {
    await connectDB();

    const adminEmail = 'admin@example.com';
    const adminPassword = 'admin123';

    // Check if admin exists
    const adminExists = await User.findOne({ email: adminEmail });

    if (adminExists) {
      if (adminExists.role !== 'admin') {
        adminExists.role = 'admin';
        await adminExists.save();
        console.log('Existing user updated to Admin role.');
      } else {
        console.log('Admin user already exists.');
      }
    } else {
      await User.create({
        name: 'Super Admin',
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
        isVerified: true
      });
      console.log(`Admin created: ${adminEmail} / ${adminPassword}`);
    }

    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedAdmin();
