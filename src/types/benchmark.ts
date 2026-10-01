export type DatasetType = "random" | "sorted" | "reversed" | "nearly_sorted";

export type SortingAlgorithm = "bubble-sort" | "insertion-sort" | "selection-sort" | "merge-sort" | "quick-sort";

export interface BenchmarkRequest {
  algorithm: SortingAlgorithm;
  size: number;
  seed: number;
  dataset_type: DatasetType;
}

export interface BenchmarkResult extends Omit<BenchmarkRequest, "algorithm"> {
  algorithm: string;
  runs: number;
  correct: boolean;
  timings_ns: number[];
  median_ns: number;
  min_ns: number;
  max_ns: number;
  mean_ns?: number;
  stddev_ns?: number;
  baseline_algorithm?: string;
  relative_speed?: number | null;
}
