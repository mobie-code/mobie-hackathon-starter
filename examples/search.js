import { readFile } from 'node:fs/promises';
const file = process.argv[2];
if (!file) {
  console.error('Usage: npm run example:search -- ./my-search.json\nCopy examples/search.json and set a future time and coordinates matching the staging rides.');
  process.exitCode = 1;
} else {
  const body = JSON.parse(await readFile(file, 'utf8'));
  const response = await fetch(`http://127.0.0.1:${process.env.PORT || 3000}/api/rides/search`, {
    method: 'POST', headers: { Authorization: `Bearer ${process.env.STARTER_API_KEY}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: AbortSignal.timeout(20_000),
  });
  console.log(JSON.stringify(await response.json(), null, 2));
  if (!response.ok) process.exitCode = 1;
}
