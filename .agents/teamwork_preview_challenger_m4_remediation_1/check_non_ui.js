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

const files = findFiles('d:/football/kickoff/src/components').filter(f => !f.includes('src\\components\\ui') && !f.includes('src/components/ui'));

const physicalRegexes = [
  /\btext-left\b/g,
  /\btext-right\b/g,
  /\bml-\d+\b/g, /\bml-\[/g, /\bml-auto\b/g, /\bml-px\b/g,
  /\bmr-\d+\b/g, /\bmr-\[/g, /\bmr-auto\b/g, /\bmr-px\b/g,
  /\bpl-\d+\b/g, /\bpl-\[/g, /\bpl-auto\b/g, /\bpl-px\b/g,
  /\bpr-\d+\b/g, /\bpr-\[/g, /\bpr-auto\b/g, /\bpr-px\b/g,
  /\bleft-\d+\b/g, /\bleft-\[/g, /\bleft-auto\b/g, /\bleft-full\b/g, /\bleft-0\b/g,
  /\bright-\d+\b/g, /\bright-\[/g, /\bright-auto\b/g, /\bright-full\b/g, /\bright-0\b/g,
  /\bborder-l\b/g, /\bborder-r\b/g, /\bborder-l-\d+/g, /\bborder-r-\d+/g,
  /\brounded-l-[a-z0-9]+/g, /\brounded-r-[a-z0-9]+/g, /\brounded-l\b/g, /\brounded-r\b/g
];

console.log('=== Non-UI Component Physical Directional Class Matches ===\n');

files.forEach(filePath => {
  const relPath = path.relative('d:/football/kickoff/src', filePath).replace(/\\/g, '/');
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    physicalRegexes.forEach(regex => {
      regex.lastIndex = 0;
      let m;
      while ((m = regex.exec(line)) !== null) {
        console.log(`src/${relPath}:${index + 1}: [${m[0]}] -> ${line.trim()}`);
      }
    });
  });
});
