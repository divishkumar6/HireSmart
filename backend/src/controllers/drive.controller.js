import Drive from '../models/Drive.js';
import Candidate from '../models/Candidate.js';

// @route   GET /api/drives
export const getDrives = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 10 } = req.query;
    const query = {};

    if (req.user.role !== 'admin') {
      query.createdBy = req.user._id;
    }
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const [drives, total] = await Promise.all([
      Drive.find(query)
        .populate('createdBy', 'name email')
        .sort('-createdAt')
        .skip(skip)
        .limit(Number(limit)),
      Drive.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: drives.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      drives,
    });
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/drives
export const createDrive = async (req, res, next) => {
  try {
    const drive = await Drive.create({
      ...req.body,
      createdBy: req.user._id,
    });
    res.status(201).json({ success: true, message: 'Drive created', drive });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/drives/:id
export const getDrive = async (req, res, next) => {
  try {
    const drive = await Drive.findById(req.params.id).populate('createdBy', 'name email');
    if (!drive) {
      return res.status(404).json({ success: false, message: 'Drive not found' });
    }
    if (req.user.role !== 'admin' && drive.createdBy._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    res.status(200).json({ success: true, drive });
  } catch (error) {
    next(error);
  }
};

// @route   PUT /api/drives/:id
export const updateDrive = async (req, res, next) => {
  try {
    let drive = await Drive.findById(req.params.id);
    if (!drive) return res.status(404).json({ success: false, message: 'Drive not found' });
    if (req.user.role !== 'admin' && drive.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    drive = await Drive.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({ success: true, message: 'Drive updated', drive });
  } catch (error) {
    next(error);
  }
};

// @route   DELETE /api/drives/:id
export const deleteDrive = async (req, res, next) => {
  try {
    const drive = await Drive.findById(req.params.id);
    if (!drive) return res.status(404).json({ success: false, message: 'Drive not found' });
    if (req.user.role !== 'admin' && drive.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await Promise.all([
      Drive.findByIdAndDelete(req.params.id),
      Candidate.deleteMany({ drive: req.params.id }),
    ]);

    res.status(200).json({ success: true, message: 'Drive and all candidates deleted' });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/drives/:id/stats
export const getDriveStats = async (req, res, next) => {
  try {
    const drive = await Drive.findById(req.params.id);
    if (!drive) return res.status(404).json({ success: false, message: 'Drive not found' });

    const stats = await Candidate.aggregate([
      { $match: { drive: drive._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          avgScore: { $avg: '$finalScore' },
        },
      },
    ]);

    const totalCandidates = await Candidate.countDocuments({ drive: drive._id });
    const topCandidates = await Candidate.find({ drive: drive._id })
      .sort('-finalScore')
      .limit(5)
      .select('name email finalScore rank status');

    res.status(200).json({
      success: true,
      stats: { statusBreakdown: stats, totalCandidates, topCandidates },
    });
  } catch (error) {
    next(error);
  }
};
