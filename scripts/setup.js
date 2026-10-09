import { readFileSync, writeFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
const template = readFileSync(new URL('../.env.example', import.meta.url), 'utf8');
try {
  writeFileSync(new URL('../.env', import.meta.url), template.replace('STARTER_API_KEY=\n', `STARTER_API_KEY=${randomBytes(32).toString('base64url')}\n`), { flag: 'wx', mode: 0o600 });
  console.log('Created .env with a random team key. Set Auth0 values and your own Mapbox token, then run npm run dev.');
} catch (error) {
  if (error.code !== 'EEXIST') throw error;
  console.log('.env already exists; nothing was overwritten.');
}
