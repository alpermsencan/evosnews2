import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { createRequire } from 'node:module';
import ts from 'typescript';
import { fileURLToPath } from 'node:url';
const __dirname = fileURLToPath(new URL('../', import.meta.url));

export function loadTs(file, mocks = {}) {
  const cache = new Map();
  function load(filename) {
    if (cache.has(filename)) return cache.get(filename).exports;
    const loadedModule = { exports: {} };
    cache.set(filename, loadedModule);
    const localRequire = createRequire(filename);
    const output = ts.transpileModule(readFileSync(filename, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
    }).outputText;
    function dependency(name) {
      if (name === 'server-only') return {};
      if (Object.hasOwn(mocks, name)) return mocks[name];
      const base = name.startsWith('@/')
        ? resolve(__dirname, '..', name.slice(2))
        : name.startsWith('.') ? resolve(dirname(filename), name) : null;
      if (!base) return localRequire(name);
      const target = [base + '.ts', base + '/index.ts'].find(existsSync);
      if (!target) throw new Error(`Missing test dependency: ${name}`);
      return load(target);
    }
    new Function('require', 'module', 'exports', output)(dependency, loadedModule, loadedModule.exports);
    return loadedModule.exports;
  }
  return load(resolve(__dirname, '..', file));
}

