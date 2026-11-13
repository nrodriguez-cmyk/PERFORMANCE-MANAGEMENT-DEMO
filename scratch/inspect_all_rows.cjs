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
  // Excel epoch is 1899-12-30 (accounting for 1900 leap year bug)
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

const cols = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
const rows = [];
let validEmployeeCount = 0;

for (let i = 0; i < rowMatches.length; i++) {
  const row = parseRow(rowMatches[i]);
  if (!row.A && !row.B) continue; // skip completely empty
  // Header is row 0
  if (i === 0) {
    rows.push(['Empleado/Número de identificación', 'Empleado', 'Razón Social', 'Puesto de trabajo', 'Fecha de inicio', 'DIRECCION', 'Empleado/Ubicación de trabajo', 'Cuenta analítica']);
    continue;
  }
  // Check if A is a cédula or valid number
  const cedula = (row.A || '').trim();
  const name = (row.B || '').trim();
  if (!cedula && !name) continue;

  const razon = (row.C || '').trim();
  const cargo = (row.D || '').trim();
  const fecha = excelDateToString(row.E);
  const direccion = (row.F || '').trim();
  const ubicacion = (row.G || '').trim();
  const cuenta = (row.H || '').trim();

  rows.push([cedula, name, razon, cargo, fecha, direccion, ubicacion, cuenta]);
  validEmployeeCount++;
}

console.log('Total parsed rows (including header):', rows.length);
console.log('Valid employee count:', validEmployeeCount);
console.log('Sample row 1:', rows[1]);
console.log('Sample row last:', rows[rows.length - 1]);
console.log('Sample row middle:', rows[Math.floor(rows.length / 2)]);
