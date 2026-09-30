import type { BenchmarkResult, DatasetType, SortingAlgorithm } from "./benchmark";

export interface ComparisonInput { algorithms: SortingAlgorithm[]; dataset_type: DatasetType; size: number; seed: number }
export type ComparisonRow = { algorithm: string; source_type?: "built_in" | "custom" } & (
  | { status: "completed"; measurement: BenchmarkResult }
  | { status: "error" | "timeout"; error: string }
);
export interface ComparisonResult { save_token?: string | null; dataset_type: DatasetType; size: number; seed: number; results: ComparisonRow[] }
