const fs = require('fs');
const path = require('path');

const root = 'd:/football/kickoff';
const targetRoutes = [
  'src/app/[locale]/page.tsx',
  'src/app/[locale]/home/page.tsx',
  'src/app/[locale]/book/page.tsx',
  'src/app/[locale]/checkout/page.tsx',
  'src/app/[locale]/matches/page.tsx',
  'src/app/[locale]/owner/dashboard/page.tsx'
];

const physicalRegex = /\b(mr-\d+|mr-\[|ml-\d+|ml-\[|pr-\d+|pr-\[|pl-\d+|pl-\[|left-\d+|left-\[|right-\d+|right-\[|text-left\b|text-right\b|border-l-\d+|border-l\b|border-r-\d+|border-r\b|space-x-\d+|rounded-l-\w+|rounded-r-\w+|float-left\b|float-right\b)/g;

targetRoutes.forEach(route => {
  const filePath = path.join(root, route);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    const matches = [...content.matchAll(physicalRegex)];
    console.log(`=== ${route} ===`);
    if (matches.length === 0) {
      console.log('  No physical CSS classes found! (100% logical utilities)');
    } else {
      matches.forEach(m => {
        const line = content.substring(0, m.index).split('\n').length;
        console.log(`  Line ${line}: ${m[0]}`);
      });
    }
  } else {
    console.log(`=== ${route} NOT FOUND ===`);
  }
});
