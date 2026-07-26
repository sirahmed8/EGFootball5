const fs = require('fs');
const path = require('path');

const msgEn = JSON.parse(fs.readFileSync('d:/football/kickoff/src/messages/en.json', 'utf8'));
const locEn = JSON.parse(fs.readFileSync('d:/football/kickoff/src/locales/en.json', 'utf8'));
const msgAr = JSON.parse(fs.readFileSync('d:/football/kickoff/src/messages/ar.json', 'utf8'));
const locAr = JSON.parse(fs.readFileSync('d:/football/kickoff/src/locales/ar.json', 'utf8'));

console.log('msgEn stringified length:', JSON.stringify(msgEn).length);
console.log('locEn stringified length:', JSON.stringify(locEn).length);
console.log('msgAr stringified length:', JSON.stringify(msgAr).length);
console.log('locAr stringified length:', JSON.stringify(locAr).length);

console.log('msgEn === locEn?', JSON.stringify(msgEn) === JSON.stringify(locEn));
console.log('msgAr === locAr?', JSON.stringify(msgAr) === JSON.stringify(locAr));
