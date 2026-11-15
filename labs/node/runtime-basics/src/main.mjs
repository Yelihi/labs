import { pathToFileURL } from 'node:url';

export function add(a, b) {
  return a + b;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  console.log(add(2, 3));
}
