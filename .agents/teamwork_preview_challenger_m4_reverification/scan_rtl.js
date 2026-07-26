const fs = require('fs');
const path = require('path');

const projectRoot = 'd:/football/kickoff';
const filesToScan = [
  'src/components/ui/select.tsx',
  'src/components/ui/table.tsx',
  'src/components/DailyAIAdviceCard.tsx',
  'src/components/Navbar.tsx',
  'src/components/SideMenu.tsx',
  'src/components/ui/button.tsx',
  'src/components/ui/calendar.tsx',
  'src/components/ui/dialog.tsx',
  'src/components/ui/dropdown-menu.tsx',
  'src/components/ui/tabs.tsx'
];

// Physical patterns in tailwind classes
// We want to match physical utilities:
// text-(left|right)
// (?:[a-z0-9:-]*:)?(?:-)?(?:m|p)[lr]-(?:\d+|auto|full|px|\[.+?\])
// (?:[a-z0-9:-]*:)?(?:-)?(?:left|right)-(?:\d+|auto|full|px|1\/2|\[.+?\])
// (?:[a-z0-9:-]*:)?border-[lr](?:-\d+|-transparent|-px|-[\w-]+)?
// (?:[a-z0-9:-]*:)?rounded-[lr](?:-none|-sm|-md|-lg|-xl|-2xl|-3xl|-full)?

const patterns = [
  /\btext-(left|right)\b/g,
  /\b(?:[a-z0-9:-]+:)?-?m[lr]-(?:\d+|auto|full|px|\[[^\]]+\])\b/g,
  /\b(?:[a-z0-9:-]+:)?-?p[lr]-(?:\d+|auto|full|px|\[[^\]]+\])\b/g,
  /\b(?:[a-z0-9:-]+:)?-?(?:left|right)-(?:\d+|auto|full|px|1\/2|\[[^\]]+\])\b/g,
  /\b(?:[a-z0-9:-]+:)?border-[lr](?:-\d+|-transparent|-px|-[\w-]+)?\b/g,
  /\b(?:[a-z0-9:-]+:)?rounded-[lr](?:-none|-sm|-md|-lg|-xl|-2xl|-3xl|-full)?\b/g
];

let totalViolations = 0;

filesToScan.forEach(relPath => {
  const fullPath = path.join(projectRoot, relPath);
  if (!fs.existsSync(fullPath)) {
    console.log(`[FILE MISSING] ${relPath}`);
    return;
  }

  const content = fs.readFileSync(fullPath, 'utf8');
  const lines = content.split('\n');

  console.log(`\n========================================`);
  console.log(`Scanning: ${relPath}`);
  console.log(`========================================`);

  let fileViolations = 0;

  lines.forEach((line, index) => {
    // Check against patterns
    patterns.forEach(pat => {
      pat.lastIndex = 0;
      let match;
      while ((match = pat.exec(line)) !== null) {
        console.log(`  Line ${index + 1}: Match "${match[0]}"`);
        console.log(`    Content: ${line.trim()}`);
        fileViolations++;
        totalViolations++;
      }
    });
  });

  if (fileViolations === 0) {
    console.log(`  CLEAN - No physical directional classes found.`);
  } else {
    console.log(`  TOTAL VIOLATIONS in file: ${fileViolations}`);
  }
});

console.log(`\n========================================`);
console.log(`TOTAL PHYSICAL DIRECTIONAL VIOLATIONS ACROSS 10 FILES: ${totalViolations}`);
console.log(`========================================`);
