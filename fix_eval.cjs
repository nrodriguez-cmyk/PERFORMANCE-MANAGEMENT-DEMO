const fs = require('fs');
let c = fs.readFileSync('src/pages/Evaluate.tsx', 'utf8');
c = c.replace(/message: El evaluador.*?\,/, 'message: `El evaluador (${roleName}) ha enviado la evaluación de ${displayEmployeeName}.`,');
fs.writeFileSync('src/pages/Evaluate.tsx', c, 'utf8');
