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
const { bfs } = await import('../src/pathfinding/bfs.ts');
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

test('BFS returns deterministic breadth-first processing and a shortest path', () => {
  const input = grid(3, 3);
  const result = bfs(input);
  assert.deepEqual(result, {
    found: true, visited: [0, 1, 3, 2, 4, 6, 5, 7, 8], path: [0, 1, 2, 5, 8],
  });
  assert.deepEqual(bfs(input), result);
  result.path.reverse();
  assert.deepEqual(bfs(input).path, [0, 1, 2, 5, 8]);
  assert.deepEqual(input, grid(3, 3));
});

test('BFS respects walls and reports no path without inventing a route', () => {
  assert.deepEqual(bfs(grid(3, 3, [1, 4])).path, [0, 3, 6, 7, 8]);
  assert.deepEqual(bfs(grid(3, 3, [1, 3])), { found: false, visited: [0], path: [] });
  assert.deepEqual(bfs(grid(1, 3, [1])), { found: false, visited: [0], path: [] });
});

test('BFS handles same-cell and reversed endpoints through the evaluation contract', async () => {
  const { evaluatePathfinding } = await import('../src/pathfinding/evaluation.ts');
  assert.deepEqual(bfs(grid(1, 1)), { found: true, visited: [0], path: [0] });
  const input = grid(1, 4, [], 3, 0);
  let tick = 0;
  const result = evaluatePathfinding('bfs', input, bfs, () => tick++);
  assert.equal(result.status, 'completed');
  assert.deepEqual(result.path, [3, 2, 1, 0]);
  assert.equal(result.pathLength, 3);
  assert.equal(result.visitedNodeCount, 4);
  assert.equal(result.executionTimeMs, 1);
});

test('BFS matches independent all-pairs distances for every 3x3 wall layout', () => {
  let cases = 0;
  for (let mask = 0; mask < 512; mask++) {
    const walls = Array.from({ length: 9 }, (_, id) => Boolean(mask & (1 << id)));
    const distance = Array.from({ length: 9 }, (_, a) => Array.from({ length: 9 }, (_, b) => {
      if (walls[a] || walls[b]) return Infinity;
      if (a === b) return 0;
      const manhattan = Math.abs(Math.floor(a / 3) - Math.floor(b / 3)) + Math.abs(a % 3 - b % 3);
      return manhattan === 1 ? 1 : Infinity;
    }));
    // Floyd–Warshall oracle: no production neighbours, queue or reconstruction.
    for (let k = 0; k < 9; k++) for (let a = 0; a < 9; a++) for (let b = 0; b < 9; b++) {
      distance[a][b] = Math.min(distance[a][b], distance[a][k] + distance[k][b]);
    }
    for (let start = 0; start < 9; start++) for (let end = 0; end < 9; end++) {
      if (walls[start] || walls[end]) continue;
      const input = snapshotInput({ rows: 3, cols: 3, start, end, walls });
      const result = bfs(input);
      const label = `mask=${mask}, start=${start}, end=${end}`;
      assert.equal(result.found, Number.isFinite(distance[start][end]), label);
      assert.equal(new Set(result.visited).size, result.visited.length, label);
      assert.equal(result.visited[0], start, label);
      assert.ok(result.visited.every(id => !walls[id]), label);
      if (result.found) {
        assert.equal(result.path.length - 1, distance[start][end], label);
        assert.equal(result.path[0], start, label);
        assert.equal(result.path.at(-1), end, label);
        assert.ok(result.path.every(id => result.visited.includes(id)), label);
        for (let i = 1; i < result.path.length; i++) {
          const a = result.path[i - 1], b = result.path[i];
          assert.equal(Math.abs(Math.floor(a / 3) - Math.floor(b / 3)) + Math.abs(a % 3 - b % 3), 1, label);
        }
      } else {
        assert.deepEqual(result.path, [], label);
        assert.deepEqual([...result.visited].sort((a, b) => a - b),
          distance[start].flatMap((value, id) => Number.isFinite(value) ? [id] : []), label);
      }
      cases++;
    }
  }
  assert.equal(cases, 11520);
});

test('BFS handles the maximum supported grid without duplicate visits or input mutation', () => {
  const input = grid(100, 100);
  const result = bfs(input);
  assert.equal(result.found, true);
  assert.equal(result.path.length - 1, 198);
  assert.equal(result.visited.length, 10000);
  assert.equal(new Set(result.visited).size, 10000);
  assert.deepEqual(input, grid(100, 100));
});

const { idlePlayback, startPlayback, advancePlayback, ANIMATION_DELAYS } = await import('../src/pathfinding/playback.ts');
const { evaluatePathfinding, gridToInput } = await import('../src/pathfinding/evaluation.ts');
const uiGrid = () => [['start', 'empty', 'end'], ['wall', 'empty', 'empty']]
  .map((row, r) => row.map((type, c) => ({ row: r, col: c, type })));

test('playback paints visited then path in result order without changing markers or input', () => {
  const grid = uiGrid();
  const result = evaluatePathfinding('bfs', gridToInput(grid), bfs);
  let state = startPlayback(grid, result);
  assert.deepEqual(state.frames.map(frame => frame.id), [...result.visited, ...result.path]);
  assert.ok(state.frames.slice(0, result.visited.length).every(frame => frame.type === 'visited'));
  assert.ok(state.frames.slice(result.visited.length).every(frame => frame.type === 'path'));
  for (let step = 0; step < state.frames.length; step++) {
    const previous = state;
    state = advancePlayback(state);
    assert.equal(state.cursor, step + 1);
    assert.equal(previous.cursor, step);
    assert.equal(state.grid[0][0].type, 'start');
    assert.equal(state.grid[0][2].type, 'end');
    assert.equal(state.grid[1][0].type, 'wall');
    if (step < result.visited.length) assert.equal(state.grid.flat().some(node => node.type === 'path'), false);
  }
  assert.equal(state.status, 'completed');
  assert.equal(state.grid[0][1].type, 'path');
  assert.equal(advancePlayback(state), state);
  assert.equal(state.result, result);
  assert.deepEqual(grid, uiGrid());
  assert.deepEqual(idlePlayback(state.grid).grid, grid);
  assert.deepEqual(startPlayback(state.grid, result).grid, grid);
});

test('playback terminates for no-path and errors; speed changes delays, not results', () => {
  const grid = uiGrid();
  grid[0][1].type = 'wall';
  const result = evaluatePathfinding('bfs', gridToInput(grid), bfs);
  let state = startPlayback(grid, result);
  while (state.status === 'running') state = advancePlayback(state);
  assert.equal(state.result.found, false);
  assert.equal(state.grid.flat().some(node => node.type === 'path'), false);
  const error = startPlayback(grid, { algorithm: 'bfs', status: 'error', error: 'runner_error' });
  assert.equal(error.status, 'error');
  assert.equal(error.result, null);
  assert.equal(advancePlayback(error), error);
  assert.ok(ANIMATION_DELAYS.slow > ANIMATION_DELAYS.normal);
  assert.ok(ANIMATION_DELAYS.normal > ANIMATION_DELAYS.fast);
});
