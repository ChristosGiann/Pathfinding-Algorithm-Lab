import type { BenchmarkResult, DatasetType } from "./benchmark";
export interface ExperimentInput {
  name: string;
  implementation_ids: number[];
  datasets: { dataset_type: DatasetType; size: number; seed: number }[];
}
export interface SortingExperiment {
  family?: "sorting";
  id: number; name: string;
  status: "draft" | "pending" | "running" | "completed" | "failed";
  execution_error: string;
  implementations: { id: number; name: string; algorithm: string; language: string }[];
  datasets: { id: number; dataset_type: DatasetType; size: number; seed: number }[];
  results: { id: number; implementation_snapshot: { comparison?: boolean; id: number; name: string; algorithm: string; language: string }; measurement: BenchmarkResult; created_at: string }[];
}

export interface ExperimentSummary {
  id: number; name: string; family?: "sorting" | "pathfinding"; status: Experiment["status"]; created_at: string; updated_at: string;
}
export interface ExperimentPage { results: ExperimentSummary[]; next_before: number | null }

export interface PathfindingExperiment {
  id: number; name: string; family: "pathfinding";
  status: "completed"; execution_error: string;
  implementations: []; datasets: [];
  input_snapshot: {
    version: 1; source: "browser"; movement: "cardinal"; costRule: "enter-cell-exclude-start";
    grid: import("../pathfinding/evaluation").GridInput;
    algorithms: import("../pathfinding/evaluation").PathfindingAlgorithm[];
  };
  results: {id:number; implementation_snapshot:{algorithm:string; name:string; language:string; version:number};
    measurement: import("../pathfinding/evaluation").PathfindingResult; created_at:string}[];
}
export type Experiment = SortingExperiment | PathfindingExperiment;
