/**
 * import.service.js
 * Parses a CSV buffer of MCQ questions and bulk-inserts into Question collection.
 *
 * Expected CSV columns (see src/templates/questionImport.csv for sample):
 *   questionText_en, questionText_hi,
 *   optionA_en, optionA_hi, optionB_en, optionB_hi,
 *   optionC_en, optionC_hi, optionD_en, optionD_hi,
 *   correctOption (A/B/C/D),
 *   explanation_en, explanation_hi,
 *   examCategory, subject, topic, difficulty, year
 */

const csv = require('csv-parser');
const { Readable } = require('stream');
const Question = require('../models/Question');
const AppError = require('../utils/AppError');
const { EXAM_CATEGORIES, DIFFICULTY, CONTENT_STATUS } = require('../config/constants');

const VALID_OPTIONS = ['A', 'B', 'C', 'D'];
const VALID_CATEGORIES = Object.values(EXAM_CATEGORIES);
const VALID_DIFFICULTIES = Object.values(DIFFICULTY);

// ── Parse CSV buffer into array of row objects ────────────────────────────────
const parseCSV = (buffer) => {
  return new Promise((resolve, reject) => {
    const results = [];
    const stream = Readable.from(buffer.toString());
    stream
      .pipe(csv({ mapHeaders: ({ header }) => header.trim() }))
      .on('data', (row) => results.push(row))
      .on('end', () => resolve(results))
      .on('error', (err) => reject(err));
  });
};

// ── Validate and transform a single CSV row ───────────────────────────────────
const transformRow = (row, index) => {
  const errors = [];
  const rowNum = index + 2; // +2 because row 1 is header

  const get = (key) => (row[key] || '').trim();

  // Required fields
  const questionText_en = get('questionText_en');
  const questionText_hi = get('questionText_hi');
  const correctOption = get('correctOption').toUpperCase();
  const examCategory = get('examCategory').toLowerCase();
  const difficulty = (get('difficulty') || 'medium').toLowerCase();

  if (!questionText_en) errors.push(`Row ${rowNum}: questionText_en is required`);
  if (!questionText_hi) errors.push(`Row ${rowNum}: questionText_hi is required`);
  if (!VALID_OPTIONS.includes(correctOption)) errors.push(`Row ${rowNum}: correctOption must be A/B/C/D`);
  if (!VALID_CATEGORIES.includes(examCategory)) errors.push(`Row ${rowNum}: invalid examCategory "${examCategory}"`);
  if (!VALID_DIFFICULTIES.includes(difficulty)) errors.push(`Row ${rowNum}: invalid difficulty "${difficulty}"`);

  // Options — all 4 required
  const options = ['A', 'B', 'C', 'D'].map((key) => {
    const en = get(`option${key}_en`);
    const hi = get(`option${key}_hi`);
    if (!en) errors.push(`Row ${rowNum}: option${key}_en is required`);
    if (!hi) errors.push(`Row ${rowNum}: option${key}_hi is required`);
    return { key, text: { en, hi } };
  });

  if (errors.length) return { errors };

  return {
    data: {
      questionText: { en: questionText_en, hi: questionText_hi },
      options,
      correctOption,
      explanation: {
        en: get('explanation_en') || '',
        hi: get('explanation_hi') || '',
      },
      examCategory,
      subject: get('subject') || null,
      topic: get('topic') || null,
      difficulty,
      year: get('year') ? parseInt(get('year'), 10) || null : null,
      status: CONTENT_STATUS.DRAFT, // All imports start as DRAFT — admin reviews before publishing
    },
  };
};

// ── Main import function ──────────────────────────────────────────────────────
const importQuestionsFromCSV = async (buffer, adminId) => {
  // 1. Parse CSV
  let rows;
  try {
    rows = await parseCSV(buffer);
  } catch (err) {
    throw new AppError(`CSV parse error: ${err.message}`, 400);
  }

  if (!rows.length) throw new AppError('CSV file is empty or has no data rows', 400);
  if (rows.length > 500) throw new AppError('Maximum 500 questions per import', 400);

  // 2. Validate all rows — collect errors first, don't insert partial data
  const validQuestions = [];
  const allErrors = [];

  for (let i = 0; i < rows.length; i++) {
    const result = transformRow(rows[i], i);
    if (result.errors) {
      allErrors.push(...result.errors);
    } else {
      validQuestions.push({ ...result.data, createdBy: adminId });
    }
  }

  // If any row has errors, abort the entire import
  if (allErrors.length) {
    throw new AppError(
      `Import failed — ${allErrors.length} validation error(s):\n${allErrors.slice(0, 20).join('\n')}${allErrors.length > 20 ? `\n...and ${allErrors.length - 20} more` : ''}`,
      400
    );
  }

  // 3. Bulk insert all valid questions
  const inserted = await Question.insertMany(validQuestions, { ordered: false });

  return {
    total: rows.length,
    imported: inserted.length,
    status: 'draft', // Remind admin all questions are in draft
    message: `${inserted.length} questions imported successfully as DRAFT. Review and publish individually.`,
  };
};

module.exports = { importQuestionsFromCSV };
