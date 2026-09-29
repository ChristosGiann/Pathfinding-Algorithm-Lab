import type { BenchmarkResult, DatasetType } from "./benchmark";
export interface ExperimentInput {
  name: string;
  implementation_ids: number[];
  datasets: { dataset_type: DatasetType; size: number; seed: number }[];
}
export interface Experiment {
  id: number; name: string;
  status: "draft" | "pending" | "running" | "completed" | "failed";
  execution_error: string;
  implementations: { id: number; name: string; algorithm: string; language: string }[];
  datasets: { id: number; dataset_type: DatasetType; size: number; seed: number }[];
  results: { id: number; implementation_snapshot: { id: number; name: string; algorithm: string; language: string }; measurement: BenchmarkResult; created_at: string }[];
}

export interface ExperimentSummary {
  id: number; name: string; status: Experiment["status"]; created_at: string; updated_at: string;
}
export interface ExperimentPage { results: ExperimentSummary[]; next_before: number | null }
