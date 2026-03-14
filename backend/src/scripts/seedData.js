import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Drive from '../models/Drive.js';
import Candidate from '../models/Candidate.js';

await mongoose.connect(process.env.MONGODB_URI);
console.log('✅ Connected to MongoDB');

await Promise.all([User.deleteMany(), Drive.deleteMany(), Candidate.deleteMany()]);
console.log('🗑️  Cleared existing data');

// ── Users ──────────────────────────────────────────────────────
const admin = await User.create({
  name: 'Admin User',
  email: 'admin@smarthire.com',
  password: 'password123',
  role: 'admin',
  approvalStatus: 'approved',
  isActive: true,
});

const recruiter = await User.create({
  name: 'Jane Recruiter',
  email: 'recruiter@smarthire.com',
  password: 'password123',
  role: 'recruiter',
  approvalStatus: 'approved',
  isActive: true,
});
console.log('👤 Created users');

// ── Drive 1: Software Engineer 2024 ───────────────────────────
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
  offerDetails: { probationPeriod: '6 months', workMode: 'Hybrid', workLocation: 'Bangalore, Karnataka' },
  rounds: [
    { name: 'Aptitude Test',       type: 'aptitude',   weightage: 20, maxScore: 100, cutoffScore: 50, order: 1 },
    { name: 'Technical Interview', type: 'technical',  weightage: 40, maxScore: 100, cutoffScore: 60, order: 2 },
    { name: 'Coding Challenge',    type: 'coding',     weightage: 30, maxScore: 100, cutoffScore: 65, order: 3 },
    { name: 'HR Interview',        type: 'hr',         weightage: 10, maxScore: 100, cutoffScore: 50, order: 4 },
  ],
});

// ── Drive 2: Data Analyst 2024 ────────────────────────────────
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
  offerDetails: { probationPeriod: '6 months', workMode: 'Work From Office', workLocation: 'Mumbai, Maharashtra' },
  rounds: [
    { name: 'Aptitude',       type: 'aptitude',  weightage: 30, maxScore: 100, cutoffScore: 50, order: 1 },
    { name: 'Technical Round',type: 'technical', weightage: 50, maxScore: 100, cutoffScore: 60, order: 2 },
    { name: 'HR',             type: 'hr',        weightage: 20, maxScore: 100, cutoffScore: 40, order: 3 },
  ],
});

// ── Drive 3: Google SWE (Admin created) ───────────────────────
const drive3 = await Drive.create({
  name: 'Google SWE Placement 2025',
  description: 'Google campus placement drive for software engineers',
  company: 'Google',
  jobRole: 'Software Engineer',
  status: 'active',
  createdBy: admin._id,
  selectionThreshold: 80,
  waitlistThreshold: 65,
  requiredSkills: ['python', 'algorithms', 'data structures', 'java', 'system design'],
  requiredExperience: 0,
  offerPackage: '28 LPA',
  offerDetails: { probationPeriod: '3 months', workMode: 'Hybrid', workLocation: 'Hyderabad, Telangana' },
  rounds: [
    { name: 'Online Assessment',  type: 'aptitude',  weightage: 25, maxScore: 100, cutoffScore: 60, order: 1 },
    { name: 'Technical Round 1',  type: 'technical', weightage: 30, maxScore: 100, cutoffScore: 65, order: 2 },
    { name: 'Technical Round 2',  type: 'coding',    weightage: 30, maxScore: 100, cutoffScore: 65, order: 3 },
    { name: 'HR Round',           type: 'hr',        weightage: 15, maxScore: 100, cutoffScore: 50, order: 4 },
  ],
});

console.log('📋 Created 3 drives');

// ── Helpers ───────────────────────────────────────────────────
const computeATS = (skills, driveSkills, experience, cgpa) => {
  const sl = skills.map(s => s.toLowerCase());
  const dl = driveSkills.map(s => s.toLowerCase());
  const matched = dl.filter(s => sl.includes(s));
  const skillMatch    = dl.length > 0 ? Math.round((matched.length / dl.length) * 100) : 60;
  const expMatch      = experience >= 1 ? 80 : 50;
  const eduMatch      = cgpa >= 8.5 ? 100 : cgpa >= 7.5 ? 85 : cgpa >= 6.5 ? 70 : 50;
  const keywordMatch  = 70;
  const atsScore = Math.round(skillMatch*0.40 + expMatch*0.30 + eduMatch*0.15 + keywordMatch*0.15);
  const atsStatus = atsScore >= 75 ? 'shortlisted' : atsScore >= 50 ? 'review' : 'rejected';
  return { atsScore, atsStatus, atsBreakdown: { skillMatch, experienceMatch: expMatch, educationMatch: eduMatch, keywordRelevance: keywordMatch }, matchedSkills: matched };
};

