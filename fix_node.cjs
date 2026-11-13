const fs = require('fs');
let c = fs.readFileSync('src/pages/Evaluate.tsx', 'utf8');
const searchStr = '      message: El evaluador () ha enviado la evaluacin de .,';
const replaceStr = '      message: El evaluador () ha enviado la evaluación de .,';
c = c.replace(searchStr, replaceStr);
fs.writeFileSync('src/pages/Evaluate.tsx', c, 'utf8');
