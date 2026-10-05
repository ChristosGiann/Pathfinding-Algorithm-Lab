import { registerHooks } from 'node:module';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { test } from 'node:test';
import assert from 'node:assert/strict';

registerHooks({
  resolve(specifier, context, next) {
    if (specifier.startsWith('.') && context.parentURL
      && existsSync(fileURLToPath(new URL(specifier + '.ts', context.parentURL)))) {
      return next(specifier + '.ts', context);
    }
    return next(specifier, context);
  },
  load(url, context, next) {
    if (url.endsWith('.ts')) return {
      format: 'module', shortCircuit: true,
      source: ts.transpileModule(readFileSync(fileURLToPath(url), 'utf8'), {
        compilerOptions: { module: ts.ModuleKind.ESNext },
      }).outputText,
    };
    return next(url, context);
  },
});

const { neighbours, snapshotInput } = await import('../src/pathfinding/evaluation.ts');
const { reconstructPath } = await import('../src/pathfinding/reconstructPath.ts');
const grid = (rows, cols, walls = [], start = 0, end = rows * cols - 1) => snapshotInput({
  rows, cols, start, end,
  walls: Array.from({ length: rows * cols }, (_, id) => walls.includes(id)),
});

test('neighbours returns cardinal cells in stable order without row wrapping', () => {
  const input = grid(3, 3);
  assert.deepEqual(neighbours(input, 4), [1, 5, 7, 3]);
  assert.deepEqual(neighbours(input, 0), [1, 3]);
  assert.deepEqual(neighbours(input, 2), [5, 1]);
  assert.deepEqual(neighbours(input, 6), [3, 7]);
  assert.deepEqual(neighbours(input, 8), [5, 7]);
  assert.deepEqual(neighbours(input, 3), [0, 4, 6]);
});

test('neighbours excludes walls and invalid origins and returns independent arrays', () => {
  const input = grid(3, 3, [1, 5, 7]);
  assert.deepEqual(neighbours(input, 4), [3]);
  for (const id of [-1, 9, 1.5, NaN, Infinity, 1]) assert.deepEqual(neighbours(input, id), []);
  const result = neighbours(input, 4);
  result.push(8);
  assert.deepEqual(neighbours(input, 4), [3]);
  assert.deepEqual(input, grid(3, 3, [1, 5, 7]));
});

test('neighbours handles single cells, rows and columns', () => {
  assert.deepEqual(neighbours(grid(1, 1), 0), []);
  assert.deepEqual(neighbours(grid(1, 3), 1), [2, 0]);
  assert.deepEqual(neighbours(grid(3, 1), 1), [0, 2]);
  assert.deepEqual(neighbours(grid(1, 3, [1]), 0), []);
});

test('reconstruction follows previous references from end to the exact start', () => {
  const start = Object.freeze({ id: 2, previous: null });
  const middle = Object.freeze({ id: 5, previous: start });
  const end = Object.freeze({ id: 8, previous: middle });
  assert.deepEqual(reconstructPath(start, end), [2, 5, 8]);
  assert.deepEqual(reconstructPath(start, start), [2]);
  const path = reconstructPath(start, end);
  path.reverse();
  assert.deepEqual(reconstructPath(start, end), [2, 5, 8]);
  assert.equal(end.previous, middle);
});

test('reconstruction returns empty for absent, disconnected or cyclic chains', () => {
  const start = { id: 0, previous: null };
  assert.deepEqual(reconstructPath(start, null), []);
  assert.deepEqual(reconstructPath(start, { id: 1, previous: null }), []);
  assert.deepEqual(reconstructPath(start, { id: 0, previous: null }), []);
  const a = { id: 1, previous: null };
  const b = { id: 2, previous: a };
  a.previous = b;
  assert.deepEqual(reconstructPath(start, b), []);
});

test('reconstruction handles long chains without recursive stack growth', () => {
  const start = { id: 0, previous: null };
  let end = start;
  for (let id = 1; id < 10000; id++) end = { id, previous: end };
  assert.deepEqual(reconstructPath(start, end), Array.from({ length: 10000 }, (_, id) => id));
});