const computeFinalScore = (scores, rounds) => {
  let total = 0;
  for (const round of rounds) {
    const sc = scores.find(s => s.roundId.toString() === round._id.toString());
    if (sc) total += ((sc.score / round.maxScore) * 100) * (round.weightage / 100);
  }
  return Math.round(total * 100) / 100;
};

// ── Candidates for Drive 1 (TechCorp) ────────────────────────
const drive1Candidates = [
  { name:'Arjun Sharma',   email:'arjun@example.com',   usn:'1BM21CS001', phone:'9876543210', college:'BMS College of Engineering', branch:'CSE', cgpa:9.1, experience:0, skills:['javascript','react','node.js','sql','git','html','css'], scores:[85,88,90,82] },
  { name:'Priya Nair',     email:'priya@example.com',   usn:'1BM21CS002', phone:'9876543211', college:'NIT Trichy',                  branch:'IT',  cgpa:8.8, experience:0, skills:['javascript','react','python','sql','git'],             scores:[78,82,75,88] },
  { name:'Rohan Mehta',    email:'rohan@example.com',   usn:'1BM21CS003', phone:'9876543212', college:'BITS Pilani',                 branch:'CS',  cgpa:9.3, experience:1, skills:['javascript','react','node.js','sql','git','typescript'],scores:[92,95,88,90] },
  { name:'Sneha Patel',    email:'sneha@example.com',   usn:'1BM21CS004', phone:'9876543213', college:'IIT Bombay',                  branch:'CSE', cgpa:8.5, experience:0, skills:['python','react','sql','git','java'],                   scores:[70,68,72,75] },
  { name:'Vikram Singh',   email:'vikram@example.com',  usn:'1BM21CS005', phone:'9876543214', college:'VIT Vellore',                 branch:'CSE', cgpa:7.9, experience:0, skills:['javascript','html','css','git'],                       scores:[55,52,48,60] },
  { name:'Kavya Reddy',    email:'kavya@example.com',   usn:'1BM21CS006', phone:'9876543215', college:'RVCE Bangalore',              branch:'ISE', cgpa:8.2, experience:0, skills:['javascript','react','node.js','mongodb'],               scores:[80,85,78,82] },
  { name:'Aditya Kumar',   email:'aditya@example.com',  usn:'1BM21CS007', phone:'9876543216', college:'PES University',              branch:'CSE', cgpa:7.5, experience:0, skills:['python','sql','java','git'],                           scores:[65,62,60,70] },
  { name:'Meera Krishnan', email:'meera@example.com',   usn:'1BM21CS008', phone:'9876543217', college:'Manipal Institute',           branch:'CSE', cgpa:8.9, experience:1, skills:['javascript','react','node.js','sql','git','aws'],       scores:[88,90,85,87] },
];

// ── Candidates for Drive 2 (DataFirst) ───────────────────────
const drive2Candidates = [
  { name:'Ravi Verma',     email:'ravi@example.com',    usn:'1BM21DS001', phone:'9876543220', college:'IIT Delhi',    branch:'CSE', cgpa:8.6, experience:0, skills:['python','sql','pandas','numpy','tableau'],              scores:[82,79,85] },
  { name:'Sunita Joshi',   email:'sunita@example.com',  usn:'1BM21DS002', phone:'9876543221', college:'NIT Warangal', branch:'IT',  cgpa:7.8, experience:0, skills:['sql','excel','python'],                                 scores:[70,65,72] },
  { name:'Ankit Gupta',    email:'ankit@example.com',   usn:'1BM21DS003', phone:'9876543222', college:'BITS Goa',     branch:'CS',  cgpa:8.1, experience:0, skills:['python','sql','pandas','tableau','power bi'],            scores:[76,80,78] },
  { name:'Deepika Singh',  email:'deepika@example.com', usn:'1BM21DS004', phone:'9876543223', college:'VIT Chennai',  branch:'CSE', cgpa:9.0, experience:1, skills:['python','sql','pandas','numpy','machine learning','r'],  scores:[91,88,90] },
  { name:'Nikhil Rao',     email:'nikhil@example.com',  usn:'1BM21DS005', phone:'9876543224', college:'MSRIT',        branch:'ISE', cgpa:7.2, experience:0, skills:['excel','sql'],                                          scores:[60,55,65] },
];

