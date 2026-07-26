const fs = require('fs');

const content = fs.readFileSync('d:/football/kickoff/src/components/FloatingChatWidget.tsx', 'utf8');
const lines = content.split('\n');

const patterns = [
  /\btext-left\b/, /\btext-right\b/,
  /\bml-\d+/, /\bml-\[/, /\bml-auto/,
  /\bmr-\d+/, /\bmr-\[/, /\bmr-auto/,
  /\bpl-\d+/, /\bpl-\[/, /\bpl-auto/,
  /\bpr-\d+/, /\bpr-\[/, /\bpr-auto/,
  /\bleft-\d+/, /\bleft-\[/, /\bleft-auto/, /\bleft-full/, /\bleft-0/,
  /\bright-\d+/, /\bright-\[/, /\bright-auto/, /\bright-full/, /\bright-0/,
  /\bborder-l\b/, /\bborder-r\b/,
  /\brounded-l-/, /\brounded-r-/
];

lines.forEach((line, idx) => {
  patterns.forEach(p => {
    if (p.test(line)) {
      console.log(`L${idx + 1}: ${line.trim()}`);
    }
  });
});
