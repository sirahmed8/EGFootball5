const fs = require('fs');
const path = require('path');

const enPath = path.join(__dirname, '../../src/messages/en.json');
const arPath = path.join(__dirname, '../../src/messages/ar.json');

const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const ar = JSON.parse(fs.readFileSync(arPath, 'utf8'));

function getAllKeys(obj, prefix = '') {
  let keys = [];
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const fullPath = prefix ? `${prefix}.${key}` : key;
      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        keys = keys.concat(getAllKeys(obj[key], fullPath));
      } else {
        keys.push(fullPath);
      }
    }
  }
  return keys;
}

function getValueByPath(obj, keyPath) {
  return keyPath.split('.').reduce((acc, part) => (acc && acc[part] !== undefined) ? acc[part] : undefined, obj);
}

function extractPlaceholders(str) {
  if (typeof str !== 'string') return [];
  const matches = str.match(/\{([^}]+)\}/g);
  return matches ? matches.map(m => m.slice(1, -1)).sort() : [];
}

const enKeys = getAllKeys(en);
const arKeys = getAllKeys(ar);

const enKeySet = new Set(enKeys);
const arKeySet = new Set(arKeys);

const missingInAr = enKeys.filter(k => !arKeySet.has(k));
const missingInEn = arKeys.filter(k => !enKeySet.has(k));

const placeholderMismatches = [];

enKeys.forEach(key => {
  if (arKeySet.has(key)) {
    const enVal = getValueByPath(en, key);
    const arVal = getValueByPath(ar, key);
    const enVars = extractPlaceholders(enVal);
    const arVars = extractPlaceholders(arVal);
    if (JSON.stringify(enVars) !== JSON.stringify(arVars)) {
      placeholderMismatches.push({
        key,
        enVars,
        arVars,
        enVal,
        arVal
      });
    }
  }
});

console.log(`--- i18n Dictionary Key Parity Report ---`);
console.log(`Total keys in en.json: ${enKeys.length}`);
console.log(`Total keys in ar.json: ${arKeys.length}`);
console.log(`Missing in ar.json (${missingInAr.length}):`, missingInAr);
console.log(`Missing in en.json (${missingInEn.length}):`, missingInEn);
console.log(`Placeholder mismatches (${placeholderMismatches.length}):`, placeholderMismatches);

if (missingInAr.length === 0 && missingInEn.length === 0 && placeholderMismatches.length === 0) {
  console.log(`✅ PARITY CHECK PASSED PERFECTLY!`);
  process.exit(0);
} else {
  console.log(`❌ PARITY CHECK FAILED!`);
  process.exit(1);
}
