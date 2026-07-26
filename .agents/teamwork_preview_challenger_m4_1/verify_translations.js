const fs = require('fs');
const path = require('path');

const root = 'd:/football/kickoff';

function getLeafKeys(obj, prefix = '') {
  let keys = {};
  for (const k in obj) {
    const fullKey = prefix ? `${prefix}.${k}` : k;
    if (obj[k] !== null && typeof obj[k] === 'object' && !Array.isArray(obj[k])) {
      Object.assign(keys, getLeafKeys(obj[k], fullKey));
    } else {
      keys[fullKey] = obj[k];
    }
  }
  return keys;
}

function countKeysPerNamespace(obj) {
  const counts = {};
  for (const ns in obj) {
    if (obj[ns] !== null && typeof obj[ns] === 'object' && !Array.isArray(obj[ns])) {
      const leafKeys = getLeafKeys(obj[ns]);
      counts[ns] = Object.keys(leafKeys).length;
    } else {
      counts[ns] = 1;
    }
  }
  return counts;
}

const localesEnPath = path.join(root, 'src/locales/en.json');
const localesArPath = path.join(root, 'src/locales/ar.json');
const messagesEnPath = path.join(root, 'src/messages/en.json');
const messagesArPath = path.join(root, 'src/messages/ar.json');

const localesEn = JSON.parse(fs.readFileSync(localesEnPath, 'utf8'));
const localesAr = JSON.parse(fs.readFileSync(localesArPath, 'utf8'));

const flatEn = getLeafKeys(localesEn);
const flatAr = getLeafKeys(localesAr);

const enKeyCount = Object.keys(flatEn).length;
const arKeyCount = Object.keys(flatAr).length;

console.log(`locales/en.json key count: ${enKeyCount}`);
console.log(`locales/ar.json key count: ${arKeyCount}`);

const nsEn = countKeysPerNamespace(localesEn);
const nsAr = countKeysPerNamespace(localesAr);

console.log('\nNamespaces in locales/en.json:', Object.keys(nsEn).length);
console.log('Per-namespace key counts (EN):', JSON.stringify(nsEn, null, 2));

// Check parity
const missingInAr = Object.keys(flatEn).filter(k => !(k in flatAr));
const missingInEn = Object.keys(flatAr).filter(k => !(k in flatEn));

console.log(`\nMissing in AR (${missingInAr.length}):`, missingInAr);
console.log(`Missing in EN (${missingInEn.length}):`, missingInEn);

// Check empty values
const emptyEn = Object.entries(flatEn).filter(([k, v]) => typeof v === 'string' && v.trim() === '');
const emptyAr = Object.entries(flatAr).filter(([k, v]) => typeof v === 'string' && v.trim() === '');

console.log(`\nEmpty strings in EN (${emptyEn.length}):`, emptyEn);
console.log(`Empty strings in AR (${emptyAr.length}):`, emptyAr);

// Compare with messages/
if (fs.existsSync(messagesEnPath) && fs.existsSync(messagesArPath)) {
  const messagesEn = JSON.parse(fs.readFileSync(messagesEnPath, 'utf8'));
  const messagesAr = JSON.parse(fs.readFileSync(messagesArPath, 'utf8'));
  const flatMsgEn = getLeafKeys(messagesEn);
  const flatMsgAr = getLeafKeys(messagesAr);
  console.log(`\nmessages/en.json key count: ${Object.keys(flatMsgEn).length}`);
  console.log(`messages/ar.json key count: ${Object.keys(flatMsgAr).length}`);
  const msgVsLocalesEnDiff = Object.keys(flatEn).filter(k => !(k in flatMsgEn));
  console.log(`Keys in locales/en.json missing in messages/en.json: ${msgVsLocalesEnDiff.length}`);
}
