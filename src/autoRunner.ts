import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const inputPath = path.resolve(__dirname, 'input.txt');

const inputLines = fs.readFileSync(inputPath, 'utf-8')
  .split('\n')
  .map(line => line.trim())
  .filter(line =>
    line.length > 0 &&
    !line.startsWith('#') &&
    !line.startsWith('//') &&
    !line.startsWith('--') &&
    !line.startsWith(';')
  );

const child = spawn('npx', ['ts-node', 'src/index.ts'], {
  stdio: 'pipe',
  shell: true,
  env: {
    ...process.env,
    FORCE_COLOR: '1',
  },
});


child.stdout.on('data', (data) => {
  process.stdout.write(data.toString());
});

child.stderr.on('data', (data) => {
  console.error(data.toString());
});

let currentLine = 0;
const sendNextInput = () => {
  if (currentLine < inputLines.length) {
    const line = inputLines[currentLine];
    console.log(`${line}`);
    child.stdin.write(line + '\n');
    currentLine++;
    setTimeout(sendNextInput, 300);
  } else {
    child.stdin.end();
  }
};


setTimeout(sendNextInput, 5000);

child.on('close', (code) => {
  console.log(`\nProcesso encerrado com código ${code}`);
});
