/**
 * admin.service.js
 * Super Admin: create/delete admins, manage users, view reports.
 * Admin: content management only (handled in respective services).
 */

const Admin = require('../models/Admin');
const User = require('../models/User');
const Report = require('../models/Report');
const AppError = require('../utils/AppError');
const { getPaginationParams, buildPaginationMeta } = require('../utils/pagination');
const { ROLES } = require('../config/constants');
const emailService = require('../utils/email.service');

// ── Admin Management (Super Admin only) ───────────────────────────────────────

const createAdmin = async ({ name, email, password }, createdById) => {
  const existing = await Admin.findOne({ email });
  if (existing) throw new AppError('Email already registered', 409);

  const admin = await Admin.create({
    name,
    email,
    password,
    role: ROLES.ADMIN,
    createdBy: createdById,
  });

  return { _id: admin._id, name: admin.name, email: admin.email, role: admin.role };
};

const deleteAdmin = async (adminId) => {
  const admin = await Admin.findById(adminId);
  if (!admin) throw new AppError('Admin not found', 404);
  if (admin.role === ROLES.SUPER_ADMIN) throw new AppError('Cannot delete a super admin', 403);
  await Admin.findByIdAndDelete(adminId);
};

const listAdmins = async (query) => {
  const { page, limit, skip } = getPaginationParams(query);
  const [items, total] = await Promise.all([
    Admin.find({ role: ROLES.ADMIN })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Admin.countDocuments({ role: ROLES.ADMIN }),
  ]);
  return { items, pagination: buildPaginationMeta({ page, limit, total }) };
};

// ── User Management ───────────────────────────────────────────────────────────

const listUsers = async (query) => {
  const { page, limit, skip } = getPaginationParams(query);
  const filter = {};
  if (query.search) {
    filter.$or = [
      { name: new RegExp(query.search, 'i') },
      { email: new RegExp(query.search, 'i') },
    ];
  }
  if (query.isSuspended !== undefined) filter.isSuspended = query.isSuspended === 'true';

  const [items, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    User.countDocuments(filter),
  ]);
  return { items, pagination: buildPaginationMeta({ page, limit, total }) };
};

const getUserById = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError('User not found', 404);
  return user;
};

const suspendUser = async (userId, reason) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError('User not found', 404);
  user.isSuspended = true;
  user.suspendedReason = reason;
  await user.save({ validateBeforeSave: false });
  return user;
};

const unsuspendUser = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError('User not found', 404);
  user.isSuspended = false;
  user.suspendedReason = null;
  await user.save({ validateBeforeSave: false });
  return user;
};

const deleteUser = async (userId) => {
  const user = await User.findByIdAndDelete(userId);
  if (!user) throw new AppError('User not found', 404);
};

const updateUserRole = async (userId, role) => {
  const validRoles = [ROLES.USER, ROLES.ADMIN, ROLES.SUPER_ADMIN];
  if (!validRoles.includes(role)) throw new AppError('Invalid role', 400);

  const user = await User.findById(userId);
  if (!user) throw new AppError('User not found', 404);

  user.role = role;
  await user.save({ validateBeforeSave: false });
  return user;
};

// ── Reported Questions Management ─────────────────────────────────────────────

const listReports = async (query) => {
  const { page, limit, skip } = getPaginationParams(query);
  const filter = {};
  if (query.status) filter.status = query.status;

  const [items, total] = await Promise.all([
    Report.find(filter)
      .populate('user', 'name email')
      .populate('question', 'questionText examCategory')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Report.countDocuments(filter),
  ]);
  return { items, pagination: buildPaginationMeta({ page, limit, total }) };
};

const reviewReport = async (reportId, adminId, { status, reviewNote }) => {
  const report = await Report.findById(reportId);
  if (!report) throw new AppError('Report not found', 404);
  report.status = status;
  report.reviewNote = reviewNote;
  report.reviewedBy = adminId;
  report.reviewedAt = new Date();
  await report.save();
  return report;
};

// ── Admin: Change own password ────────────────────────────────────────────────

const changeAdminPassword = async (adminId, { currentPassword, newPassword }) => {
  const admin = await Admin.findById(adminId).select('+password');
  if (!admin) throw new AppError('Admin not found', 404);

  const isMatch = await admin.comparePassword(currentPassword);
  if (!isMatch) throw new AppError('Current password is incorrect', 400);

  admin.password = newPassword;
  admin.refreshToken = null; // Invalidate existing sessions
  await admin.save();

  // Send security alert email (non-blocking)
  emailService.sendPasswordChangedAlert(admin.email, admin.name).catch(() => {});
};

// ── Admin: Get own profile ────────────────────────────────────────────────────

const getAdminProfile = async (adminId) => {
  const admin = await Admin.findById(adminId).populate('createdBy', 'name email');
  if (!admin) throw new AppError('Admin not found', 404);
  return admin;
};

module.exports = {
  createAdmin, deleteAdmin, listAdmins,
  listUsers, getUserById, suspendUser, unsuspendUser, deleteUser, updateUserRole,
  listReports, reviewReport,
  changeAdminPassword, getAdminProfile,
};
