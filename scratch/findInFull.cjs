const fs = require('fs');
const readline = require('readline');

async function findInFull() {
  const fileStream = fs.createReadStream('C:/Users/nrodriguez/.gemini/antigravity/brain/ff782a95-aff8-41fb-b67d-d4cf74e3966e/.system_generated/logs/transcript_full.jsonl');
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  for await (const line of rl) {
    if (line.includes('"step_index":3477')) {
      const obj = JSON.parse(line);
      console.log('Step 3477 in full: Content len:', (obj.content || '').length);
      fs.writeFileSync('scratch/step3477_full.txt', obj.content || '', 'utf8');
      break;
    }
  }
}
findInFull();
