import Category from '../models/Category.js';
import mongoose from 'mongoose';

const seedCategories = async () => {
  try {
    const categories = [
      { name: 'Doctor', description: 'Medical professionals and healthcare services' },
      { name: 'Barber', description: 'Hair cutting and grooming services' },
      { name: 'Salon', description: 'Beauty and wellness services' },
      { name: 'Consultant', description: 'Professional consulting services' },
      { name: 'Therapist', description: 'Mental health and therapy services' },
      { name: 'Fitness', description: 'Gym and personal training services' },
      { name: 'Education', description: 'Tutoring and educational services' },
      { name: 'Legal', description: 'Legal consultation and services' },
      { name: 'Technical', description: 'Technical support and IT services' },
      { name: 'Creative', description: 'Design and creative services' }
    ];

    await Category.deleteMany({});
    await Category.insertMany(categories);
    
    console.log('Categories seeded successfully');
  } catch (error) {
    console.error('Error seeding categories:', error);
  }
};

export default seedCategories;
