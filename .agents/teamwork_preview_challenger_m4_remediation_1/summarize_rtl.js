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

const fileSummary = {};

files.forEach(filePath => {
  const relPath = path.relative('d:/football/kickoff/src', filePath).replace(/\\/g, '/');
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    patterns.forEach(pat => {
      pat.regex.lastIndex = 0;
      let match;
      while ((match = pat.regex.exec(line)) !== null) {
        if (!fileSummary[relPath]) fileSummary[relPath] = [];
        fileSummary[relPath].push({
          line: index + 1,
          pattern: pat.name,
          match: match[0],
          snippet: line.trim().substring(0, 100)
        });
      }
    });
  });
});

console.log('=== RTL Utility Violation Summary ===');
let appViolations = 0;
let uiViolations = 0;
let componentViolations = 0;
let totalViolations = 0;

for (const f in fileSummary) {
  const count = fileSummary[f].length;
  totalViolations += count;
  if (f.startsWith('app/')) appViolations += count;
  else if (f.startsWith('components/ui/')) uiViolations += count;
  else if (f.startsWith('components/')) componentViolations += count;

  console.log(`[${count} matches] src/${f}`);
  fileSummary[f].forEach(item => {
    console.log(`   L${item.line} (${item.pattern}): ${item.match} -> ${item.snippet}`);
  });
}

console.log('\n--- Totals ---');
console.log(`src/app/ violations: ${appViolations}`);
console.log(`src/components/ (non-ui) violations: ${componentViolations}`);
console.log(`src/components/ui/ violations: ${uiViolations}`);
console.log(`Total lingering physical directional utilities: ${totalViolations}`);
