/**
 * swagger.js
 * OpenAPI 3.0 specification for RiseRank Backend API.
 * Served at GET /api/v1/docs
 *
 * Uses swagger-jsdoc to read @openapi annotations from route files
 * and swagger-ui-express to render the interactive UI.
 */

const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'RiseRank API',
      version: '1.0.0',
      description: `
## RiseRank — Bilingual Government Exam Preparation Platform

**Base URL:** \`/api/v1\`

### Authentication
All protected routes require a JWT Bearer token in the \`Authorization\` header:
\`\`\`
Authorization: Bearer <access_token>
\`\`\`

### Response Format
All responses follow this structure:
\`\`\`json
{
  "success": true,
  "message": "...",
  "data": { ... },
  "pagination": { ... }
}
\`\`\`

### Roles
- **user** — registered student
- **admin** — content manager
- **superadmin** — full access
      `,
      contact: {
        name: 'RiseRank Support',
        email: 'support@riserank.in',
        url: 'https://riserank.in',
      },
    },
    servers: [
      { url: 'http://localhost:5000/api/v1', description: 'Local Development' },
      { url: 'https://api.riserank.in/api/v1', description: 'Production' },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT access token from /auth/login or /auth/register',
        },
      },
      schemas: {
        // ── Common ──────────────────────────────────────────
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Operation successful' },
            data: { type: 'object' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Error description' },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string' },
                  message: { type: 'string' },
                },
              },
            },
          },
        },
        Pagination: {
          type: 'object',
          properties: {
            total: { type: 'integer', example: 100 },
            page: { type: 'integer', example: 1 },
            limit: { type: 'integer', example: 20 },
            totalPages: { type: 'integer', example: 5 },
            hasNextPage: { type: 'boolean', example: true },
            hasPrevPage: { type: 'boolean', example: false },
          },
        },

        // ── User ─────────────────────────────────────────────
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '665f1a2b3c4d5e6f7a8b9c0d' },
            name: { type: 'string', example: 'Rahul Kumar' },
            email: { type: 'string', example: 'rahul@example.com' },
            phone: { type: 'string', example: '9876543210' },
            role: { type: 'string', enum: ['user'], example: 'user' },
            preferredLanguage: { type: 'string', enum: ['en', 'hi'], example: 'hi' },
            preferredExams: { type: 'array', items: { type: 'string' }, example: ['ssc', 'banking'] },
            currentStreak: { type: 'integer', example: 7 },
            longestStreak: { type: 'integer', example: 15 },
            totalQuizAttempts: { type: 'integer', example: 42 },
            isEmailVerified: { type: 'boolean', example: true },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },

        // ── Auth ──────────────────────────────────────────────
        RegisterRequest: {
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: {
            name: { type: 'string', example: 'Rahul Kumar' },
            email: { type: 'string', format: 'email', example: 'rahul@example.com' },
            password: { type: 'string', format: 'password', example: 'Secure@123' },
            phone: { type: 'string', example: '9876543210' },
            preferredLanguage: { type: 'string', enum: ['en', 'hi'], example: 'hi' },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'rahul@example.com' },
            password: { type: 'string', format: 'password', example: 'Secure@123' },
            device: { type: 'string', enum: ['web', 'android', 'ios'], example: 'android' },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            user: { $ref: '#/components/schemas/User' },
            accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
            refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
            sessionId: { type: 'string', example: 'uuid-v4-string' },
          },
        },

        // ── Bilingual Content ─────────────────────────────────
        BilingualText: {
          type: 'object',
          properties: {
            en: { type: 'string', example: 'English content' },
            hi: { type: 'string', example: 'हिंदी सामग्री' },
          },
        },

        // ── Category ──────────────────────────────────────────
        Category: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { $ref: '#/components/schemas/BilingualText' },
            slug: { type: 'string', example: 'ssc' },
            isActive: { type: 'boolean', example: true },
            order: { type: 'integer', example: 1 },
          },
        },

        // ── Current Affair ────────────────────────────────────
        CurrentAffair: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            title: { $ref: '#/components/schemas/BilingualText' },
            body: { $ref: '#/components/schemas/BilingualText' },
            summary: { $ref: '#/components/schemas/BilingualText' },
            examTags: { type: 'array', items: { type: 'string' }, example: ['ssc', 'banking'] },
            status: { type: 'string', enum: ['draft', 'published', 'archived'] },
            publishedAt: { type: 'string', format: 'date-time' },
            viewCount: { type: 'integer', example: 120 },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },

        // ── Question ──────────────────────────────────────────
        Option: {
          type: 'object',
          properties: {
            key: { type: 'string', enum: ['A', 'B', 'C', 'D'] },
            text: { $ref: '#/components/schemas/BilingualText' },
          },
        },
        Question: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            questionText: { $ref: '#/components/schemas/BilingualText' },
            options: { type: 'array', items: { $ref: '#/components/schemas/Option' } },
            correctOption: { type: 'string', enum: ['A', 'B', 'C', 'D'] },
            explanation: { $ref: '#/components/schemas/BilingualText' },
            examCategory: { type: 'string', example: 'ssc' },
            difficulty: { type: 'string', enum: ['easy', 'medium', 'hard'] },
            attemptCount: { type: 'integer' },
          },
        },

        // ── Quiz ─────────────────────────────────────────────
        Quiz: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            title: { $ref: '#/components/schemas/BilingualText' },
            examCategory: { type: 'string', example: 'ssc' },
            durationSeconds: { type: 'integer', example: 600 },
            isDaily: { type: 'boolean' },
            scheduledDate: { type: 'string', format: 'date-time' },
            status: { type: 'string', enum: ['draft', 'published', 'archived'] },
            attemptCount: { type: 'integer' },
          },
        },

        // ── Quiz Attempt ──────────────────────────────────────
        QuizAttempt: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            quiz: { type: 'string' },
            score: { type: 'number', example: 8 },
            totalMarks: { type: 'number', example: 10 },
            percentage: { type: 'number', example: 80.0 },
            correctCount: { type: 'integer', example: 8 },
            wrongCount: { type: 'integer', example: 2 },
            timeTakenSeconds: { type: 'integer', example: 345 },
            isCompleted: { type: 'boolean' },
          },
        },

        // ── Leaderboard ───────────────────────────────────────
        LeaderboardEntry: {
          type: 'object',
          properties: {
            rank: { type: 'integer', example: 3 },
            user: { $ref: '#/components/schemas/User' },
            score: { type: 'number', example: 95 },
            totalQuizzes: { type: 'integer', example: 10 },
            periodType: { type: 'string', enum: ['daily', 'weekly', 'alltime'] },
          },
        },
      },
    },
    security: [{ BearerAuth: [] }],
    tags: [
      { name: 'Auth', description: 'Registration, login, tokens, password management' },
      { name: 'Users', description: 'User profile, bookmarks, reports, leaderboard' },
      { name: 'Categories', description: 'Exam category management' },
      { name: 'Current Affairs', description: 'Bilingual current affairs CRUD' },
      { name: 'Questions', description: 'MCQ question bank management' },
      { name: 'Quizzes', description: 'Quiz creation, attempts, scoring' },
      { name: 'Admin', description: 'Admin & user management (admin/superadmin)' },
      { name: 'Analytics', description: 'Platform analytics (superadmin only)' },
      { name: 'Upload', description: 'File uploads to S3' },
      { name: 'Notifications', description: 'FCM push notification management' },
      { name: 'Import', description: 'Bulk question import via CSV' },
    ],
  },
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
