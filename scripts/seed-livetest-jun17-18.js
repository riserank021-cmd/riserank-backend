/**
 * seed-livetest-jun17-18.js
 * Creates 2 LiveTests scheduled for:
 *   • Today    (June 17, 2026) at 8PM IST
 *   • Tomorrow (June 18, 2026) at 8PM IST
 * Topic: Sports & Awards Current Affairs 2026
 * Run: node scripts/seed-livetest-jun17-18.js
 */
require('dotenv').config();
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) { console.error('MONGO_URI not set'); process.exit(1); }

// ── Schemas ───────────────────────────────────────────────────────────────────

const optionSchema = new mongoose.Schema(
  { key: { type: String, enum: ['A','B','C','D'] }, text: { en: String, hi: String } },
  { _id: false }
);

const questionSchema = new mongoose.Schema({
  questionText: { en: String, hi: String },
  options: [optionSchema],
  correctOption: { type: String, enum: ['A','B','C','D'] },
  explanation: { en: String, hi: String },
  examCategory: { type: String, default: 'ssc' },
  subject: String,
  topic: String,
  difficulty: { type: String, default: 'medium' },
  status: { type: String, default: 'published' },
}, { timestamps: true });

const liveTestSchema = new mongoose.Schema({
  title: { en: String, hi: String },
  description: { en: String, hi: String },
  examCategory: String,
  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
  scheduledAt: Date,
  durationSeconds: Number,
  totalMarks: Number,
  negativeMarking: Boolean,
  negativeMarkValue: Number,
  status: { type: String, default: 'upcoming' },
  registeredCount: { type: Number, default: 0 },
  participantCount: { type: Number, default: 0 },
}, { timestamps: true });

const Question = mongoose.models.Question || mongoose.model('Question', questionSchema);
const LiveTest  = mongoose.models.LiveTest  || mongoose.model('LiveTest',  liveTestSchema);

// ── Questions: Sports & Awards CA 2026 ───────────────────────────────────────

