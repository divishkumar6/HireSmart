import Candidate from '../models/Candidate.js';
import Drive from '../models/Drive.js';

// ── GET /api/candidates ─────────────────────────────────────
export const getCandidates = async (req, res, next) => {
  try {
    const { drive, status, search, page = 1, limit = 20 } = req.query;
    const query = {};
    if (drive) query.drive = drive;
    if (status) query.status = status;
    if (search) query.$or = [
      { name:    { $regex: search, $options: 'i' } },
      { email:   { $regex: search, $options: 'i' } },
      { college: { $regex: search, $options: 'i' } },
      { usn:     { $regex: search, $options: 'i' } },
    ];
    if (req.user.role !== 'admin') query.addedBy = req.user._id;
    const skip = (Number(page) - 1) * Number(limit);
    const [candidates, total] = await Promise.all([
      Candidate.find(query)
        .populate('drive', 'name status')
        .populate('addedBy', 'name')
        .sort('-createdAt')
        .skip(skip).limit(Number(limit)),
      Candidate.countDocuments(query),
    ]);
    res.json({ success:true, count:candidates.length, total, totalPages:Math.ceil(total/Number(limit)), currentPage:Number(page), candidates });
  } catch (err) { next(err); }
};

// ── POST /api/candidates ────────────────────────────────────
export const addCandidate = async (req, res, next) => {
  try {
    const driveDoc = await Drive.findById(req.body.drive);
    if (!driveDoc) return res.status(404).json({ success:false, message:'Drive not found' });
    if (['completed','archived'].includes(driveDoc.status))
      return res.status(400).json({ success:false, message:'Cannot add to completed drive' });

    const candidate = new Candidate({ ...req.body, addedBy: req.user._id });
    const ats = candidate.computeATS(driveDoc.requiredSkills || [], driveDoc.requiredExperience || 0);
    candidate.atsScore = ats.atsScore;
    candidate.atsStatus = ats.atsStatus;
    candidate.atsBreakdown = ats.atsBreakdown;

    await candidate.save();
    await Drive.findByIdAndUpdate(driveDoc._id, { $inc: { totalCandidates: 1 } });
    res.status(201).json({ success:true, message:'Candidate added', candidate });
  } catch (err) { next(err); }
};

// ── GET /api/candidates/:id ─────────────────────────────────
export const getCandidate = async (req, res, next) => {
  try {
    const candidate = await Candidate.findById(req.params.id)
      .populate('drive', 'name rounds status selectionThreshold waitlistThreshold requiredSkills requiredExperience')
      .populate('addedBy', 'name email')
      .populate('scores.enteredBy', 'name');
    if (!candidate) return res.status(404).json({ success:false, message:'Candidate not found' });
    res.json({ success:true, candidate });
  } catch (err) { next(err); }
};

// ── PUT /api/candidates/:id ─────────────────────────────────
export const updateCandidate = async (req, res, next) => {
  try {
    const candidate = await Candidate.findById(req.params.id)
      .populate('drive', 'requiredSkills requiredExperience');
    if (!candidate) return res.status(404).json({ success:false, message:'Candidate not found' });
    Object.assign(candidate, req.body);
    if (req.body.skills || req.body.experience !== undefined) {
      const ats = candidate.computeATS(
        candidate.drive?.requiredSkills || [],
        candidate.drive?.requiredExperience || 0
      );
      candidate.atsScore = ats.atsScore;
      candidate.atsStatus = ats.atsStatus;
      candidate.atsBreakdown = ats.atsBreakdown;
    }
    await candidate.save();
    res.json({ success:true, message:'Candidate updated', candidate });
  } catch (err) { next(err); }
};

// ── DELETE /api/candidates/:id ──────────────────────────────
export const deleteCandidate = async (req, res, next) => {
  try {
    const candidate = await Candidate.findByIdAndDelete(req.params.id);
    if (!candidate) return res.status(404).json({ success:false, message:'Candidate not found' });
    await Drive.findByIdAndUpdate(candidate.drive, { $inc: { totalCandidates: -1 } });
    res.json({ success:true, message:'Candidate removed' });
  } catch (err) { next(err); }
};

// ── PUT /api/candidates/:id/scores ──────────────────────────
export const updateScores = async (req, res, next) => {
  try {
    const { scores } = req.body;
    const candidate = await Candidate.findById(req.params.id)
      .populate('drive', 'rounds selectionThreshold waitlistThreshold requiredSkills requiredExperience');
    if (!candidate) return res.status(404).json({ success:false, message:'Candidate not found' });

    for (const incoming of scores) {
      const existing = candidate.scores.find(s => s.roundId.toString() === incoming.roundId);
      if (existing) {
        existing.score = incoming.score; existing.enteredBy = req.user._id; existing.enteredAt = new Date();
        if (incoming.notes) existing.notes = incoming.notes;
      } else {
        candidate.scores.push({ ...incoming, enteredBy: req.user._id });
      }
    }

    candidate.finalScore = candidate.computeFinalScore(candidate.drive.rounds);
    const { selectionThreshold, waitlistThreshold } = candidate.drive;
    if (candidate.finalScore >= selectionThreshold) candidate.status = 'selected';
    else if (candidate.finalScore >= waitlistThreshold) candidate.status = 'waitlisted';
    else if (candidate.scores.length > 0) candidate.status = 'in_progress';

    const ats = candidate.computeATS(candidate.drive.requiredSkills || [], candidate.drive.requiredExperience || 0);
    candidate.atsScore = ats.atsScore; candidate.atsStatus = ats.atsStatus; candidate.atsBreakdown = ats.atsBreakdown;

    await candidate.save();
    await recomputeRankings(candidate.drive._id);
    const updated = await Candidate.findById(req.params.id);
    res.json({ success:true, message:'Scores updated', candidate: updated });
  } catch (err) { next(err); }
};

