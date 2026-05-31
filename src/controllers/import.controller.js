/**
 * import.controller.js
 * Admin uploads a CSV → questions bulk-imported to DB as DRAFT.
 */

const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const AppError = require('../utils/AppError');
const importService = require('../services/import.service');

const importQuestions = asyncHandler(async (req, res) => {
  if (!req.file) throw new AppError('No CSV file uploaded', 400);
  if (req.file.mimetype !== 'text/csv' && !req.file.originalname.endsWith('.csv')) {
    throw new AppError('Only .csv files are accepted', 400);
  }

  const result = await importService.importQuestionsFromCSV(req.file.buffer, req.user._id);

  return sendSuccess(res, {
    statusCode: 200,
    message: result.message,
    data: {
      total: result.total,
      imported: result.imported,
      status: result.status,
    },
  });
});

// GET /api/v1/import/template — download sample CSV
const downloadTemplate = asyncHandler(async (req, res) => {
  const headers = [
    'questionText_en', 'questionText_hi',
    'optionA_en', 'optionA_hi',
    'optionB_en', 'optionB_hi',
    'optionC_en', 'optionC_hi',
    'optionD_en', 'optionD_hi',
    'correctOption',
    'explanation_en', 'explanation_hi',
    'examCategory', 'subject', 'topic', 'difficulty', 'year',
  ].join(',');

  const sampleRow = [
    '"Sample question in English?"', '"नमूना प्रश्न हिंदी में?"',
    '"Option A English"', '"विकल्प A हिंदी"',
    '"Option B English"', '"विकल्प B हिंदी"',
    '"Option C English"', '"विकल्प C हिंदी"',
    '"Option D English"', '"विकल्प D हिंदी"',
    'B',
    '"Explanation in English"', '"हिंदी में स्पष्टीकरण"',
    'ssc', 'General Knowledge', 'Current Events', 'medium', '2024',
  ].join(',');

  const csvContent = `${headers}\n${sampleRow}\n`;

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="riserank_question_import_template.csv"');
  res.send(csvContent);
});

module.exports = { importQuestions, downloadTemplate };
