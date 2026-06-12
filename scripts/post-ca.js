/**
 * post-ca.js — Post today's current affairs to RiseRank
 * Run: node scripts/post-ca.js
 */
const https = require('https');
const http = require('http');

function post(path, data, token) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(data);
    const headers = { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) };
    if (token) headers['Authorization'] = 'Bearer ' + token;
    const req = http.request({ hostname: 'localhost', port: 5001, path, method: 'POST', headers }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => { try { resolve(JSON.parse(d)); } catch (e) { resolve({ raw: d }); } });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function translate(text) {
  return new Promise(resolve => {
    if (!text) return resolve('');
    const url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=hi&dt=t&q=' + encodeURIComponent(text);
    https.get(url, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve(JSON.parse(d)[0].map(s => s[0]).join('')); } catch (e) { resolve(text); }
      });
    }).on('error', () => resolve(text));
  });
}

const articles = [
  {
    titleEn: 'Jaspal Rana, Champion Shooter and Coach, Passes Away at 49',
    summaryEn: 'Jaspal Rana, renowned Indian sport shooter and national coach, passed away on June 12, 2026 at age 49.',
    bodyEn: 'Jaspal Rana was one of India most decorated sport shooters who won gold at the Commonwealth Games and Asian Shooting Championships multiple times. He later coached the Indian national shooting team. He passed away on June 12, 2026 at Max Hospital, Saket, New Delhi. His death is a great loss to Indian sports.',
    examTags: ['ssc', 'railway', 'banking'],
  },
  {
    titleEn: 'India Appoints Dinesh Trivedi as High Commissioner to Bangladesh',
    summaryEn: 'India appointed former MP Dinesh Trivedi as High Commissioner to Bangladesh on April 27, 2026 — the first political appointee to an ambassadorial role in South Asia.',
    bodyEn: 'Dinesh Trivedi, former railway minister and Member of Parliament, was appointed as India High Commissioner to Bangladesh. This marks the first time a political figure has been appointed to an ambassadorial post in South Asia under recent Indian foreign policy. Bangladesh is a key neighbour with strong trade and cultural ties.',
    examTags: ['ssc', 'railway', 'banking'],
  },
  {
    titleEn: 'World Bank Projects India GDP Growth at 6.6% for FY 2026-27',
    summaryEn: 'The World Bank projected India GDP growth at 6.6% for FY 2026-27 in its Global Economic Prospects report released on June 11, 2026.',
    bodyEn: 'The World Bank Global Economic Prospects report released on June 11, 2026 projected India GDP growth at 6.6% for FY 2026-27. India remains the fastest-growing major economy globally. Key growth drivers include strong domestic consumption, infrastructure investment, and digital economy expansion.',
    examTags: ['ssc', 'railway', 'banking'],
  },
  {
    titleEn: 'India Signs Trade Agreements with EU, USA and Canada for Viksit Bharat 2047',
    summaryEn: 'India signed free trade agreements with EU, New Zealand, EFTA, Canada and USA in 2026 as part of the Viksit Bharat 2047 vision.',
    bodyEn: 'In 2026, India signed free trade agreements with the European Union, New Zealand, the European Free Trade Association, Canada, and the United States. These agreements are part of the Viksit Bharat 2047 vision to make India a developed nation by 2047, expected to boost exports and create millions of jobs across sectors.',
    examTags: ['ssc', 'railway', 'banking'],
  },
  {
    titleEn: 'India and Bangladesh Agree to Strengthen Border Cooperation',
    summaryEn: 'India and Bangladesh agreed on June 12, 2026 to improve border cooperation through intelligence sharing and coordinated BSF-BGB patrols.',
    bodyEn: 'After a four-day meeting concluding on June 12, 2026, India and Bangladesh agreed to deepen border management cooperation. The agreement covers improved intelligence sharing between BSF and Border Guard Bangladesh, coordinated patrols, and measures to curb smuggling and illegal crossings along the shared border.',
    examTags: ['ssc', 'railway', 'banking'],
  },
];

(async () => {
  const login = await post('/api/v1/auth/admin/login', { email: 'superadmin@riserank.in', password: 'RiseRank@2024' });
  const token = login.data && (login.data.accessToken || login.data.token);
  if (!token) { console.error('Login failed:', JSON.stringify(login)); process.exit(1); }
  console.log('Login OK');

  for (const a of articles) {
    const hi_title = await translate(a.titleEn);
    const hi_summary = await translate(a.summaryEn);
    const hi_body = await translate(a.bodyEn);
    const res = await post('/api/v1/current-affairs', {
      title: { en: a.titleEn, hi: hi_title },
      summary: { en: a.summaryEn, hi: hi_summary },
      body: { en: a.bodyEn, hi: hi_body },
      examTags: a.examTags,
      status: 'published',
    }, token);
    console.log(res.success ? 'Posted: ' + a.titleEn.slice(0, 60) : 'FAIL: ' + JSON.stringify(res).slice(0, 200));
    await new Promise(r => setTimeout(r, 500));
  }
  console.log('All done!');
})().catch(console.error);
