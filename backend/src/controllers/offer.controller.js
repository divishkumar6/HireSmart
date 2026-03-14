import Candidate from '../models/Candidate.js';
import Drive from '../models/Drive.js';
import User from '../models/User.js';

// GET /api/offers/:candidateId/generate
export const generateOffer = async (req, res, next) => {
  try {
    const candidate = await Candidate.findById(req.params.candidateId)
      .populate('drive', 'name company jobRole companyLogo offerPackage offerDetails startDate')
      .populate('addedBy', 'name email');

    if (!candidate) return res.status(404).json({ success: false, message: 'Candidate not found' });
    if (candidate.status !== 'selected')
      return res.status(403).json({ success: false, message: 'Offer letter only available for selected candidates' });

    const drive = candidate.drive;
    const today = new Date();
    const deadlineDate = new Date(today);
    deadlineDate.setDate(deadlineDate.getDate() + 7);

    const offerData = {
      candidateName: candidate.name,
      candidateEmail: candidate.email,
      college: candidate.college || '',
      branch: candidate.branch || '',
      company: drive?.company || 'SmartHire Corp',
      companyLogo: drive?.companyLogo || '',
      jobRole: drive?.jobRole || 'Software Engineer',
      driveName: drive?.name || '',
      package: drive?.offerPackage || '6 LPA',
      startDate: drive?.startDate
        ? new Date(drive.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
        : 'To be communicated',
      offerDate: today.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
      acceptanceDeadline: deadlineDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
      hrName: req.user.name,
      hrEmail: req.user.email,
      offerDetails: drive?.offerDetails || {},
      finalScore: candidate.finalScore || 0,
      atsScore: candidate.atsScore || 0,
    };

    res.json({ success: true, offerData });
  } catch (err) { next(err); }
};

// PUT /api/offers/:candidateId/status   — update candidate status manually
export const updateCandidateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowed = ['selected', 'waitlisted', 'rejected', 'in_progress', 'pending'];
    if (!allowed.includes(status))
      return res.status(400).json({ success: false, message: 'Invalid status' });

    const candidate = await Candidate.findByIdAndUpdate(
      req.params.candidateId,
      { status },
      { new: true }
    ).populate('drive', 'name');

    if (!candidate) return res.status(404).json({ success: false, message: 'Candidate not found' });

    // Update drive selectedCount if toggling selected
    if (status === 'selected') {
      await Drive.findByIdAndUpdate(candidate.drive._id, { $inc: { selectedCount: 1 } });
    }

    res.json({ success: true, message: `Status updated to ${status}`, candidate });
  } catch (err) { next(err); }
};
