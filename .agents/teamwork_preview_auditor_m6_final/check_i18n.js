const fs = require('fs');

function countKeys(obj, prefix = '') {
  let count = 0;
  let keys = [];
  for (const k in obj) {
    const fullKey = prefix ? prefix + '.' + k : k;
    if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
      const res = countKeys(obj[k], fullKey);
      count += res.count;
      keys = keys.concat(res.keys);
    } else {
      count++;
      keys.push(fullKey);
    }
  }
  return { count, keys };
}

const msgAr = JSON.parse(fs.readFileSync('src/messages/ar.json', 'utf8'));
const msgEn = JSON.parse(fs.readFileSync('src/messages/en.json', 'utf8'));

const arRes = countKeys(msgAr);
const enRes = countKeys(msgEn);

console.log('src/messages/ar.json total leaf keys:', arRes.count);
console.log('src/messages/en.json total leaf keys:', enRes.count);

const arSet = new Set(arRes.keys);
const enSet = new Set(enRes.keys);

const missingInEn = arRes.keys.filter(k => !enSet.has(k));
const missingInAr = enRes.keys.filter(k => !arSet.has(k));

console.log('Missing in EN count:', missingInEn.length);
if (missingInEn.length > 0) console.log('Missing in EN keys:', missingInEn);
console.log('Missing in AR count:', missingInAr.length);
if (missingInAr.length > 0) console.log('Missing in AR keys:', missingInAr);

const locAr = fs.readFileSync('src/locales/ar.json', 'utf8');
const locEn = fs.readFileSync('src/locales/en.json', 'utf8');
const msgArRaw = fs.readFileSync('src/messages/ar.json', 'utf8');
const msgEnRaw = fs.readFileSync('src/messages/en.json', 'utf8');

console.log('locales/ar.json === messages/ar.json:', locAr === msgArRaw);
console.log('locales/en.json === messages/en.json:', locEn === msgEnRaw);
