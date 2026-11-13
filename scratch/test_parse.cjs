const line = '31500424,Yetsaniel Esau Vegas Liendro,"INVERSIONES SOZU, C.A",RESPONSABLE,2025-10-11,OPERACIONES,,[ TCP ] - TUCUPITA';
const matches = line.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g);
console.log('matches length:', matches ? matches.length : 0);
console.log('matches:', matches);

// Standard CSV line split function:
function parseCsvLine(text) {
  const result = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      if (inQuotes && text[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === ',' && !inQuotes) {
      result.push(cur.trim());
      cur = '';
    } else {
      cur += c;
    }
  }
  result.push(cur.trim());
  return result;
}

console.log('parseCsvLine:', parseCsvLine(line));
