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

const strictPhysicalRegex = /\b(?:[a-z0-9:-]+:)?(?:text-(?:left|right)|m[lr]-(?:\d+|auto|full|px|\[[^\]]+\])|p[lr]-(?:\d+|auto|full|px|\[[^\]]+\])|border-[lr](?:-\d+|-transparent|-px|-[\w-]+)?|rounded-[lr](?:-none|-sm|-md|-lg|-xl|-2xl|-3xl|-full)?)\b/g;

let totalFound = 0;

filesToScan.forEach(f => {
  const filePath = path.join(projectRoot, f);
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  let fileMatches = 0;

  lines.forEach((line, i) => {
    strictPhysicalRegex.lastIndex = 0;
    let m;
    while ((m = strictPhysicalRegex.exec(line)) !== null) {
      console.log(`[${f}:${i+1}] ${m[0]} in "${line.trim()}"`);
      fileMatches++;
      totalFound++;
    }
  });

  if (fileMatches === 0) {
    console.log(`PASS: ${f} has 0 physical margin/padding/text-align/border/rounded utilities.`);
  }
});

console.log(`\nTotal physical margin/padding/text-align/border/rounded utilities found: ${totalFound}`);
