const fs = require('fs');
const path = require('path');

const root = 'd:/football/kickoff';
const appDir = path.join(root, 'src/app/[locale]');

function getAllFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllFiles(fullPath));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      results.push(fullPath);
    }
  });
  return results;
}

const files = getAllFiles(appDir);

const physicalRegex = /\b(mr-\d+|mr-\[|ml-\d+|ml-\[|pr-\d+|pr-\[|pl-\d+|pl-\[|left-\d+|left-\[|right-\d+|right-\[|text-left\b|text-right\b|border-l-\d+|border-l\b|border-r-\d+|border-r\b|space-x-\d+|rounded-l-\w+|rounded-r-\w+|float-left\b|float-right\b)/g;

console.log(`Scanning ${files.length} files under src/app/[locale]...`);

let count = 0;
files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const relPath = path.relative(root, file);
  const matches = [...content.matchAll(physicalRegex)];
  if (matches.length > 0) {
    count += matches.length;
    console.log(`\n${relPath}:`);
    matches.forEach(m => {
      const line = content.substring(0, m.index).split('\n').length;
      console.log(`  Line ${line}: ${m[0]}`);
    });
  }
});

console.log(`\nTotal physical CSS matches under src/app/[locale]: ${count}`);
