import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

const sendTokenResponse = (user, statusCode, res, message = 'Success') => {
  const token = signToken(user._id);
  const userObj = user.toObject();
  delete userObj.password;
  res.status(statusCode).json({ success: true, message, token, user: userObj });
};

// POST /api/auth/register — creates account in PENDING state, requires admin approval
export const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ success: false, message: 'Email already registered.' });

    // First-ever admin: auto-approve so system can bootstrap
    const adminCount = await User.countDocuments({ role: 'admin' });
    const isFirstAdmin = role === 'admin' && adminCount === 0;

    const user = await User.create({
      name, email, password,
      role: role === 'admin' ? 'admin' : 'recruiter',
      approvalStatus: isFirstAdmin ? 'approved' : 'pending',
      isActive: isFirstAdmin,
    });

    if (isFirstAdmin) {
      return sendTokenResponse(user, 201, res, 'Admin account created successfully');
    }

    res.status(201).json({
      success: true,
      pending: true,
      message: 'Registration submitted. An admin must approve your account before you can log in.',
    });
  } catch (error) { next(error); }
};

// POST /api/auth/login
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password are required.' });

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });

    if (user.approvalStatus === 'pending')
      return res.status(403).json({ success: false, message: 'Your account is awaiting admin approval.' });

    if (user.approvalStatus === 'rejected')
      return res.status(403).json({ success: false, message: 'Your account request was rejected. Contact admin.' });

    if (!user.isActive)
      return res.status(401).json({ success: false, message: 'Account is deactivated. Contact admin.' });

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });
    sendTokenResponse(user, 200, res, 'Login successful');
  } catch (error) { next(error); }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json({ success: true, user });
  } catch (error) { next(error); }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { name, avatar } = req.body;
    const user = await User.findByIdAndUpdate(req.user._id, { name, avatar }, { new: true, runValidators: true });
    res.status(200).json({ success: true, message: 'Profile updated', user });
  } catch (error) { next(error); }
};

export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.comparePassword(currentPassword)))
      return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
    user.password = newPassword;
    await user.save();
    res.status(200).json({ success: true, message: 'Password changed successfully.' });
  } catch (error) { next(error); }
};

export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort('-createdAt');
    res.status(200).json({ success: true, count: users.length, users });
  } catch (error) { next(error); }
};
