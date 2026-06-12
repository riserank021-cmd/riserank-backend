/**
 * seed-appointment-livetest.js
 * Seeds 20 Appointment CA 2026 questions + creates 2 LiveTests
 * (next Saturday 8PM IST + next Sunday 8PM IST)
 * Run: node scripts/seed-appointment-livetest.js
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
const LiveTest = mongoose.models.LiveTest || mongoose.model('LiveTest', liveTestSchema);

// ── Questions ─────────────────────────────────────────────────────────────────

const questions = [
  {
    questionText: {
      en: 'Who Has Been Appointed As New Chief Of Defence Staff (CDS) of India?',
      hi: 'नए चीफ ऑफ डिफेंस स्टाफ (CDS) के रूप में किसे नियुक्त किया गया है?',
    },
    options: [
      { key: 'A', text: { en: 'N. S. Raja Subramani', hi: 'एन. एस. राजा सुब्रमणि' } },
      { key: 'B', text: { en: 'Anil Chauhan', hi: 'अनिल चौहान' } },
      { key: 'C', text: { en: 'Upendra Dwivedi', hi: 'उपेंद्र द्विवेदी' } },
      { key: 'D', text: { en: 'Krishna Swaminathan', hi: 'कृष्ण स्वामीनाथन' } },
    ],
    correctOption: 'A',
    explanation: {
      en: 'Lt. General N. S. Raja Subramani became the 3rd Chief of Defence Staff (CDS) of India, replacing General Anil Chauhan.',
      hi: 'लेफ्टिनेंट जनरल एन. एस. राजा सुब्रमणि भारत के तीसरे चीफ ऑफ डिफेंस स्टाफ (CDS) बने, उन्होंने जनरल अनिल चौहान की जगह ली।',
    },
    subject: 'Current Affairs',
    topic: 'Appointments - Defence',
  },
  {
    questionText: {
      en: 'Who Has Been Appointed As Vice Chairman of NITI Aayog?',
      hi: 'नीति आयोग के उपाध्यक्ष के रूप में किसे नियुक्त किया गया है?',
    },
    options: [
      { key: 'A', text: { en: 'Suman Bery', hi: 'सुमन बेरी' } },
      { key: 'B', text: { en: 'B.V.R. Subrahmanyam', hi: 'बी.वी.आर. सुब्रह्मण्यम' } },
      { key: 'C', text: { en: 'Nidhi Chhibber', hi: 'निधि छिब्बर' } },
      { key: 'D', text: { en: 'Ashok Kumar Lahiri', hi: 'अशोक कुमार लाहिड़ी' } },
    ],
    correctOption: 'D',
    explanation: {
      en: 'Ashok Kumar Lahiri was appointed as the Vice Chairman of NITI Aayog. NITI Aayog was founded on 1 Jan 2015, replacing the Planning Commission. Its Chairman is PM Narendra Modi.',
      hi: 'अशोक कुमार लाहिड़ी को नीति आयोग के उपाध्यक्ष के रूप में नियुक्त किया गया। नीति आयोग की स्थापना 1 जनवरी 2015 को हुई थी।',
    },
    subject: 'Current Affairs',
    topic: 'Appointments - Government',
  },
  {
    questionText: {
      en: 'Who Became The Vice Chief Of Army Staff In 2026?',
      hi: '2026 में सेना के उप प्रमुख कौन बने?',
    },
    options: [
      { key: 'A', text: { en: 'Dhiraj Seth', hi: 'धीरज सेठ' } },
      { key: 'B', text: { en: 'Upendra Dwivedi', hi: 'उपेंद्र द्विवेदी' } },
      { key: 'C', text: { en: 'Manoj Pande', hi: 'मनोज पांडे' } },
      { key: 'D', text: { en: 'Anil Chauhan', hi: 'अनिल चौहान' } },
    ],
    correctOption: 'A',
    explanation: {
      en: 'Dhiraj Seth became the Vice Chief of Army Staff in 2026. Upendra Dwivedi is the Chief of Army Staff and Krishna Swaminathan is Chief of Naval Staff.',
      hi: 'धीरज सेठ 2026 में सेना के उप प्रमुख बने। उपेंद्र द्विवेदी थल सेनाध्यक्ष हैं।',
    },
    subject: 'Current Affairs',
    topic: 'Appointments - Defence',
  },
  {
    questionText: {
      en: 'Who Was Appointed Brand Ambassador For Census 2027?',
      hi: 'जनगणना 2027 के लिए ब्रांड एंबेसडर किसे नियुक्त किया गया?',
    },
    options: [
      { key: 'A', text: { en: 'Sudarshan Pattnaik', hi: 'सुदर्शन पट्टनायक' } },
      { key: 'B', text: { en: 'Raghurajpur Moharana', hi: 'रघुराजपुर मोहराना' } },
      { key: 'C', text: { en: 'Anish Kapoor', hi: 'अनीश कपूर' } },
      { key: 'D', text: { en: 'Jatin Das', hi: 'जतिन दास' } },
    ],
    correctOption: 'A',
    explanation: {
      en: 'Sand artist Sudarshan Pattnaik (from Odisha) was appointed Brand Ambassador for Census 2027. The mascots are named Pragati (female) and Vikas (male).',
      hi: 'ओडिशा के रेत कलाकार सुदर्शन पट्टनायक को जनगणना 2027 का ब्रांड एंबेसडर नियुक्त किया गया। शुभंकर का नाम प्रगति (महिला) और विकास (पुरुष) है।',
    },
    subject: 'Current Affairs',
    topic: 'Appointments - Government',
  },
  {
    questionText: {
      en: 'Who Became The 24th Chief Minister Of Bihar In 2026?',
      hi: '2026 में बिहार के 24वें मुख्यमंत्री कौन बने?',
    },
    options: [
      { key: 'A', text: { en: 'Nitish Kumar', hi: 'नीतीश कुमार' } },
      { key: 'B', text: { en: 'Tejashwi Yadav', hi: 'तेजस्वी यादव' } },
      { key: 'C', text: { en: 'Vijay Sinha', hi: 'विजय सिन्हा' } },
      { key: 'D', text: { en: 'Samrat Choudhary', hi: 'सम्राट चौधरी' } },
    ],
    correctOption: 'D',
    explanation: {
      en: 'Samrat Choudhary became the 24th Chief Minister of Bihar — the first BJP leader to become Bihar Chief Minister. He replaced Nitish Kumar, who became a Rajya Sabha member.',
      hi: 'सम्राट चौधरी बिहार के 24वें मुख्यमंत्री बने — बिहार के मुख्यमंत्री बनने वाले पहले BJP नेता। उन्होंने नीतीश कुमार की जगह ली।',
    },
    subject: 'Current Affairs',
    topic: 'Appointments - State Government',
  },
  {
    questionText: {
      en: 'Who Has Been Recently Appointed As Governor Of Bihar?',
      hi: 'हाल ही में बिहार के राज्यपाल के रूप में किसे नियुक्त किया गया है?',
    },
    options: [
      { key: 'A', text: { en: 'Syed Ata Hasnain', hi: 'सैयद अता हसनैन' } },
      { key: 'B', text: { en: 'Rajendra Arlekar', hi: 'राजेंद्र अर्लेकर' } },
      { key: 'C', text: { en: 'Phagu Chauhan', hi: 'फागू चौहान' } },
      { key: 'D', text: { en: 'Anandiben Patel', hi: 'आनंदीबेन पटेल' } },
    ],
    correctOption: 'A',
    explanation: {
      en: 'Syed Ata Hasnain was appointed as the Governor of Bihar (March 2026) by President Droupadi Murmu. Governors are appointed under Article 155 of the Constitution.',
      hi: 'सैयद अता हसनैन को राष्ट्रपति द्रौपदी मुर्मू द्वारा बिहार का राज्यपाल नियुक्त किया गया। राज्यपाल की नियुक्ति संविधान के अनुच्छेद 155 के तहत होती है।',
    },
    subject: 'Current Affairs',
    topic: 'Appointments - Governor',
  },
  {
    questionText: {
      en: 'Who Has Been Appointed As India\'s Ambassador To China (2026)?',
      hi: 'चीन में भारत के राजदूत के रूप में किसे नियुक्त किया गया है (2026)?',
    },
    options: [
      { key: 'A', text: { en: 'Vinay Kwatra', hi: 'विनय क्वात्रा' } },
      { key: 'B', text: { en: 'Taranjit Singh Sandhu', hi: 'तरनजीत सिंह संधू' } },
      { key: 'C', text: { en: 'Harsh Vardhan Shringla', hi: 'हर्षवर्धन श्रृंगला' } },
      { key: 'D', text: { en: 'Vikram Doraiswami', hi: 'विक्रम दोरईस्वामी' } },
    ],
    correctOption: 'D',
    explanation: {
      en: 'Vikram Doraiswami was appointed as India\'s Ambassador to China in 2026. China\'s capital is Beijing and the Yangtze River is Asia\'s longest river.',
      hi: 'विक्रम दोरईस्वामी को 2026 में चीन में भारत का राजदूत नियुक्त किया गया।',
    },
    subject: 'Current Affairs',
    topic: 'Appointments - Diplomatic',
  },
  {
    questionText: {
      en: 'Who Has Been Appointed As Director General Of National Investigation Agency (NIA)?',
      hi: 'राष्ट्रीय जांच एजेंसी (NIA) के महानिदेशक के रूप में किसे नियुक्त किया गया है?',
    },
    options: [
      { key: 'A', text: { en: 'Sadanand Date', hi: 'सदानंद दाते' } },
      { key: 'B', text: { en: 'Rakesh Kumar', hi: 'राकेश कुमार' } },
      { key: 'C', text: { en: 'Angad Singh', hi: 'अंगद सिंह' } },
      { key: 'D', text: { en: 'Rakesh Aggarwal', hi: 'राकेश अग्रवाल' } },
    ],
    correctOption: 'D',
    explanation: {
      en: 'Rakesh Aggarwal was appointed as Director General of NIA. NIA is a counter-terrorism law enforcement agency founded in 2009, under the Ministry of Home Affairs.',
      hi: 'राकेश अग्रवाल को NIA के महानिदेशक के रूप में नियुक्त किया गया। NIA की स्थापना 2009 में हुई थी।',
    },
    subject: 'Current Affairs',
    topic: 'Appointments - Security Forces',
  },
  {
    questionText: {
      en: 'Who Has Been Appointed As The National President Of BJP In January 2026?',
      hi: 'जनवरी 2026 में भारतीय जनता पार्टी (BJP) के राष्ट्रीय अध्यक्ष के रूप में किसे नियुक्त किया गया?',
    },
    options: [
      { key: 'A', text: { en: 'Amit Shah', hi: 'अमित शाह' } },
      { key: 'B', text: { en: 'J. P. Nadda', hi: 'जे. पी. नड्डा' } },
      { key: 'C', text: { en: 'Nitin Nabin', hi: 'नितिन नबिन' } },
      { key: 'D', text: { en: 'Rajnath Singh', hi: 'राजनाथ सिंह' } },
    ],
    correctOption: 'C',
    explanation: {
      en: 'Nitin Nabin (from Bihar) became the 16th and youngest National President of BJP in January 2026, replacing J. P. Nadda.',
      hi: 'नितिन नबिन (बिहार से) BJP के 16वें और सबसे युवा राष्ट्रीय अध्यक्ष बने, उन्होंने जे. पी. नड्डा की जगह ली।',
    },
    subject: 'Current Affairs',
    topic: 'Appointments - Political',
  },
  {
    questionText: {
      en: 'Who Has Been Appointed As The New Director General Of BSF?',
      hi: 'BSF के नए महानिदेशक के रूप में किसे नियुक्त किया गया है?',
    },
    options: [
      { key: 'A', text: { en: 'Praveen Kumar', hi: 'प्रवीण कुमार' } },
      { key: 'B', text: { en: 'Amar Sharma', hi: 'अमर शर्मा' } },
      { key: 'C', text: { en: 'R Hari Kumar', hi: 'आर हरि कुमार' } },
      { key: 'D', text: { en: 'Sandeep Kumar', hi: 'संदीप कुमार' } },
    ],
    correctOption: 'A',
    explanation: {
      en: 'Praveen Kumar was appointed as the new Director General of BSF (Border Security Force). BSF was founded in 1965, headquartered in New Delhi, under the Ministry of Home Affairs.',
      hi: 'प्रवीण कुमार को BSF के नए महानिदेशक के रूप में नियुक्त किया गया। BSF की स्थापना 1965 में हुई थी।',
    },
    subject: 'Current Affairs',
    topic: 'Appointments - Security Forces',
  },
  {
    questionText: {
      en: 'Who Has Been Appointed As The New Chairman Of CBIC?',
      hi: 'केंद्रीय अप्रत्यक्ष कर और सीमा शुल्क बोर्ड (CBIC) के नए अध्यक्ष के रूप में किसे नियुक्त किया गया है?',
    },
    options: [
      { key: 'A', text: { en: 'Ravi Agrawal', hi: 'रवि अग्रवाल' } },
      { key: 'B', text: { en: 'Sanjay Malhotra', hi: 'संजय मल्होत्रा' } },
      { key: 'C', text: { en: 'Ajay Bhushan Pandey', hi: 'अजय भूषण पांडेय' } },
      { key: 'D', text: { en: 'Vivek Chaturvedi', hi: 'विवेक चतुर्वेदी' } },
    ],
    correctOption: 'D',
    explanation: {
      en: 'Vivek Chaturvedi was appointed as the new Chairman of CBIC (Central Board of Indirect Taxes and Customs), which is part of the Department of Revenue under the Ministry of Finance.',
      hi: 'विवेक चतुर्वेदी को CBIC के नए अध्यक्ष के रूप में नियुक्त किया गया। CBIC वित्त मंत्रालय के अधीन राजस्व विभाग का हिस्सा है।',
    },
    subject: 'Current Affairs',
    topic: 'Appointments - Finance',
  },
  {
    questionText: {
      en: 'Who Has Been Appointed As The Next Mossad Chief?',
      hi: 'अगले मोसाद प्रमुख के रूप में किसे नियुक्त किया गया है?',
    },
    options: [
      { key: 'A', text: { en: 'David Barnea', hi: 'डेविड बार्निया' } },
      { key: 'B', text: { en: 'Benjamin Netanyahu', hi: 'बेंजामिन नेतन्याहू' } },
      { key: 'C', text: { en: 'Roman Gofman', hi: 'रोमन गोफमैन' } },
      { key: 'D', text: { en: 'Meir Dagan', hi: 'मेइर दागन' } },
    ],
    correctOption: 'C',
    explanation: {
      en: 'Roman Gofman was appointed as the next Mossad Chief. Mossad is the national intelligence agency of Israel, headquartered in Tel Aviv.',
      hi: 'रोमन गोफमैन को अगले मोसाद प्रमुख के रूप में नियुक्त किया गया। मोसाद इज़राइल की राष्ट्रीय खुफिया एजेंसी है।',
    },
    subject: 'Current Affairs',
    topic: 'Appointments - International',
  },
  {
    questionText: {
      en: 'Who Became The First Woman To Lead UN Tourism?',
      hi: 'संयुक्त राष्ट्र पर्यटन का नेतृत्व करने वाली पहली महिला कौन बनीं?',
    },
    options: [
      { key: 'A', text: { en: 'Sofia Montiel', hi: 'सोफिया मोंटिएल' } },
      { key: 'B', text: { en: 'Shaikha Nasser Al Nowais', hi: 'शेखा नासर अल नोवैस' } },
      { key: 'C', text: { en: 'Christine Lagarde', hi: 'क्रिस्टीन लेगार्ड' } },
      { key: 'D', text: { en: 'Angela Merkel', hi: 'एंजेला मर्केल' } },
    ],
    correctOption: 'B',
    explanation: {
      en: 'Shaikha Nasser Al Nowais from UAE became the first woman Secretary-General of UN Tourism. UN Tourism was founded in 1975, with headquarters in Madrid, Spain.',
      hi: 'UAE की शेखा नासर अल नोवैस UN Tourism की पहली महिला महासचिव बनीं। UN Tourism की स्थापना 1975 में हुई, मुख्यालय मैड्रिड, स्पेन में है।',
    },
    subject: 'Current Affairs',
    topic: 'Appointments - International',
  },
  {
    questionText: {
      en: 'Who Became The 53rd Chief Justice Of India?',
      hi: 'भारत के 53वें मुख्य न्यायाधीश कौन बने?',
    },
    options: [
      { key: 'A', text: { en: 'Amit Kumar', hi: 'अमित कुमार' } },
      { key: 'B', text: { en: 'U. U. Lalit', hi: 'यू. यू. ललित' } },
      { key: 'C', text: { en: 'Surya Kant', hi: 'सूर्यकांत' } },
      { key: 'D', text: { en: 'Sanjiv Khanna', hi: 'संजीव खन्ना' } },
    ],
    correctOption: 'C',
    explanation: {
      en: 'Justice Surya Kant became the 53rd Chief Justice of India, assuming office on 24 November 2025, replacing BR Gavai. CJI is appointed by the President under Article 124.',
      hi: 'न्यायमूर्ति सूर्यकांत भारत के 53वें मुख्य न्यायाधीश बने, उन्होंने 24 नवंबर 2025 को कार्यभार संभाला। CJI की नियुक्ति अनुच्छेद 124 के तहत राष्ट्रपति द्वारा की जाती है।',
    },
    subject: 'Current Affairs',
    topic: 'Appointments - Judiciary',
  },
  {
    questionText: {
      en: 'Which Person Has Been Appointed As The US Ambassador To India?',
      hi: 'किस व्यक्ति को भारत में अमेरिकी राजदूत के रूप में नियुक्त किया गया है?',
    },
    options: [
      { key: 'A', text: { en: 'Eric Garcetti', hi: 'एरिक गार्सेटी' } },
      { key: 'B', text: { en: 'Nikki Haley', hi: 'निक्की हेली' } },
      { key: 'C', text: { en: 'Thomas West', hi: 'थॉमस वेस्ट' } },
      { key: 'D', text: { en: 'Sergio Gor', hi: 'सर्जियो गोर' } },
    ],
    correctOption: 'D',
    explanation: {
      en: 'Sergio Gor was appointed as the US Ambassador to India.',
      hi: 'सर्जियो गोर को भारत में अमेरिकी राजदूत के रूप में नियुक्त किया गया।',
    },
    subject: 'Current Affairs',
    topic: 'Appointments - Diplomatic',
  },
  {
    questionText: {
      en: 'Who Became The 11th Director-General Of UNESCO?',
      hi: 'यूनेस्को के 11वें महानिदेशक कौन बने?',
    },
    options: [
      { key: 'A', text: { en: 'Audrey Azoulay', hi: 'ऑड्री अज़ोउले' } },
      { key: 'B', text: { en: 'Gabriela Ramos', hi: 'गैब्रिएला रामोस' } },
      { key: 'C', text: { en: 'Khaled al-Anani', hi: 'खालेद अल-अनानी' } },
      { key: 'D', text: { en: 'Firmin Edouard', hi: 'फिरमिन एडौर्ड' } },
    ],
    correctOption: 'C',
    explanation: {
      en: 'Khaled al-Anani from Egypt became the 11th Director-General of UNESCO — the first Arab UNESCO Director General. UNESCO was founded in 1945 with headquarters in Paris, France.',
      hi: 'मिस्र के खालेद अल-अनानी यूनेस्को के 11वें महानिदेशक बने — पहले अरब यूनेस्को महानिदेशक। यूनेस्को की स्थापना 1945 में हुई, मुख्यालय पेरिस, फ्रांस में है।',
    },
    subject: 'Current Affairs',
    topic: 'Appointments - International',
  },
  {
    questionText: {
      en: 'Who Became The New BCCI President?',
      hi: 'बीसीसीआई के नए अध्यक्ष कौन बने?',
    },
    options: [
      { key: 'A', text: { en: 'Sanjay Manjrekar', hi: 'संजय मांजरेकर' } },
      { key: 'B', text: { en: 'Mithun Manhas', hi: 'मिथुन मनहास' } },
      { key: 'C', text: { en: 'Anil Kumble', hi: 'अनिल कुंबले' } },
      { key: 'D', text: { en: 'Rahul Dravid', hi: 'राहुल द्रविड़' } },
    ],
    correctOption: 'B',
    explanation: {
      en: 'Mithun Manhas became the new BCCI President. BCCI (Board of Control for Cricket in India) was founded in 1928, headquartered in Mumbai.',
      hi: 'मिथुन मनहास BCCI के नए अध्यक्ष बने। BCCI की स्थापना 1928 में हुई, मुख्यालय मुंबई में है।',
    },
    subject: 'Current Affairs',
    topic: 'Appointments - Sports',
  },
  {
    questionText: {
      en: 'Who Has Been Appointed As CEO Of FSSAI?',
      hi: 'FSSAI के CEO के रूप में किसे नियुक्त किया गया है?',
    },
    options: [
      { key: 'A', text: { en: 'Vikram Singh', hi: 'विक्रम सिंह' } },
      { key: 'B', text: { en: 'Arun Kumar', hi: 'अरुण कुमार' } },
      { key: 'C', text: { en: 'Rajit Punhani', hi: 'राजित पुनहानी' } },
      { key: 'D', text: { en: 'Ritu Sharma', hi: 'रितु शर्मा' } },
    ],
    correctOption: 'C',
    explanation: {
      en: 'Rajit Punhani was appointed as CEO of FSSAI (Food Safety and Standards Authority of India). FSSAI was formed in 2008, headquartered in New Delhi.',
      hi: 'राजित पुनहानी को FSSAI के CEO के रूप में नियुक्त किया गया। FSSAI का गठन 2008 में हुआ था।',
    },
    subject: 'Current Affairs',
    topic: 'Appointments - Government',
  },
  {
    questionText: {
      en: 'Who Has Been Elected As India\'s 15th Vice President?',
      hi: 'भारत के 15वें उपराष्ट्रपति के रूप में किसे चुना गया है?',
    },
    options: [
      { key: 'A', text: { en: 'B Sudershan Reddy', hi: 'बी. सुदर्शन रेड्डी' } },
      { key: 'B', text: { en: 'M. Venkaiah Naidu', hi: 'एम. वेंकैया नायडू' } },
      { key: 'C', text: { en: 'CP Radhakrishnan', hi: 'सी.पी. राधाकृष्णन' } },
      { key: 'D', text: { en: 'Hari B Kambhampati', hi: 'हरि बी. कांभमपति' } },
    ],
    correctOption: 'C',
    explanation: {
      en: 'CP Radhakrishnan (from Tamil Nadu) became India\'s 15th Vice President. He was formerly the Governor of Maharashtra. The Vice President\'s post is described under Article 63 of the Constitution.',
      hi: 'सी.पी. राधाकृष्णन (तमिलनाडु से) भारत के 15वें उपराष्ट्रपति बने। वे पहले महाराष्ट्र के राज्यपाल थे।',
    },
    subject: 'Current Affairs',
    topic: 'Appointments - Constitutional',
  },
  {
    questionText: {
      en: 'Who Took Charge As The Director General Of CISF Recently?',
      hi: 'हाल ही में CISF के महानिदेशक के रूप में किसने कार्यभार संभाला?',
    },
    options: [
      { key: 'A', text: { en: 'Praveer Ranjan', hi: 'प्रवीर रंजन' } },
      { key: 'B', text: { en: 'Sheel Vardhan Singh', hi: 'शील वर्धन सिंह' } },
      { key: 'C', text: { en: 'Rakesh Asthana', hi: 'राकेश अस्थाना' } },
      { key: 'D', text: { en: 'Sanjay Arora', hi: 'संजय अरोड़ा' } },
    ],
    correctOption: 'A',
    explanation: {
      en: 'Praveer Ranjan took charge as Director General of CISF (Central Industrial Security Force). CISF was founded in 1969, under the Ministry of Home Affairs, headquartered in New Delhi.',
      hi: 'प्रवीर रंजन ने CISF के महानिदेशक के रूप में कार्यभार संभाला। CISF की स्थापना 1969 में हुई थी।',
    },
    subject: 'Current Affairs',
    topic: 'Appointments - Security Forces',
  },
];

// ── Helper: next occurrence of a weekday at 8PM IST ──────────────────────────

function nextWeekdayAt8PMIST(targetDay) {
  // targetDay: 0=Sun, 6=Sat
  const now = new Date();
  // Get current date in IST
  const istOffset = 5.5 * 60 * 60 * 1000;
  const nowIST = new Date(now.getTime() + istOffset);

  const currentDay = nowIST.getUTCDay();
  let daysUntil = targetDay - currentDay;
  if (daysUntil < 0) daysUntil += 7;
  if (daysUntil === 0) {
    // Same weekday — check if 8PM IST has already passed
    if (nowIST.getUTCHours() >= 20) daysUntil = 7;
  }

  // Build target date at 20:00 IST = 14:30 UTC
  const targetIST = new Date(nowIST);
  targetIST.setUTCDate(nowIST.getUTCDate() + daysUntil);
  targetIST.setUTCHours(20, 0, 0, 0);

  // Convert to UTC
  return new Date(targetIST.getTime() - istOffset);
}

// ── Main ──────────────────────────────────────────────────────────────────────

(async () => {
  try {
    console.log('\nConnecting to MongoDB...');
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 10000 });
    console.log('Connected\n');

    // Insert questions
    console.log('Seeding 20 Appointment CA 2026 questions...');
    const inserted = await Question.insertMany(questions);
    console.log(`✅ ${inserted.length} questions inserted`);

    const questionIds = inserted.map(q => q._id);

    // Create Saturday live test
    const satDate = nextWeekdayAt8PMIST(6);
    const satTest = await LiveTest.create({
      title: { en: 'Appointment CA 2026 — Live Test', hi: 'नियुक्ति करंट अफेयर्स 2026 — लाइव टेस्ट' },
      description: {
        en: '20 questions on important appointments from Current Affairs 2026. Duration: 20 minutes.',
        hi: 'करंट अफेयर्स 2026 की महत्वपूर्ण नियुक्तियों पर 20 प्रश्न। अवधि: 20 मिनट।',
      },
      examCategory: 'ssc',
      questions: questionIds,
      scheduledAt: satDate,
      durationSeconds: 20 * 60,
      totalMarks: 20,
      negativeMarking: false,
      status: 'upcoming',
    });
    console.log(`✅ Saturday live test created: ${satDate.toISOString()} UTC (8PM IST)`);
    console.log(`   ID: ${satTest._id}`);

    // Create Sunday live test
    const sunDate = nextWeekdayAt8PMIST(0);
    const sunTest = await LiveTest.create({
      title: { en: 'Appointment CA 2026 — Live Test', hi: 'नियुक्ति करंट अफेयर्स 2026 — लाइव टेस्ट' },
      description: {
        en: '20 questions on important appointments from Current Affairs 2026. Duration: 20 minutes.',
        hi: 'करंट अफेयर्स 2026 की महत्वपूर्ण नियुक्तियों पर 20 प्रश्न। अवधि: 20 मिनट।',
      },
      examCategory: 'ssc',
      questions: questionIds,
      scheduledAt: sunDate,
      durationSeconds: 20 * 60,
      totalMarks: 20,
      negativeMarking: false,
      status: 'upcoming',
    });
    console.log(`✅ Sunday live test created: ${sunDate.toISOString()} UTC (8PM IST)`);
    console.log(`   ID: ${sunTest._id}`);

    console.log('\nAll done!');
    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('Failed:', err.message);
    await mongoose.connection.close().catch(() => {});
    process.exit(1);
  }
})();
