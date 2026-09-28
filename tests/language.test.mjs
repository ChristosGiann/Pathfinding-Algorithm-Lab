import { registerHooks } from 'node:module';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

registerHooks({
  resolve(specifier, context, next) {
    if (specifier.startsWith('.') && context.parentURL) {
      for (const suffix of ['.ts', '.tsx']) {
        if (existsSync(fileURLToPath(new URL(specifier + suffix, context.parentURL)))) {
          return next(specifier + suffix, context);
        }
      }
    }
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
const { translations } = await import('../src/i18n/translations.ts');
const { reviewTexts } = await import('../src/i18n/review.ts');
const { benchmarkTexts } = await import('../src/i18n/benchmark.ts');
const { customPythonTexts } = await import('../src/i18n/customPython.ts');
const { pythonErrorMessage } = await import('../src/i18n/pythonErrors.ts');
const { AppHeader } = await import('../src/components/AppHeader/AppHeader.tsx');
const { GridNode } = await import('../src/components/Grid/GridNode.tsx');
const { ResultsDashboard } = await import('../src/components/Benchmark/ResultsDashboard.tsx');
const render = (component, props) => renderToStaticMarkup(createElement(component, props));

function shape(value) {
  return Object.fromEntries(Object.entries(value).map(([key, item]) => [key,
    typeof item === 'object' ? shape(item) : typeof item]));
}
test('all UI dictionaries have matching non-empty Greek and English entries', () => {
  for (const texts of [translations, reviewTexts, benchmarkTexts, customPythonTexts]) {
    assert.deepEqual(shape(texts.el), shape(texts.en));
    assert.doesNotMatch(JSON.stringify(texts), /:""/);
  }
});
test('header labels the selector and reflects each selected language', () => {
  for (const language of ['el', 'en']) {
    const html = render(AppHeader, { texts: translations[language].app, language, onLanguageChange() {} });
    assert.match(html, new RegExp(translations[language].app.title));
    assert.match(html, /for="app-language"/);
    assert.match(html, new RegExp(`value="${language}"[^>]*selected=""`));
    assert.match(html, /lang="el"/);
    assert.match(html, /lang="en"/);
  }
});
test('grid accessible labels and titles follow language while cell identity stays unchanged', () => {
  for (const language of ['el', 'en']) {
    const html = render(GridNode, { node: { row: 2, col: 3, type: 'wall' }, texts: translations[language].grid, onNodeClick() {} });
    assert.ok(html.includes(`aria-label="${translations[language].grid.cell(2, 3)}"`));
    assert.match(html, /grid-node--wall/);
  }
});
test('all static API error codes have English feedback and unknown codes have safe localized fallback', () => {
  const codes = ['invalid_request','empty_source','source_too_large','invalid_encoding','syntax_error','too_complex','missing_solve','invalid_signature','generator_solve'];
  for (const code of codes) {
    assert.doesNotMatch(pythonErrorMessage(code, 'en'), /[Α-Ωα-ω]|unknown error/);
    assert.match(pythonErrorMessage(code, 'el'), /[Α-Ωα-ω]/);
  }
  for (const code of ['future_error', 'toString', '__proto__']) {
    assert.match(pythonErrorMessage(code, 'en'), /unknown error/);
    assert.match(pythonErrorMessage(code, 'el'), /άγνωστο σφάλμα/);
  }
});
test('existing results render localized status and numbers without changing measurements', () => {
  const input = { algorithm:'bubble-sort', dataset_type:'random', size:100, seed:42 };
  const entries = [{ id:1, input, status:'completed', result:{...input, runs:10, correct:true, median_ns:1500000, min_ns:1000000, max_ns:2000000} }];
  const snapshot = JSON.stringify(entries);
  const en = render(ResultsDashboard, { entries, running:false, language:'en', onClear() {} });
  const el = render(ResultsDashboard, { entries, running:false, language:'el', onClear() {} });
  assert.match(en, /Correct sorting in all 10 runs/);
  assert.match(en, /<td>1\.5<\/td>/);
  assert.match(el, /Σωστή ταξινόμηση/);
  assert.match(el, /<td>1,5<\/td>/);
  assert.equal(JSON.stringify(entries), snapshot);
});


test('mixed algorithm results keep identity in table, chart and failed attempts in both languages', () => {
  const input = { algorithm:'insertion-sort', dataset_type:'reversed', size:100, seed:42 };
  const entries = [
    { id:1, input, status:'completed', result:{...input, runs:10, correct:true, median_ns:100, min_ns:50, max_ns:200} },
    { id:2, input:{...input, algorithm:'bubble-sort'}, status:'error' },
    { id:3, input, status:'timeout' },
  ];
  for (const language of ['el', 'en']) {
    const html = render(ResultsDashboard, {entries, running:false, language, onClear() {}});
    assert.match(html, /Insertion Sort · Python/);
    assert.match(html, /Bubble Sort · Python/);
    assert.match(html, /#1 · Insertion Sort · 100/);
    assert.ok(html.includes(benchmarkTexts[language].timeout));
    assert.ok(html.includes(benchmarkTexts[language].error));
  }
});
