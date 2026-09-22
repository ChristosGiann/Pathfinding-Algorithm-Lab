import type { Algorithm } from "../types/algorithm";
import type { BenchmarkRequest, BenchmarkResult } from "../types/benchmark";
import type { ImplementationReview, ReviewInput } from "../types/review";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error(
    "Δεν έχει οριστεί το VITE_API_BASE_URL.",
  );
}

export interface BackendHealthResponse {
  status: "ok";
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

export function getAlgorithms(): Promise<Algorithm[]> {
  return apiRequest<Algorithm[]>(
    "/api/algorithms/",
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

export function runBubbleSortBenchmark(input: BenchmarkRequest, signal?: AbortSignal): Promise<BenchmarkResult> {
  return apiRequest<BenchmarkResult>("/api/benchmarks/bubble-sort/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
    signal,
  });
}
