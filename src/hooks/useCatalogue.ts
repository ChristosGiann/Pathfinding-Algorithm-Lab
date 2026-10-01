import { useEffect, useState } from "react";
import type { Algorithm } from "../types/algorithm";
import { getAlgorithms } from "../services/apiClient";

export function useCatalogue() {
  const [catalogue, setCatalogue] = useState<Algorithm[]>([]);
  useEffect(() => {
    const controller = new AbortController();
    void getAlgorithms(AbortSignal.any([controller.signal, AbortSignal.timeout(15_000)]))
      .then(items => { if (!controller.signal.aborted) setCatalogue(items); }).catch(() => {});
    return () => controller.abort();
  }, []);
  return catalogue;
}
