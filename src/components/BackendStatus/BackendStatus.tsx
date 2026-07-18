import { useEffect, useState } from "react";
import { getBackendHealth } from "../../services/apiClient";
import "./BackendStatus.css";

type ConnectionStatus = "loading" | "online" | "offline";

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

    async function checkBackendHealth() {
      try {
        const response = await getBackendHealth();

        if (isActive) {
          setStatus(response.status === "ok" ? "online" : "offline");
        }
      } catch {
        if (isActive) {
          setStatus("offline");
        }
      }
    }

    void checkBackendHealth();

    return () => {
      isActive = false;
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