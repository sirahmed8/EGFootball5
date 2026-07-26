const fs = require('fs');

const msgAr = JSON.parse(fs.readFileSync('d:/football/kickoff/src/messages/ar.json', 'utf8'));
const locAr = JSON.parse(fs.readFileSync('d:/football/kickoff/src/locales/ar.json', 'utf8'));

function flatten(obj, prefix = '') {
  let res = {};
  for (const k in obj) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
      Object.assign(res, flatten(obj[k], key));
    } else {
      res[key] = obj[k];
    }
  }
  return res;
}

const flatMsg = flatten(msgAr);
const flatLoc = flatten(locAr);

const msgKeys = new Set(Object.keys(flatMsg));
const locKeys = new Set(Object.keys(flatLoc));

console.log('Keys in messages/ar.json but not in locales/ar.json:');
for (const k of msgKeys) {
  if (!locKeys.has(k)) {
    console.log(`  - ${k}: "${flatMsg[k]}"`);
  }
}

console.log('Keys in locales/ar.json but not in messages/ar.json:');
for (const k of locKeys) {
  if (!msgKeys.has(k)) {
    console.log(`  - ${k}: "${flatLoc[k]}"`);
  }
}

console.log('Keys with differing values between messages/ar.json and locales/ar.json:');
for (const k of msgKeys) {
  if (locKeys.has(k) && flatMsg[k] !== flatLoc[k]) {
    console.log(`  - ${k}:\n     msg: "${flatMsg[k]}"\n     loc: "${flatLoc[k]}"`);
  }
}
