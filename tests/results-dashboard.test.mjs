import { registerHooks } from 'node:module';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

// Transpile source for Node's test runner; no new test dependency required.
registerHooks({
  resolve(specifier, context, next) {
    if (specifier.endsWith('/i18n/benchmark')) specifier += '.ts';
    return next(specifier, context);
  },
  load(url, context, next) {
    if (url.endsWith('.css')) return { format: 'module', source: '', shortCircuit: true };
    if (/\.(ts|tsx)$/.test(url)) return {
      format: 'module', shortCircuit: true,
      source: ts.transpileModule(readFileSync(fileURLToPath(url), 'utf8'), {
        compilerOptions: { module: ts.ModuleKind.ESNext, jsx: ts.JsxEmit.ReactJSX },
      }).outputText,
    };
    return next(url, context);
  },
});
const { ResultsDashboard } = await import('../src/components/Benchmark/ResultsDashboard.tsx');
const input = { dataset_type: 'random', size: 100, seed: 42 };
const result = { ...input, algorithm: 'bubble-sort', runs: 10, correct: true,
  timings_ns: [], median_ns: 2000000, min_ns: 1000000, max_ns: 4000000 };
const render = (entries, running = false) => renderToStaticMarkup(createElement(ResultsDashboard,
  { entries, running, language: 'el', onClear() {} }));

test('empty and loading states provide Greek guidance', () => {
  assert.match(render([]), /Εκτέλεσε ένα benchmark/);
  assert.match(render([], true), /role="status"/);
  assert.match(render([], true), /aria-busy="true"/);
});
test('converts nanoseconds to milliseconds and scales chart from zero', () => {
  const html = render([{ id: 1, input, status: 'completed', result }]);
  assert.match(html, /<td>2<\/td><td>1<\/td><td>4<\/td>/);
  assert.match(html, /width:50%/);
  assert.match(html, /left:25%;width:75%/);
  assert.match(html, /Σωστή ταξινόμηση/);
  assert.match(html, /Bubble Sort · Python/);
});
test('failures and timeouts have no invented timing or correctness', () => {
  const html = render([{ id: 1, input, status: 'error' }, { id: 2, input, status: 'timeout' }]);
  assert.match(html, /Η εκτέλεση απέτυχε/);
  assert.match(html, /30 δευτερόλεπτα/);
  assert.doesNotMatch(html, /results__plot|Σωστή ταξινόμηση/);
  assert.equal((html.match(/<td>—<\/td>/g) ?? []).length, 8);
});
test('incorrect output stays labelled and zero timings stay finite', () => {
  const html = render([{ id: 1, input, status: 'completed', result: {
    ...result, correct: false, median_ns: 0, min_ns: 0, max_ns: 0,
  } }]);
  assert.match(html, /Αποτυχία ελέγχου ορθότητας/);
  assert.doesNotMatch(html, /NaN|Infinity|Σωστή ταξινόμηση/);
  assert.match(html, /width:0%/);
});
