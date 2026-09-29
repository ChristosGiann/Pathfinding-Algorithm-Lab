import type { Experiment, ExperimentInput, ExperimentPage } from "../types/experiment";
import type { Algorithm } from "../types/algorithm";
import type { BenchmarkRequest, BenchmarkResult } from "../types/benchmark";
import type { ImplementationReview, ReviewInput } from "../types/review";
import type { PythonValidationResult } from "../types/customPython";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error(
    "Δεν έχει οριστεί το VITE_API_BASE_URL.",
  );
}

export interface BackendHealthResponse {
  status: "ok";
}

export function validatePythonSource(source: string, signal: AbortSignal): Promise<PythonValidationResult> {
  return apiRequest<PythonValidationResult>("/api/implementations/validate-python/", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ source }), signal,
  });
}

async function apiRequest<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(
    `${API_BASE_URL}${path}`,
    options,
  );

  if (!response.ok) {
    throw new Error(
      `Το backend επέστρεψε HTTP ${response.status}.`,
    );
  }

  return response.json() as Promise<T>;
}

export function getBackendHealth(signal?: AbortSignal): Promise<BackendHealthResponse> {
  return apiRequest<BackendHealthResponse>(
    "/api/health/",
    { signal, cache: "no-store" },
  );
}

export function getAlgorithms(signal?: AbortSignal): Promise<Algorithm[]> {
  return apiRequest<Algorithm[]>(
    "/api/algorithms/", { signal },
  );
}

export function getImplementationReview(id: number, signal: AbortSignal): Promise<ImplementationReview> {
  return apiRequest<ImplementationReview>(`/api/implementations/${id}/review/`, { signal, cache: "no-store" });
}

export function saveImplementationReview(id: number, input: ReviewInput, signal: AbortSignal): Promise<ImplementationReview> {
  return apiRequest<ImplementationReview>(`/api/implementations/${id}/review/`, {
    method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input), signal,
  });
}

export function runSortingBenchmark(input: BenchmarkRequest, signal?: AbortSignal): Promise<BenchmarkResult> {
  return apiRequest<BenchmarkResult>("/api/benchmarks/sorting/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
    signal,
  });
}


export function createExperiment(input: ExperimentInput, signal: AbortSignal): Promise<Experiment> {
  return apiRequest<Experiment>("/api/experiments/", {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input), signal,
  });
}
export function getExperiment(id: number, signal: AbortSignal): Promise<Experiment> {
  return apiRequest<Experiment>(`/api/experiments/${id}/`, { signal, cache: "no-store" });
}
export function runExperiment(id: number, signal: AbortSignal): Promise<Experiment> {
  return apiRequest<Experiment>(`/api/experiments/${id}/run/`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: "{}", signal,
  });
}

export function listExperiments(before: number | null, signal: AbortSignal): Promise<ExperimentPage> {
  const query = before === null ? "" : `?before=${before}`;
  return apiRequest<ExperimentPage>(`/api/experiments/${query}`, { signal, cache: "no-store" });
}
