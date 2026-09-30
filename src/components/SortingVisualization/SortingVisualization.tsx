import { useEffect, useReducer, useState } from "react";
import type { Language } from "../../i18n/translations";
import type { SortingAlgorithm } from "../../types/benchmark";
import { benchmarkTexts } from "../../i18n/benchmark";
import { visualizationTexts } from "../../i18n/visualization";
import { parseInput, playback, sortingTrace } from "../../visualization/sortingTrace";
import "./SortingVisualization.css";

export function SortingVisualization({language}:{language:Language}) {
  const t=visualizationTexts[language], b=benchmarkTexts[language];
  const [algorithm,setAlgorithm]=useState<SortingAlgorithm>("bubble-sort");
  const [input,setInput]=useState("8, 3, 6, 1, 5, 2");
  const [error,setError]=useState(false), [speed,setSpeed]=useState(350);
  const [state,dispatch]=useReducer(playback,undefined,()=>({steps:sortingTrace("bubble-sort",[8,3,6,1,5,2]),index:0,playing:false}));
  useEffect(()=> {
    if (!state.playing) return;
    const timer=window.setInterval(()=>dispatch({type:"tick"}),speed);
    return ()=>window.clearInterval(timer);
  },[state.playing,speed]);
  const frame=state.steps[state.index], original=state.steps[0].values, max=Math.max(1,...original);
  const end=state.index===state.steps.length-1;
  return <section className="benchmark" aria-labelledby="sorting-visualization-title">
    <h2 id="sorting-visualization-title">{t.title}</h2><p>{t.note}</p>
    <form className="benchmark__fields" onSubmit={event=>{event.preventDefault();try {dispatch({type:"load",steps:sortingTrace(algorithm,parseInput(input))});setError(false);} catch {setError(true);}}}>
      <label>{b.algorithm}<select value={algorithm} onChange={event=>{const value=event.target.value as SortingAlgorithm;setAlgorithm(value);dispatch({type:"load",steps:sortingTrace(value,original)});}}>{Object.entries(b.algorithms).map(([slug,label])=><option key={slug} value={slug}>{label}</option>)}</select></label>
      <label>{t.input}<input value={input} maxLength={160} onChange={event=>setInput(event.target.value)} /></label><button>{t.load}</button>
    </form>
    {error && <p role="alert">{t.invalid}</p>}
    <p>{t.original}: [{original.join(", ")}]</p>
    <div className="benchmark__fields">
      <button onClick={()=>dispatch({type:"play"})} disabled={state.playing||end}>{t.play}</button>
      <button onClick={()=>dispatch({type:"pause"})} disabled={!state.playing}>{t.pause}</button>
      <button onClick={()=>dispatch({type:"step"})} disabled={state.playing||end}>{t.step}</button>
      <button onClick={()=>dispatch({type:"reset"})}>{t.reset}</button>
      <label>{t.speed}<select value={speed} onChange={event=>setSpeed(Number(event.target.value))}>{[1000,350,100].map(ms=><option key={ms} value={ms}>{ms} ms / {t.frame}</option>)}</select></label>
    </div>
    <p role="status">{t.frame} {state.index} / {state.steps.length-1} · {t.kinds[frame.kind]}</p>
    <ol className="sorting-bars" aria-label={t.title}>{frame.values.map((value,index)=><li key={index} className={frame.active.includes(index)?"sorting-bars__active":""} style={{height:`${20+value/max*130}px`}}><span>{value}</span></li>)}</ol>
  </section>;
}
