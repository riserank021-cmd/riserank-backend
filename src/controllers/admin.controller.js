const adminService = require('../services/admin.service');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendCreated } = require('../utils/apiResponse');

// ── Admin Management ──────────────────────────────────────────────────────────
const createAdmin = asyncHandler(async (req, res) => {
  const admin = await adminService.createAdmin(req.body, req.user._id);
  return sendCreated(res, { message: 'Admin created successfully', data: { admin } });
});

const deleteAdmin = asyncHandler(async (req, res) => {
  await adminService.deleteAdmin(req.params.id);
  return sendSuccess(res, { message: 'Admin deleted' });
});

const listAdmins = asyncHandler(async (req, res) => {
  const result = await adminService.listAdmins(req.query);
  return sendSuccess(res, { data: result.items, pagination: result.pagination });
});

// ── User Management ───────────────────────────────────────────────────────────
const listUsers = asyncHandler(async (req, res) => {
  const result = await adminService.listUsers(req.query);
  return sendSuccess(res, { data: result.items, pagination: result.pagination });
});

const getUserById = asyncHandler(async (req, res) => {
  const user = await adminService.getUserById(req.params.id);
  return sendSuccess(res, { data: { user } });
});

const suspendUser = asyncHandler(async (req, res) => {
  const user = await adminService.suspendUser(req.params.id, req.body.reason);
  return sendSuccess(res, { message: 'User suspended', data: { user } });
});

const unsuspendUser = asyncHandler(async (req, res) => {
  const user = await adminService.unsuspendUser(req.params.id);
  return sendSuccess(res, { message: 'User unsuspended', data: { user } });
});

const deleteUser = asyncHandler(async (req, res) => {
  await adminService.deleteUser(req.params.id);
  return sendSuccess(res, { message: 'User deleted' });
});

const updateUserRole = asyncHandler(async (req, res) => {
  const user = await adminService.updateUserRole(req.params.id, req.body.role);
  return sendSuccess(res, { message: `User role updated to ${user.role}`, data: { user } });
});

// ── Reports ───────────────────────────────────────────────────────────────────
const listReports = asyncHandler(async (req, res) => {
  const result = await adminService.listReports(req.query);
  return sendSuccess(res, { data: result.items, pagination: result.pagination });
});

const reviewReport = asyncHandler(async (req, res) => {
  const report = await adminService.reviewReport(req.params.id, req.user._id, req.body);
  return sendSuccess(res, { message: 'Report reviewed', data: { report } });
});

const changeAdminPassword = asyncHandler(async (req, res) => {
  await adminService.changeAdminPassword(req.user._id, req.body);
  return sendSuccess(res, { message: 'Password changed successfully' });
});

const getAdminProfile = asyncHandler(async (req, res) => {
  const admin = await adminService.getAdminProfile(req.user._id);
  return sendSuccess(res, { data: { admin } });
});

module.exports = {
  createAdmin, deleteAdmin, listAdmins,
  listUsers, getUserById, suspendUser, unsuspendUser, deleteUser, updateUserRole,
  listReports, reviewReport,
  changeAdminPassword, getAdminProfile,
};
