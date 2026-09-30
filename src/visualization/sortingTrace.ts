import type { SortingAlgorithm } from "../types/benchmark";

export type StepKind = "initial" | "compare" | "swap" | "write" | "done";
export interface SortingStep { values: number[]; active: number[]; kind: StepKind }

export function parseInput(text: string): number[] {
  const tokens = text.trim().split(/[\s,]+/);
  if (tokens.length > 32 || tokens.some(token => !/^\d{1,3}$/.test(token))) throw new Error("invalid_input");
  return tokens.map(Number);
}

/** Educational trace only: never imported into a benchmark execution path. */
export function sortingTrace(algorithm: SortingAlgorithm, input: readonly number[]): SortingStep[] {
  if (!input.length || input.length > 32 || input.some(v => !Number.isInteger(v) || v < 0 || v > 999)) throw new Error("invalid_input");
  const a = [...input], steps: SortingStep[] = [];
  const emit = (kind: StepKind, ...active: number[]) => { steps.push({values: [...a], active, kind}); };
  const swap = (i: number, j: number) => { [a[i], a[j]] = [a[j], a[i]]; emit("swap", i, j); };
  emit("initial");
  switch (algorithm) {
    case "bubble-sort":
      for (let end = a.length - 1; end > 0; end--) {
        let changed = false;
        for (let i = 0; i < end; i++) { emit("compare", i, i + 1); if (a[i] > a[i + 1]) { swap(i, i + 1); changed = true; } }
        if (!changed) break;
      }
      break;
    case "insertion-sort":
      for (let i = 1; i < a.length; i++) {
        const value = a[i]; let j = i - 1;
        while (j >= 0) { emit("compare", j, j + 1); if (a[j] <= value) break; a[j + 1] = a[j]; emit("write", j + 1); j--; }
        a[j + 1] = value; emit("write", j + 1);
      }
      break;
    case "selection-sort":
      for (let i = 0; i < a.length - 1; i++) {
        let min = i;
        for (let j = i + 1; j < a.length; j++) { emit("compare", min, j); if (a[j] < a[min]) min = j; }
        if (min !== i) swap(i, min);
      }
      break;
    case "merge-sort":
      for (let width = 1; width < a.length; width *= 2) {
        const buffer = [...a];
        for (let left = 0; left < a.length; left += 2 * width) {
          const middle = Math.min(left + width, a.length), right = Math.min(left + 2 * width, a.length);
          let i = left, j = middle;
          for (let k = left; k < right; k++) {
            if (i < middle && j < right) emit("compare", i, j);
            buffer[k] = i < middle && (j >= right || a[i] <= a[j]) ? a[i++] : a[j++];
          }
        }
        for (let i = 0; i < a.length; i++) { a[i] = buffer[i]; emit("write", i); }
      }
      break;
    case "quick-sort": {
      const pending = [[0, a.length - 1]];
      while (pending.length) {
        const [left, right] = pending.pop()!;
        if (left >= right) continue;
        const pivot = a[Math.floor((left + right) / 2)];
        let lower = left, current = left, upper = right;
        while (current <= upper) {
          emit("compare", current);
          if (a[current] < pivot) swap(lower++, current++);
          else if (a[current] > pivot) swap(current, upper--);
          else current++;
        }
        const ranges = [[left, lower - 1], [upper + 1, right]].sort((x, y) => (y[1] - y[0]) - (x[1] - x[0]));
        pending.push(...ranges.filter(([start, end]) => start < end));
      }
      break;
    }
    default: throw new Error("unknown_algorithm");
  }
  emit("done");
  return steps;
}

export interface Playback { steps: SortingStep[]; index: number; playing: boolean }
export type PlaybackAction = {type:"load"; steps:SortingStep[]} | {type:"play"|"pause"|"step"|"tick"|"reset"};
export function playback(state: Playback, action: PlaybackAction): Playback {
  if (action.type === "load") return {steps:action.steps,index:0,playing:false};
  if (action.type === "reset") return {...state,index:0,playing:false};
  if (action.type === "pause") return {...state,playing:false};
  if (action.type === "play") return {...state,playing:state.index < state.steps.length - 1};
  if (action.type === "tick" && !state.playing) return state;
  const index = Math.min(state.index + 1, state.steps.length - 1);
  return {...state,index,playing:action.type === "tick" && index < state.steps.length - 1};
}
