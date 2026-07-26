const fs = require('fs');
const path = require('path');

function getKeys(obj, prefix = '') {
  let keys = [];
  for (const k in obj) {
    const keyPath = prefix ? `${prefix}.${k}` : k;
    if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
      keys = keys.concat(getKeys(obj[k], keyPath));
    } else {
      keys.push(keyPath);
    }
  }
  return keys;
}

function getVal(obj, pathStr) {
  return pathStr.split('.').reduce((o, i) => (o ? o[i] : undefined), obj);
}

const root = path.join(__dirname, '..', '..');
const localesDir = path.join(root, 'src', 'locales');
const messagesDir = path.join(root, 'src', 'messages');

console.log('=== CHECKING src/locales ===');
if (fs.existsSync(localesDir)) {
  const enLoc = JSON.parse(fs.readFileSync(path.join(localesDir, 'en.json'), 'utf8'));
  const arLoc = JSON.parse(fs.readFileSync(path.join(localesDir, 'ar.json'), 'utf8'));
  const enKeys = getKeys(enLoc);
  const arKeys = getKeys(arLoc);
  
  console.log(`en.json keys total: ${enKeys.length}`);
  console.log(`ar.json keys total: ${arKeys.length}`);
  
  const missingInAr = enKeys.filter(k => !arKeys.includes(k));
  const missingInEn = arKeys.filter(k => !enKeys.includes(k));
  
  console.log(`Missing in AR (${missingInAr.length}):`, missingInAr);
  console.log(`Missing in EN (${missingInEn.length}):`, missingInEn);

  let placeholderMismatches = [];
  for (const k of enKeys) {
    if (arKeys.includes(k)) {
      const enVal = String(getVal(enLoc, k));
      const arVal = String(getVal(arLoc, k));
      const enPlaceholders = (enVal.match(/\{([^}]+)\}/g) || []).sort();
      const arPlaceholders = (arVal.match(/\{([^}]+)\}/g) || []).sort();
      if (JSON.stringify(enPlaceholders) !== JSON.stringify(arPlaceholders)) {
        placeholderMismatches.push({ key: k, en: enVal, ar: arVal, enPh: enPlaceholders, arPh: arPlaceholders });
      }
    }
  }
  console.log(`Placeholder mismatches count: ${placeholderMismatches.length}`);
  if (placeholderMismatches.length > 0) {
    console.log('Placeholder mismatches details:', JSON.stringify(placeholderMismatches, null, 2));
  }

  let untranslated = [];
  for (const k of enKeys) {
    const enVal = String(getVal(enLoc, k));
    const arVal = String(getVal(arLoc, k));
    // allow acronyms or brand names
    const allowed = ['EGFootball5', 'Kickoff', 'URL', 'ID', 'VIP', 'WhatsApp', 'Fast & Reliable'];
    if (enVal === arVal && /[a-zA-Z]{3,}/.test(enVal) && !allowed.some(w => enVal.trim() === w)) {
      untranslated.push({ key: k, value: enVal });
    }
  }
  console.log(`Potentially untranslated in AR count: ${untranslated.length}`);
  if (untranslated.length > 0) {
    console.log('Untranslated samples:', untranslated.slice(0, 15));
  }
} else {
  console.log('src/locales directory does NOT exist!');
}

console.log('\n=== CHECKING src/messages ===');
if (fs.existsSync(messagesDir)) {
  const enMsg = JSON.parse(fs.readFileSync(path.join(messagesDir, 'en.json'), 'utf8'));
  const arMsg = JSON.parse(fs.readFileSync(path.join(messagesDir, 'ar.json'), 'utf8'));
  const enKeys = getKeys(enMsg);
  const arKeys = getKeys(arMsg);
  console.log(`en.json keys total: ${enKeys.length}`);
  console.log(`ar.json keys total: ${arKeys.length}`);
  const missingInAr = enKeys.filter(k => !arKeys.includes(k));
  const missingInEn = arKeys.filter(k => !enKeys.includes(k));
  console.log(`Missing in AR (${missingInAr.length}):`, missingInAr);
  console.log(`Missing in EN (${missingInEn.length}):`, missingInEn);

  // Compare src/locales vs src/messages content
  const enLocContent = fs.readFileSync(path.join(localesDir, 'en.json'), 'utf8');
  const enMsgContent = fs.readFileSync(path.join(messagesDir, 'en.json'), 'utf8');
  console.log('src/locales/en.json equals src/messages/en.json?', enLocContent === enMsgContent);
  const arLocContent = fs.readFileSync(path.join(localesDir, 'ar.json'), 'utf8');
  const arMsgContent = fs.readFileSync(path.join(messagesDir, 'ar.json'), 'utf8');
  console.log('src/locales/ar.json equals src/messages/ar.json?', arLocContent === arMsgContent);
} else {
  console.log('src/messages directory does NOT exist');
}
