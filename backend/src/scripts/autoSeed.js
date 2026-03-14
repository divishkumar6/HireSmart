// Auto-seed runs on first deployment when DB is empty
import User from '../models/User.js';
import Drive from '../models/Drive.js';
import Candidate from '../models/Candidate.js';

export default async function runSeed() {
  // Users
  const admin = await User.create({
    name: 'Admin User', email: 'admin@smarthire.com', password: 'password123',
    role: 'admin', approvalStatus: 'approved', isActive: true,
  });
  const rec1 = await User.create({
    name: 'Jane Recruiter', email: 'recruiter@smarthire.com', password: 'password123',
    role: 'recruiter', approvalStatus: 'approved', isActive: true,
  });
  const rec2 = await User.create({
    name: 'Ravi Sharma', email: 'ravi@smarthire.com', password: 'password123',
    role: 'recruiter', approvalStatus: 'approved', isActive: true,
  });

  // Drive 1 — active
  const drive1 = await Drive.create({
    name: 'Software Engineer 2024', company: 'TechCorp', jobRole: 'Software Engineer',
    status: 'active', createdBy: rec1._id, selectionThreshold: 75, waitlistThreshold: 60,
    requiredSkills: ['javascript','react','node.js','sql'],
    offerPackage: '12 LPA',
    offerDetails: { probationPeriod: '6 months', workMode: 'Hybrid', workLocation: 'Bangalore' },
    rounds: [
      { name: 'Aptitude Test',       type: 'aptitude',  weightage: 20, maxScore: 100, cutoffScore: 50, order: 1 },
      { name: 'Technical Interview', type: 'technical', weightage: 40, maxScore: 100, cutoffScore: 60, order: 2 },
      { name: 'Coding Challenge',    type: 'coding',    weightage: 30, maxScore: 100, cutoffScore: 65, order: 3 },
      { name: 'HR Interview',        type: 'hr',        weightage: 10, maxScore: 100, cutoffScore: 50, order: 4 },
    ],
  });

  // Drive 2 — active
  const drive2 = await Drive.create({
    name: 'Data Analyst Batch 2024', company: 'DataFirst', jobRole: 'Data Analyst',
    status: 'active', createdBy: rec1._id, selectionThreshold: 70, waitlistThreshold: 55,
    requiredSkills: ['python','sql','excel','tableau'],
    offerPackage: '10 LPA',
    offerDetails: { probationPeriod: '6 months', workMode: 'Work From Office', workLocation: 'Mumbai' },
    rounds: [
      { name: 'Aptitude',        type: 'aptitude',  weightage: 30, maxScore: 100, cutoffScore: 50, order: 1 },
      { name: 'Technical Round', type: 'technical', weightage: 50, maxScore: 100, cutoffScore: 60, order: 2 },
      { name: 'HR',              type: 'hr',        weightage: 20, maxScore: 100, cutoffScore: 40, order: 3 },
    ],
  });

  // Drive 3 — completed
  const drive3 = await Drive.create({
    name: 'UI/UX Designer 2024', company: 'DesignStudio', jobRole: 'UI/UX Designer',
    status: 'completed', createdBy: rec2._id, selectionThreshold: 72, waitlistThreshold: 58,
    requiredSkills: ['figma','css','javascript','react'],
    offerPackage: '9 LPA',
    offerDetails: { probationPeriod: '3 months', workMode: 'Remote', workLocation: 'Remote' },
    rounds: [
      { name: 'Design Test',     type: 'aptitude',  weightage: 40, maxScore: 100, cutoffScore: 55, order: 1 },
      { name: 'Portfolio Review',type: 'technical', weightage: 40, maxScore: 100, cutoffScore: 60, order: 2 },
      { name: 'HR',              type: 'hr',        weightage: 20, maxScore: 100, cutoffScore: 40, order: 3 },
    ],
  });

  // Drive 4 — draft
  await Drive.create({
    name: 'DevOps Engineer 2025', company: 'CloudNine', jobRole: 'DevOps Engineer',
    status: 'draft', createdBy: rec2._id, selectionThreshold: 78, waitlistThreshold: 62,
    requiredSkills: ['docker','kubernetes','aws','linux'],
    offerPackage: '14 LPA',
    offerDetails: { probationPeriod: '6 months', workMode: 'Hybrid', workLocation: 'Hyderabad' },
    rounds: [
      { name: 'Technical',  type: 'technical', weightage: 50, maxScore: 100, cutoffScore: 65, order: 1 },
      { name: 'System Design', type: 'coding', weightage: 35, maxScore: 100, cutoffScore: 60, order: 2 },
      { name: 'HR',         type: 'hr',        weightage: 15, maxScore: 100, cutoffScore: 40, order: 3 },
    ],
  });

  // Helper: create candidate with scores + ATS
  async function createCandidate(data, drive, scores, addedBy) {
    const roundIds = drive.rounds.map(r => r._id);
    const scoreEntries = roundIds.map((id, i) => ({
      roundId: id, score: scores[i], roundName: drive.rounds[i].name,
      enteredBy: addedBy, enteredAt: new Date(),
    }));
    let final = 0;
    drive.rounds.forEach((r, i) => { final += (scores[i] / r.maxScore) * r.weightage; });
    final = Math.round(final * 100) / 100;

    const dSkills = (drive.requiredSkills || []).map(s => s.toLowerCase());
    const cSkills = (data.skills || []).map(s => s.toLowerCase());
    const skillMatch = dSkills.length > 0 ? Math.min(100, Math.round((dSkills.filter(s => cSkills.includes(s)).length / dSkills.length) * 100)) : 60;
    const cgpa = data.cgpa || 0;
    const eduMatch = cgpa >= 8.5 ? 100 : cgpa >= 7.5 ? 85 : cgpa >= 6.5 ? 70 : 50;
    const atsScore = Math.round(skillMatch*0.40 + 70*0.30 + eduMatch*0.15 + 70*0.15);
    const atsStatus = atsScore >= 75 ? 'shortlisted' : atsScore >= 50 ? 'review' : 'rejected';
    const status = final >= drive.selectionThreshold ? 'selected' : final >= drive.waitlistThreshold ? 'waitlisted' : final > 0 ? 'rejected' : 'pending';

    return Candidate.create({
      ...data, drive: drive._id, addedBy, scores: scoreEntries,
      finalScore: final, status, atsScore, atsStatus,
      atsBreakdown: { skillMatch, experienceMatch: 70, educationMatch: eduMatch, keywordRelevance: 70 },
    });
  }

  // Drive1 candidates
  const d1 = [
    await createCandidate({ name:'Arjun Sharma',  email:'arjun@example.com',  phone:'9876543210', usn:'1BM21CS001', college:'IIT Delhi',       branch:'CSE', cgpa:9.1, experience:0, skills:['javascript','react','node.js','sql','python'] }, drive1, [88,82,79,91], rec1._id),
    await createCandidate({ name:'Priya Nair',    email:'priya@example.com',  phone:'9876543211', usn:'1BM21CS002', college:'NIT Trichy',       branch:'IT',  cgpa:8.8, experience:0, skills:['javascript','react','css','html'] },           drive1, [72,68,70,85], rec1._id),
    await createCandidate({ name:'Rohan Mehta',   email:'rohan@example.com',  phone:'9876543212', usn:'1BM21CS003', college:'BITS Pilani',      branch:'CS',  cgpa:9.3, experience:1, skills:['javascript','node.js','react','sql','docker'] }, drive1, [95,90,88,92], rec1._id),
    await createCandidate({ name:'Sneha Patel',   email:'sneha@example.com',  phone:'9876543213', usn:'1BM21CS004', college:'IIT Bombay',       branch:'CSE', cgpa:8.5, experience:0, skills:['python','react','javascript','sql'] },           drive1, [80,76,73,88], rec1._id),
    await createCandidate({ name:'Vikram Singh',  email:'vikram@example.com', phone:'9876543214', usn:'1BM21CS005', college:'VIT Vellore',      branch:'CSE', cgpa:7.9, experience:0, skills:['java','sql'] },                                   drive1, [55,48,52,70], rec1._id),
    await createCandidate({ name:'Ananya Iyer',   email:'ananya@example.com', phone:'9876543215', usn:'1BM21CS006', college:'IIIT Hyderabad',   branch:'CSE', cgpa:9.0, experience:0, skills:['react','javascript','typescript','node.js','sql'] }, drive1, [91,87,85,94], rec1._id),
    await createCandidate({ name:'Karthik Rajan', email:'karthik@example.com',phone:'9876543216', usn:'1BM21CS007', college:'NIT Surathkal',   branch:'IT',  cgpa:8.2, experience:0, skills:['javascript','python','git'] },                     drive1, [62,58,55,75], rec1._id),
    await createCandidate({ name:'Divya Menon',   email:'divya@example.com',  phone:'9876543217', usn:'1BM21CS008', college:'PESIT Bangalore', branch:'CSE', cgpa:8.6, experience:1, skills:['react','node.js','javascript','sql','aws'] },       drive1, [84,79,77,90], rec1._id),
  ];
  const s1 = [...d1].sort((a,b) => b.finalScore - a.finalScore);
  for (let i=0;i<s1.length;i++) await Candidate.findByIdAndUpdate(s1[i]._id,{rank:i+1});
  await Drive.findByIdAndUpdate(drive1._id, { totalCandidates:d1.length, selectedCount:d1.filter(c=>c.status==='selected').length });

  // Drive2 candidates
  const d2 = [
    await createCandidate({ name:'Meera Krishnan', email:'meera@example.com',  usn:'2BM21IS001', college:'NIT Calicut',    branch:'IS',  cgpa:8.9, experience:0, skills:['python','sql','excel','tableau','machine learning'] }, drive2, [88,85,90], rec1._id),
    await createCandidate({ name:'Saurabh Gupta',  email:'saurabh@example.com',usn:'2BM21IS002', college:'IIT Madras',     branch:'DS',  cgpa:9.2, experience:0, skills:['python','sql','machine learning','pandas'] },           drive2, [92,90,88], rec1._id),
    await createCandidate({ name:'Lakshmi Rao',    email:'lakshmi@example.com',usn:'2BM21IS003', college:'PESIT',          branch:'CSE', cgpa:7.8, experience:0, skills:['sql','excel','python'] },                                drive2, [65,60,75], rec1._id),
    await createCandidate({ name:'Aditya Verma',   email:'aditya@example.com', usn:'2BM21IS004', college:'BITS Goa',       branch:'CS',  cgpa:8.4, experience:1, skills:['python','sql','tableau','power bi'] },                   drive2, [79,75,82], rec1._id),
    await createCandidate({ name:'Pooja Hegde',    email:'pooja@example.com',  usn:'2BM21IS005', college:'VIT Chennai',    branch:'IT',  cgpa:8.1, experience:0, skills:['python','sql','excel'] },                                drive2, [70,65,78], rec1._id),
  ];
  const s2 = [...d2].sort((a,b) => b.finalScore - a.finalScore);
  for (let i=0;i<s2.length;i++) await Candidate.findByIdAndUpdate(s2[i]._id,{rank:i+1});
  await Drive.findByIdAndUpdate(drive2._id, { totalCandidates:d2.length, selectedCount:d2.filter(c=>c.status==='selected').length });

  // Drive3 candidates
  const d3 = [
    await createCandidate({ name:'Neha Kulkarni', email:'neha@example.com',   usn:'3BM21ME001', college:'RVCE Bangalore',  branch:'CS',  cgpa:8.7, experience:0, skills:['figma','css','javascript','react'] }, drive3, [82,80,88], rec2._id),
    await createCandidate({ name:'Rahul Pandey',  email:'rahul2@example.com', usn:'3BM21ME002', college:'BMS Engineering', branch:'IS',  cgpa:7.6, experience:0, skills:['figma','css','html'] },               drive3, [68,65,77], rec2._id),
    await createCandidate({ name:'Shruti Bhat',   email:'shruti@example.com', usn:'3BM21ME003', college:'NIT Karnataka',  branch:'CSE', cgpa:9.0, experience:1, skills:['figma','react','javascript','css'] },  drive3, [90,88,92], rec2._id),
  ];
  const s3 = [...d3].sort((a,b) => b.finalScore - a.finalScore);
  for (let i=0;i<s3.length;i++) await Candidate.findByIdAndUpdate(s3[i]._id,{rank:i+1});
  await Drive.findByIdAndUpdate(drive3._id, { totalCandidates:d3.length, selectedCount:d3.filter(c=>c.status==='selected').length });
}
