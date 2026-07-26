const fs = require('fs');

function flatten(obj, prefix = '') {
  const res = {};
  for (const k in obj) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
      Object.assign(res, flatten(obj[k], key));
    } else {
      res[key] = obj[key];
    }
  }
  return res;
}

const msgEn = flatten(JSON.parse(fs.readFileSync('src/messages/en.json', 'utf8')));
const msgAr = flatten(JSON.parse(fs.readFileSync('src/messages/ar.json', 'utf8')));
const locEn = flatten(JSON.parse(fs.readFileSync('src/locales/en.json', 'utf8')));
const locAr = flatten(JSON.parse(fs.readFileSync('src/locales/ar.json', 'utf8')));

console.log(`Key counts:
  src/messages/en.json: ${Object.keys(msgEn).length}
  src/messages/ar.json: ${Object.keys(msgAr).length}
  src/locales/en.json:  ${Object.keys(locEn).length}
  src/locales/ar.json:  ${Object.keys(locAr).length}
`);

const msgEnKeys = Object.keys(msgEn);
const msgArKeys = Object.keys(msgAr);
const locEnKeys = Object.keys(locEn);
const locArKeys = Object.keys(locAr);

console.log('--- Missing in messages/ar.json vs messages/en.json ---');
msgEnKeys.filter(k => !(k in msgAr)).forEach(k => console.log(`  - ${k}: "${msgEn[k]}"`));

console.log('--- Missing in locales/ar.json vs locales/en.json ---');
locEnKeys.filter(k => !(k in locAr)).forEach(k => console.log(`  - ${k}: "${locEn[k]}"`));

console.log('--- Missing in messages/en.json vs locales/en.json ---');
locEnKeys.filter(k => !(k in msgEn)).forEach(k => console.log(`  - ${k}: "${locEn[k]}"`));

console.log('--- Missing in locales/en.json vs messages/en.json ---');
msgEnKeys.filter(k => !(k in locEn)).forEach(k => console.log(`  - ${k}: "${msgEn[k]}"`));

console.log('--- Differences between messages/en.json and locales/en.json values ---');
let diffCountEn = 0;
msgEnKeys.forEach(k => {
  if (k in locEn && msgEn[k] !== locEn[k]) {
    console.log(`  - ${k}: msg="${msgEn[k]}" vs loc="${locEn[k]}"`);
    diffCountEn++;
  }
});
if (diffCountEn === 0) console.log('  None! messages/en.json and locales/en.json are identical.');

console.log('--- Differences between messages/ar.json and locales/ar.json values ---');
let diffCountAr = 0;
msgArKeys.forEach(k => {
  if (k in locAr && msgAr[k] !== locAr[k]) {
    console.log(`  - ${k}: msg="${msgAr[k]}" vs loc="${locAr[k]}"`);
    diffCountAr++;
  }
});
if (diffCountAr === 0) console.log('  None! All existing keys have identical values between messages/ar.json and locales/ar.json.');