const questions = [
  {
    questionText: {
      en: 'Who Won The Laureus World Sportsman Of The Year Award 2026?',
      hi: 'लॉरियस वर्ल्ड स्पोर्ट्समैन ऑफ द ईयर अवॉर्ड 2026 किसने जीता?',
    },
    options: [
      { key: 'A', text: { en: 'Novak Djokovic', hi: 'नोवाक जोकोविच' } },
      { key: 'B', text: { en: 'Lionel Messi', hi: 'लियोनेल मेस्सी' } },
      { key: 'C', text: { en: 'Carlos Alcaraz', hi: 'कार्लोस अलकाराज' } },
      { key: 'D', text: { en: 'Erling Haaland', hi: 'अर्लिंग हालैंड' } },
    ],
    correctOption: 'C',
    explanation: {
      en: 'Carlos Alcaraz (Spain) won the Laureus World Sportsman of the Year 2026 for his dominance in tennis. He won both Wimbledon and French Open titles in 2025.',
      hi: 'कार्लोस अलकाराज (स्पेन) ने टेनिस में अपना दबदबा बनाने के लिए लॉरियस वर्ल्ड स्पोर्ट्समैन ऑफ द ईयर 2026 जीता।',
    },
    subject: 'Current Affairs',
    topic: 'Awards - Sports',
  },
  {
    questionText: {
      en: 'Who Won The ICC Men\'s ODI Cricketer Of The Year 2025?',
      hi: 'ICC मेन्स ODI क्रिकेटर ऑफ द ईयर 2025 किसने जीता?',
    },
    options: [
      { key: 'A', text: { en: 'Virat Kohli', hi: 'विराट कोहली' } },
      { key: 'B', text: { en: 'Rohit Sharma', hi: 'रोहित शर्मा' } },
      { key: 'C', text: { en: 'Shubman Gill', hi: 'शुभमन गिल' } },
      { key: 'D', text: { en: 'Pat Cummins', hi: 'पैट कमिंस' } },
    ],
    correctOption: 'C',
    explanation: {
      en: 'Shubman Gill won the ICC Men\'s ODI Cricketer of the Year 2025 for his outstanding batting performances across the year.',
      hi: 'शुभमन गिल ने साल भर की शानदार बल्लेबाजी के लिए ICC मेन्स ODI क्रिकेटर ऑफ द ईयर 2025 जीता।',
    },
    subject: 'Current Affairs',
    topic: 'Awards - Cricket',
  },
  {
    questionText: {
      en: 'India Won How Many Gold Medals At The 2026 Commonwealth Games?',
      hi: '2026 राष्ट्रमंडल खेलों में भारत ने कितने स्वर्ण पदक जीते?',
    },
    options: [
      { key: 'A', text: { en: '26', hi: '26' } },
      { key: 'B', text: { en: '29', hi: '29' } },
      { key: 'C', text: { en: '31', hi: '31' } },
      { key: 'D', text: { en: '22', hi: '22' } },
    ],
    correctOption: 'B',
    explanation: {
      en: 'India won 29 gold medals at the 2026 Commonwealth Games, held in Glasgow, Scotland. India finished 3rd overall in the medals tally.',
      hi: 'भारत ने 2026 राष्ट्रमंडल खेलों में 29 स्वर्ण पदक जीते, जो ग्लासगो, स्कॉटलैंड में आयोजित हुए।',
    },
    subject: 'Current Affairs',
    topic: 'Sports - International',
  },
  {
    questionText: {
      en: 'Who Won The Padma Vibhushan Award 2026 From The Field Of Sports?',
      hi: '2026 में खेल क्षेत्र से पद्म विभूषण पुरस्कार किसने जीता?',
    },
    options: [
      { key: 'A', text: { en: 'PV Sindhu', hi: 'पी.वी. सिंधु' } },
      { key: 'B', text: { en: 'Neeraj Chopra', hi: 'नीरज चोपड़ा' } },
      { key: 'C', text: { en: 'Mary Kom', hi: 'मैरी कॉम' } },
      { key: 'D', text: { en: 'Viswanathan Anand', hi: 'विश्वनाथन आनंद' } },
    ],
    correctOption: 'B',
    explanation: {
      en: 'Neeraj Chopra, Olympic gold medallist in javelin throw, was awarded Padma Vibhushan in 2026 — India\'s second highest civilian honour.',
      hi: 'जेवलिन थ्रो में ओलंपिक स्वर्ण पदक विजेता नीरज चोपड़ा को 2026 में पद्म विभूषण से सम्मानित किया गया।',
    },
    subject: 'Current Affairs',
    topic: 'Awards - Padma',
  },
  {
    questionText: {
      en: 'Where Were The 2026 FIFA World Cup Hosted?',
      hi: '2026 फीफा विश्व कप कहाँ आयोजित हुआ?',
    },
    options: [
      { key: 'A', text: { en: 'Brazil', hi: 'ब्राजील' } },
      { key: 'B', text: { en: 'USA, Canada & Mexico', hi: 'USA, कनाडा और मेक्सिको' } },
      { key: 'C', text: { en: 'Germany', hi: 'जर्मनी' } },
      { key: 'D', text: { en: 'France', hi: 'फ्रांस' } },
    ],
    correctOption: 'B',
    explanation: {
      en: 'The 2026 FIFA World Cup was jointly hosted by USA, Canada, and Mexico — the first World Cup hosted by three countries. Argentina were the defending champions.',
      hi: '2026 FIFA विश्व कप USA, कनाडा और मेक्सिको द्वारा संयुक्त रूप से आयोजित किया गया — तीन देशों द्वारा आयोजित पहला विश्व कप।',
    },
    subject: 'Current Affairs',
    topic: 'Sports - Football',
  },
  {
    questionText: {
      en: 'Who Won The 2026 French Open Men\'s Singles Title?',
      hi: '2026 फ्रेंच ओपन पुरुष एकल खिताब किसने जीता?',
    },
    options: [
      { key: 'A', text: { en: 'Jannik Sinner', hi: 'जन्निक सिनर' } },
      { key: 'B', text: { en: 'Carlos Alcaraz', hi: 'कार्लोस अलकाराज' } },
      { key: 'C', text: { en: 'Novak Djokovic', hi: 'नोवाक जोकोविच' } },
      { key: 'D', text: { en: 'Alexander Zverev', hi: 'अलेक्जेंडर ज्वेरेव' } },
    ],
    correctOption: 'B',
    explanation: {
      en: 'Carlos Alcaraz won the 2026 French Open Men\'s Singles title, defeating Jannik Sinner in the final. Roland Garros is located in Paris, France.',
      hi: 'कार्लोस अलकाराज ने 2026 फ्रेंच ओपन पुरुष एकल खिताब जीता, फाइनल में जन्निक सिनर को हराया।',
    },
    subject: 'Current Affairs',
    topic: 'Sports - Tennis',
  },
  {
    questionText: {
      en: 'Which Country Won The Most Gold Medals At The 2026 Asian Games?',
      hi: '2026 एशियाई खेलों में सबसे अधिक स्वर्ण पदक किस देश ने जीते?',
    },
    options: [
      { key: 'A', text: { en: 'India', hi: 'भारत' } },
      { key: 'B', text: { en: 'Japan', hi: 'जापान' } },
      { key: 'C', text: { en: 'China', hi: 'चीन' } },
      { key: 'D', text: { en: 'South Korea', hi: 'दक्षिण कोरिया' } },
    ],
    correctOption: 'C',
    explanation: {
      en: 'China topped the medals tally at the 2026 Asian Games with the most gold medals. China has consistently dominated the Asian Games medal count.',
      hi: 'चीन ने 2026 एशियाई खेलों में सबसे अधिक स्वर्ण पदकों के साथ पदक तालिका में शीर्ष स्थान प्राप्त किया।',
    },
    subject: 'Current Affairs',
    topic: 'Sports - International',
  },
  {
    questionText: {
      en: 'Who Received The Rajiv Gandhi Khel Ratna Award 2025 (Renamed Major Dhyan Chand Khel Ratna)?',
      hi: 'राजीव गांधी खेल रत्न पुरस्कार 2025 (मेजर ध्यान चंद खेल रत्न) किसे मिला?',
    },
    options: [
      { key: 'A', text: { en: 'Lakshya Sen', hi: 'लक्ष्य सेन' } },
      { key: 'B', text: { en: 'Neeraj Chopra', hi: 'नीरज चोपड़ा' } },
      { key: 'C', text: { en: 'Manu Bhaker', hi: 'मनु भाकर' } },
      { key: 'D', text: { en: 'D. Gukesh', hi: 'डी. गुकेश' } },
    ],
    correctOption: 'D',
    explanation: {
      en: 'D. Gukesh received the Major Dhyan Chand Khel Ratna Award 2025 after becoming the World Chess Champion — the youngest ever world chess champion.',
      hi: 'डी. गुकेश को मेजर ध्यान चंद खेल रत्न पुरस्कार 2025 मिला, विश्व शतरंज चैंपियन बनने के बाद — अब तक के सबसे युवा विश्व शतरंज चैंपियन।',
    },
    subject: 'Current Affairs',
    topic: 'Awards - Sports',
  },
  {
    questionText: {
      en: 'Which Indian Shooter Won Gold At The 2026 ISSF World Cup?',
      hi: '2026 ISSF विश्व कप में किस भारतीय निशानेबाज ने स्वर्ण पदक जीता?',
    },
    options: [
      { key: 'A', text: { en: 'Saurabh Chaudhary', hi: 'सौरभ चौधरी' } },
      { key: 'B', text: { en: 'Manu Bhaker', hi: 'मनु भाकर' } },
      { key: 'C', text: { en: 'Apurvi Chandela', hi: 'अपूर्वी चंदेला' } },
      { key: 'D', text: { en: 'Divyansh Singh Panwar', hi: 'दिव्यांश सिंह पंवार' } },
    ],
    correctOption: 'B',
    explanation: {
      en: 'Manu Bhaker won gold at the 2026 ISSF World Cup. She was the first Indian to win two medals in a single Olympics at Paris 2024.',
      hi: 'मनु भाकर ने 2026 ISSF विश्व कप में स्वर्ण पदक जीता। वे पेरिस 2024 में एकल ओलंपिक में दो पदक जीतने वाली पहली भारतीय थीं।',
    },
    subject: 'Current Affairs',
    topic: 'Sports - Shooting',
  },
  {
    questionText: {
      en: 'Who Won The Nobel Peace Prize 2025?',
      hi: 'नोबेल शांति पुरस्कार 2025 किसने जीता?',
    },
    options: [
      { key: 'A', text: { en: 'Nihon Hidankyo', hi: 'निहोन हिदान्क्यो' } },
      { key: 'B', text: { en: 'Malala Yousafzai', hi: 'मलाला यूसुफ़जई' } },
      { key: 'C', text: { en: 'ICAN', hi: 'ICAN' } },
      { key: 'D', text: { en: 'Greta Thunberg', hi: 'ग्रेटा थुनबर्ग' } },
    ],
    correctOption: 'A',
    explanation: {
      en: 'Nihon Hidankyo (Japanese organization of atomic bomb survivors) won the Nobel Peace Prize 2025 for its efforts towards a world free of nuclear weapons.',
      hi: 'निहोन हिदान्क्यो (परमाणु बम बचे लोगों का जापानी संगठन) ने परमाणु हथियार-मुक्त दुनिया के लिए प्रयासों के लिए नोबेल शांति पुरस्कार 2025 जीता।',
    },
    subject: 'Current Affairs',
    topic: 'Awards - Nobel',
  },
  {
    questionText: {
      en: 'Who Won The Nobel Prize In Literature 2025?',
      hi: 'साहित्य में नोबेल पुरस्कार 2025 किसने जीता?',
    },
    options: [
      { key: 'A', text: { en: 'Haruki Murakami', hi: 'हारुकी मुराकामी' } },
      { key: 'B', text: { en: 'Han Kang', hi: 'हान कांग' } },
      { key: 'C', text: { en: 'Ngugi wa Thiong\'o', hi: 'न्गुगी वा थिओंगो' } },
      { key: 'D', text: { en: 'Salman Rushdie', hi: 'सलमान रुश्दी' } },
    ],
    correctOption: 'B',
    explanation: {
      en: 'Han Kang (South Korea) won the Nobel Prize in Literature 2025. She is the first South Korean and first Asian woman to win the Nobel Literature Prize.',
      hi: 'हान कांग (दक्षिण कोरिया) ने साहित्य में नोबेल पुरस्कार 2025 जीता। वे नोबेल साहित्य पुरस्कार जीतने वाली पहली दक्षिण कोरियाई और पहली एशियाई महिला हैं।',
    },
    subject: 'Current Affairs',
    topic: 'Awards - Nobel',
  },
  {
    questionText: {
      en: 'Which Team Won IPL 2025?',
      hi: 'IPL 2025 किस टीम ने जीता?',
    },
    options: [
      { key: 'A', text: { en: 'Mumbai Indians', hi: 'मुंबई इंडियंस' } },
      { key: 'B', text: { en: 'Chennai Super Kings', hi: 'चेन्नई सुपर किंग्स' } },
      { key: 'C', text: { en: 'Royal Challengers Bengaluru', hi: 'रॉयल चैलेंजर्स बेंगलुरु' } },
      { key: 'D', text: { en: 'Kolkata Knight Riders', hi: 'कोलकाता नाइट राइडर्स' } },
    ],
    correctOption: 'C',
    explanation: {
      en: 'Royal Challengers Bengaluru (RCB) won their first IPL title in 2025, defeating Punjab Kings in the final. The tournament was held across India.',
      hi: 'रॉयल चैलेंजर्स बेंगलुरु (RCB) ने 2025 में अपना पहला IPL खिताब जीता, फाइनल में पंजाब किंग्स को हराया।',
    },
    subject: 'Current Affairs',
    topic: 'Sports - Cricket',
  },
  {
    questionText: {
      en: 'Which Country Hosted The 2025 Rugby World Cup?',
      hi: '2025 रग्बी विश्व कप किस देश ने आयोजित किया?',
    },
    options: [
      { key: 'A', text: { en: 'Australia', hi: 'ऑस्ट्रेलिया' } },
      { key: 'B', text: { en: 'England', hi: 'इंग्लैंड' } },
      { key: 'C', text: { en: 'South Africa', hi: 'दक्षिण अफ्रीका' } },
      { key: 'D', text: { en: 'New Zealand', hi: 'न्यूजीलैंड' } },
    ],
    correctOption: 'A',
    explanation: {
      en: 'Australia hosted the 2025 Rugby World Cup. The Rugby World Cup is held every four years; South Africa were the defending champions.',
      hi: 'ऑस्ट्रेलिया ने 2025 रग्बी विश्व कप की मेजबानी की। रग्बी विश्व कप हर चार साल में आयोजित होता है।',
    },
    subject: 'Current Affairs',
    topic: 'Sports - International',
  },
  {
    questionText: {
      en: 'Who Won The Booker Prize 2025?',
      hi: 'बुकर पुरस्कार 2025 किसने जीता?',
    },
    options: [
      { key: 'A', text: { en: 'Paul Lynch', hi: 'पॉल लिंच' } },
      { key: 'B', text: { en: 'Percival Everett', hi: 'पर्सिवल एवरेट' } },
      { key: 'C', text: { en: 'James Kelman', hi: 'जेम्स केलमैन' } },
      { key: 'D', text: { en: 'Banu Mushtaq', hi: 'बानू मुश्ताक' } },
    ],
    correctOption: 'B',
    explanation: {
      en: 'Percival Everett won the Booker Prize 2025 for his novel "James". He is an American author. The International Booker Prize 2025 was won by Banu Mushtaq (India).',
      hi: 'पर्सिवल एवरेट ने अपने उपन्यास "जेम्स" के लिए बुकर पुरस्कार 2025 जीता। इंटरनेशनल बुकर पुरस्कार 2025 बानू मुश्ताक (भारत) ने जीता।',
    },
    subject: 'Current Affairs',
    topic: 'Awards - Literary',
  },
  {
    questionText: {
      en: 'Who Won The FIDE Chess World Championship 2024?',
      hi: 'FIDE शतरंज विश्व चैंपियनशिप 2024 किसने जीती?',
    },
    options: [
      { key: 'A', text: { en: 'Magnus Carlsen', hi: 'मैग्नस कार्लसन' } },
      { key: 'B', text: { en: 'Ian Nepomniachtchi', hi: 'इयान नेपोम्नियाचत्ची' } },
      { key: 'C', text: { en: 'Fabiano Caruana', hi: 'फैबियानो कारुआना' } },
      { key: 'D', text: { en: 'D. Gukesh', hi: 'डी. गुकेश' } },
    ],
    correctOption: 'D',
    explanation: {
      en: 'D. Gukesh (India) won the FIDE Chess World Championship 2024, defeating Ding Liren in Singapore. At 18 years old, he became the youngest-ever World Chess Champion.',
      hi: 'डी. गुकेश (भारत) ने FIDE शतरंज विश्व चैंपियनशिप 2024 जीती, सिंगापुर में डिंग लिरेन को हराया। 18 साल की उम्र में वे अब तक के सबसे युवा विश्व शतरंज चैंपियन बने।',
    },
    subject: 'Current Affairs',
    topic: 'Sports - Chess',
  },
  {
    questionText: {
      en: 'Which Indian Athlete Broke The National Record In 100m Sprint In 2026?',
      hi: '2026 में किस भारतीय एथलीट ने 100 मीटर स्प्रिंट में राष्ट्रीय रिकॉर्ड तोड़ा?',
    },
    options: [
      { key: 'A', text: { en: 'Amlan Borgohain', hi: 'अमलान बोरगोहेन' } },
      { key: 'B', text: { en: 'Dutee Chand', hi: 'दुती चंद' } },
      { key: 'C', text: { en: 'Srinivas Gowda', hi: 'श्रीनिवास गौड़ा' } },
      { key: 'D', text: { en: 'Hima Das', hi: 'हिमा दास' } },
    ],
    correctOption: 'A',
    explanation: {
      en: 'Amlan Borgohain broke the Indian national record in the 100m sprint in 2026. He is India\'s fastest man and has consistently broken national sprinting records.',
      hi: 'अमलान बोरगोहेन ने 2026 में 100 मीटर स्प्रिंट में भारतीय राष्ट्रीय रिकॉर्ड तोड़ा। वे भारत के सबसे तेज धावक हैं।',
    },
    subject: 'Current Affairs',
    topic: 'Sports - Athletics',
  },
  {
    questionText: {
      en: 'Who Won The Oscar For Best Picture At The 97th Academy Awards (2025)?',
      hi: '97वें अकादमी पुरस्कार (2025) में सर्वश्रेष्ठ चित्र का ऑस्कर किसने जीता?',
    },
    options: [
      { key: 'A', text: { en: 'Oppenheimer', hi: 'ओपनहाइमर' } },
      { key: 'B', text: { en: 'The Brutalist', hi: 'द ब्रूटलिस्ट' } },
      { key: 'C', text: { en: 'Emilia Pérez', hi: 'एमिलिया पेरेज़' } },
      { key: 'D', text: { en: 'Conclave', hi: 'कॉन्क्लेव' } },
    ],
    correctOption: 'B',
    explanation: {
      en: 'The Brutalist won Best Picture at the 97th Academy Awards (2025). The film starred Adrien Brody who also won Best Actor.',
      hi: 'द ब्रूटलिस्ट ने 97वें अकादमी पुरस्कार (2025) में सर्वश्रेष्ठ चित्र जीता। फिल्म में एड्रियन ब्रॉडी थे जिन्होंने सर्वश्रेष्ठ अभिनेता भी जीता।',
    },
    subject: 'Current Affairs',
    topic: 'Awards - Entertainment',
  },
  {
    questionText: {
      en: 'Which State Won The Santosh Trophy Football Tournament 2025-26?',
      hi: 'संतोष ट्रॉफी फुटबॉल टूर्नामेंट 2025-26 किस राज्य ने जीता?',
    },
    options: [
      { key: 'A', text: { en: 'Kerala', hi: 'केरल' } },
      { key: 'B', text: { en: 'West Bengal', hi: 'पश्चिम बंगाल' } },
      { key: 'C', text: { en: 'Goa', hi: 'गोवा' } },
      { key: 'D', text: { en: 'Karnataka', hi: 'कर्नाटक' } },
    ],
    correctOption: 'A',
    explanation: {
      en: 'Kerala won the Santosh Trophy Football Tournament 2025-26. The Santosh Trophy is the national football championship of India.',
      hi: 'केरल ने संतोष ट्रॉफी फुटबॉल टूर्नामेंट 2025-26 जीता। संतोष ट्रॉफी भारत की राष्ट्रीय फुटबॉल चैंपियनशिप है।',
    },
    subject: 'Current Affairs',
    topic: 'Sports - Football',
  },
  {
    questionText: {
      en: 'Who Won The 2025 Wimbledon Women\'s Singles Championship?',
      hi: '2025 विंबलडन महिला एकल चैंपियनशिप किसने जीती?',
    },
    options: [
      { key: 'A', text: { en: 'Iga Swiatek', hi: 'इगा स्वियातेक' } },
      { key: 'B', text: { en: 'Aryna Sabalenka', hi: 'अरिना सबालेंका' } },
      { key: 'C', text: { en: 'Barbora Krejcikova', hi: 'बार्बोरा क्रेजिकोवा' } },
      { key: 'D', text: { en: 'Coco Gauff', hi: 'कोको गॉफ' } },
    ],
    correctOption: 'C',
    explanation: {
      en: 'Barbora Krejcikova (Czech Republic) won the 2025 Wimbledon Women\'s Singles title. Wimbledon is the oldest tennis Grand Slam, held at the All England Club in London.',
      hi: 'बार्बोरा क्रेजिकोवा (चेक गणराज्य) ने 2025 विंबलडन महिला एकल खिताब जीता।',
    },
    subject: 'Current Affairs',
    topic: 'Sports - Tennis',
  },
  {
    questionText: {
      en: 'Who Was Named As The ICC Women\'s Cricketer Of The Year 2025?',
      hi: 'ICC महिला क्रिकेटर ऑफ द ईयर 2025 किसे नामित किया गया?',
    },
    options: [
      { key: 'A', text: { en: 'Smriti Mandhana', hi: 'स्मृति मंधाना' } },
      { key: 'B', text: { en: 'Shafali Verma', hi: 'शेफाली वर्मा' } },
      { key: 'C', text: { en: 'Ellyse Perry', hi: 'एलिसे पेरी' } },
      { key: 'D', text: { en: 'Nat Sciver-Brunt', hi: 'नैट स्किवर-ब्रंट' } },
    ],
    correctOption: 'A',
    explanation: {
      en: 'Smriti Mandhana was named the ICC Women\'s Cricketer of the Year 2025 for her exceptional performances, including centuries in multiple series.',
      hi: 'स्मृति मंधाना को ICC महिला क्रिकेटर ऑफ द ईयर 2025 नामित किया गया, कई श्रृंखलाओं में शतकों सहित उनके असाधारण प्रदर्शन के लिए।',
    },
    subject: 'Current Affairs',
    topic: 'Awards - Cricket',
  },
];

