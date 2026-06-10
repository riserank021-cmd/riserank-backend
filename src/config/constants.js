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

/**
 * Practice subjects & topics per exam category.
 * subject values are stored on Question.subject
 * topic values are stored on Question.topic
 */
const PRACTICE_SUBJECTS = {
  ssc: {
    english: {
      label: { en: 'English', hi: 'अंग्रेज़ी' },
      topics: [
        { value: 'one_word_substitution',  label: { en: 'One Word Substitution', hi: 'एक शब्द प्रतिस्थापन' } },
        { value: 'idioms_phrases',         label: { en: 'Idioms & Phrases',       hi: 'मुहावरे और वाक्यांश' } },
        { value: 'antonyms',               label: { en: 'Antonyms',              hi: 'विलोम शब्द' } },
        { value: 'synonyms',               label: { en: 'Synonyms',              hi: 'समानार्थी शब्द' } },
        { value: 'spelling',               label: { en: 'Spelling',              hi: 'वर्तनी' } },
        { value: 'active_passive_voice',   label: { en: 'Active & Passive Voice', hi: 'कर्तृवाच्य और कर्मवाच्य' } },
        { value: 'direct_indirect_speech', label: { en: 'Direct & Indirect Speech', hi: 'प्रत्यक्ष और अप्रत्यक्ष कथन' } },
      ],
    },
    gk_gs: {
      label: { en: 'GK & GS', hi: 'सामान्य ज्ञान' },
      topics: [
        { value: 'history',    label: { en: 'History',    hi: 'इतिहास' } },
        { value: 'polity',     label: { en: 'Polity',     hi: 'राजव्यवस्था' } },
        { value: 'geography',  label: { en: 'Geography',  hi: 'भूगोल' } },
        { value: 'economics',  label: { en: 'Economics',  hi: 'अर्थशास्त्र' } },
        { value: 'science',    label: { en: 'Science',    hi: 'विज्ञान' } },
      ],
    },
  },
  railway: {
    mathematics: {
      label: { en: 'Mathematics', hi: 'गणित' },
      topics: [
        { value: 'number_system',   label: { en: 'Number System',   hi: 'संख्या प्रणाली' } },
        { value: 'percentage',      label: { en: 'Percentage',      hi: 'प्रतिशत' } },
        { value: 'ratio_proportion',label: { en: 'Ratio & Proportion', hi: 'अनुपात और समानुपात' } },
        { value: 'simplification',  label: { en: 'Simplification',  hi: 'सरलीकरण' } },
      ],
    },
    general_intelligence: {
      label: { en: 'General Intelligence', hi: 'सामान्य बुद्धिमत्ता' },
      topics: [
        { value: 'reasoning',    label: { en: 'Reasoning',    hi: 'तर्कशक्ति' } },
        { value: 'analogies',    label: { en: 'Analogies',    hi: 'सादृश्य' } },
        { value: 'series',       label: { en: 'Series',       hi: 'श्रृंखला' } },
      ],
    },
  },
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
  PRACTICE_SUBJECTS,
};
