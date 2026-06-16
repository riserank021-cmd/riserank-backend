/**
 * seed-ssc-cgl-2024.js
 * Seeds SSC CGL PRE 2024 General Awareness questions (text-based, all 4 shifts)
 * Run: node scripts/seed-ssc-cgl-2024.js
 */
require('dotenv').config();
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) { console.error('MONGO_URI not set'); process.exit(1); }

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
  source: { type: String, default: 'SSC CGL PRE 2024' },
}, { timestamps: true });

const Question = mongoose.models.Question || mongoose.model('Question', questionSchema);

const questions = [

  // ══════════════════════════════════════════════════
  // SHIFT 1 — General Awareness
  // ══════════════════════════════════════════════════
  {
    questionText: { en: "Who among the following has authored the play 'Nil Darpan'?", hi: "निम्नलिखित में से किसने 'नील दर्पण' नाटक लिखा?" },
    options: [
      { key: 'A', text: { en: 'Motilal Nehru', hi: 'मोतीलाल नेहरू' } },
      { key: 'B', text: { en: 'Chittaranjan Das', hi: 'चित्तरंजन दास' } },
      { key: 'C', text: { en: 'Dinabandhu Mitra', hi: 'दीनबंधु मित्र' } },
      { key: 'D', text: { en: 'Sarojini Naidu', hi: 'सरोजिनी नायडू' } },
    ],
    correctOption: 'C',
    explanation: { en: 'Nil Darpan was written by Dinabandhu Mitra in 1860. It depicted the oppression of indigo farmers by British planters.', hi: 'नील दर्पण नाटक दीनबंधु मित्र ने 1860 में लिखा था। यह नीलहे किसानों पर अंग्रेज बागान मालिकों के अत्याचार को दर्शाता है।' },
    subject: 'History', topic: 'Literature & Art',
  },
  {
    questionText: { en: 'Which of the following awards was won by Lata Mangeshkar in the year 2001?', hi: 'लता मंगेशकर को 2001 में निम्नलिखित में से कौन-सा पुरस्कार मिला?' },
    options: [
      { key: 'A', text: { en: 'Filmfare Lifetime Achievement Award', hi: 'फिल्मफेयर लाइफटाइम अचीवमेंट अवॉर्ड' } },
      { key: 'B', text: { en: 'Padma Vibhushan', hi: 'पद्म विभूषण' } },
      { key: 'C', text: { en: 'Dadasaheb Phalke Award', hi: 'दादासाहेब फाल्के पुरस्कार' } },
      { key: 'D', text: { en: 'Bharat Ratna', hi: 'भारत रत्न' } },
    ],
    correctOption: 'D',
    explanation: { en: 'Lata Mangeshkar was awarded Bharat Ratna in 2001, India\'s highest civilian honour.', hi: 'लता मंगेशकर को 2001 में भारत रत्न, भारत का सर्वोच्च नागरिक सम्मान, प्रदान किया गया।' },
    subject: 'Current Affairs', topic: 'Awards & Honours',
  },
  {
    questionText: { en: 'Who founded the Prarthana Samaj in Mumbai in 1867?', hi: '1867 में मुंबई में प्रार्थना समाज की स्थापना किसने की?' },
    options: [
      { key: 'A', text: { en: 'Atmaram Pandurang', hi: 'आत्माराम पांडुरंग' } },
      { key: 'B', text: { en: 'Gopal Krishna Gokhale', hi: 'गोपाल कृष्ण गोखले' } },
      { key: 'C', text: { en: 'Shri Ram Bajpai', hi: 'श्री राम बाजपेयी' } },
      { key: 'D', text: { en: 'Ram Mohan Roy', hi: 'राम मोहन राय' } },
    ],
    correctOption: 'A',
    explanation: { en: 'Prarthana Samaj was founded by Atmaram Pandurang in Mumbai (Bombay) in 1867. It was a religious reform movement influenced by the Brahmo Samaj.', hi: 'प्रार्थना समाज की स्थापना 1867 में मुंबई में आत्माराम पांडुरंग ने की थी। यह ब्रह्म समाज से प्रेरित धार्मिक सुधार आंदोलन था।' },
    subject: 'History', topic: 'Social Reform Movements',
  },
  {
    questionText: { en: 'Who among the following formed the Bihar Provincial Kisan Sabha in 1929?', hi: '1929 में बिहार प्रांतीय किसान सभा की स्थापना किसने की?' },
    options: [
      { key: 'A', text: { en: 'Kunwar Singh', hi: 'कुंवर सिंह' } },
      { key: 'B', text: { en: 'JM Sengupta', hi: 'जे.एम. सेनगुप्ता' } },
      { key: 'C', text: { en: 'Jayprakash Narayan', hi: 'जयप्रकाश नारायण' } },
      { key: 'D', text: { en: 'Swami Sahajanand Saraswati', hi: 'स्वामी सहजानंद सरस्वती' } },
    ],
    correctOption: 'D',
    explanation: { en: 'Swami Sahajanand Saraswati founded the Bihar Provincial Kisan Sabha in 1929, one of the earliest peasant organisations in India.', hi: 'स्वामी सहजानंद सरस्वती ने 1929 में बिहार प्रांतीय किसान सभा की स्थापना की, जो भारत के प्रारंभिक किसान संगठनों में से एक था।' },
    subject: 'History', topic: 'Freedom Movement',
  },
  {
    questionText: { en: 'In which city was the first golf club of India situated?', hi: 'भारत का पहला गोल्फ क्लब किस शहर में स्थित था?' },
    options: [
      { key: 'A', text: { en: 'Shimla', hi: 'शिमला' } },
      { key: 'B', text: { en: 'Gulmarg', hi: 'गुलमर्ग' } },
      { key: 'C', text: { en: 'Mysore', hi: 'मैसूर' } },
      { key: 'D', text: { en: 'Kolkata', hi: 'कोलकाता' } },
    ],
    correctOption: 'D',
    explanation: { en: 'The Royal Calcutta Golf Club (now Kolkata), established in 1829, is the first golf club in India and the oldest outside Britain.', hi: 'रॉयल कलकत्ता गोल्फ क्लब (अब कोलकाता), 1829 में स्थापित, भारत का पहला गोल्फ क्लब है और ब्रिटेन के बाहर सबसे पुराना है।' },
    subject: 'General Knowledge', topic: 'Sports',
  },
  {
    questionText: { en: 'Which article has a similar provision to that of Article 32 and deals with writ jurisdiction of High Courts?', hi: 'कौन-सा अनुच्छेद अनुच्छेद 32 के समान है और उच्च न्यायालयों के रिट क्षेत्राधिकार से संबंधित है?' },
    options: [
      { key: 'A', text: { en: 'Article 227', hi: 'अनुच्छेद 227' } },
      { key: 'B', text: { en: 'Article 228', hi: 'अनुच्छेद 228' } },
      { key: 'C', text: { en: 'Article 225', hi: 'अनुच्छेद 225' } },
      { key: 'D', text: { en: 'Article 226', hi: 'अनुच्छेद 226' } },
    ],
    correctOption: 'D',
    explanation: { en: 'Article 226 empowers High Courts to issue writs (habeas corpus, mandamus, prohibition, certiorari, quo warranto), similar to Article 32 which gives the Supreme Court this power.', hi: 'अनुच्छेद 226 उच्च न्यायालयों को रिट जारी करने का अधिकार देता है, जो अनुच्छेद 32 के समान है जो सर्वोच्च न्यायालय को यह शक्ति देता है।' },
    subject: 'Polity', topic: 'Constitutional Articles',
  },
  {
    questionText: { en: 'Mahendravarman I was the ruler of which of the following dynasties?', hi: 'महेंद्रवर्मन I किस वंश का शासक था?' },
    options: [
      { key: 'A', text: { en: 'Pandya', hi: 'पांड्य' } },
      { key: 'B', text: { en: 'Chola', hi: 'चोल' } },
      { key: 'C', text: { en: 'Chalukya', hi: 'चालुक्य' } },
      { key: 'D', text: { en: 'Pallava', hi: 'पल्लव' } },
    ],
    correctOption: 'D',
    explanation: { en: 'Mahendravarman I was a Pallava king who ruled from Kanchipuram. He was known for patronising music and rock-cut cave temples.', hi: 'महेंद्रवर्मन I पल्लव वंश का राजा था जो कांचीपुरम से शासन करता था। वह संगीत और गुफा मंदिरों का संरक्षक था।' },
    subject: 'History', topic: 'Ancient India',
  },
  {
    questionText: { en: 'Who is Union Minister of State (Independent Charge) for Science and Technology as of July 2023?', hi: 'जुलाई 2023 तक विज्ञान एवं प्रौद्योगिकी राज्य मंत्री (स्वतंत्र प्रभार) कौन हैं?' },
    options: [
      { key: 'A', text: { en: 'Ramesh Pokhriyal', hi: 'रमेश पोखरियाल' } },
      { key: 'B', text: { en: 'Dharmendra Pradhan', hi: 'धर्मेंद्र प्रधान' } },
      { key: 'C', text: { en: 'Ashwini Vaishnaw', hi: 'अश्विनी वैष्णव' } },
      { key: 'D', text: { en: 'Jitendra Singh', hi: 'जितेंद्र सिंह' } },
    ],
    correctOption: 'D',
    explanation: { en: 'Dr. Jitendra Singh is the Union Minister of State (Independent Charge) for Science and Technology, Earth Sciences, and Minister of State for PMO, Department of Atomic Energy.', hi: 'डॉ. जितेंद्र सिंह विज्ञान एवं प्रौद्योगिकी, पृथ्वी विज्ञान राज्य मंत्री (स्वतंत्र प्रभार) हैं।' },
    subject: 'Current Affairs', topic: 'Government & Politics',
  },
  {
    questionText: { en: 'Lathmar Holi is primarily celebrated in the state of:', hi: 'लठमार होली मुख्य रूप से किस राज्य में मनाई जाती है?' },
    options: [
      { key: 'A', text: { en: 'Karnataka', hi: 'कर्नाटक' } },
      { key: 'B', text: { en: 'Arunachal Pradesh', hi: 'अरुणाचल प्रदेश' } },
      { key: 'C', text: { en: 'Uttar Pradesh', hi: 'उत्तर प्रदेश' } },
      { key: 'D', text: { en: 'Himachal Pradesh', hi: 'हिमाचल प्रदेश' } },
    ],
    correctOption: 'C',
    explanation: { en: 'Lathmar Holi is celebrated in Barsana and Nandgaon in Mathura district, Uttar Pradesh, where women beat men with sticks (lathis).', hi: 'लठमार होली उत्तर प्रदेश के मथुरा जिले के बरसाना और नंदगाव में मनाई जाती है, जहां महिलाएं लाठियों से पुरुषों को मारती हैं।' },
    subject: 'Culture', topic: 'Festivals',
  },
  {
    questionText: { en: 'Pandit Vishwa Mohan Bhatt (Mohan Veena player) won which Award in the year 1994?', hi: 'पंडित विश्वमोहन भट्ट (मोहन वीणा वादक) ने 1994 में कौन-सा पुरस्कार जीता?' },
    options: [
      { key: 'A', text: { en: 'Sangita Kalanidhi', hi: 'संगीत कलानिधि' } },
      { key: 'B', text: { en: 'Oscar', hi: 'ऑस्कर' } },
      { key: 'C', text: { en: 'Grammy', hi: 'ग्रैमी' } },
      { key: 'D', text: { en: 'Sangeet Natak Akademi', hi: 'संगीत नाटक अकादमी' } },
    ],
    correctOption: 'C',
    explanation: { en: 'Pandit Vishwa Mohan Bhatt won the Grammy Award in 1994 for Best World Music Album for "A Meeting by the River" recorded with Ry Cooder.', hi: 'पंडित विश्वमोहन भट्ट ने 1994 में रे कूडर के साथ "A Meeting by the River" के लिए ग्रैमी अवॉर्ड जीता।' },
    subject: 'Culture', topic: 'Awards & Honours',
  },
  {
    questionText: { en: 'Which plateaus are very fertile because they are rich in black soil?', hi: 'कौन-से पठार काली मिट्टी से समृद्ध होने के कारण बहुत उपजाऊ हैं?' },
    options: [
      { key: 'A', text: { en: 'African plateau', hi: 'अफ्रीकी पठार' } },
      { key: 'B', text: { en: 'Ethiopian plateau', hi: 'इथियोपियाई पठार' } },
      { key: 'C', text: { en: 'Katanga plateau', hi: 'कटांगा पठार' } },
      { key: 'D', text: { en: 'Deccan lava plateau', hi: 'दक्कन लावा पठार' } },
    ],
    correctOption: 'D',
    explanation: { en: 'The Deccan Lava Plateau (Deccan Trap) is famous for its black cotton soil (regur soil) formed by the weathering of basaltic lava, ideal for cotton cultivation.', hi: 'दक्कन लावा पठार (दक्कन ट्रैप) काली कपास मिट्टी (रेगुर मिट्टी) के लिए प्रसिद्ध है, जो बेसाल्टिक लावा के अपक्षय से बनती है।' },
    subject: 'Geography', topic: 'Indian Geography',
  },
  {
    questionText: { en: 'Who is the Chief Minister of Tamil Nadu as of July 2023?', hi: 'जुलाई 2023 तक तमिलनाडु के मुख्यमंत्री कौन हैं?' },
    options: [
      { key: 'A', text: { en: 'Pinarayi Vijayan', hi: 'पिनाराई विजयन' } },
      { key: 'B', text: { en: 'M Yedurappa', hi: 'एम. येदियुरप्पा' } },
      { key: 'C', text: { en: 'KN Nehru', hi: 'के.एन. नेहरू' } },
      { key: 'D', text: { en: 'MK Stalin', hi: 'एम.के. स्टालिन' } },
    ],
    correctOption: 'D',
    explanation: { en: 'M.K. Stalin has been the Chief Minister of Tamil Nadu since May 2021. He is the son of former CM M. Karunanidhi and leader of DMK party.', hi: 'एम.के. स्टालिन मई 2021 से तमिलनाडु के मुख्यमंत्री हैं। वे पूर्व CM एम. करुणानिधि के पुत्र और DMK के नेता हैं।' },
    subject: 'Current Affairs', topic: 'Government & Politics',
  },
  {
    questionText: { en: 'Which state is the biggest producer of Pulses in India?', hi: 'भारत में दलहन का सबसे बड़ा उत्पादक राज्य कौन-सा है?' },
    options: [
      { key: 'A', text: { en: 'Madhya Pradesh', hi: 'मध्य प्रदेश' } },
      { key: 'B', text: { en: 'Haryana', hi: 'हरियाणा' } },
      { key: 'C', text: { en: 'Punjab', hi: 'पंजाब' } },
      { key: 'D', text: { en: 'Bihar', hi: 'बिहार' } },
    ],
    correctOption: 'A',
    explanation: { en: 'Madhya Pradesh is the largest producer of pulses in India, producing about 35% of the total pulse production in the country.', hi: 'मध्य प्रदेश भारत में दलहन का सबसे बड़ा उत्पादक है, जो देश के कुल दलहन उत्पादन का लगभग 35% उत्पादन करता है।' },
    subject: 'Geography', topic: 'Agriculture',
  },
  {
    questionText: { en: 'In which year was Project Tiger launched in India?', hi: 'भारत में प्रोजेक्ट टाइगर किस वर्ष शुरू किया गया था?' },
    options: [
      { key: 'A', text: { en: '1985', hi: '1985' } },
      { key: 'B', text: { en: '1973', hi: '1973' } },
      { key: 'C', text: { en: '1972', hi: '1972' } },
      { key: 'D', text: { en: '1980', hi: '1980' } },
    ],
    correctOption: 'B',
    explanation: { en: 'Project Tiger was launched on 1 April 1973 by Prime Minister Indira Gandhi at Jim Corbett National Park. It is a wildlife conservation project administered by the National Tiger Conservation Authority (NTCA).', hi: 'प्रोजेक्ट टाइगर 1 अप्रैल 1973 को प्रधानमंत्री इंदिरा गांधी द्वारा जिम कॉर्बेट नेशनल पार्क में शुरू किया गया था।' },
    subject: 'Environment', topic: 'Conservation',
  },
  {
    questionText: { en: 'The head office of Board of Control for Cricket in India (BCCI) is located in ________?', hi: 'भारतीय क्रिकेट नियंत्रण बोर्ड (BCCI) का मुख्यालय कहाँ स्थित है?' },
    options: [
      { key: 'A', text: { en: 'Mumbai', hi: 'मुंबई' } },
      { key: 'B', text: { en: 'Kolkata', hi: 'कोलकाता' } },
      { key: 'C', text: { en: 'Delhi', hi: 'दिल्ली' } },
      { key: 'D', text: { en: 'Chennai', hi: 'चेन्नई' } },
    ],
    correctOption: 'A',
    explanation: { en: 'BCCI\'s headquarters is located in Mumbai (Wankhede Stadium). BCCI was founded in 1928 and is one of the richest cricket boards in the world.', hi: 'BCCI का मुख्यालय मुंबई (वानखेड़े स्टेडियम) में है। BCCI की स्थापना 1928 में हुई थी।' },
    subject: 'Sports', topic: 'Cricket',
  },
  {
    questionText: { en: 'Details about Sudarshana lake are given in a rock inscription at Girnar, which was composed to record the achievements of the Shaka ruler _________.', hi: 'सुदर्शन झील के बारे में विवरण गिरनार के एक शिलालेख में दिया गया है, जो शक शासक _________ की उपलब्धियों को दर्ज करने के लिए बनाया गया था।' },
    options: [
      { key: 'A', text: { en: 'Rudrasimha III', hi: 'रुद्रसिम्हा III' } },
      { key: 'B', text: { en: 'Rudradaman I', hi: 'रुद्रदमन I' } },
      { key: 'C', text: { en: 'Chashtana', hi: 'चष्टन' } },
      { key: 'D', text: { en: 'Maues', hi: 'माउस' } },
    ],
    correctOption: 'B',
    explanation: { en: 'The Junagadh (Girnar) rock inscription of Rudradaman I (150 CE) is the earliest Sanskrit inscription. It records the repair of Sudarshana Lake originally built by Chandragupta Maurya.', hi: 'रुद्रदमन I का जूनागढ़ (गिरनार) शिलालेख (150 ई.) सबसे प्रारंभिक संस्कृत शिलालेख है। इसमें चंद्रगुप्त मौर्य द्वारा निर्मित सुदर्शन झील की मरम्मत का उल्लेख है।' },
    subject: 'History', topic: 'Ancient India',
  },

  // ══════════════════════════════════════════════════
  // SHIFT 2 — General Awareness
  // ══════════════════════════════════════════════════
  {
    questionText: { en: 'Which condition, also known as icterus, causes a yellowing of your skin and the whites of your eyes?', hi: 'कौन-सी स्थिति, जिसे पीलिया (icterus) भी कहते हैं, त्वचा और आंखों के सफेद भाग को पीला कर देती है?' },
    options: [
      { key: 'A', text: { en: 'Ichthyosis', hi: 'इचथ्योसिस' } },
      { key: 'B', text: { en: 'Jaundice', hi: 'पीलिया' } },
      { key: 'C', text: { en: 'Psoriasis', hi: 'सोरायसिस' } },
      { key: 'D', text: { en: 'Vitiligo', hi: 'विटिलिगो' } },
    ],
    correctOption: 'B',
    explanation: { en: 'Jaundice (icterus) is caused by high levels of bilirubin in the blood, leading to yellowing of the skin and eyes. It can be caused by liver disease, bile duct obstruction, or haemolysis.', hi: 'पीलिया (icterus) रक्त में बिलीरुबिन के उच्च स्तर से होता है, जिससे त्वचा और आंखें पीली हो जाती हैं।' },
    subject: 'Science', topic: 'Biology & Health',
  },
  {
    questionText: { en: 'In which of the following states is Govindji Nartanalaya located?', hi: 'गोविंदजी नर्तनालय निम्नलिखित में से किस राज्य में स्थित है?' },
    options: [
      { key: 'A', text: { en: 'Manipur', hi: 'मणिपुर' } },
      { key: 'B', text: { en: 'Assam', hi: 'असम' } },
      { key: 'C', text: { en: 'Nagaland', hi: 'नागालैंड' } },
      { key: 'D', text: { en: 'Meghalaya', hi: 'मेघालय' } },
    ],
    correctOption: 'A',
    explanation: { en: 'Govindji Nartanalaya is a classical dance institution in Manipur, known for promoting Manipuri classical dance forms including Ras Lila.', hi: 'गोविंदजी नर्तनालय मणिपुर में एक शास्त्रीय नृत्य संस्थान है, जो रास लीला सहित मणिपुरी शास्त्रीय नृत्य को बढ़ावा देने के लिए जाना जाता है।' },
    subject: 'Culture', topic: 'Art & Dance',
  },
  {
    questionText: { en: 'Which of the following celebrations is dedicated to Sun God and his wife Usha to thank them for sustaining life on earth?', hi: 'निम्नलिखित में से कौन-सा उत्सव सूर्य देव और उनकी पत्नी उषा को धन्यवाद देने के लिए मनाया जाता है?' },
    options: [
      { key: 'A', text: { en: 'Madai Festival', hi: 'मडई उत्सव' } },
      { key: 'B', text: { en: 'Chhath Puja', hi: 'छठ पूजा' } },
      { key: 'C', text: { en: 'Vishwakarma Puja', hi: 'विश्वकर्मा पूजा' } },
      { key: 'D', text: { en: 'Sorath Sabha', hi: 'सोरठ सभा' } },
    ],
    correctOption: 'B',
    explanation: { en: 'Chhath Puja is a Hindu festival dedicated to the Sun God (Surya) and Usha (his wife/sister). Devotees fast and offer prayers at sunrise and sunset. It is mainly celebrated in Bihar, Jharkhand, and UP.', hi: 'छठ पूजा सूर्य देव और उनकी पत्नी उषा को समर्पित हिंदू त्योहार है। यह मुख्यतः बिहार, झारखंड और उत्तर प्रदेश में मनाया जाता है।' },
    subject: 'Culture', topic: 'Festivals',
  },
  {
    questionText: { en: 'Which of the following inscriptions of Rudradaman is the first royal inscription in early India composed in chaste Sanskrit?', hi: 'रुद्रदमन का कौन-सा शिलालेख प्रारंभिक भारत का पहला शाही शिलालेख है जो शुद्ध संस्कृत में रचित है?' },
    options: [
      { key: 'A', text: { en: 'Prayag', hi: 'प्रयाग' } },
      { key: 'B', text: { en: 'Girnar', hi: 'गिरनार' } },
      { key: 'C', text: { en: 'Chirand', hi: 'चिरांद' } },
      { key: 'D', text: { en: 'Mehrauli', hi: 'मेहरौली' } },
    ],
    correctOption: 'B',
    explanation: { en: 'The Girnar (Junagadh) inscription of Rudradaman I (c. 150 CE) is the first royal inscription composed in chaste Sanskrit prose, as opposed to earlier Prakrit inscriptions.', hi: 'रुद्रदमन I का गिरनार (जूनागढ़) शिलालेख (लगभग 150 ई.) शुद्ध संस्कृत गद्य में रचित पहला शाही शिलालेख है।' },
    subject: 'History', topic: 'Ancient India',
  },
  {
    questionText: { en: 'What is the IUPAC name of tertiary butyl alcohol?', hi: 'टर्शियरी ब्यूटाइल अल्कोहल का IUPAC नाम क्या है?' },
    options: [
      { key: 'A', text: { en: '2-Methylpropan-2-ol', hi: '2-मिथाइलप्रोपेन-2-ऑल' } },
      { key: 'B', text: { en: '1-propylpropan-3-ol', hi: '1-प्रोपाइलप्रोपेन-3-ऑल' } },
      { key: 'C', text: { en: '1-Methylpropan-3-ol', hi: '1-मिथाइलप्रोपेन-3-ऑल' } },
      { key: 'D', text: { en: '1-ethylpropan-3-ol', hi: '1-एथाइलप्रोपेन-3-ऑल' } },
    ],
    correctOption: 'A',
    explanation: { en: 'Tertiary butyl alcohol (t-butanol) has the structure (CH₃)₃COH. Its IUPAC name is 2-methylpropan-2-ol (OH group on C2, methyl substituent at C2).', hi: 'टर्शियरी ब्यूटाइल अल्कोहल (t-ब्यूटानॉल) की संरचना (CH₃)₃COH है। इसका IUPAC नाम 2-मिथाइलप्रोपेन-2-ऑल है।' },
    subject: 'Science', topic: 'Chemistry',
  },
  {
    questionText: { en: 'What is the relationship between interest rate and demand for money?', hi: 'ब्याज दर और मुद्रा की मांग के बीच क्या संबंध है?' },
    options: [
      { key: 'A', text: { en: 'No relationship exists', hi: 'कोई संबंध नहीं' } },
      { key: 'B', text: { en: 'Inverse', hi: 'व्युत्क्रम (विपरीत)' } },
      { key: 'C', text: { en: 'Direct', hi: 'प्रत्यक्ष (सीधा)' } },
      { key: 'D', text: { en: 'Proportionate', hi: 'आनुपातिक' } },
    ],
    correctOption: 'B',
    explanation: { en: 'There is an inverse (negative) relationship between interest rate and demand for money. When interest rates rise, opportunity cost of holding money increases, so demand for money falls.', hi: 'ब्याज दर और मुद्रा की मांग के बीच व्युत्क्रम (नकारात्मक) संबंध होता है। ब्याज दर बढ़ने पर मुद्रा रखने की अवसर लागत बढ़ती है, इसलिए मुद्रा की मांग घटती है।' },
    subject: 'Economics', topic: 'Monetary Economics',
  },
  {
    questionText: { en: 'When electricity is passed through water, what kind of chemical reaction occurs?', hi: 'जब पानी से विद्युत प्रवाहित की जाती है, तो किस प्रकार की रासायनिक प्रतिक्रिया होती है?' },
    options: [
      { key: 'A', text: { en: 'Decomposition', hi: 'अपघटन' } },
      { key: 'B', text: { en: 'Displacement', hi: 'विस्थापन' } },
      { key: 'C', text: { en: 'Double displacement', hi: 'द्विविस्थापन' } },
      { key: 'D', text: { en: 'Combination', hi: 'संयोजन' } },
    ],
    correctOption: 'A',
    explanation: { en: 'When electricity is passed through water (electrolysis of water), a decomposition reaction occurs: 2H₂O → 2H₂ + O₂. Water breaks down into hydrogen and oxygen.', hi: 'जब पानी से विद्युत प्रवाहित की जाती है (जल का विद्युत अपघटन), अपघटन प्रतिक्रिया होती है: 2H₂O → 2H₂ + O₂।' },
    subject: 'Science', topic: 'Chemistry',
  },
  {
    questionText: { en: 'Which of the following can be represented as a functional unit of nature?', hi: 'निम्नलिखित में से किसे प्रकृति की कार्यात्मक इकाई के रूप में दर्शाया जा सकता है?' },
    options: [
      { key: 'A', text: { en: 'Vehicles', hi: 'वाहन' } },
      { key: 'B', text: { en: 'Ecosystem', hi: 'पारिस्थितिकी तंत्र' } },
      { key: 'C', text: { en: 'Atmosphere', hi: 'वायुमंडल' } },
      { key: 'D', text: { en: 'Biome', hi: 'बायोम' } },
    ],
    correctOption: 'B',
    explanation: { en: 'An ecosystem is considered the functional unit of nature as it includes all living organisms and their physical environment interacting as a system.', hi: 'पारिस्थितिकी तंत्र को प्रकृति की कार्यात्मक इकाई माना जाता है क्योंकि इसमें सभी जीवित प्राणी और उनका भौतिक वातावरण एक प्रणाली के रूप में परस्पर क्रिया करते हैं।' },
    subject: 'Science', topic: 'Biology & Ecology',
  },
  {
    questionText: { en: 'In which state of India is Kund or Tanka used for water harvesting?', hi: 'भारत के किस राज्य में जल संचयन के लिए कुंड या टांका का उपयोग किया जाता है?' },
    options: [
      { key: 'A', text: { en: 'Rajasthan', hi: 'राजस्थान' } },
      { key: 'B', text: { en: 'Andhra Pradesh', hi: 'आंध्र प्रदेश' } },
      { key: 'C', text: { en: 'Uttar Pradesh', hi: 'उत्तर प्रदेश' } },
      { key: 'D', text: { en: 'Punjab', hi: 'पंजाब' } },
    ],
    correctOption: 'A',
    explanation: { en: 'Kund (or Tanka) is a traditional underground rainwater harvesting structure found in the Thar Desert region of Rajasthan. It collects and stores rainwater for drinking purposes.', hi: 'कुंड (या टांका) राजस्थान के थार रेगिस्तान क्षेत्र में पाई जाने वाली पारंपरिक भूमिगत वर्षा जल संचयन संरचना है।' },
    subject: 'Geography', topic: 'Water Conservation',
  },
  {
    questionText: { en: 'Which of the following is NOT correct about Directive Principles of State Policy?', hi: 'राज्य के नीति निर्देशक तत्त्वों के बारे में निम्नलिखित में से कौन-सा कथन सही नहीं है?' },
    options: [
      { key: 'A', text: { en: 'They ensure social and economic development.', hi: 'वे सामाजिक और आर्थिक विकास सुनिश्चित करते हैं।' } },
      { key: 'B', text: { en: 'They are justiciable in nature.', hi: 'वे न्यायोचित प्रकृति के हैं।' } },
      { key: 'C', text: { en: 'They provide guidelines for the governance of the country.', hi: 'वे देश के शासन के लिए दिशानिर्देश प्रदान करते हैं।' } },
      { key: 'D', text: { en: 'They are morally binding on the government.', hi: 'वे सरकार पर नैतिक रूप से बाध्यकारी हैं।' } },
    ],
    correctOption: 'B',
    explanation: { en: 'DPSPs are NOT justiciable (not enforceable by courts), unlike Fundamental Rights. They are moral/political obligations on the State. This is stated in Article 37.', hi: 'नीति निर्देशक तत्त्व न्यायोचित नहीं हैं (न्यायालयों द्वारा लागू नहीं किए जा सकते), मूल अधिकारों के विपरीत। यह अनुच्छेद 37 में उल्लेखित है।' },
    subject: 'Polity', topic: 'Constitutional Articles',
  },
  {
    questionText: { en: 'Which of the following statements correctly defines the Green Revolution?', hi: 'निम्नलिखित में से कौन-सा कथन हरित क्रांति को सही ढंग से परिभाषित करता है?' },
    options: [
      { key: 'A', text: { en: 'It is a new strategy in agriculture to produce food grains, especially wheat and rice.', hi: 'यह खाद्यान्न, विशेषकर गेहूं और चावल उत्पादन के लिए कृषि में एक नई रणनीति है।' } },
      { key: 'B', text: { en: 'It is a new strategy to increase the share of the forest.', hi: 'यह वन क्षेत्र बढ़ाने की नई रणनीति है।' } },
      { key: 'C', text: { en: 'It is a new strategy to use green colour for all purposes.', hi: 'यह सभी उद्देश्यों के लिए हरे रंग का उपयोग करने की रणनीति है।' } },
      { key: 'D', text: { en: 'It is a new strategy to use only herbal products.', hi: 'यह केवल हर्बल उत्पादों का उपयोग करने की रणनीति है।' } },
    ],
    correctOption: 'A',
    explanation: { en: 'The Green Revolution (1960s-70s) refers to the period of agricultural transformation using high-yielding variety (HYV) seeds, fertilisers, and irrigation to increase food grain production, especially wheat and rice in India.', hi: 'हरित क्रांति (1960-70 का दशक) उच्च उपज वाले बीजों, उर्वरकों और सिंचाई के उपयोग से खाद्यान्न उत्पादन, विशेषकर गेहूं और चावल, बढ़ाने की कृषि परिवर्तन अवधि को संदर्भित करती है।' },
    subject: 'Economics', topic: 'Agriculture & Economy',
  },
  {
    questionText: { en: 'In which part of India does the hot wind "Loo" blow?', hi: 'भारत के किस भाग में गर्म हवा "लू" चलती है?' },
    options: [
      { key: 'A', text: { en: 'West and Southwestern', hi: 'पश्चिम और दक्षिण-पश्चिम' } },
      { key: 'B', text: { en: 'North and Northwestern', hi: 'उत्तर और उत्तर-पश्चिम' } },
      { key: 'C', text: { en: 'East and Northeastern', hi: 'पूर्व और उत्तर-पूर्व' } },
      { key: 'D', text: { en: 'South and Southwestern', hi: 'दक्षिण और दक्षिण-पश्चिम' } },
    ],
    correctOption: 'B',
    explanation: { en: 'Loo is a strong, hot, and dry summer wind that blows over the North and Northwestern India (plains of Punjab, Haryana, Rajasthan, and Uttar Pradesh) during May-June.', hi: '"लू" एक तेज, गर्म और शुष्क गर्मियों की हवा है जो मई-जून में उत्तर और उत्तर-पश्चिम भारत (पंजाब, हरियाणा, राजस्थान और उत्तर प्रदेश के मैदानों) में चलती है।' },
    subject: 'Geography', topic: 'Indian Climate',
  },

  // ══════════════════════════════════════════════════
  // SHIFT 3 — General Awareness
  // ══════════════════════════════════════════════════
  {
    questionText: { en: 'Who among the following devised the system of "Subsidiary Alliance"?', hi: 'निम्नलिखित में से किसने "सहायक संधि" प्रणाली तैयार की?' },
    options: [
      { key: 'A', text: { en: 'Lord Wellesley', hi: 'लॉर्ड वेलेस्ली' } },
      { key: 'B', text: { en: 'Lord Canning', hi: 'लॉर्ड कैनिंग' } },
      { key: 'C', text: { en: 'Lord William Bentinck', hi: 'लॉर्ड विलियम बेंटिंक' } },
      { key: 'D', text: { en: 'Lord Dalhousie', hi: 'लॉर्ड डलहौजी' } },
    ],
    correctOption: 'A',
    explanation: { en: 'The Subsidiary Alliance system was devised by Lord Wellesley (Governor-General 1798-1805). Indian rulers had to maintain British troops and pay for them, surrendering control of their foreign affairs.', hi: 'सहायक संधि प्रणाली लॉर्ड वेलेस्ली (गवर्नर जनरल 1798-1805) ने तैयार की। भारतीय शासकों को ब्रिटिश सेना रखनी होती थी और विदेशी मामलों का नियंत्रण छोड़ना होता था।' },
    subject: 'History', topic: 'Modern India - British Rule',
  },
  {
    questionText: { en: 'Which of the following statements about fats and oils is INCORRECT?', hi: 'वसा और तेल के बारे में निम्नलिखित में से कौन-सा कथन गलत है?' },
    options: [
      { key: 'A', text: { en: 'Fats and oils get reduced over time and smell bad.', hi: 'वसा और तेल समय के साथ अपचयित होते हैं और बदबू देते हैं।' } },
      { key: 'B', text: { en: 'Fats and oils are oxidised, they become rancid.', hi: 'वसा और तेल ऑक्सीकृत होने पर बासी हो जाते हैं।' } },
      { key: 'C', text: { en: 'Antioxidants are added to foods containing fats and oil to prevent oxidation.', hi: 'ऑक्सीकरण रोकने के लिए वसा और तेल युक्त खाद्य पदार्थों में एंटीऑक्सीडेंट मिलाए जाते हैं।' } },
      { key: 'D', text: { en: 'Chips manufacturers usually flush bags with Nitrogen to prevent rancidity.', hi: 'चिप्स निर्माता रैंसिडिटी रोकने के लिए थैलियों में नाइट्रोजन भरते हैं।' } },
    ],
    correctOption: 'A',
    explanation: { en: 'Statement A is incorrect — fats and oils get OXIDISED (not reduced) over time, which causes rancidity and bad smell. This is called oxidative rancidity.', hi: 'कथन A गलत है — वसा और तेल समय के साथ ऑक्सीकृत होते हैं (अपचयित नहीं), जिससे रैंसिडिटी और बदबू आती है। इसे ऑक्सीडेटिव रैंसिडिटी कहते हैं।' },
    subject: 'Science', topic: 'Chemistry',
  },
  {
    questionText: { en: 'Hot local wind that flows over north India in summer is known as:', hi: 'गर्मियों में उत्तर भारत पर बहने वाली गर्म स्थानीय हवा को क्या कहते हैं?' },
    options: [
      { key: 'A', text: { en: 'Loo', hi: 'लू' } },
      { key: 'B', text: { en: 'Chinook', hi: 'चिनूक' } },
      { key: 'C', text: { en: 'Mango showers', hi: 'आम्र वर्षा' } },
      { key: 'D', text: { en: 'Purga', hi: 'पुर्गा' } },
    ],
    correctOption: 'A',
    explanation: { en: 'Loo is a strong, hot, and dry westerly wind blowing over the plains of North India during summer (April-June). Chinook is a warm wind in North America; Mango showers occur in Kerala and Karnataka.', hi: '"लू" गर्मी के मौसम में उत्तर भारत के मैदानों पर बहने वाली गर्म और शुष्क पश्चिमी हवा है।' },
    subject: 'Geography', topic: 'Indian Climate',
  },
  {
    questionText: { en: "'Nuakhai' is the state festival of:", hi: "'नुआखाई' किस राज्य का राज्योत्सव है?" },
    options: [
      { key: 'A', text: { en: 'Meghalaya', hi: 'मेघालय' } },
      { key: 'B', text: { en: 'Odisha', hi: 'ओडिशा' } },
      { key: 'C', text: { en: 'Tamil Nadu', hi: 'तमिलनाडु' } },
      { key: 'D', text: { en: 'Bihar', hi: 'बिहार' } },
    ],
    correctOption: 'B',
    explanation: { en: 'Nuakhai (meaning "new food") is an agricultural festival of Odisha and is the most important festival of western Odisha. It celebrates the harvesting of new rice.', hi: 'नुआखाई (अर्थ "नया भोजन") ओडिशा का एक कृषि उत्सव है और पश्चिमी ओडिशा का सबसे महत्वपूर्ण त्योहार है।' },
    subject: 'Culture', topic: 'Festivals',
  },
  {
    questionText: { en: 'Which Article of the Indian Constitution prohibits providing of any religious instruction in educational institutions maintained by the State?', hi: 'भारतीय संविधान का कौन-सा अनुच्छेद राज्य द्वारा संचालित शैक्षणिक संस्थाओं में धार्मिक शिक्षा देने पर रोक लगाता है?' },
    options: [
      { key: 'A', text: { en: 'Article 29', hi: 'अनुच्छेद 29' } },
      { key: 'B', text: { en: 'Article 28', hi: 'अनुच्छेद 28' } },
      { key: 'C', text: { en: 'Article 30', hi: 'अनुच्छेद 30' } },
      { key: 'D', text: { en: 'Article 25', hi: 'अनुच्छेद 25' } },
    ],
    correctOption: 'B',
    explanation: { en: 'Article 28 of the Indian Constitution prohibits religious instruction in educational institutions wholly maintained out of State funds.', hi: 'भारतीय संविधान का अनुच्छेद 28 राज्य निधि से पूरी तरह संचालित शैक्षणिक संस्थाओं में धार्मिक शिक्षा देने पर प्रतिबंध लगाता है।' },
    subject: 'Polity', topic: 'Fundamental Rights',
  },
  {
    questionText: { en: 'Under which of the following Acts was the power to rule India transferred from the English East India Company to the British Crown?', hi: 'निम्नलिखित में से किस अधिनियम के तहत भारत पर शासन की शक्ति ईस्ट इंडिया कंपनी से ब्रिटिश ताज को हस्तांतरित की गई?' },
    options: [
      { key: 'A', text: { en: 'Charter Act of 1833', hi: 'चार्टर अधिनियम 1833' } },
      { key: 'B', text: { en: 'Regulating Act 1773', hi: 'रेगुलेटिंग अधिनियम 1773' } },
      { key: 'C', text: { en: "Pitt's India Act 1784", hi: 'पिट्स इंडिया एक्ट 1784' } },
      { key: 'D', text: { en: 'Government of India Act 1858', hi: 'भारत सरकार अधिनियम 1858' } },
    ],
    correctOption: 'D',
    explanation: { en: 'The Government of India Act 1858 was passed after the 1857 revolt. It transferred the power to govern India from the East India Company to the British Crown. The Governor-General was renamed Viceroy.', hi: 'भारत सरकार अधिनियम 1858 को 1857 के विद्रोह के बाद पारित किया गया। इसने ईस्ट इंडिया कंपनी से ब्रिटिश ताज को भारत पर शासन की शक्ति हस्तांतरित की।' },
    subject: 'History', topic: 'Modern India - British Rule',
  },
  {
    questionText: { en: 'Which of the following is an inactivated (killed) polio vaccine developed in 1952?', hi: '1952 में विकसित निम्नलिखित में से कौन-सा पोलियो का निष्क्रिय (मृत) टीका है?' },
    options: [
      { key: 'A', text: { en: 'Salk vaccine', hi: 'साल्क वैक्सीन' } },
      { key: 'B', text: { en: 'Imvanex vaccine', hi: 'इम्वैनेक्स वैक्सीन' } },
      { key: 'C', text: { en: 'HDCV vaccine', hi: 'HDCV वैक्सीन' } },
      { key: 'D', text: { en: 'TAB vaccine', hi: 'TAB वैक्सीन' } },
    ],
    correctOption: 'A',
    explanation: { en: 'The Salk vaccine (IPV - Inactivated Polio Vaccine) was developed by Dr. Jonas Salk in 1952. The oral polio vaccine (OPV) was developed by Dr. Albert Sabin in 1961.', hi: 'साल्क वैक्सीन (IPV - निष्क्रिय पोलियो वैक्सीन) डॉ. जोनास साल्क ने 1952 में विकसित की थी। ओरल पोलियो वैक्सीन (OPV) 1961 में डॉ. अल्बर्ट साबिन ने विकसित की थी।' },
    subject: 'Science', topic: 'Biology & Health',
  },
  {
    questionText: { en: "What is the length of Indian Railways network according to Railway Yearbook 2019-20?", hi: 'रेलवे वर्षपुस्तक 2019-20 के अनुसार भारतीय रेलवे नेटवर्क की लंबाई कितनी है?' },
    options: [
      { key: 'A', text: { en: '67,956 km', hi: '67,956 किमी' } },
      { key: 'B', text: { en: '1,604 km', hi: '1,604 किमी' } },
      { key: 'C', text: { en: '63,950 km', hi: '63,950 किमी' } },
      { key: 'D', text: { en: '2,402 km', hi: '2,402 किमी' } },
    ],
    correctOption: 'A',
    explanation: { en: 'According to Railway Yearbook 2019-20, the Indian Railways network spans 67,956 km, making it one of the largest rail networks in the world.', hi: 'रेलवे वर्षपुस्तक 2019-20 के अनुसार, भारतीय रेलवे नेटवर्क 67,956 किमी तक फैला है, जो इसे विश्व के सबसे बड़े रेल नेटवर्क में से एक बनाता है।' },
    subject: 'Current Affairs', topic: 'Infrastructure',
  },
  {
    questionText: { en: 'Silappathikaram (the Jewelled Anklet), the earliest epic poem in Tamil, was written in the 5th-6th Century CE by _________.', hi: 'सिलप्पतिकारम (रत्न जड़ित पायल), तमिल का सबसे पुराना महाकाव्य, 5वीं-6वीं शताब्दी ई. में किसने लिखा?' },
    options: [
      { key: 'A', text: { en: 'Tolkappiyar', hi: 'तोल्काप्पियर' } },
      { key: 'B', text: { en: 'Ilango Adigal', hi: 'इलांगो अडिगल' } },
      { key: 'C', text: { en: 'Sittalai Sattanar', hi: 'सित्तलाई सत्तनार' } },
      { key: 'D', text: { en: 'Kambar', hi: 'कंबर' } },
    ],
    correctOption: 'B',
    explanation: { en: 'Silappathikaram was written by Ilango Adigal, a Jain prince and poet. Along with Manimekalai, it is one of the Five Great Epics of Tamil literature.', hi: 'सिलप्पतिकारम इलांगो अडिगल द्वारा लिखी गई थी, जो एक जैन राजकुमार और कवि थे। मणिमेकलाई के साथ, यह तमिल साहित्य के पांच महान महाकाव्यों में से एक है।' },
    subject: 'Culture', topic: 'Literature & Art',
  },
  {
    questionText: { en: 'In Pradhan Mantri Gramin Awaas Yojana, the cost of unit assistance is shared between Central and State Governments in the ratio ___________ in plain areas.', hi: 'प्रधानमंत्री ग्रामीण आवास योजना में मैदानी क्षेत्रों में केंद्र और राज्य सरकारों के बीच इकाई सहायता की लागत ___________ अनुपात में साझा की जाती है।' },
    options: [
      { key: 'A', text: { en: '60 : 40', hi: '60 : 40' } },
      { key: 'B', text: { en: '40 : 60', hi: '40 : 60' } },
      { key: 'C', text: { en: '90 : 10', hi: '90 : 10' } },
      { key: 'D', text: { en: '30 : 70', hi: '30 : 70' } },
    ],
    correctOption: 'A',
    explanation: { en: 'Under PMGAY, the cost sharing between Central and State governments is 60:40 in plain areas and 90:10 in North Eastern and Himalayan states.', hi: 'PMGAY के तहत, मैदानी क्षेत्रों में केंद्र और राज्य सरकारों के बीच लागत साझाकरण 60:40 है और उत्तर-पूर्वी तथा हिमालयी राज्यों में 90:10 है।' },
    subject: 'Current Affairs', topic: 'Government Schemes',
  },
  {
    questionText: { en: 'Which of the following countries won the first men\'s Asian Hockey Championship trophy?', hi: 'पहला पुरुष एशियाई हॉकी चैंपियनशिप ट्रॉफी निम्नलिखित में से किस देश ने जीती?' },
    options: [
      { key: 'A', text: { en: 'Japan', hi: 'जापान' } },
      { key: 'B', text: { en: 'China', hi: 'चीन' } },
      { key: 'C', text: { en: 'India', hi: 'भारत' } },
      { key: 'D', text: { en: 'Pakistan', hi: 'पाकिस्तान' } },
    ],
    correctOption: 'D',
    explanation: { en: 'Pakistan won the first Asian Hockey Championship held in 1982 in Karachi. Pakistan has been a dominant force in Asian hockey.', hi: 'पाकिस्तान ने 1982 में कराची में आयोजित पहली एशियाई हॉकी चैंपियनशिप जीती।' },
    subject: 'Sports', topic: 'Hockey',
  },
  {
    questionText: { en: 'In which of the following states is the Nrityagram, an Odissi dance institution, located?', hi: 'नृत्यग्राम, एक ओडिसी नृत्य संस्थान, निम्नलिखित में से किस राज्य में स्थित है?' },
    options: [
      { key: 'A', text: { en: 'Kerala', hi: 'केरल' } },
      { key: 'B', text: { en: 'Karnataka', hi: 'कर्नाटक' } },
      { key: 'C', text: { en: 'Tamil Nadu', hi: 'तमिलनाडु' } },
      { key: 'D', text: { en: 'Maharashtra', hi: 'महाराष्ट्र' } },
    ],
    correctOption: 'B',
    explanation: { en: 'Nrityagram is an Odissi dance village/gurukul located near Bangalore, Karnataka. It was founded in 1990 by Protima Bedi and promotes Indian classical dance.', hi: 'नृत्यग्राम बैंगलोर, कर्नाटक के पास स्थित एक ओडिसी नृत्य गुरुकुल है। इसकी स्थापना 1990 में प्रोतिमा बेदी ने की थी।' },
    subject: 'Culture', topic: 'Art & Dance',
  },
  {
    questionText: { en: 'Which of the following goods needs further transformation in the economic process?', hi: 'आर्थिक प्रक्रिया में निम्नलिखित में से किस वस्तु को और रूपांतरण की आवश्यकता है?' },
    options: [
      { key: 'A', text: { en: 'Consumer durable goods', hi: 'उपभोक्ता टिकाऊ वस्तुएं' } },
      { key: 'B', text: { en: 'Finished goods', hi: 'तैयार माल' } },
      { key: 'C', text: { en: 'Intermediate goods', hi: 'मध्यवर्ती वस्तुएं' } },
      { key: 'D', text: { en: 'Capital goods', hi: 'पूंजीगत वस्तुएं' } },
    ],
    correctOption: 'C',
    explanation: { en: 'Intermediate goods are goods that are used as inputs in the production of other goods and services. They need further processing or transformation before reaching the final consumer.', hi: 'मध्यवर्ती वस्तुएं वे हैं जिनका उपयोग अन्य वस्तुओं और सेवाओं के उत्पादन में इनपुट के रूप में किया जाता है। इन्हें अंतिम उपभोक्ता तक पहुंचने से पहले और प्रसंस्करण की आवश्यकता होती है।' },
    subject: 'Economics', topic: 'Basic Economics',
  },
];

(async () => {
  try {
    console.log('\nConnecting to MongoDB...');
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 10000 });
    console.log('Connected\n');

    console.log(`Seeding ${questions.length} SSC CGL 2024 GA questions...`);
    const inserted = await Question.insertMany(questions);
    console.log(`✅ ${inserted.length} questions inserted successfully!`);
    console.log('Topics covered: History, Polity, Geography, Science, Economics, Culture, Sports, Current Affairs');

    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('Failed:', err.message);
    await mongoose.connection.close().catch(() => {});
    process.exit(1);
  }
})();
