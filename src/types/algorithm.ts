export type AlgorithmImplementationSourceType =
  | "built_in"
  | "custom";

export interface AlgorithmImplementation {
  id: number;
  name: string;
  slug: string;
  language: string;
  source_type: AlgorithmImplementationSourceType;
  is_reference: boolean;
  is_active: boolean;
}

export interface Algorithm {
  name: string;
  slug: string;
  description: string;
  problem: string;
  best_case_complexity: string;
  average_case_complexity: string;
  worst_case_complexity: string;
  space_complexity: string;
  implementations: AlgorithmImplementation[];
}
