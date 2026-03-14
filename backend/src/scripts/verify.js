// Verification script to check if default users are created
import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User.js';

await mongoose.connect(process.env.MONGODB_URI);
console.log('✅ Connected to MongoDB');

const admin = await User.findOne({ email: 'admin@smarthire.com' });
const recruiter = await User.findOne({ email: 'recruiter@smarthire.com' });

console.log('\n📊 User Status:');
console.log('Admin exists:', admin ? '✅' : '❌');
console.log('Recruiter exists:', recruiter ? '✅' : '❌');

if (admin) {
  console.log(`Admin: ${admin.name} (${admin.email}) - Role: ${admin.role}`);
}
if (recruiter) {
  console.log(`Recruiter: ${recruiter.name} (${recruiter.email}) - Role: ${recruiter.role}`);
}

await mongoose.disconnect();
process.exit(0);