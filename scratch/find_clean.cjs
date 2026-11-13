const fs = require('fs');
const readline = require('readline');

async function extractUserCsv() {
  const fileStream = fs.createReadStream('C:/Users/nrodriguez/.gemini/antigravity/brain/ff782a95-aff8-41fb-b67d-d4cf74e3966e/.system_generated/logs/transcript.jsonl');
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  for await (const line of rl) {
    if (!line.includes('26120411,Alexis Martin Vasquez Reyes')) continue;
    if (line.includes('extractUserCsv')) continue;
    if (line.includes('run_command')) continue;

    console.log('Found candidate line, length:', line.length);
    fs.writeFileSync('scratch/candidate_line.txt', line, 'utf8');
    break;
  }
}
extractUserCsv();
