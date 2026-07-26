const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../../src/app/[locale]');

function findTsxFiles(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(findTsxFiles(fullPath));
    } else if (file.endsWith('.tsx')) {
      results.push(fullPath);
    }
  });
  return results;
}

const files = findTsxFiles(srcDir);

// Patterns matching potential raw user-facing strings in JSX text nodes
// e.g., >Some Hardcoded Text< or placeholder="Hardcoded"
const rawTextFindings = [];

files.forEach(file => {
  const relPath = path.relative(srcDir, file);
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');

  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    // Ignore imports, comments, console log, className, etc.
    if (trimmed.startsWith('//') || trimmed.startsWith('import ') || trimmed.startsWith('/*')) return;
    
    // Check for hardcoded JSX text e.g. >Word< or placeholder="Word"
    const textNodeMatch = />\s*([A-Za-z0-9\u0600-\u06FF\s.,!?:;'"()-]{3,})\s*</g;
    let match;
    while ((match = textNodeMatch.exec(trimmed)) !== null) {
      const text = match[1].trim();
      // Ignore common non-translatable text like icons, numbers, variables, CSS names, single letters, EGP
      if (
        !/^[0-9\s:/-]+$/.test(text) &&
        !/^(div|span|button|p|h1|h2|h3|h4|h5|h6|a|input|label|table|tr|td|th|svg|path|code|pre)$/i.test(text) &&
        !/^EGP$/i.test(text) &&
        !/^USD$/i.test(text) &&
        !/^OK$/i.test(text) &&
        !/^\s*$/.test(text)
      ) {
        // Check if line contains t( or translations
        if (!trimmed.includes('t(') && !trimmed.includes('{t(')) {
          rawTextFindings.push({
            file: relPath,
            line: idx + 1,
            text,
            snippet: trimmed
          });
        }
      }
    }

    // Check placeholder="Hardcoded"
    const placeholderMatch = /placeholder="([^"{}\n]{3,})"/g;
    while ((match = placeholderMatch.exec(trimmed)) !== null) {
      const text = match[1].trim();
      if (!text.startsWith('{') && !text.includes('t(')) {
        rawTextFindings.push({
          file: relPath,
          line: idx + 1,
          text: `placeholder="${text}"`,
          snippet: trimmed
        });
      }
    }
  });
});

console.log(`--- Hardcoded Text Audit Report ---`);
console.log(`Scanned ${files.length} .tsx files in src/app/[locale]`);
console.log(`Potential Hardcoded Text Findings: ${rawTextFindings.length}`);
rawTextFindings.slice(0, 50).forEach(f => {
  console.log(`  - [${f.file}:${f.line}] "${f.text}" => ${f.snippet}`);
});
