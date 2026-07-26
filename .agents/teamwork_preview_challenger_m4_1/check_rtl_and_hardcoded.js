const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../../src');

function findTsxFiles(dir) {
  let results = [];
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

// Physical directional utility patterns
const directionalRegexes = [
  { name: 'mr-* (margin-right)', regex: /\bmr-\d+(\.\d+)?\b/g },
  { name: 'ml-* (margin-left)', regex: /\bml-\d+(\.\d+)?\b/g },
  { name: 'pr-* (padding-right)', regex: /\bpr-\d+(\.\d+)?\b/g },
  { name: 'pl-* (padding-left)', regex: /\bpl-\d+(\.\d+)?\b/g },
  { name: 'text-left', regex: /\btext-left\b/g },
  { name: 'text-right', regex: /\btext-right\b/g },
  { name: 'left-* (position left)', regex: /\bleft-\d+(\.\d+)?\b/g },
  { name: 'right-* (position right)', regex: /\bright-\d+(\.\d+)?\b/g },
  { name: 'border-l-*', regex: /\bborder-l(-\d+)?\b/g },
  { name: 'border-r-*', regex: /\bborder-r(-\d+)?\b/g },
  { name: 'rounded-l-*', regex: /\brounded-l(-[a-z0-9]+)?\b/g },
  { name: 'rounded-r-*', regex: /\brounded-r(-[a-z0-9]+)?\b/g },
];

const findings = [];

files.forEach(file => {
  const relPath = path.relative(srcDir, file);
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');

  lines.forEach((line, idx) => {
    directionalRegexes.forEach(({ name, regex }) => {
      let match;
      regex.lastIndex = 0; // reset
      while ((match = regex.exec(line)) !== null) {
        // Exception check: is it combined with rtl: or ltr: prefix? e.g. rtl:text-left or ltr:text-right
        const prefix = line.substring(Math.max(0, match.index - 4), match.index);
        if (prefix.includes('rtl:') || prefix.includes('ltr:')) {
          // Explicit RTL/LTR override, okay in some context, but note it
        } else {
          findings.push({
            file: relPath,
            line: idx + 1,
            issue: `Physical utility '${match[0]}' (${name})`,
            snippet: line.trim()
          });
        }
      }
    });
  });
});

console.log(`--- RTL Utility Audit Report ---`);
console.log(`Scanned ${files.length} .tsx files in src/`);
console.log(`Physical Utility Findings: ${findings.length}`);
findings.slice(0, 50).forEach(f => {
  console.log(`  - [${f.file}:${f.line}] ${f.issue} => "${f.snippet}"`);
});

if (findings.length > 50) {
  console.log(`  ... and ${findings.length - 50} more findings.`);
}
