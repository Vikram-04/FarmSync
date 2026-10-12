import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import CostBenchmark from '../models/CostBenchmark.js';
import costBenchmarksData from './costBenchmarks.js';

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();

    console.log('Clearing old cost benchmarks...');
    await CostBenchmark.deleteMany();

    console.log('Seeding cost benchmarks...');
    await CostBenchmark.insertMany(costBenchmarksData);

    console.log('Data seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
