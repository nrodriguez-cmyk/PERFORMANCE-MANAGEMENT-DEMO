const fs = require('fs');
const readline = require('readline');

async function run() {
  const fileStream = fs.createReadStream('C:/Users/nrodriguez/.gemini/antigravity/brain/ff782a95-aff8-41fb-b67d-d4cf74e3966e/.system_generated/logs/transcript.jsonl');
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  for await (const line of rl) {
    if (line.includes('"step_index":3516')) {
      const obj = JSON.parse(line);
      console.log('Source:', obj.source, 'Content length:', obj.content ? obj.content.length : 0);
      if (obj.content) {
        fs.writeFileSync('scratch/step3516.txt', obj.content, 'utf8');
      }
      break;
    }
  }
}
run();
