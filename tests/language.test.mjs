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
test('all UI dictionaries have matching non-empty Greek and English entries', async () => {
  const additional=[];
  for(const file of ['comparison','comparisonSave','complexity','education','visualization','customExecution']) {
    const module=await import(`../src/i18n/${file}.ts`); additional.push(...Object.values(module).filter(value=>value?.el&&value?.en));
  }
  for (const texts of [translations, reviewTexts, benchmarkTexts, customPythonTexts, experimentTexts,...additional]) {
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

test('Merge Sort is selectable and labelled in both languages', async () => {
  const { Benchmark } = await import('../src/components/Benchmark/Benchmark.tsx');
  for (const language of ['el', 'en']) {
    const html = renderToStaticMarkup(createElement(Benchmark, { language }));
    assert.match(html, /<option value="merge-sort">Merge Sort<\/option>/);
  }
});

test('Quick Sort is selectable and labelled in both languages', async () => {
  const { Benchmark } = await import('../src/components/Benchmark/Benchmark.tsx');
  for (const language of ['el', 'en']) {
    const html = renderToStaticMarkup(createElement(Benchmark, { language }));
    assert.match(html, /<option value="quick-sort">Quick Sort<\/option>/);
  }
});


test('comparison uses shared scale, preserves failed/incorrect rows and both languages', async () => {
  const { ComparisonResults } = await import('../src/components/Comparison/ComparisonResults.tsx');
  const result = { dataset_type:'random', size:10, seed:42, results:[
    {algorithm:'bubble-sort',status:'completed',measurement:{correct:true,median_ns:2000000,min_ns:1000000,max_ns:4000000}},
    {algorithm:'quick-sort',status:'completed',measurement:{correct:false,median_ns:1000000,min_ns:500000,max_ns:2000000}},
    {algorithm:'merge-sort',status:'error',error:'runner_error'}] };
  for (const language of ['el','en']) {
    const html = renderToStaticMarkup(createElement(ComparisonResults,{result,language}));
    assert.match(html,/width:50%/); assert.match(html,/width:25%/);
    assert.match(html,/Merge Sort/); assert.match(html,/<td>—<\/td>/);
    assert.match(html,language === 'el' ? /Αποτυχία ελέγχου/ : /Correctness check failed/);
    const zero = {...result,results:[{...result.results[0],measurement:{correct:true,median_ns:0,min_ns:0,max_ns:0}}]};
    assert.doesNotMatch(renderToStaticMarkup(createElement(ComparisonResults,{result:zero,language})),/NaN|Infinity/);
  }
});


test('complexity context maps by slug and never fabricates missing values', async () => {
  const { ComplexityContext } = await import('../src/components/Benchmark/ComplexityContext.tsx');
  const catalogue = [{slug:'quick-sort',best_case_complexity:'BEST',average_case_complexity:'AVG',worst_case_complexity:'WORST',space_complexity:'SPACE'}];
  for (const language of ['el','en']) {
    const html = renderToStaticMarkup(createElement(ComplexityContext,{slug:'quick-sort',catalogue,language}));
    for (const value of ['BEST','AVG','WORST','SPACE']) assert.match(html,new RegExp(value));
    const missing = renderToStaticMarkup(createElement(ComplexityContext,{slug:'unknown',catalogue,language}));
    assert.doesNotMatch(missing,/BEST|AVG|WORST|SPACE/);
    assert.match(missing,language === 'el' ? /Metadata μη διαθέσιμα/ : /Metadata unavailable/);
  }
});


test('persisted comparison reconstructs after refresh from snapshots only', async () => {
  const { comparisonFromExperiment } = await import('../src/components/Comparison/fromExperiment.ts');
  const { ComparisonResults } = await import('../src/components/Comparison/ComparisonResults.tsx');
  const experiment = JSON.parse(JSON.stringify({results:['quick-sort','merge-sort'].map(algorithm => ({implementation_snapshot:{algorithm,comparison:true},measurement:{algorithm,dataset_type:'reversed',size:10,seed:7,correct:true,median_ns:1000,min_ns:500,max_ns:2000}}))}));
  const restored = comparisonFromExperiment(experiment);
  assert.equal(restored.results.length,2);
  assert.match(renderToStaticMarkup(createElement(ComparisonResults,{result:restored,language:'en'})),/Quick Sort/);
  assert.equal(comparisonFromExperiment({results:[]}),null);
});


test('statistics render explicit baseline, finite ratios and legacy fallback', async () => {
  const { ComparisonResults } = await import('../src/components/Comparison/ComparisonResults.tsx');
  const result = {baseline_algorithm:'quick-sort',dataset_type:'random',size:3,seed:1,results:[{algorithm:'quick-sort',status:'completed',measurement:{correct:true,median_ns:1000000,min_ns:1,max_ns:2000000,mean_ns:1500000,stddev_ns:500000,relative_speed:2}}]};
  for (const language of ['el','en']) {
    const html=renderToStaticMarkup(createElement(ComparisonResults,{result,language}));
    assert.match(html,/2×/); assert.match(html,language==='el' ? /Μέσος όρος/ : /Mean/);
    assert.match(html,language==='el' ? /Baseline αναφοράς: Quick Sort/ : /Reference baseline: Quick Sort/);
    assert.doesNotMatch(html,/NaN|Infinity/);
  }
});


test('all five sorting traces are deterministic, isolated and end sorted', async () => {
 const {sortingTrace,parseInput}=await import('../src/visualization/sortingTrace.ts');
 for (const slug of Object.keys(benchmarkTexts.en.algorithms)) for (const input of [[1],[3,1,3,0,2],[9,8,7,6],[1,2,3],[4,4,4]]) {
  const original=[...input],steps=sortingTrace(slug,input);
  assert.deepEqual(input,original);assert.deepEqual(steps,sortingTrace(slug,input));
  assert.deepEqual(steps[0].values,original);assert.deepEqual(steps.at(-1).values,[...input].sort((a,b)=>a-b));
  assert.equal(steps.at(-1).kind,'done');assert.equal(new Set(steps.map(s=>s.values)).size,steps.length);
 }
 assert.deepEqual(parseInput('3, 0 2'),[3,0,2]);
 for(const value of ['', '-1','1.5','1000',Array(33).fill('1').join(',')]) assert.throws(()=>parseInput(value));
});

test('playback pauses, steps, resets and stops at end without losing original', async()=>{
 const {sortingTrace,playback}=await import('../src/visualization/sortingTrace.ts');
 let s={steps:sortingTrace('bubble-sort',[2,1]),index:0,playing:false};
 s=playback(s,{type:'play'});s=playback(s,{type:'tick'});assert.equal(s.index,1);
 s=playback(s,{type:'pause'});assert.equal(playback(s,{type:'tick'}).index,1);
 s=playback(s,{type:'step'});assert.equal(s.index,2);assert.equal(s.playing,false);
 s=playback(s,{type:'play'});for(let i=0;i<20;i++)s=playback(s,{type:'tick'});
 assert.equal(s.index,s.steps.length-1);assert.equal(s.playing,false);
 s=playback(s,{type:'reset'});assert.equal(s.index,0);assert.deepEqual(s.steps[0].values,[2,1]);
 const {SortingVisualization}=await import('../src/components/SortingVisualization/SortingVisualization.tsx');
 for(const language of ['el','en']) {const html=renderToStaticMarkup(createElement(SortingVisualization,{language}));for(const label of ['Play','Pause','Step','Reset']) assert.match(html,new RegExp(label));}
});


test('education renders localized structure, supplied content and missing fallback',async()=>{
 const {EducationalContent}=await import('../src/components/AlgorithmLibrary/EducationalContent.tsx');
 for (const language of ['el','en']) {
  const content={what:'WHAT',intuition:'INTUITION',how:['STEP'],strengths:'STRENGTH',weaknesses:'WEAK',uses:'USE',pitfalls:'NOTE'};
  const algorithm={education:{[language]:content,stable:true,in_place:false,walkthrough:[[2,1],[1,2]]}};
  const html=renderToStaticMarkup(createElement(EducationalContent,{algorithm,language}));
  for(const value of ['WHAT','INTUITION','STEP','STRENGTH','WEAK','USE','NOTE','[2, 1]'])assert.ok(html.includes(value));
  assert.match(html,language==='el'?/Πλεονεκτήματα/:/Strengths/);
  const missing=renderToStaticMarkup(createElement(EducationalContent,{algorithm:{},language}));
  assert.doesNotMatch(missing,/O\(|WHAT/);assert.match(missing,language==='el'?/μη διαθέσιμο/:/unavailable/);
 }
});


test('custom benchmark requires trusted acknowledgement and explains local limits in both languages',async()=>{
 const {CustomBenchmark}=await import('../src/components/CustomPython/CustomBenchmark.tsx');
 for (const language of ['el','en']) {
  const html=renderToStaticMarkup(createElement(CustomBenchmark,{source:'def solve(values): return sorted(values)',language}));
  assert.match(html,/ENABLE_TRUSTED_CUSTOM_EXECUTION/);assert.match(html,/<button disabled=""/);
  assert.match(html,language==='el'?/δικός μου trusted/:/my own trusted/);
 }
});


test('mixed comparison identifies custom, retains built-in timings and failed rows',async()=>{
 const {ComparisonResults}=await import('../src/components/Comparison/ComparisonResults.tsx');
 for(const language of ['el','en']) for(const status of ['completed','error','timeout']) {
  const measurement={correct:true,median_ns:1000000,min_ns:500000,max_ns:2000000,relative_speed:2};
  const custom=status==='completed'?{algorithm:'custom-python',source_type:'custom',status,measurement}:{algorithm:'custom-python',source_type:'custom',status,error:'runner_error'};
  const result={baseline_algorithm:'quick-sort',dataset_type:'random',size:8,seed:42,results:[{algorithm:'quick-sort',source_type:'built_in',status:'completed',measurement},custom]};
  const html=renderToStaticMarkup(createElement(ComparisonResults,{result,language}));
  assert.match(html,/Quick Sort · Built-in/);assert.match(html,/Custom Python · Custom/);assert.match(html,/width:50%/);
  if(status!=='completed')assert.match(html,/<td>—<\/td>/);
 }
});


test('grid adapter validates endpoints and snapshots the existing UI without DOM',async()=>{
 const {gridToInput,neighbours,snapshotInput}=await import('../src/pathfinding/evaluation.ts');
 const {createGrid}=await import('../src/utils/createGrid.ts');
 const grid=createGrid(20,30), input=gridToInput(grid);
 assert.equal(input.start,305);assert.equal(input.end,324);assert.equal(input.walls.length,600);
 grid[0][0].type='wall';assert.equal(input.walls[0],false);
 const tiny={rows:2,cols:3,start:0,end:5,walls:[false,true,false,false,false,false]};
 assert.deepEqual(neighbours(tiny,0),[3]);assert.deepEqual(neighbours(tiny,3),[0,4]);
 assert.deepEqual(neighbours(tiny,2),[5]);assert.deepEqual(neighbours(tiny,1),[]);
 assert.ok(Object.isFrozen(snapshotInput(tiny).walls));
 for(const bad of [{...tiny,start:1},{...tiny,end:8},{...tiny,rows:0},{...tiny,walls:Array(6)},{...tiny,cols:2}])assert.throws(()=>snapshotInput(bad));
 assert.throws(()=>gridToInput([]));assert.throws(()=>gridToInput([[{row:0,col:0,type:'start'}]]));
 const miniature=[[{row:0,col:0,type:'start'},{row:0,col:1,type:'visited'},{row:0,col:2,type:'end'}]];
 assert.deepEqual(gridToInput(miniature).walls,[false,false,false]);
 miniature[0][1].type='start';assert.throws(()=>gridToInput(miniature));
});

test('pathfinding result measures only search and separates no-path, invalid and runner errors',async()=>{
 const {evaluatePathfinding}=await import('../src/pathfinding/evaluation.ts');
 const input={rows:1,cols:3,start:0,end:2,walls:[false,false,false]}, events=[];
 const times=[10,12.5];
 const result=evaluatePathfinding('bfs',input,()=>{events.push('search');return {found:true,visited:[0,1,2],path:[0,1,2]}},()=>{events.push('clock');return times.shift()});
 assert.deepEqual(events,['clock','search','clock']);assert.equal(result.executionTimeMs,2.5);assert.equal(result.pathLength,2);assert.equal(result.visitedNodeCount,3);
 const noPath=evaluatePathfinding('dfs',{...input,walls:[false,true,false]},()=>({found:false,visited:[0],path:[]}),()=>1);
 assert.equal(noPath.found,false);assert.equal(noPath.pathLength,null);assert.equal(noPath.executionTimeMs,0);
 const same=evaluatePathfinding('astar',{rows:1,cols:1,start:0,end:0,walls:[false]},()=>({found:true,visited:[0],path:[0]}),()=>1);
 assert.equal(same.pathLength,0);
 for(const trace of [{found:true,visited:[0,2],path:[0,2]},{found:true,visited:[0,1,2],path:[2,1,0]},{found:false,visited:[0,0],path:[]},{found:false,visited:[99],path:[]},{found:false,visited:[],path:[0]}]) {
  const bad=evaluatePathfinding('bfs',input,()=>trace,()=>1);assert.equal(bad.error,'invalid_result');assert.equal(bad.executionTimeMs,undefined);
 }
 assert.equal(evaluatePathfinding('bfs',input,()=>{throw Error('private detail')}).error,'runner_error');
 assert.equal(evaluatePathfinding('bfs',input,()=>({found:false,visited:[],path:[]}),()=>NaN).error,'invalid_clock');
});

test('same-grid comparison isolates mutation and continues after failure',async()=>{
 const {comparePathfinding}=await import('../src/pathfinding/evaluation.ts');
 const input={rows:1,cols:2,start:0,end:1,walls:[false,false]},copies=[];
 const success=fresh=>{copies.push(fresh);return {found:true,visited:[0,1],path:[0,1]}};
 const results=comparePathfinding(input,[{algorithm:'bfs',search:fresh=>{copies.push(fresh);fresh.walls[0]=true;}},{algorithm:'dijkstra',search:success},{algorithm:'astar',search:success}],()=>1);
 assert.equal(results[0].error,'runner_error');assert.equal(results[1].found,true);assert.equal(results[2].pathLength,1);
 assert.equal(new Set(copies.map(item=>item.walls)).size,3);assert.deepEqual(input.walls,[false,false]);
 assert.throws(()=>comparePathfinding(input,[{algorithm:'bfs',search:success},{algorithm:'bfs',search:success}]));
});
