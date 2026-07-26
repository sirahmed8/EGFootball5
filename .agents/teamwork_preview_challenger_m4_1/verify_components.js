const fs = require('fs');
const path = require('path');

const root = 'd:/football/kickoff';
const srcDir = path.join(root, 'src');

const localesEn = JSON.parse(fs.readFileSync(path.join(root, 'src/locales/en.json'), 'utf8'));

function getAllFiles(dir, exts = ['.tsx', '.ts', '.jsx', '.js']) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllFiles(fullPath, exts));
    } else {
      if (exts.includes(path.extname(file))) {
        results.push(fullPath);
      }
    }
  });
  return results;
}

const files = getAllFiles(srcDir);

console.log(`Found ${files.length} ts/tsx files in src/`);

// 1. Scan for physical CSS classes
const physicalRegex = /\b(mr-\d+|mr-\[|ml-\d+|ml-\[|pr-\d+|pr-\[|pl-\d+|pl-\[|left-\d+|left-\[|right-\d+|right-\[|text-left\b|text-right\b|border-l-\d+|border-l\b|border-r-\d+|border-r\b|space-x-\d+|rounded-l-\w+|rounded-r-\w+|float-left\b|float-right\b)/g;

let physicalClassFindings = [];

// 2. Scan for t('key') calls and check against JSON
let unmappedKeyFindings = [];

// Helper to check nested object path
function hasKey(obj, pathArr) {
  let curr = obj;
  for (const p of pathArr) {
    if (curr && typeof curr === 'object' && p in curr) {
      curr = curr[p];
    } else {
      return false;
    }
  }
  return true;
}

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const relPath = path.relative(root, file);

  // Check physical CSS
  let match;
  while ((match = physicalRegex.exec(content)) !== null) {
    // Get line number
    const lineNum = content.substring(0, match.index).split('\n').length;
    physicalClassFindings.push({
      file: relPath,
      line: lineNum,
      match: match[0]
    });
  }

  // Find useTranslations namespace in file
  // e.g. useTranslations('Landing') or useTranslations('Book')
  const nsMatches = [...content.matchAll(/useTranslations\(\s*['"]([^'"]+)['"]\s*\)/g)];
  const namespaces = nsMatches.map(m => m[1]);

  // Find t('key') or t("key") or t(`key`)
  const tMatches = [...content.matchAll(/\bt\(\s*['"]([^'"]+)['"]/g)];
  tMatches.forEach(m => {
    const key = m[1];
    if (key.includes('${')) return; // skip dynamic template strings for now
    
    // Check if key exists directly or under any of the namespaces used in the file
    let found = false;
    if (key.includes('.')) {
      found = hasKey(localesEn, key.split('.'));
    }
    if (!found) {
      for (const ns of namespaces) {
        if (hasKey(localesEn, [ns, ...key.split('.')])) {
          found = true;
          break;
        }
      }
    }
    // Also check if key exists anywhere top-level or under common namespaces if ns not explicit
    if (!found) {
      for (const ns in localesEn) {
        if (hasKey(localesEn, [ns, ...key.split('.')])) {
          found = true;
          break;
        }
      }
    }

    if (!found) {
      const lineNum = content.substring(0, m.index).split('\n').length;
      unmappedKeyFindings.push({
        file: relPath,
        line: lineNum,
        key: key,
        namespaces: namespaces
      });
    }
  });
});

console.log(`\n=== Physical Directional CSS Class Findings (${physicalClassFindings.length}) ===`);
physicalClassFindings.forEach(f => console.log(`${f.file}:${f.line} -> ${f.match}`));

console.log(`\n=== Potentially Unmapped i18n Keys (${unmappedKeyFindings.length}) ===`);
unmappedKeyFindings.forEach(f => console.log(`${f.file}:${f.line} -> key '${f.key}' (namespaces in file: ${f.namespaces.join(', ')})`));
