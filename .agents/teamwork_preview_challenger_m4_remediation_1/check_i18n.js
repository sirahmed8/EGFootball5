const fs = require('fs');
const path = require('path');

const projectRoot = 'd:/football/kickoff';

function flattenKeys(obj, prefix = '') {
  let keys = {};
  for (const k in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, k)) {
      const propKey = prefix ? `${prefix}.${k}` : k;
      if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
        Object.assign(keys, flattenKeys(obj[k], propKey));
      } else {
        keys[propKey] = obj[k];
      }
    }
  }
  return keys;
}

function compareFiles(enPath, arPath, label) {
  console.log(`=== Comparing ${label} ===`);
  const enAbs = path.join(projectRoot, enPath);
  const arAbs = path.join(projectRoot, arPath);

  if (!fs.existsSync(enAbs)) {
    console.error(`ERROR: ${enPath} does not exist!`);
    return;
  }
  if (!fs.existsSync(arAbs)) {
    console.error(`ERROR: ${arPath} does not exist!`);
    return;
  }

  const enJson = JSON.parse(fs.readFileSync(enAbs, 'utf8'));
  const arJson = JSON.parse(fs.readFileSync(arAbs, 'utf8'));

  const enKeys = flattenKeys(enJson);
  const arKeys = flattenKeys(arJson);

  const enKeySet = new Set(Object.keys(enKeys));
  const arKeySet = new Set(Object.keys(arKeys));

  const missingInAr = [...enKeySet].filter(k => !arKeySet.has(k));
  const missingInEn = [...arKeySet].filter(k => !enKeySet.has(k));

  console.log(`EN total keys: ${enKeySet.size}`);
  console.log(`AR total keys: ${arKeySet.size}`);

  if (missingInAr.length > 0) {
    console.log(`\n❌ Keys in ${enPath} missing in ${arPath} (${missingInAr.length}):`);
    missingInAr.forEach(k => console.log(`  - ${k}: "${enKeys[k]}"`));
  } else {
    console.log(`✅ No missing EN keys in ${arPath}`);
  }

  if (missingInEn.length > 0) {
    console.log(`\n❌ Keys in ${arPath} missing in ${enPath} (${missingInEn.length}):`);
    missingInEn.forEach(k => console.log(`  - ${k}: "${arKeys[k]}"`));
  } else {
    console.log(`✅ No extra AR keys missing in ${enPath}`);
  }

  // Check untranslated fallbacks in AR
  const untranslated = [];
  const emptyValues = [];
  const arabicRegex = /[\u0600-\u06FF]/;

  for (const k of Object.keys(arKeys)) {
    const arVal = arKeys[k];
    const enVal = enKeys[k];

    if (arVal === '' || arVal === null || arVal === undefined) {
      emptyValues.push({ key: k, enVal });
    } else if (typeof arVal === 'string') {
      // Check if string contains no Arabic characters and matches English value or contains English words where Arabic expected
      // Note: numbers, URLs, variables like {name}, brand names like "EGFootball", "VAR", "FC" might not have Arabic, but full sentences/words might be untranslated.
      if (arVal === enVal && typeof enVal === 'string' && enVal.trim().length > 3 && /[a-zA-Z]{3,}/.test(enVal)) {
        untranslated.push({ key: k, arVal, enVal, reason: 'Identical string to English' });
      } else if (!arabicRegex.test(arVal) && /[a-zA-Z]{3,}/.test(arVal)) {
        untranslated.push({ key: k, arVal, enVal, reason: 'No Arabic characters & contains English text' });
      }
    }
  }

  if (emptyValues.length > 0) {
    console.log(`\n⚠️ Empty values in ${arPath} (${emptyValues.length}):`);
    emptyValues.forEach(item => console.log(`  - ${item.key}: (empty) [EN: "${item.enVal}"]`));
  }

  if (untranslated.length > 0) {
    console.log(`\n⚠️ Potential untranslated / English fallback values in ${arPath} (${untranslated.length}):`);
    untranslated.forEach(item => console.log(`  - ${item.key}: "${item.arVal}" [Reason: ${item.reason}] [EN: "${item.enVal}"]`));
  } else {
    console.log(`✅ No untranslated English fallbacks detected in ${arPath}`);
  }

  return {
    missingInAr,
    missingInEn,
    emptyValues,
    untranslated
  };
}

const resMessages = compareFiles('src/messages/en.json', 'src/messages/ar.json', 'messages (src/messages/)');
console.log('\n----------------------------------------\n');
const resLocales = compareFiles('src/locales/en.json', 'src/locales/ar.json', 'locales (src/locales/)');
