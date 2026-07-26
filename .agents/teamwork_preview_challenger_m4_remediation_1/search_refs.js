const fs = require('fs');
const path = require('path');

function searchFiles(dir, pattern) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  for (const file of files) {
    const resPath = path.join(dir, file.name);
    if (file.isDirectory()) {
      searchFiles(resPath, pattern);
    } else if (file.isFile() && (resPath.endsWith('.ts') || resPath.endsWith('.tsx') || resPath.endsWith('.js') || resPath.endsWith('.json'))) {
      const content = fs.readFileSync(resPath, 'utf8');
      if (content.match(pattern)) {
        console.log(`Found in: ${resPath}`);
        const lines = content.split('\n');
        lines.forEach((line, idx) => {
          if (line.match(pattern)) {
            console.log(`  L${idx+1}: ${line.trim()}`);
          }
        });
      }
    }
  }
}

console.log('--- Searching for locales or messages references ---');
searchFiles('d:/football/kickoff/src', /locales|messages/i);
