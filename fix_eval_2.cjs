const fs = require('fs');
let c = fs.readFileSync('src/pages/Evaluate.tsx', 'utf8');
c = c.replace(/evaluaci.n de \$\{displayEmployeeName\}/, 'evaluación de ${displayEmployeeName}');
fs.writeFileSync('src/pages/Evaluate.tsx', c, 'utf8');
