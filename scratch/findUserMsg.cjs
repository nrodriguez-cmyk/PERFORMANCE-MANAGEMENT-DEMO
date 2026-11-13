const fs = require('fs');
const readline = require('readline');

async function findUserMsg() {
  const fileStream = fs.createReadStream('C:/Users/nrodriguez/.gemini/antigravity/brain/ff782a95-aff8-41fb-b67d-d4cf74e3966e/.system_generated/logs/transcript.jsonl');
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  for await (const line of rl) {
    if (line.includes('ACTUALIZA LA BASE DE DATOS')) {
      const obj = JSON.parse(line);
      console.log('Step:', obj.step_index, 'Type:', obj.type, 'Source:', obj.source, 'Content len:', (obj.content || '').length);
      fs.writeFileSync('scratch/user_msg.txt', obj.content || '', 'utf8');
    }
  }
}
findUserMsg();
