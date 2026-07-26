const fs = require('fs');
const path = require('path');

const projectRoot = 'd:/football/kickoff';
const files = [
  'src/messages/en.json',
  'src/messages/ar.json',
  'src/locales/en.json',
  'src/locales/ar.json'
];

function flattenKeys(obj, prefix = '') {
  let keys = [];
  for (const k in obj) {
    const p = prefix ? `${prefix}.${k}` : k;
    if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
      keys = keys.concat(flattenKeys(obj[k], p));
    } else {
      keys.push(p);
    }
  }
  return keys;
}

const requiredKeys = ['Profile.profileUpdatedSuccess', 'Profile.favoritePitchesTitle', 'Profile.depositLabel'];

files.forEach(f => {
  const fullPath = path.join(projectRoot, f);
  if (!fs.existsSync(fullPath)) {
    console.log(`[FILE MISSING] ${f}`);
    return;
  }
  const raw = fs.readFileSync(fullPath, 'utf8');
  const data = JSON.parse(raw);
  const flat = flattenKeys(data);
  console.log(`\n--- ${f} ---`);
  console.log(`Total Keys: ${flat.length}`);

  requiredKeys.forEach(rk => {
    const parts = rk.split('.');
    let val = data;
    for (let p of parts) {
      if (val && typeof val === 'object') val = val[p];
      else val = undefined;
    }
    console.log(`  Required Key '${rk}': ${val !== undefined ? 'EXISTS -> "' + val + '"' : 'MISSING'}`);
  });
});

// Diff between messages/en vs messages/ar
const msgEn = JSON.parse(fs.readFileSync(path.join(projectRoot, 'src/messages/en.json'), 'utf8'));
const msgAr = JSON.parse(fs.readFileSync(path.join(projectRoot, 'src/messages/ar.json'), 'utf8'));
const flatMsgEn = flattenKeys(msgEn);
const flatMsgAr = flattenKeys(msgAr);
const missingMsgAr = flatMsgEn.filter(k => !flatMsgAr.includes(k));
const missingMsgEn = flatMsgAr.filter(k => !flatMsgEn.includes(k));

console.log(`\n--- i18n Parity: src/messages/en.json vs src/messages/ar.json ---`);
console.log(`en.json count: ${flatMsgEn.length}, ar.json count: ${flatMsgAr.length}`);
console.log(`Missing in ar.json: ${missingMsgAr.length}`);
console.log(`Missing in en.json: ${missingMsgEn.length}`);

// Diff between locales/en vs locales/ar
const locEn = JSON.parse(fs.readFileSync(path.join(projectRoot, 'src/locales/en.json'), 'utf8'));
const locAr = JSON.parse(fs.readFileSync(path.join(projectRoot, 'src/locales/ar.json'), 'utf8'));
const flatLocEn = flattenKeys(locEn);
const flatLocAr = flattenKeys(locAr);
const missingLocAr = flatLocEn.filter(k => !flatLocAr.includes(k));
const missingLocEn = flatLocAr.filter(k => !flatLocEn.includes(k));

console.log(`\n--- i18n Parity: src/locales/en.json vs src/locales/ar.json ---`);
console.log(`en.json count: ${flatLocEn.length}, ar.json count: ${flatLocAr.length}`);
console.log(`Missing in ar.json: ${missingLocAr.length}`);
console.log(`Missing in en.json: ${missingLocEn.length}`);

// Check equality between src/messages and src/locales
const missingBetweenMsgAndLoc = flatMsgEn.filter(k => !flatLocEn.includes(k));
console.log(`\n--- Consistency between src/messages/en.json and src/locales/en.json ---`);
console.log(`Count in src/messages/en.json: ${flatMsgEn.length}`);
console.log(`Count in src/locales/en.json: ${flatLocEn.length}`);
console.log(`Diff count: ${missingBetweenMsgAndLoc.length}`);
