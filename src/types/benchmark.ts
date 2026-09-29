export type DatasetType = "random" | "sorted" | "reversed" | "nearly_sorted";

export type SortingAlgorithm = "bubble-sort" | "insertion-sort" | "selection-sort";

export interface BenchmarkRequest {
  algorithm: SortingAlgorithm;
  size: number;
  seed: number;
  dataset_type: DatasetType;
}

export interface BenchmarkResult extends BenchmarkRequest {
  runs: number;
  correct: boolean;
  timings_ns: number[];
  median_ns: number;
  min_ns: number;
  max_ns: number;
}
