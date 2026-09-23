export type DatasetType = "random" | "sorted" | "reversed" | "nearly_sorted";

export interface BenchmarkRequest {
  size: number;
  seed: number;
  dataset_type: DatasetType;
}

export interface BenchmarkResult extends BenchmarkRequest {
  algorithm: "bubble-sort";
  runs: number;
  correct: boolean;
  timings_ns: number[];
  median_ns: number;
  min_ns: number;
  max_ns: number;
}