// ── Candidates for Drive 3 (Google) ──────────────────────────
const drive3Candidates = [
  { name:'Ishaan Bose',    email:'ishaan@example.com',  usn:'1BM21CS010', phone:'9876543230', college:'IIT Madras',   branch:'CSE', cgpa:9.5, experience:1, skills:['python','algorithms','data structures','java','system design','c++'], scores:[95,92,89,94] },
  { name:'Zara Ahmed',     email:'zara@example.com',    usn:'1BM21CS011', phone:'9876543231', college:'IIT Bombay',   branch:'CS',  cgpa:9.2, experience:0, skills:['python','java','algorithms','data structures','git'],                  scores:[88,85,82,90] },
  { name:'Suresh Nair',    email:'suresh@example.com',  usn:'1BM21CS012', phone:'9876543232', college:'NIT Calicut',  branch:'CSE', cgpa:8.4, experience:0, skills:['java','python','data structures','sql'],                               scores:[72,68,70,75] },
];

// ── Insert candidates with scores and ATS ────────────────────
const insertCandidates = async (candidates, drive) => {
  const insertedIds = [];
  for (const c of candidates) {
    const { atsScore, atsStatus, atsBreakdown } = computeATS(c.skills, drive.requiredSkills, c.experience, c.cgpa);
    
    const scoreObjs = c.scores.map((score, i) => ({
      roundId: drive.rounds[i]._id,
      roundName: drive.rounds[i].name,
      score,
      maxScore: drive.rounds[i].maxScore,
      enteredBy: recruiter._id,
      enteredAt: new Date(),
    }));
    
    const finalScore = computeFinalScore(scoreObjs, drive.rounds);
    
    let status = 'in_progress';
    if (finalScore >= drive.selectionThreshold) status = 'selected';
    else if (finalScore >= drive.waitlistThreshold) status = 'waitlisted';
    else status = 'rejected';
    
    const candidate = await Candidate.create({
      name: c.name, email: c.email, usn: c.usn, phone: c.phone,
      college: c.college, branch: c.branch, cgpa: c.cgpa,
      experience: c.experience, skills: c.skills,
      drive: drive._id, addedBy: recruiter._id,
      scores: scoreObjs, finalScore, status,
      atsScore, atsStatus, atsBreakdown,
      graduationYear: 2024,
    });
    insertedIds.push(candidate._id);
  }
  return insertedIds;
};

const d1ids = await insertCandidates(drive1Candidates, drive1);
const d2ids = await insertCandidates(drive2Candidates, drive2);
const d3ids = await insertCandidates(drive3Candidates, drive3);

// ── Update drive candidate counts ────────────────────────────
await Drive.findByIdAndUpdate(drive1._id, { totalCandidates: d1ids.length, selectedCount: drive1Candidates.filter((_,i) => { const s = drive1Candidates[i].scores; const fs = s[0]*0.20 + s[1]*0.40 + s[2]*0.30 + s[3]*0.10; return fs >= 75; }).length });
await Drive.findByIdAndUpdate(drive2._id, { totalCandidates: d2ids.length });
await Drive.findByIdAndUpdate(drive3._id, { totalCandidates: d3ids.length });

// ── Compute rankings per drive ────────────────────────────────
for (const driveId of [drive1._id, drive2._id, drive3._id]) {
  const sorted = await Candidate.find({ drive: driveId }).sort('-finalScore');
  for (let i = 0; i < sorted.length; i++) {
    await Candidate.findByIdAndUpdate(sorted[i]._id, { rank: i + 1 });
  }
}

console.log('🎓 Created candidates with scores, ATS, and rankings');

// ── Seed summary ──────────────────────────────────────────────
console.log('\n✅ Seed complete!\n');
console.log('═══════════════════════════════════════════════');
console.log('  LOGIN CREDENTIALS');
console.log('═══════════════════════════════════════════════');
console.log('  Admin:     admin@smarthire.com    / password123');
console.log('  Recruiter: recruiter@smarthire.com / password123');
console.log('═══════════════════════════════════════════════');
console.log(`  Drives: 3 | Candidates: ${d1ids.length + d2ids.length + d3ids.length}`);
console.log('═══════════════════════════════════════════════\n');

await mongoose.disconnect();
process.exit(0);
