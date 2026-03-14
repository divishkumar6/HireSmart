import mongoose from 'mongoose';

const scoreSchema = new mongoose.Schema({
  roundId: { type: mongoose.Schema.Types.ObjectId, required: true },
  roundName: String,
  score: { type: Number, required: true, min: 0 },
  maxScore: Number,
  enteredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  enteredAt: { type: Date, default: Date.now },
  notes: String,
});

const candidateSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  phone: { type: String, trim: true },
  usn: { type: String, trim: true, uppercase: true },
  college: { type: String, trim: true },
  branch: { type: String, trim: true },
  graduationYear: Number,
  cgpa: { type: Number, min: 0, max: 10 },
  tenth: { type: Number, min: 0, max: 100 },
  twelfth: { type: Number, min: 0, max: 100 },
  gender: { type: String, trim: true },
  drive: { type: mongoose.Schema.Types.ObjectId, ref: 'Drive', required: true },
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'selected', 'waitlisted', 'rejected', 'shortlisted', 'review'],
    default: 'pending',
  },
  scores: [scoreSchema],
  finalScore: { type: Number, default: 0 },
  rank: Number,
  resumeUrl: String,
  notes: String,
  isDisqualified: { type: Boolean, default: false },
  resumeText: { type: String, select: false }, // stored but not returned by default
  disqualifyReason: String,
  // ATS fields
  skills: [{ type: String, trim: true }],
  experience: { type: Number, default: 0 }, // years
  atsScore: { type: Number, default: 0 },
  atsBreakdown: {
    skillMatch: { type: Number, default: 0 },
    experienceMatch: { type: Number, default: 0 },
    educationMatch: { type: Number, default: 0 },
    keywordRelevance: { type: Number, default: 0 },
  },
  atsStatus: {
    type: String,
    enum: ['shortlisted', 'review', 'rejected', 'pending'],
    default: 'pending',
  },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

candidateSchema.index({ email: 1, drive: 1 }, { unique: true });
candidateSchema.index({ drive: 1 });
candidateSchema.index({ status: 1 });
candidateSchema.index({ finalScore: -1 });
candidateSchema.index({ atsScore: -1 });

candidateSchema.methods.computeFinalScore = function (rounds) {
  if (!rounds || rounds.length === 0 || this.scores.length === 0) return 0;
  let weightedTotal = 0;
  for (const round of rounds) {
    const scoreEntry = this.scores.find(s => s.roundId.toString() === round._id.toString());
    if (scoreEntry) {
      const normalized = (scoreEntry.score / round.maxScore) * 100;
      weightedTotal += (normalized * round.weightage) / 100;
    }
  }
  return Math.round(weightedTotal * 100) / 100;
};

// Compute ATS score based on candidate profile vs drive requirements
candidateSchema.methods.computeATS = function (driveSkills = [], requiredExp = 0, requiredEducation = '') {
  const candidateSkillsLower = (this.skills || []).map(s => s.toLowerCase());
  const driveSkillsLower = driveSkills.map(s => s.toLowerCase());

  // Skill match (40%)
  const matchedSkills = driveSkillsLower.filter(s => candidateSkillsLower.includes(s));
  const skillMatch = driveSkillsLower.length > 0
    ? Math.min(100, (matchedSkills.length / driveSkillsLower.length) * 100)
    : 60;

  // Experience match (30%)
  const expMatch = requiredExp > 0
    ? Math.min(100, ((this.experience || 0) / requiredExp) * 100)
    : this.experience > 0 ? 70 : 50;

  // Education match (15%) — based on CGPA
  const cgpa = this.cgpa || 0;
  const eduMatch = cgpa >= 8.5 ? 100 : cgpa >= 7.5 ? 80 : cgpa >= 6.5 ? 60 : cgpa >= 5 ? 40 : 20;

  // Keyword relevance (15%) — based on notes/branch matching
  const keywordMatch = this.college ? 70 : 50;

  const atsScore = Math.round(
    skillMatch * 0.40 +
    expMatch * 0.30 +
    eduMatch * 0.15 +
    keywordMatch * 0.15
  );

  const atsStatus = atsScore >= 75 ? 'shortlisted' : atsScore >= 50 ? 'review' : 'rejected';

  return {
    atsScore,
    atsStatus,
    atsBreakdown: {
      skillMatch: Math.round(skillMatch),
      experienceMatch: Math.round(expMatch),
      educationMatch: Math.round(eduMatch),
      keywordRelevance: Math.round(keywordMatch),
    }
  };
};

const Candidate = mongoose.model('Candidate', candidateSchema);
export default Candidate;
