const fs = require('fs');

const sharedStringsXml = fs.readFileSync('scratch/xlsx_unzipped/xl/sharedStrings.xml', 'utf8');
const stringMatches = sharedStringsXml.match(/<si>(.*?)<\/si>/gs) || [];
const sharedStrings = stringMatches.map(si => {
  const tMatches = si.match(/<t[^>]*>(.*?)<\/t>/gs) || [];
  return tMatches.map(t => t.replace(/<[^>]+>/g, '')).join('');
});
console.log('Total shared strings:', sharedStrings.length);
console.log('First 15 shared strings:', sharedStrings.slice(0, 15));

const sheet1Xml = fs.readFileSync('scratch/xlsx_unzipped/xl/worksheets/sheet1.xml', 'utf8');
const rowMatches = sheet1Xml.match(/<row r="(\d+)"[^>]*>(.*?)<\/row>/gs) || [];
console.log('Total rows in sheet1:', rowMatches.length);

function colIndex(colStr) {
  let num = 0;
  for (let i = 0; i < colStr.length; i++) {
    num = num * 26 + (colStr.charCodeAt(i) - 64);
  }
  return num - 1;
}

function parseRow(rowXml) {
  const cells = {};
  const cMatches = rowXml.match(/<c r="([A-Z]+)(\d+)"[^>]*>(.*?)<\/c>/gs) || [];
  for (const c of cMatches) {
    const colMatch = c.match(/r="([A-Z]+)(\d+)"/);
    if (!colMatch) continue;
    const col = colMatch[1];
    const isString = c.includes('t="s"');
    const vMatch = c.match(/<v>(.*?)<\/v>/);
    let val = vMatch ? vMatch[1] : '';
    if (isString) {
      val = sharedStrings[parseInt(val, 10)] || '';
    }
    cells[col] = val;
  }
  return cells;
}

console.log('Row 1 (Header):', parseRow(rowMatches[0]));
console.log('Row 2:', parseRow(rowMatches[1]));
console.log('Row 3:', parseRow(rowMatches[2]));
