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

const checkTokens = [
  'text-left', 'text-right',
  'ml-', 'mr-', '-ml-', '-mr-',
  'pl-', 'pr-', '-pl-', '-pr-',
  'left-', 'right-', '-left-', '-right-',
  'border-l', 'border-r',
  'rounded-l', 'rounded-r'
];

console.log('=== COMPREHENSIVE RTL AUDIT OF 10 FILES ===\n');

filesToScan.forEach(f => {
  const filePath = path.join(projectRoot, f);
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  console.log(`File: ${f}`);
  let occurrences = [];

  lines.forEach((line, idx) => {
    // Extract className="..." or classNames={{ ... }} or cn(...) contents
    // Or just look for any class tokens
    const lineNum = idx + 1;
    
    // Check line for physical directional tokens in string literals
    // E.g. matching words or class strings
    checkTokens.forEach(tok => {
      // Find occurrences of tok in string literals or class lists
      // We exclude pure prop names like side="left", align="left", orientation="left"
      // or standard animations unless they are physical position classes
      let regex;
      if (tok === 'text-left' || tok === 'text-right') {
        regex = new RegExp(`\\b${tok}\\b`, 'g');
      } else if (tok.startsWith('border-') || tok.startsWith('rounded-')) {
        regex = new RegExp(`\\b${tok}(?:-[\\w-]+)?\\b`, 'g');
      } else if (tok === 'left-' || tok === 'right-' || tok === '-left-' || tok === '-right-') {
        regex = new RegExp(`(?:\\b|:|-)${tok.replace('-', '')}-(?:\\d+|auto|full|px|1\\/2|\\[[^\\]]+\\])\\b`, 'g');
      } else { // ml-, mr-, pl-, pr-
        regex = new RegExp(`(?:\\b|:|-)${tok}(?:\\d+|auto|full|px|\\[[^\\]]+\\])\\b`, 'g');
      }

      let match;
      while ((match = regex.exec(line)) !== null) {
        // Exclude TS comparisons / props if matched incorrectly
        occurrences.push({
          line: lineNum,
          token: tok,
          matched: match[0],
          text: line.trim()
        });
      }
    });
  });

  if (occurrences.length === 0) {
    console.log(`  RESULT: PASS (0 physical directional classes)`);
  } else {
    console.log(`  RESULT: FINDINGS (${occurrences.length} matches)`);
    occurrences.forEach(o => {
      console.log(`    Line ${o.line} [${o.matched}]: ${o.text}`);
    });
  }
  console.log('');
});
