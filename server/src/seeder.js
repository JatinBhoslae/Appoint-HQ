import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Category from './models/Category.js';
import connectDB from './config/db.js';

dotenv.config();

const categories = [
  { name: 'Sports & Recreation', description: 'Courts, fields, and activity bookings' },
  { name: 'Health & Wellness', description: 'Doctors, therapy, and fitness' },
  { name: 'Equipment Rental', description: 'Rent bats, balls, projectors, etc.' },
  { name: 'Events & Venues', description: 'Hall bookings and event spaces' },
  { name: 'Education & Tutors', description: 'Classes and tutoring sessions' },
  { name: 'Maintenance Services', description: 'Plumbing, electrical, and repairs' }
];

const importData = async () => {
  try {
    await connectDB();

    // Seed Admin
    const adminExists = await User.findOne({ email: 'admin@example.com' });
    if (!adminExists) {
      const adminUser = new User({
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'adminpassword123',
        role: 'admin',
        isVerified: true
      });
      await adminUser.save();
      console.log('Admin user created successfully');
    } else {
      console.log('Admin user already exists');
    }

    // Seed Categories
    for (const cat of categories) {
      const exists = await Category.findOne({ name: cat.name });
      if (!exists) {
        await Category.create(cat);
        console.log(`Created category: ${cat.name}`);
      }
    }
    console.log('Categories seeded successfully');

    process.exit();
  } catch (error) {
    console.error(`${error}`);
    process.exit(1);
  }
};

importData();
