/**
 * seed-idioms.js
 * Seeds 200 Idioms & Phrases questions into MongoDB.
 * Run: node scripts/seed-idioms.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Question = require('../src/models/Question');
const Admin    = require('../src/models/Admin');

// ── 200 idiom-meaning pairs ───────────────────────────────────────────────────
const IDIOMS = [
  ['A bun in the oven', 'Pregnant'],
  ['A cash cow', 'A business or product that provides a steady source of income'],
  ['A clarion call', 'A strong and clear call to action'],
  ['A damp squib', 'Something that fails to meet expectations'],
  ['A dish fit for the gods', 'Extremely delicious food'],
  ['A dog and pony show', 'An elaborate but superficial presentation'],
  ['A dog in the manger', 'A selfish person who prevents others from using something'],
  ['A dressing down', 'A severe scolding'],
  ['A far cry from', 'Very different from'],
  ['A fighting chance', 'A small but real possibility of success'],
  ['A fine state of affairs', 'An unpleasant or unsatisfactory situation'],
  ['A five finger discount', 'The act of stealing or shoplifting'],
  ['A flea in one\'s ear', 'A sharp rebuke or scolding'],
  ['A fly in the ointment', 'A small problem that spoils something otherwise good'],
  ['A fly on the wheel', 'Someone who overestimates their own influence or power in a situation'],
  ['A heart to heart', 'An honest and open conversation'],
  ['A hornet\'s nest', 'A situation that causes serious trouble'],
  ['A Judas kiss', 'An act that appears friendly but is actually intended to harm or betray'],
  ['A lemon', 'A product, especially a car, that is faulty'],
  ['A lump in one\'s throat', 'A tight feeling in the throat caused by strong emotion, making it difficult to speak'],
  ['A mare\'s nest', 'A false discovery; a messy, chaotic situation'],
  ['A one-trick pony', 'A person or thing with only one special skill or talent'],
  ['A rift in the lute', 'A small problem that threatens to destroy a relationship'],
  ['A tough row to hoe', 'A very difficult task or situation'],
  ['A voice crying in the wilderness', 'A warning that no one pays attention to'],
  ['After a fashion', 'In a way that is barely acceptable'],
  ['Alarums and excursions', 'Chaotic activity and confusion'],
  ['All and sundry', 'Everyone, without exception'],
  ['An albatross around one\'s neck', 'A heavy burden or guilt that hinders one\'s progress'],
  ['An eyesore', 'Something ugly or unpleasant to look at'],
  ['Angle for', 'To try to get something in a clever, indirect way'],
  ['Any port in a storm', 'A place of refuge or shelter during difficulty'],
  ['Apropos of nothing', 'Without any connection to what was being discussed'],
  ['As clean as a whistle', 'Extremely clean or completely free from guilt'],
  ['As easy as pie', 'Very easy to do'],
  ['As good as gold', 'Well-behaved and obedient'],
  ['As right as rain', 'Perfectly fine or in good health'],
  ['As tight as the bark on a tree', 'Extremely stingy; very miserly'],
  ['At a loose end', 'Having nothing to do; restless or unsettled'],
  ['At a low ebb', 'In a weak state or at a low point'],
  ['At one\'s disposal', 'Available for one\'s use'],
  ['At the end of one\'s rope', 'Having no more patience or strength left'],
  ['Bang for the buck', 'Good value for money'],
  ['Be all one to someone', 'Of no importance; making no difference'],
  ['Be floored', 'To be extremely surprised or shocked'],
  ['Be going places', 'To be destined for success in the future'],
  ['Be tied to someone\'s apron strings', 'Excessively dependent on someone'],
  ['Beard the lion in his den', 'To confront a powerful or dangerous person on their own ground'],
  ['Beat the band', 'To an extreme degree; exceedingly'],
  ['Beat the drum for', 'To speak enthusiastically in support of something'],
  ['Beat the rap', 'To escape punishment or blame'],
  ['Beginner\'s luck', 'Good luck experienced by a beginner'],
  ['Behind someone\'s back', 'Without someone\'s knowledge; secretly'],
  ['Belle of the ball', 'The most admired or attractive woman at an event'],
  ['Bells and whistles', 'Attractive but unnecessary extra features'],
  ['Bend over backwards', 'To make great efforts to help or please someone'],
  ['Bend someone\'s ear', 'To talk to someone at tedious length, especially about a problem'],
  ['Beside oneself', 'Overwhelmed with emotion; unable to control oneself'],
  ['Beyond the pale', 'Outside the bounds of acceptable behavior'],
  ['Bid defiance', 'To openly resist or challenge'],
  ['Bid fair', 'To seem likely to succeed or happen'],
  ['Bide one\'s time', 'To wait patiently for the right moment to act'],
  ['Big draw', 'A person or thing that attracts a lot of attention'],
  ['Blaze a trail', 'To be the first to do something new'],
  ['Blow smoke', 'To deceive or mislead someone'],
  ['Blue in the face', 'Exhausted from repeated but futile attempts'],
  ['Bob\'s your uncle', 'Used to say that something will be done easily'],
  ['Box someone\'s ear', 'To slap someone on the ear'],
  ['Break a sweat', 'To exert physical effort'],
  ['Break loose', 'To escape from control or restraint'],
  ['Break one\'s duck', 'To score for the first time or achieve one\'s first success'],
  ['Break the bank', 'To cost too much money'],
  ['Breast the tape', 'To win a race by crossing the finish line first'],
  ['Bring home the bacon', 'To earn money for one\'s family; to succeed'],
  ['Broth of a boy', 'A lively and high-spirited young man'],
  ['Buck the system', 'To resist or fight against established rules or authority'],
  ['Buck the trend', 'To resist or go against the prevailing trend or popular opinion'],
  ['Burst someone\'s bubble', 'To destroy someone\'s illusions or hopes'],
  ['Buy the farm', 'To die'],
  ['By and by', 'Before long; eventually'],
  ['By far', 'By a great amount'],
  ['By the sweat of one\'s brow', 'By one\'s own hard work and effort'],
  ['Cards are stacked against someone', 'To be in a situation where success is very unlikely'],
  ['Carry coals to Newcastle', 'To supply something that is already plentiful'],
  ['Cast a slur on', 'To make unfair or damaging remarks about someone'],
  ['Cast someone adrift', 'To leave someone without help or support'],
  ['Cast the first stone', 'To be the first to criticize or blame someone'],
  ['Catch a weasel asleep', 'To surprise someone when they are not prepared'],
  ['Catch-all', 'Something that covers a wide range of things'],
  ['Cat\'s in the cradle', 'A parent being too busy for their child, leading to a distant relationship'],
  ['Change hands', 'To pass to a different owner'],
  ['Change horses in midstream', 'To change plans or leadership in the middle of an important activity'],
  ['Cheek by jowl', 'Very close together'],
  ['Cheek to cheek', 'Dancing or standing very close together, face to face'],
  ['Clear the decks', 'To prepare for an activity by dealing with anything in the way'],
  ['Cloak and dagger', 'Involving secrecy and intrigue'],
  ['Close the book on', 'To stop doing or dealing with something finally'],
  ['Cock of the walk', 'A person who dominates others in a group'],
  ['Cold comfort', 'Something that offers little comfort in a bad situation'],
  ['Come to mind', 'To suddenly come into one\'s thoughts'],
  ['Come between the bark and the tree', 'To interfere in a close relationship, especially a family matter'],
  ['Come clean', 'To tell the truth about something'],
  ['Come out of one\'s shell', 'To become less shy and more confident in social situations'],
  ['Come to a standstill', 'To stop completely; to cease all movement or progress'],
  ['Cook someone\'s goose', 'To ruin someone\'s plans or chances'],
  ['Count down the days', 'To wait eagerly for something'],
  ['Cross someone\'s mind', 'To come into someone\'s thoughts'],
  ['Cross the Rubicon', 'To do something that cannot be undone'],
  ['Cry stinking fish', 'To say bad things about one\'s own products or work'],
  ['Cut both ways', 'To have both positive and negative effects'],
  ['Cut it out', 'To stop doing something annoying'],
  ['Cut one\'s teeth on', 'To get one\'s first experience of something'],
  ['Cut someone off without a shilling', 'To disinherit someone completely'],
  ['Cut the cackle', 'To stop talking nonsense and get to the point'],
  ['Cut the Gordian knot', 'To solve a difficult problem decisively'],
  ['Cut to the quick', 'To hurt someone\'s feelings deeply'],
  ['Dead meat', 'A person who is in serious trouble'],
  ['Dead men\'s shoes', 'A position available only after someone\'s departure'],
  ['Dice with death', 'To put one\'s life at risk'],
  ['Dine with Duke Humphrey', 'To go without food; remain hungry'],
  ['Don\'t buy it', 'To not believe something'],
  ['Don\'t care a hang', 'To not care at all about something'],
  ['Down for the count', 'Defeated, unconscious, or unable to continue'],
  ['Down the road', 'In the future; at a later time'],
  ['Draw a blank', 'To fail to get an answer or remember something'],
  ['Draw on one\'s fancy', 'To use one\'s imagination'],
  ['Dressed to the nines', 'Dressed very elegantly or formally'],
  ['Drive home', 'To emphasize a point clearly and forcefully'],
  ['Drive someone up the wall', 'To make someone extremely annoyed'],
  ['Easy does it', 'Do something carefully and slowly'],
  ['Eat crow', 'To admit that you were wrong'],
  ['Eat the leek', 'To be forced to take back one\'s words humiliatingly'],
  ['Fair\'s fair', 'Used to say that treatment should be fair and equal'],
  ['Feast one\'s eyes on', 'To gaze at something with great pleasure'],
  ['Feather one\'s nest', 'To make money, often dishonestly, for oneself'],
  ['Feel the pinch', 'To experience financial hardship'],
  ['Few and far between', 'Rare and scarce'],
  ['Fiddle while Rome burns', 'To do trivial things while ignoring a serious crisis'],
  ['Fight shy of', 'To be unwilling to do or become involved in something'],
  ['Fly by the seat of one\'s pants', 'To act on instinct without planning'],
  ['Fly off the handle', 'To lose one\'s temper suddenly'],
  ['Follow suit', 'To do the same as others have done'],
  ['Footloose and fancy-free', 'Free from responsibilities or romantic commitments'],
  ['From cradle to grave', 'Throughout one\'s entire life'],
  ['Full of hot air', 'Full of empty, boastful talk'],
  ['Full of sound and fury', 'Loud but meaningless or ineffective'],
  ['Gall and wormwood', 'Something extremely bitter or irritating'],
  ['Get away scot-free', 'To escape punishment or consequences entirely'],
  ['Get it in the neck', 'To be severely criticized or punished'],
  ['Get one\'s dander up', 'To become very angry or lose one\'s temper'],
  ['Get one\'s head around', 'To comprehend or understand something difficult'],
  ['Get one\'s walking papers', 'To be officially dismissed or fired from a job'],
  ['Get something out of one\'s system', 'To do something so that you no longer feel the need to do it'],
  ['Get the hang of', 'To learn how to do or use something'],
  ['Get the sack', 'To be dismissed from one\'s job'],
  ['Gird up one\'s loins', 'To prepare oneself for something difficult or challenging'],
  ['Give someone enough rope', 'To give someone freedom to act, often so they make mistakes'],
  ['Give the game away', 'To reveal a secret or spoil a surprise'],
  ['Give vent to', 'To express strong feelings forcefully'],
  ['Go a long way', 'To be very helpful or successful; to last for a long time'],
  ['Go bananas', 'To become very angry or excited'],
  ['Go bonkers', 'To become crazy or act wildly'],
  ['Go down a storm', 'To be received with great enthusiasm; to be very successful'],
  ['Go down the tubes', 'To be ruined, or fail'],
  ['Go easy on', 'To use something sparingly; or to treat someone leniently'],
  ['Go for the jugular', 'To attack someone\'s weakest point'],
  ['Go haywire', 'To stop working correctly and become out of control'],
  ['Go pear-shaped', 'To go badly wrong'],
  ['Go suck a lemon', 'A rude expression telling someone to go away'],
  ['Go the whole hog', 'To do something completely and thoroughly'],
  ['Go to hell in a handbasket', 'To deteriorate rapidly and uncontrollably'],
  ['Go to the devil', 'An angry dismissal telling someone to go away'],
  ['Go to the wall', 'To fail completely or be ruined financially'],
  ['Go-getter', 'An ambitious and determined person'],
  ['Grease the skids', 'To clear the way for something'],
  ['Grease the wheels', 'To make a process or situation run more smoothly'],
  ['Greener pastures', 'A new place or situation that offers better opportunities'],
  ['Grist to the mill', 'Something useful or advantageous'],
  ['Hail from', 'To come from or originate from a place'],
  ['Hand over fist', 'Very quickly, especially when making or losing money'],
  ['Hang fire', 'To delay making a decision or taking action'],
  ['Hang in the balance', 'To be uncertain or undecided'],
  ['Hang in there', 'To persevere during difficult times'],
  ['Hang one\'s head', 'To feel or show great shame or embarrassment'],
  ['Hard to come by', 'Difficult to find or obtain'],
  ['Have a bash', 'To make an attempt'],
  ['Have hollow legs', 'To be able to eat or drink a lot without showing effects'],
  ['Have something on the brain', 'To be obsessed with something'],
  ['Have something under one\'s belt', 'To have already done or experienced something'],
  ['Have two strings to one\'s bow', 'Have alternative plans or resources'],
  ['Have words with', 'To argue with someone'],
  ['High-handed', 'Acting in an arrogant or domineering manner'],
  ['Hit the ground running', 'To start doing something and proceed quickly and successfully'],
  ['Hoist by one\'s own petard', 'To be harmed by something that was intended to harm someone else'],
  ['Hold someone\'s feet to the fire', 'To pressure someone to fulfil their obligations'],
  ['Hot under the collar', 'Feeling angry or annoyed'],
  ['I\'ll eat my hat', 'Expression of certainty that something will not happen'],
  ['In a time warp', 'In a state where things have not changed from the past'],
  ['In dire straits', 'In a very bad or difficult situation, especially financial'],
  ['In Dutch with', 'In trouble or disfavor with someone'],
];

// ── Helper: shuffle array ────────────────────────────────────────────────────
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── Build questions ───────────────────────────────────────────────────────────
function buildQuestions(adminId) {
  const allMeanings = IDIOMS.map(([, meaning]) => meaning);

  return IDIOMS.map(([idiom, correctMeaning], idx) => {
    // Pick 3 wrong options from other indices, spaced apart
    const wrongPool = [];
    const step = Math.floor(allMeanings.length / 4);
    for (let s = 1; s <= 3; s++) {
      let wrongIdx = (idx + s * step) % allMeanings.length;
      // Ensure it's not the same as correct
      while (allMeanings[wrongIdx] === correctMeaning) {
        wrongIdx = (wrongIdx + 1) % allMeanings.length;
      }
      wrongPool.push(allMeanings[wrongIdx]);
    }

    // 4 options: 1 correct + 3 wrong, shuffled
    const optionTexts = shuffle([correctMeaning, ...wrongPool]);
    const keys = ['A', 'B', 'C', 'D'];
    const correctKey = keys[optionTexts.indexOf(correctMeaning)];

    // Simple Hindi placeholder — correct meaning in transliterated form
    const options = keys.map((key, i) => ({
      key,
      text: {
        en: optionTexts[i],
        hi: optionTexts[i], // same text; update with proper Hindi translations later
      },
    }));

    return {
      questionText: {
        en: `What does the idiom "${idiom}" mean?`,
        hi: `मुहावरे "${idiom}" का अर्थ क्या है?`,
      },
      options,
      correctOption: correctKey,
      explanation: {
        en: `"${idiom}" means: ${correctMeaning}.`,
        hi: `"${idiom}" का अर्थ है: ${correctMeaning}।`,
      },
      examCategory: 'ssc',
      subject: 'english',
      topic: 'idioms_phrases',
      difficulty: 'medium',
      tags: ['idioms', 'phrases', 'english', 'ssc-cgl'],
      status: 'published',
      createdBy: adminId,
    };
  });
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('Connecting to MongoDB…');
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected.');

  const admin = await Admin.findOne({ role: { $in: ['admin', 'superadmin'] } }).select('_id email');
  if (!admin) throw new Error('No admin found. Create an admin first.');
  console.log(`Using admin: ${admin.email} (${admin._id})`);

  const questions = buildQuestions(admin._id);
  console.log(`Inserting ${questions.length} questions…`);

  // Avoid duplicates: remove any existing idioms_phrases questions first (optional)
  // await Question.deleteMany({ topic: 'idioms_phrases' });

  const result = await Question.insertMany(questions, { ordered: false });
  console.log(`✅ Inserted ${result.length} Idioms & Phrases questions successfully.`);

  await mongoose.disconnect();
  console.log('Done.');
}

main().catch((err) => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
