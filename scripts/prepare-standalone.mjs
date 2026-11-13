import { cp, mkdir } from 'node:fs/promises';
import { join } from 'node:path';

// Next's standalone output excludes static/public assets by default. Hostinger's
// server.js launches that output, so package these assets alongside its server.
const root = process.cwd();
const destination = join(root, '.next', 'standalone');
await mkdir(join(destination, '.next'), { recursive: true });
await cp(join(root, 'public'), join(destination, 'public'), { recursive: true });
await cp(join(root, '.next', 'static'), join(destination, '.next', 'static'), { recursive: true });
console.log('Standalone public and static assets prepared.');
