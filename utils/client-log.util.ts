import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import figlet from 'figlet';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(path.join(__dirname, '../package.json'), 'utf-8'));

export function logClientUp(mode: string, baseUrl: string) {
  console.log(figlet.textSync('XCORPION'));
  console.log(`Project     : ${pkg.name}`);
  console.log(`Version     : ${pkg.version}`);
  console.log(`Environment : ${mode}`);
  console.log(`API base    : ${baseUrl}`);
}
