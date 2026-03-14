// Optional script to create default drives and sample candidates
// Run with: node src/scripts/initDefaults.js

import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Drive from '../models/Drive.js';
import Candidate from '../models/Candidate.js';

await mongoose.connect(process.env.MONGODB_URI);
console.log('✅ Connected to MongoDB');

// Get default users
const admin = await User.findOne({ email: 'admin@smarthire.com' });
const recruiter = await User.findOne({ email: 'recruiter@smarthire.com' });

if (!admin || !recruiter) {
  console.log('❌ Default users not found. Please start the server first to create them.');
  process.exit(1);
}

// Check if drives already exist
const existingDrives = await Drive.countDocuments();
if (existingDrives > 0) {
  console.log('📋 Drives already exist. Skipping drive creation.');
} else {
  // Create default drives
  const drive1 = await Drive.create({
    name: 'Software Engineer 2024',
    description: 'Full-stack engineering roles for product team',
    company: 'TechCorp',
    jobRole: 'Software Engineer',
    status: 'active',
    createdBy: recruiter._id,
    selectionThreshold: 75,
    waitlistThreshold: 60,
    requiredSkills: ['javascript', 'react', 'node.js', 'sql', 'git'],
    requiredExperience: 0,
    offerPackage: '8 LPA',
    offerDetails: { 
      probationPeriod: '6 months', 
      workMode: 'Hybrid', 
      workLocation: 'Bangalore, Karnataka' 
    },
    rounds: [
      { name: 'Aptitude Test', type: 'aptitude', weightage: 20, maxScore: 100, cutoffScore: 50, order: 1 },
      { name: 'Technical Interview', type: 'technical', weightage: 40, maxScore: 100, cutoffScore: 60, order: 2 },
      { name: 'Coding Challenge', type: 'coding', weightage: 30, maxScore: 100, cutoffScore: 65, order: 3 },
      { name: 'HR Interview', type: 'hr', weightage: 10, maxScore: 100, cutoffScore: 50, order: 4 },
    ],
  });

  const drive2 = await Drive.create({
    name: 'Data Analyst Batch 2024',
    description: 'Data analysis and business intelligence roles',
    company: 'DataFirst',
    jobRole: 'Data Analyst',
    status: 'active',
    createdBy: recruiter._id,
    selectionThreshold: 70,
    waitlistThreshold: 55,
    requiredSkills: ['python', 'sql', 'excel', 'tableau', 'pandas'],
    requiredExperience: 0,
    offerPackage: '6 LPA',
    offerDetails: { 
      probationPeriod: '6 months', 
      workMode: 'Work From Office', 
      workLocation: 'Mumbai, Maharashtra' 
    },
    rounds: [
      { name: 'Aptitude', type: 'aptitude', weightage: 30, maxScore: 100, cutoffScore: 50, order: 1 },
      { name: 'Technical Round', type: 'technical', weightage: 50, maxScore: 100, cutoffScore: 60, order: 2 },
      { name: 'HR', type: 'hr', weightage: 20, maxScore: 100, cutoffScore: 40, order: 3 },
    ],
  });

  console.log('📋 Created 2 default drives');
}

console.log('\n✅ Default setup complete!\n');
console.log('═══════════════════════════════════════════════');
console.log('  LOGIN CREDENTIALS');
console.log('═══════════════════════════════════════════════');
console.log('  Admin:     admin@smarthire.com    / password123');
console.log('  Recruiter: recruiter@smarthire.com / password123');
console.log('═══════════════════════════════════════════════\n');

await mongoose.disconnect();
process.exit(0);