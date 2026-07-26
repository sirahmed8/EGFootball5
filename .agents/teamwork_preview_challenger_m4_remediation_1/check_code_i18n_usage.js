const fs = require('fs');
const path = require('path');

const enJson = JSON.parse(fs.readFileSync('d:/football/kickoff/src/messages/en.json', 'utf8'));
const arJson = JSON.parse(fs.readFileSync('d:/football/kickoff/src/messages/ar.json', 'utf8'));

function flatten(obj, prefix = '') {
  let res = {};
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

const flatEn = flatten(enJson);
const flatAr = flatten(arJson);

function findTsxFiles(dir) {
  let list = [];
  const files = fs.readdirSync(dir, { withFileTypes: true });
  for (const f of files) {
    const p = path.join(dir, f.name);
    if (f.isDirectory()) {
      list = list.concat(findTsxFiles(p));
    } else if (f.isFile() && (p.endsWith('.tsx') || p.endsWith('.ts'))) {
      list.push(p);
    }
  }
  return list;
}

const files = findTsxFiles('d:/football/kickoff/src');
console.log(`Scanning ${files.length} ts/tsx files for translation usage...`);

const missingInCodeEn = [];
const missingInCodeAr = [];

// Track usage of useTranslations
files.forEach(filePath => {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Find namespace in useTranslations('Namespace')
  const namespaceMatches = [...content.matchAll(/useTranslations\(\s*['"]([^'"]+)['"]\s*\)/g)];
  const namespaces = namespaceMatches.map(m => m[1]);
  
  // Find t('key') or t("key")
  const tMatches = [...content.matchAll(/t\(\s*['"]([^'"]+)['"]/g)];
  
  tMatches.forEach(m => {
    const key = m[1];
    if (key.includes('.')) {
      // absolute key
      if (!(key in flatEn)) missingInCodeEn.push({ file: filePath, key });
      if (!(key in flatAr)) missingInCodeAr.push({ file: filePath, key });
    } else {
      // relative to namespaces found in file
      let foundInEn = false;
      let foundInAr = false;
      for (const ns of namespaces) {
        const fullKey = `${ns}.${key}`;
        if (fullKey in flatEn) foundInEn = true;
        if (fullKey in flatAr) foundInAr = true;
      }
      if (namespaces.length > 0) {
        if (!foundInEn) missingInCodeEn.push({ file: filePath, key, namespaces });
        if (!foundInAr) missingInCodeAr.push({ file: filePath, key, namespaces });
      }
    }
  });
});

console.log(`Missing in EN for code usages: ${missingInCodeEn.length}`);
missingInCodeEn.forEach(item => console.log(`  File: ${item.file} -> key: ${item.key} (ns: ${item.namespaces})`));

console.log(`Missing in AR for code usages: ${missingInCodeAr.length}`);
missingInCodeAr.forEach(item => console.log(`  File: ${item.file} -> key: ${item.key} (ns: ${item.namespaces})`));