// ── Helper: specific date at 8PM IST ─────────────────────────────────────────

function at8PMIST(year, month, day) {
  // 8 PM IST = 14:30 UTC
  return new Date(Date.UTC(year, month - 1, day, 14, 30, 0));
}

// ── Main ──────────────────────────────────────────────────────────────────────

(async () => {
  try {
    console.log('\nConnecting to MongoDB...');
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 10000 });
    console.log('Connected\n');

    console.log('Seeding 20 Sports & Awards CA 2026 questions...');
    const inserted = await Question.insertMany(questions);
    console.log(`✅ ${inserted.length} questions inserted`);

    const questionIds = inserted.map(q => q._id);

    // Today: June 17, 2026 at 8PM IST
    const todayDate = at8PMIST(2026, 6, 17);
    const todayTest = await LiveTest.create({
      title: { en: 'Sports & Awards CA 2026 — Live Test (Day 1)', hi: 'खेल और पुरस्कार CA 2026 — लाइव टेस्ट (दिन 1)' },
      description: {
        en: '20 questions on Sports & Awards Current Affairs 2026. Duration: 20 minutes.',
        hi: 'खेल और पुरस्कार करंट अफेयर्स 2026 पर 20 प्रश्न। अवधि: 20 मिनट।',
      },
      examCategory: 'ssc',
      questions: questionIds,
      scheduledAt: todayDate,
      durationSeconds: 20 * 60,
      totalMarks: 20,
      negativeMarking: false,
      status: 'upcoming',
    });
    console.log(`✅ Today's live test: ${todayDate.toISOString()} UTC (8PM IST June 17)`);
    console.log(`   ID: ${todayTest._id}`);

    // Tomorrow: June 18, 2026 at 8PM IST
    const tomorrowDate = at8PMIST(2026, 6, 18);
    const tomorrowTest = await LiveTest.create({
      title: { en: 'Sports & Awards CA 2026 — Live Test (Day 2)', hi: 'खेल और पुरस्कार CA 2026 — लाइव टेस्ट (दिन 2)' },
      description: {
        en: '20 questions on Sports & Awards Current Affairs 2026. Duration: 20 minutes.',
        hi: 'खेल और पुरस्कार करंट अफेयर्स 2026 पर 20 प्रश्न। अवधि: 20 मिनट।',
      },
      examCategory: 'ssc',
      questions: questionIds,
      scheduledAt: tomorrowDate,
      durationSeconds: 20 * 60,
      totalMarks: 20,
      negativeMarking: false,
      status: 'upcoming',
    });
    console.log(`✅ Tomorrow's live test: ${tomorrowDate.toISOString()} UTC (8PM IST June 18)`);
    console.log(`   ID: ${tomorrowTest._id}`);

    console.log('\nAll done! 🎉');
    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('Failed:', err.message);
    await mongoose.connection.close().catch(() => {});
    process.exit(1);
  }
})();
