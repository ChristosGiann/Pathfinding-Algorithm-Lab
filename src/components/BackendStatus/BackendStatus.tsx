import { useEffect, useState } from "react";
import { getBackendHealth } from "../../services/apiClient";
import "./BackendStatus.css";

type ConnectionStatus = "loading" | "online" | "offline";

const HEALTH_CHECK_INTERVAL_MS = 5_000;
const HEALTH_CHECK_TIMEOUT_MS = 5_000;

interface BackendStatusTexts {
  loading: string;
  online: string;
  offline: string;
}

interface BackendStatusProps {
  texts: BackendStatusTexts;
}

export function BackendStatus({ texts }: BackendStatusProps) {
  const [status, setStatus] = useState<ConnectionStatus>("loading");

  useEffect(() => {
    let isActive = true;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    let requestTimer: ReturnType<typeof setTimeout> | undefined;
    let controller: AbortController | undefined;

    async function checkBackendHealth() {
      controller = new AbortController();
      const requestController = controller;
      requestTimer = setTimeout(() => {
        requestController.abort();
      }, HEALTH_CHECK_TIMEOUT_MS);

      try {
        const response = await getBackendHealth(requestController.signal);

        if (isActive) {
          setStatus(response.status === "ok" ? "online" : "offline");
        }
      } catch {
        if (isActive) {
          setStatus("offline");
        }
      } finally {
        clearTimeout(requestTimer);

        if (isActive) {
          retryTimer = setTimeout(() => {
            void checkBackendHealth();
          }, HEALTH_CHECK_INTERVAL_MS);
        }
      }
    }

    void checkBackendHealth();

    return () => {
      isActive = false;
      clearTimeout(retryTimer);
      clearTimeout(requestTimer);
      controller?.abort();
    };
  }, []);

  return (
    <div
      className={`backend-status backend-status--${status}`}
      role="status"
      aria-live="polite"
    >
      <span className="backend-status__indicator" aria-hidden="true" />

      <span>{texts[status]}</span>
    </div>
  );
}
