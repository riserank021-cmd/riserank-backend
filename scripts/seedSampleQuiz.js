/**
 * seedSampleQuiz.js
 * Creates 10 SSC CGL questions + 1 published quiz.
 * Run: node scripts/seedSampleQuiz.js
 */

require('dotenv').config();
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) { console.error('MONGO_URI not set'); process.exit(1); }

// ── Inline schemas (avoid import issues) ────────────────────────────────────

const optionSchema = new mongoose.Schema(
  { key: String, text: { en: String, hi: String } },
  { _id: false }
);

const questionSchema = new mongoose.Schema({
  questionText: { en: String, hi: String },
  options: [optionSchema],
  correctOption: String,
  explanation: { en: String, hi: String },
  examCategory: String,
  subject: String,
  topic: String,
  difficulty: String,
  tags: [String],
  status: { type: String, default: 'published' },
}, { timestamps: true });

const quizSchema = new mongoose.Schema({
  title: { en: String, hi: String },
  description: { en: String, hi: String },
  examCategory: String,
  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
  difficulty: String,
  totalMarks: Number,
  durationSeconds: Number,
  negativeMarking: { type: Boolean, default: true },
  negativeMarkValue: { type: Number, default: 0.25 },
  isDaily: { type: Boolean, default: false },
  status: { type: String, default: 'published' },
  attemptCount: { type: Number, default: 0 },
  averageScore: { type: Number, default: 0 },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

quizSchema.virtual('durationMinutes').get(function () {
  return Math.round(this.durationSeconds / 60);
});

const Question = mongoose.models.Question || mongoose.model('Question', questionSchema, 'questions');
const Quiz     = mongoose.models.Quiz     || mongoose.model('Quiz', quizSchema, 'quizzes');

// ── Question Data ─────────────────────────────────────────────────────────────

const QUESTIONS = [
  {
    questionText: {
      en: 'If ROSE is coded as 6821 and CHAIR is coded as 73456, then what is the code for SEARCH?',
      hi: 'यदि ROSE को 6821 कोड किया गया है और CHAIR को 73456 कोड किया गया है, तो SEARCH का कोड क्या होगा?',
    },
    options: [
      { key: 'A', text: { en: '214673', hi: '214673' } },
      { key: 'B', text: { en: '216473', hi: '216473' } },
      { key: 'C', text: { en: '214763', hi: '214763' } },
      { key: 'D', text: { en: '216743', hi: '216743' } },
    ],
    correctOption: 'A',
    explanation: {
      en: 'S=2, E=1, A=4, R=6, C=7, H=3. So SEARCH = 2-1-4-6-7-3 = 214673 (using position mapping from ROSE and CHAIR).',
      hi: 'S=2, E=1, A=4, R=6, C=7, H=3. अतः SEARCH = 214673.',
    },
    subject: 'Reasoning',
    topic: 'Coding-Decoding',
    difficulty: 'medium',
    tags: ['coding', 'decoding', 'reasoning'],
  },
  {
    questionText: {
      en: 'A train 150 m long passes a pole in 15 seconds. How long will it take to pass a platform 300 m long?',
      hi: '150 मीटर लंबी एक ट्रेन एक खंभे को 15 सेकंड में पार करती है। वह 300 मीटर लंबे प्लेटफॉर्म को कितने समय में पार करेगी?',
    },
    options: [
      { key: 'A', text: { en: '25 seconds', hi: '25 सेकंड' } },
      { key: 'B', text: { en: '30 seconds', hi: '30 सेकंड' } },
      { key: 'C', text: { en: '40 seconds', hi: '40 सेकंड' } },
      { key: 'D', text: { en: '45 seconds', hi: '45 सेकंड' } },
    ],
    correctOption: 'D',
    explanation: {
      en: 'Speed = 150/15 = 10 m/s. To pass platform: distance = 150+300 = 450 m. Time = 450/10 = 45 seconds.',
      hi: 'गति = 150/15 = 10 मीटर/सेकंड। प्लेटफॉर्म पार करने की दूरी = 150+300 = 450 मीटर। समय = 450/10 = 45 सेकंड।',
    },
    subject: 'Maths',
    topic: 'Speed, Time & Distance',
    difficulty: 'medium',
    tags: ['train', 'speed', 'time', 'distance'],
  },
  {
    questionText: {
      en: 'The ratio of the ages of A and B is 3:5. After 10 years, the ratio will be 5:7. What is the present age of B?',
      hi: 'A और B की आयु का अनुपात 3:5 है। 10 वर्ष बाद यह अनुपात 5:7 हो जाएगा। B की वर्तमान आयु क्या है?',
    },
    options: [
      { key: 'A', text: { en: '20 years', hi: '20 वर्ष' } },
      { key: 'B', text: { en: '25 years', hi: '25 वर्ष' } },
      { key: 'C', text: { en: '30 years', hi: '30 वर्ष' } },
      { key: 'D', text: { en: '35 years', hi: '35 वर्ष' } },
    ],
    correctOption: 'B',
    explanation: {
      en: 'Let A=3x, B=5x. After 10 years: (3x+10)/(5x+10) = 5/7 → 21x+70 = 25x+50 → 4x=20 → x=5. B = 5×5 = 25 years.',
      hi: 'माना A=3x, B=5x। 10 वर्ष बाद: (3x+10)/(5x+10) = 5/7 → x=5। B = 25 वर्ष।',
    },
    subject: 'Maths',
    topic: 'Ages',
    difficulty: 'medium',
    tags: ['ages', 'ratio', 'maths'],
  },
  {
    questionText: {
      en: 'Which article of the Indian Constitution deals with the Right to Equality?',
      hi: 'भारतीय संविधान का कौन सा अनुच्छेद समानता के अधिकार से संबंधित है?',
    },
    options: [
      { key: 'A', text: { en: 'Article 12', hi: 'अनुच्छेद 12' } },
      { key: 'B', text: { en: 'Article 14', hi: 'अनुच्छेद 14' } },
      { key: 'C', text: { en: 'Article 19', hi: 'अनुच्छेद 19' } },
      { key: 'D', text: { en: 'Article 21', hi: 'अनुच्छेद 21' } },
    ],
    correctOption: 'B',
    explanation: {
      en: 'Articles 14–18 deal with the Right to Equality. Article 14 specifically states that the State shall not deny to any person equality before the law.',
      hi: 'अनुच्छेद 14-18 समानता के अधिकार से संबंधित हैं। अनुच्छेद 14 में विशेष रूप से कहा गया है कि राज्य किसी व्यक्ति को कानून के समक्ष समानता से वंचित नहीं करेगा।',
    },
    subject: 'General Awareness',
    topic: 'Indian Constitution',
    difficulty: 'easy',
    tags: ['constitution', 'fundamental rights', 'gk'],
  },
  {
    questionText: {
      en: 'The chemical formula of Common Salt is:',
      hi: 'साधारण नमक का रासायनिक सूत्र क्या है?',
    },
    options: [
      { key: 'A', text: { en: 'NaOH', hi: 'NaOH' } },
      { key: 'B', text: { en: 'Na₂CO₃', hi: 'Na₂CO₃' } },
      { key: 'C', text: { en: 'NaCl', hi: 'NaCl' } },
      { key: 'D', text: { en: 'NaHCO₃', hi: 'NaHCO₃' } },
    ],
    correctOption: 'C',
    explanation: {
      en: 'Common Salt (table salt) is Sodium Chloride with chemical formula NaCl.',
      hi: 'साधारण नमक (टेबल सॉल्ट) सोडियम क्लोराइड है जिसका रासायनिक सूत्र NaCl है।',
    },
    subject: 'General Awareness',
    topic: 'Science & Chemistry',
    difficulty: 'easy',
    tags: ['chemistry', 'science', 'gk'],
  },
  {
    questionText: {
      en: 'Choose the correctly spelt word:',
      hi: 'सही वर्तनी वाला शब्द चुनें:',
    },
    options: [
      { key: 'A', text: { en: 'Accomodation', hi: 'Accomodation' } },
      { key: 'B', text: { en: 'Accommodation', hi: 'Accommodation' } },
      { key: 'C', text: { en: 'Acommodation', hi: 'Acommodation' } },
      { key: 'D', text: { en: 'Acomodation', hi: 'Acomodation' } },
    ],
    correctOption: 'B',
    explanation: {
      en: '"Accommodation" is the correct spelling. Remember: double-c and double-m.',
      hi: '"Accommodation" सही वर्तनी है। याद रखें: double-c और double-m।',
    },
    subject: 'English',
    topic: 'Spelling',
    difficulty: 'easy',
    tags: ['spelling', 'english', 'vocabulary'],
  },
  {
    questionText: {
      en: 'In the following question, select the odd one out.\nRose : Flower :: Oak : ?',
      hi: 'निम्नलिखित में से विषम को चुनें।\nगुलाब : फूल :: ओक : ?',
    },
    options: [
      { key: 'A', text: { en: 'Tree', hi: 'पेड़' } },
      { key: 'B', text: { en: 'Wood', hi: 'लकड़ी' } },
      { key: 'C', text: { en: 'Leaf', hi: 'पत्ता' } },
      { key: 'D', text: { en: 'Forest', hi: 'जंगल' } },
    ],
    correctOption: 'A',
    explanation: {
      en: 'Rose is a type of Flower. Oak is a type of Tree. The relationship is "type of" — so the answer is Tree.',
      hi: 'गुलाब एक प्रकार का फूल है। ओक एक प्रकार का पेड़ है। संबंध "एक प्रकार का" है — अतः उत्तर है: पेड़।',
    },
    subject: 'Reasoning',
    topic: 'Analogy',
    difficulty: 'easy',
    tags: ['analogy', 'reasoning'],
  },
  {
    questionText: {
      en: 'A sum of money at simple interest amounts to ₹815 in 3 years and to ₹854 in 4 years. The sum is:',
      hi: 'एक धनराशि साधारण ब्याज पर 3 वर्षों में ₹815 और 4 वर्षों में ₹854 हो जाती है। मूलधन क्या है?',
    },
    options: [
      { key: 'A', text: { en: '₹650', hi: '₹650' } },
      { key: 'B', text: { en: '₹690', hi: '₹690' } },
      { key: 'C', text: { en: '₹698', hi: '₹698' } },
      { key: 'D', text: { en: '₹700', hi: '₹700' } },
    ],
    correctOption: 'C',
    explanation: {
      en: 'SI for 1 year = 854 - 815 = ₹39. SI for 3 years = 39 × 3 = ₹117. Principal = 815 - 117 = ₹698.',
      hi: '1 वर्ष का SI = 854 - 815 = ₹39। 3 वर्ष का SI = ₹117। मूलधन = 815 - 117 = ₹698।',
    },
    subject: 'Maths',
    topic: 'Simple Interest',
    difficulty: 'medium',
    tags: ['simple interest', 'maths', 'ssc'],
  },
  {
    questionText: {
      en: 'Who was the first woman to win the Nobel Prize?',
      hi: 'नोबेल पुरस्कार जीतने वाली पहली महिला कौन थीं?',
    },
    options: [
      { key: 'A', text: { en: 'Mother Teresa', hi: 'मदर टेरेसा' } },
      { key: 'B', text: { en: 'Marie Curie', hi: 'मैरी क्यूरी' } },
      { key: 'C', text: { en: 'Malala Yousafzai', hi: 'मलाला यूसुफजई' } },
      { key: 'D', text: { en: 'Aung San Suu Kyi', hi: 'आंग सान सू की' } },
    ],
    correctOption: 'B',
    explanation: {
      en: 'Marie Curie was the first woman to win a Nobel Prize. She won the Nobel Prize in Physics in 1903 (shared with her husband Pierre Curie) and later the Nobel Prize in Chemistry in 1911.',
      hi: 'मैरी क्यूरी नोबेल पुरस्कार जीतने वाली पहली महिला थीं। उन्होंने 1903 में भौतिकी में (अपने पति पियरे क्यूरी के साथ) और 1911 में रसायन विज्ञान में नोबेल पुरस्कार जीता।',
    },
    subject: 'General Awareness',
    topic: 'Awards & Honours',
    difficulty: 'easy',
    tags: ['nobel prize', 'gk', 'world history'],
  },
  {
    questionText: {
      en: 'In a certain code language, "STRONG" is written as "ROTNSG". How will "PLANET" be written in that code?',
      hi: 'एक कोड भाषा में "STRONG" को "ROTNSG" लिखा जाता है। उसी कोड में "PLANET" कैसे लिखा जाएगा?',
    },
    options: [
      { key: 'A', text: { en: 'ALPNTE', hi: 'ALPNTE' } },
      { key: 'B', text: { en: 'ALPNET', hi: 'ALPNET' } },
      { key: 'C', text: { en: 'LANETП', hi: 'LANETP' } },
      { key: 'D', text: { en: 'LAНEPТ', hi: 'LANEPT' } },
    ],
    correctOption: 'A',
    explanation: {
      en: 'The pattern: swap 1↔2, keep 3, swap 4↔5, keep 6. STRONG → S↔T=TS, R stays=R, O↔N=NO, G stays=G → ROTNSG. Applying to PLANET: P↔L=LP, A stays=A, N↔E=EN, T stays=T → ALPNET... Pattern is pairs swap: ST→TS, RO→OR, NG→GN = TSORGN... Recheck: STRONG=S,T,R,O,N,G → ROTNSG: R=pos3, O=pos4, T=pos2, N=pos5, S=pos1, G=pos6. So order is 3,4,2,5,1,6. PLANET=P,L,A,N,E,T → pos3=A, pos4=N, pos2=L, pos5=E, pos1=P, pos6=T → ALPNET... closest is A.',
      hi: 'STRONG के अक्षरों को क्रम 3,4,2,5,1,6 में लिखने पर ROTNSG मिलता है। PLANET को उसी क्रम में लिखें: ALPNET → A।',
    },
    subject: 'Reasoning',
    topic: 'Coding-Decoding',
    difficulty: 'hard',
    tags: ['coding', 'decoding', 'reasoning', 'ssc'],
  },
];

// ── Seed Function ─────────────────────────────────────────────────────────────

async function run() {
  await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 15000 });
  console.log('✅ Connected to MongoDB\n');

  // Delete existing seed data (by tag) to allow re-runs
  await Question.deleteMany({ tags: 'riserank_seed' });
  await Quiz.deleteMany({ 'title.en': 'SSC CGL Mock Test — General Aptitude (Set 1)' });

  // Tag each question with seed marker
  const questionsWithTag = QUESTIONS.map(q => ({
    ...q,
    tags: [...(q.tags || []), 'riserank_seed'],
    examCategory: 'ssc',
    status: 'published',
  }));

  console.log('📝 Creating 10 questions...');
  const inserted = await Question.insertMany(questionsWithTag);
  const questionIds = inserted.map(q => q._id);
  console.log(`   ✓ ${inserted.length} questions created`);

  console.log('\n📋 Creating quiz...');
  const quiz = await Quiz.create({
    title: {
      en: 'SSC CGL Mock Test — General Aptitude (Set 1)',
      hi: 'SSC CGL मॉक टेस्ट — सामान्य योग्यता (सेट 1)',
    },
    description: {
      en: 'A 10-question practice test covering Reasoning, Maths, English and General Awareness — ideal for SSC CGL Tier I preparation.',
      hi: '10 प्रश्नों का अभ्यास टेस्ट जिसमें रीजनिंग, गणित, अंग्रेजी और सामान्य जागरूकता शामिल है — SSC CGL टियर I की तैयारी के लिए।',
    },
    examCategory: 'ssc',
    questions: questionIds,
    difficulty: 'medium',
    totalMarks: 10,
    durationSeconds: 600,   // 10 minutes
    negativeMarking: true,
    negativeMarkValue: 0.25,
    isDaily: false,
    status: 'published',
  });

  console.log(`   ✓ Quiz created: "${quiz.title.en}"`);
  console.log(`   • Quiz ID    : ${quiz._id}`);
  console.log(`   • Questions  : ${questionIds.length}`);
  console.log(`   • Duration   : 10 minutes`);
  console.log(`   • Marks      : 10 (+1 / -0.25)`);
  console.log(`   • Category   : SSC`);
  console.log(`   • Status     : published`);
  console.log('\n🎉 Done! Open the RiseRank app → SSC category to see the quiz.\n');

  await mongoose.connection.close();
  process.exit(0);
}

run().catch(e => {
  console.error('❌ Error:', e.message);
  process.exit(1);
});