// ── GET /api/candidates/drive/:driveId/rankings ─────────────
export const getDriveRankings = async (req, res, next) => {
  try {
    const candidates = await Candidate.find({ drive: req.params.driveId })
      .sort('-finalScore')
      .select('name email college usn finalScore rank status atsScore atsStatus');
    res.json({ success:true, count:candidates.length, candidates });
  } catch (err) { next(err); }
};

// ── GET /api/candidates/heatmap ─────────────────────────────
export const getSkillHeatmap = async (req, res, next) => {
  try {
    const query = req.user.role !== 'admin' ? { addedBy: req.user._id } : {};
    if (req.query.drive) query.drive = req.query.drive;
    const candidates = await Candidate.find(query).select('skills');
    const skillCount = {};
    for (const c of candidates) {
      for (const skill of (c.skills || [])) {
        const s = skill.trim().toLowerCase();
        if (s) skillCount[s] = (skillCount[s] || 0) + 1;
      }
    }
    const heatmap = Object.entries(skillCount)
      .sort((a, b) => b[1] - a[1]).slice(0, 20)
      .map(([skill, count]) => ({ skill, count }));
    res.json({ success:true, heatmap });
  } catch (err) { next(err); }
};

// ── GET /api/candidates/dashboard-stats ─────────────────────
export const getDashboardStats = async (req, res, next) => {
  try {
    const isAdmin = req.user.role === 'admin';
    const query = isAdmin ? {} : { addedBy: req.user._id };
    const driveQuery = isAdmin ? {} : { createdBy: req.user._id };

    const [totalDrives, activeDrives, totalCandidates, selectedCount, statusBreakdown, recentActivity] = await Promise.all([
      Drive.countDocuments(driveQuery),
      Drive.countDocuments({ ...driveQuery, status: 'active' }),
      Candidate.countDocuments(query),
      Candidate.countDocuments({ ...query, status: 'selected' }),
      Candidate.aggregate([
        { $match: query },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Candidate.find(query).sort('-createdAt').limit(5)
        .select('name status createdAt drive atsScore finalScore')
        .populate('drive', 'name'),
    ]);

    res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.json({
      success: true,
      stats: { totalDrives, activeDrives, totalCandidates, selectedCount, statusBreakdown, recentActivity },
      timestamp: Date.now(),
    });
  } catch (err) { next(err); }
};

// ── POST /api/candidates/bulk-import ────────────────────────
export const bulkImport = async (req, res, next) => {
  try {
    const { driveId, rows } = req.body;
    if (!driveId) return res.status(400).json({ success:false, message:'driveId required' });
    if (!rows?.length) return res.status(400).json({ success:false, message:'No rows provided' });
    const driveDoc = await Drive.findById(driveId);
    if (!driveDoc) return res.status(404).json({ success:false, message:'Drive not found' });

    const results = { added:0, skipped:0, errors:[] };
    for (const row of rows.slice(0, 500)) {
      if (!row.name || !row.email) { results.skipped++; continue; }
      try {
        const temp = new Candidate({
          ...row,
          drive: driveId,
          addedBy: req.user._id,
          skills: Array.isArray(row.skills)
            ? row.skills
            : (row.skills || '').split(',').map(s => s.trim()).filter(Boolean),
        });
        const ats = temp.computeATS(driveDoc.requiredSkills || [], driveDoc.requiredExperience || 0);
        temp.atsScore = ats.atsScore; temp.atsStatus = ats.atsStatus; temp.atsBreakdown = ats.atsBreakdown;
        await temp.save();
        results.added++;
      } catch (e) {
        if (e.code === 11000) results.skipped++;
        else results.errors.push((row.email || 'unknown') + ': ' + e.message);
      }
    }
    await Drive.findByIdAndUpdate(driveId, { $inc: { totalCandidates: results.added } });
    res.json({ success:true, message:`Imported ${results.added} candidates`, ...results });
  } catch (err) { next(err); }
};

// ── Internal: recompute rankings ────────────────────────────
const recomputeRankings = async (driveId) => {
  const candidates = await Candidate.find({ drive: driveId }).sort('-finalScore');
  const ops = candidates.map((c, i) => ({
    updateOne: { filter: { _id: c._id }, update: { rank: i + 1 } }
  }));
  if (ops.length) await Candidate.bulkWrite(ops);
};
