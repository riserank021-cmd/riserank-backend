/**
 * constants.js
 * App-wide constants. Never hardcode these inline — import from here.
 */

const ROLES = {
  SUPER_ADMIN: 'superadmin',
  ADMIN: 'admin',
  USER: 'user',
};

const CONTENT_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
};

const EXAM_CATEGORIES = {
  SSC: 'ssc',
  RAILWAY: 'railway',
  BANKING: 'banking',
  BIHAR_SI: 'bihar_si',
};

const LANGUAGES = {
  ENGLISH: 'en',
  HINDI: 'hi',
};

const QUIZ_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  ARCHIVED: 'archived',
};

const DIFFICULTY = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard',
};

const ACTIVITY_ACTIONS = {
  // Auth
  USER_REGISTER: 'user.register',
  USER_LOGIN: 'user.login',
  USER_LOGOUT: 'user.logout',

  // Content
  CURRENT_AFFAIR_CREATE: 'currentAffair.create',
  CURRENT_AFFAIR_UPDATE: 'currentAffair.update',
  CURRENT_AFFAIR_DELETE: 'currentAffair.delete',
  CURRENT_AFFAIR_PUBLISH: 'currentAffair.publish',
  CURRENT_AFFAIR_ARCHIVE: 'currentAffair.archive',

  QUESTION_CREATE: 'question.create',
  QUESTION_UPDATE: 'question.update',
  QUESTION_DELETE: 'question.delete',

  QUIZ_CREATE: 'quiz.create',
  QUIZ_UPDATE: 'quiz.update',
  QUIZ_DELETE: 'quiz.delete',
  QUIZ_ATTEMPT: 'quiz.attempt',

  // Admin
  ADMIN_CREATE: 'admin.create',
  ADMIN_DELETE: 'admin.delete',
  USER_DELETE: 'user.delete',
  USER_SUSPEND: 'user.suspend',
};

const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
};

const STREAK = {
  GRACE_PERIOD_HOURS: 26, // Allow slight delay — login by 26hrs still counts
};

module.exports = {
  ROLES,
  CONTENT_STATUS,
  EXAM_CATEGORIES,
  LANGUAGES,
  QUIZ_STATUS,
  DIFFICULTY,
  ACTIVITY_ACTIONS,
  PAGINATION,
  STREAK,
};
