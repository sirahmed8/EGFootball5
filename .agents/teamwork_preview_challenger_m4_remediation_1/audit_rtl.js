const fs = require('fs');
const path = require('path');

function findFiles(dir) {
  let list = [];
  const files = fs.readdirSync(dir, { withFileTypes: true });
  for (const f of files) {
    const p = path.join(dir, f.name);
    if (f.isDirectory()) {
      list = list.concat(findFiles(p));
    } else if (f.isFile() && /\.(tsx|ts|jsx|js|css|scss|html)$/.test(f.name)) {
      list.push(p);
    }
  }
  return list;
}

const files = findFiles('d:/football/kickoff/src');
console.log(`Auditing ${files.length} files in src/ for physical directional Tailwind utilities...`);

// Patterns to search for:
// Word boundaries or className string context for:
// text-left, text-right
// ml-*, mr-*
// pl-*, pr-*
// left-*, right-* (excluding keywords like 'flex-right' or 'right-to-left' if any, but class names usually left-0, left-1/2, left-auto, right-0, etc.)
// border-l-*, border-r-*
// rounded-l-*, rounded-r-*

const patterns = [
  { name: 'text-left', regex: /\btext-left\b/g },
  { name: 'text-right', regex: /\btext-right\b/g },
  { name: 'ml-* (margin-left)', regex: /\bml-\d+|\bml-\[|\bml-auto|\bml-px/g },
  { name: 'mr-* (margin-right)', regex: /\bmr-\d+|\bmr-\[|\bmr-auto|\bmr-px/g },
  { name: 'pl-* (padding-left)', regex: /\bpl-\d+|\bpl-\[|\bpl-auto|\bpl-px/g },
  { name: 'pr-* (padding-right)', regex: /\bpr-\d+|\bpr-\[|\bpr-auto|\bpr-px/g },
  { name: 'left-* (positioning left)', regex: /\bleft-\d+|\bleft-\[|\bleft-auto|\bleft-full|\bleft-1\/\d|\bleft-2\/\d|\bleft-1\/2/g },
  { name: 'right-* (positioning right)', regex: /\bright-\d+|\bright-\[|\bright-auto|\bright-full|\bright-1\/\d|\bright-2\/\d|\bright-1\/2/g },
  { name: 'border-l-*', regex: /\bborder-l(-\d+|-\[|-px)?\b/g },
  { name: 'border-r-*', regex: /\bborder-r(-\d+|-\[|-px)?\b/g },
  { name: 'rounded-l-*', regex: /\brounded-l(-[a-z0-9]+)?\b/g },
  { name: 'rounded-r-*', regex: /\brounded-r(-[a-z0-9]+)?\b/g }
];

let totalViolations = 0;
const results = {};

files.forEach(filePath => {
  const relPath = path.relative('d:/football/kickoff', filePath);
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    // Ignore comments or non-class code if needed, but let's check class names in strings/JSX
    patterns.forEach(pat => {
      pat.regex.lastIndex = 0;
      let match;
      while ((match = pat.regex.exec(line)) !== null) {
        // Exclude false positives if any (e.g. comments, import statements)
        const matchText = match[0];
        
        if (!results[relPath]) results[relPath] = [];
        results[relPath].push({
          lineNum: index + 1,
          patternName: pat.name,
          matchText: matchText,
          lineContent: line.trim()
        });
        totalViolations++;
      }
    });
  });
});

console.log(`\nFound ${totalViolations} total physical directional class instances across ${Object.keys(results).length} files:\n`);

for (const f in results) {
  console.log(`FILE: ${f}`);
  results[f].forEach(v => {
    console.log(`  Line ${v.lineNum} [${v.patternName} -> "${v.matchText}"]: ${v.lineContent}`);
  });
  console.log('');
}
