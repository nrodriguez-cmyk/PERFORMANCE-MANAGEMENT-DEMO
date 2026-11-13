const fs = require('fs');

const sharedStringsXml = fs.readFileSync('scratch/xlsx_unzipped/xl/sharedStrings.xml', 'utf8');
const stringMatches = sharedStringsXml.match(/<si>(.*?)<\/si>/gs) || [];
const sharedStrings = stringMatches.map(si => {
  const tMatches = si.match(/<t[^>]*>(.*?)<\/t>/gs) || [];
  return tMatches.map(t => t.replace(/<[^>]+>/g, '')).join('');
});

const sheet1Xml = fs.readFileSync('scratch/xlsx_unzipped/xl/worksheets/sheet1.xml', 'utf8');
const rowMatches = sheet1Xml.match(/<row r="(\d+)"[^>]*>(.*?)<\/row>/gs) || [];

function excelDateToString(serial) {
  if (!serial || isNaN(serial)) return serial || '';
  const num = parseFloat(serial);
  const utc_days = Math.floor(num - 25569);
  const date = new Date(utc_days * 86400 * 1000);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
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

function escapeCsvField(val) {
  if (val === null || val === undefined) return '';
  const str = String(val).trim();
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

const csvLines = [];
let validCount = 0;

for (let i = 0; i < rowMatches.length; i++) {
  const row = parseRow(rowMatches[i]);
  if (i === 0) {
    csvLines.push(['Empleado/Número de identificación', 'Empleado', 'Razón Social', 'Puesto de trabajo', 'Fecha de inicio', 'DIRECCION', 'Empleado/Ubicación de trabajo', 'Cuenta analítica'].map(escapeCsvField).join(','));
    continue;
  }

  const cedula = (row.A || '').trim();
  const name = (row.B || '').trim();
  if (!cedula && !name) continue;

  const razon = (row.C || '').trim();
  const cargo = (row.D || '').trim();
  const fecha = excelDateToString(row.E);
  const direccion = (row.F || '').trim();
  const ubicacion = (row.G || '').trim();
  const cuenta = (row.H || '').trim();

  const line = [cedula, name, razon, cargo, fecha, direccion, ubicacion, cuenta].map(escapeCsvField).join(',');
  csvLines.push(line);
  validCount++;
}

console.log(`Generated ${csvLines.length} lines (${validCount} employees).`);

const fileContent = `export const RAW_EMPLOYEES_CSV = \`${csvLines.join('\n')}\`;\n`;
fs.writeFileSync('src/data/rawEmployeesCsv.ts', fileContent, 'utf8');
console.log('Successfully written src/data/rawEmployeesCsv.ts');
