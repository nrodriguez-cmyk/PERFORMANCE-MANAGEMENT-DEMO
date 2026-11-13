const fs = require('fs');
const readline = require('readline');

async function findCsv() {
  const fileStream = fs.createReadStream('C:/Users/nrodriguez/.gemini/antigravity/brain/ff782a95-aff8-41fb-b67d-d4cf74e3966e/.system_generated/logs/transcript.jsonl');
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  for await (const line of rl) {
    if (line.includes('Barbara Marina Bravo Portillo') && line.includes('Alexis Martin Vasquez Reyes')) {
      const obj = JSON.parse(line);
      console.log('Found! Step:', obj.step_index, 'Type:', obj.type, 'Source:', obj.source);
      fs.writeFileSync('scratch/full_csv_step.json', JSON.stringify({ content: obj.content }));
      break;
    }
  }
}
findCsv();
