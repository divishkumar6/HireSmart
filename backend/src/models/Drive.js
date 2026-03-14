import mongoose from 'mongoose';

const roundSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  type: { type: String, enum: ['aptitude', 'technical', 'coding', 'hr', 'group_discussion', 'other'], default: 'other' },
  weightage: { type: Number, required: true, min: 1, max: 100 },
  maxScore: { type: Number, required: true, min: 1, default: 100 },
  cutoffScore: { type: Number, required: true, min: 0, default: 0 },
  order: { type: Number, default: 0 },
});

const driveSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  description: { type: String, trim: true, maxlength: 500 },
  company: { type: String, trim: true },
  jobRole: { type: String, trim: true },
  status: { type: String, enum: ['draft', 'active', 'completed', 'archived'], default: 'draft' },
  rounds: {
    type: [roundSchema],
    validate: {
      validator: function (rounds) {
        if (!rounds || rounds.length === 0) return true;
        const total = rounds.reduce((sum, r) => sum + r.weightage, 0);
        return Math.round(total) === 100;
      },
      message: 'Total weightage must equal 100%',
    },
  },
  selectionThreshold: { type: Number, required: true, min: 0, max: 100, default: 75 },
  waitlistThreshold: { type: Number, required: true, min: 0, max: 100, default: 60 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  totalCandidates: { type: Number, default: 0 },
  selectedCount: { type: Number, default: 0 },
  startDate: Date,
  endDate: Date,
  tags: [{ type: String, trim: true }],
  // ATS config
  requiredSkills: [{ type: String, trim: true }],
  requiredExperience: { type: Number, default: 0 },
  // Offer letter config
  companyLogo: { type: String, trim: true },
  offerPackage: { type: String, trim: true, default: '' },
  offerDetails: {
    probationPeriod: { type: String, default: '6 months' },
    workMode: { type: String, default: 'Hybrid' },
    workLocation: { type: String, default: 'To be communicated' },
    benefits: [{ type: String }],
  },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

driveSchema.index({ createdBy: 1 });
driveSchema.index({ status: 1 });
driveSchema.index({ createdAt: -1 });

driveSchema.virtual('selectionRate').get(function () {
  if (!this.totalCandidates) return 0;
  return Math.round((this.selectedCount / this.totalCandidates) * 100);
});

const Drive = mongoose.model('Drive', driveSchema);
export default Drive;
