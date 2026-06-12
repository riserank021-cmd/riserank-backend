/**
 * backfill-hindi.js
 * Translates all CurrentAffair documents that are missing Hindi
 * using the free Google Translate API.
 *
 * Usage:
 *   cd ~/Desktop/RiseRank/riserank-backend
 *   node scripts/backfill-hindi.js
 */

require('dotenv').config({ path: '.env' });
const mongoose = require('mongoose');
const https = require('https');

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

// ── Free Google Translate ─────────────────────────────────────────────────────
function translate(text, to = 'hi') {
  return new Promise((resolve) => {
    if (!text?.trim()) return resolve('');
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${to}&dt=t&q=${encodeURIComponent(text)}`;
    https.get(url, (res) => {
      let body = '';
      res.on('data', (c) => (body += c));
      res.on('end', () => {
        try {
          const data = JSON.parse(body);
          resolve(data[0].map((s) => s[0]).join(''));
        } catch { resolve(''); }
      });
    }).on('error', () => resolve(''));
  });
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  const CurrentAffair = require('../src/models/CurrentAffair');

  // Find articles missing Hindi title, summary, or body
  const articles = await CurrentAffair.find({
    $or: [
      { 'title.hi': { $in: [null, ''] } },
      { 'summary.hi': { $in: [null, ''] } },
      { 'body.hi': { $in: [null, ''] } },
    ],
  }).lean();

  console.log(`Found ${articles.length} articles needing Hindi translation`);

  let done = 0;
  for (const article of articles) {
    const updates = {};

    if (!article.title?.hi) {
      updates['title.hi'] = await translate(article.title?.en);
    }
    if (!article.summary?.hi) {
      updates['summary.hi'] = await translate(article.summary?.en);
    }
    if (!article.body?.hi) {
      updates['body.hi'] = await translate(article.body?.en);
    }

    if (Object.keys(updates).length > 0) {
      await CurrentAffair.updateOne({ _id: article._id }, { $set: updates });
      done++;
      console.log(`[${done}/${articles.length}] ✓ ${article.title?.en?.slice(0, 60)}`);
    }

    // Small delay to avoid rate limiting
    await new Promise((r) => setTimeout(r, 300));
  }

  console.log(`\nDone! Updated ${done} articles with Hindi translations.`);
  await mongoose.disconnect();
}

main().catch((err) => { console.error(err); process.exit(1); });
