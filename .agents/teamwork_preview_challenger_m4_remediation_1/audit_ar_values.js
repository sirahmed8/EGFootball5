const fs = require('fs');

const arMsg = JSON.parse(fs.readFileSync('d:/football/kickoff/src/messages/ar.json', 'utf8'));

function flatten(obj, prefix = '') {
  let res = {};
  for (const k in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, k)) {
      const key = prefix ? `${prefix}.${k}` : k;
      if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
        Object.assign(res, flatten(obj[k], key));
      } else {
        res[key] = obj[key];
      }
    }
  }
  return res;
}

const flatAr = flatten(arMsg);
console.log('Sample keys:');
Object.keys(flatAr).slice(0, 10).forEach(k => console.log(`${k}: "${flatAr[k]}"`));

console.log('\nKeys in AR containing letters A-Z / a-z:');
for (const k in flatAr) {
  const val = flatAr[k];
  if (typeof val === 'string' && /[a-zA-Z]/.test(val)) {
    console.log(`${k}: "${val}"`);
  }
}
