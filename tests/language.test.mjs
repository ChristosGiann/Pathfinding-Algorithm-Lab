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
      // Vite supplies import.meta.env in the browser; rendering tests do not make requests.
      source: ts.transpileModule(readFileSync(fileURLToPath(url), 'utf8').replaceAll('import.meta.env', '({VITE_API_BASE_URL: \"http://127.0.0.1:8000/api\"})'), {
        compilerOptions: { module: ts.ModuleKind.ESNext, jsx: ts.JsxEmit.ReactJSX },
      }).outputText,
    };
    return next(url, context);
  },
});
const { translations } = await import('../src/i18n/translations.ts');
const { experimentTexts } = await import('../src/i18n/experiment.ts');
const { HistoryPage } = await import('../src/components/Experiments/HistoryPage.tsx');
const { ExperimentDetails } = await import('../src/components/Experiments/ExperimentDetails.tsx');
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
  for (const texts of [translations, reviewTexts, benchmarkTexts, customPythonTexts, experimentTexts]) {
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


test('saved experiment uses snapshots after catalogue deletion and keeps failed correctness visible', () => {
  const experiment = {id:7, name:'Saved test', status:'failed', execution_error:'incorrect_result', implementations:[], datasets:[], results:[
    {id:1, implementation_snapshot:{id:12,name:'Historical sorter',algorithm:'insertion-sort',language:'python'},
    measurement:{algorithm:'insertion-sort',dataset_type:'random',size:100,seed:42,runs:10,correct:false,median_ns:1500000,min_ns:1000000,max_ns:2000000}}
  ]};
  for (const language of ['el','en']) {
    const html = render(ExperimentDetails, {experiment, language});
    assert.match(html, /Historical sorter/);
    assert.match(html, /insertion-sort/);
    assert.ok(html.includes(experimentTexts[language].incorrect));
    assert.ok(html.includes(benchmarkTexts[language].incorrect));
    assert.ok(html.includes(language === 'el' ? '1,5' : '1.5'));
  }
});
test('draft and runner failure render without invented measurements', () => {
  for (const status of ['draft','failed']) {
    const html = render(ExperimentDetails, {language:'en',experiment:{id:1,name:'Test',status,execution_error:status==='failed'?'runner_error':'',implementations:[],datasets:[],results:[]}});
    assert.match(html, /No saved measurements/);
    assert.doesNotMatch(html, /<table/);
    if (status==='failed') assert.match(html, /Execution failed in the runner/);
  }
});


test('history renders localized summaries, escaped names and disabled open controls', () => {
  const data = {results:[{id:7,name:'<script>sample</script>',status:'completed',created_at:'2026-09-29T12:00:00Z',updated_at:'2026-09-29T12:05:00Z'}],next_before:null};
  for (const language of ['el','en']) {
    const html = render(HistoryPage, {data,language,busy:true,onOpen(){}});
    assert.ok(html.includes(experimentTexts[language].states.completed));
    assert.ok(html.includes(experimentTexts[language].open+' #7'));
    assert.match(html, /disabled=""/);
    assert.match(html, /&lt;script&gt;/);
    assert.match(html, /dateTime="2026-09-29T12:00:00Z"/i);
  }
});
test('empty history gives guidance without open buttons', () => {
  const html = render(HistoryPage, {data:{results:[],next_before:null},language:'en',busy:false,onOpen(){}});
  assert.match(html, /No experiments on this page/);
  assert.doesNotMatch(html, /<button/);
});


test('Selection Sort is selectable and labelled in both languages', async () => {
  const { Benchmark } = await import('../src/components/Benchmark/Benchmark.tsx');
  for (const language of ['el', 'en']) {
    const html = renderToStaticMarkup(createElement(Benchmark, { language }));
    assert.match(html, /<option value="selection-sort">Selection Sort<\/option>/);
  }
});
