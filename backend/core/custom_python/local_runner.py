"""Developer-only smoke execution. NOT a sandbox; never expose via HTTP."""
import os
import subprocess
import sys
import tempfile
from pathlib import Path

from .validation import failure, validate_source

TIMEOUT_SECONDS = 2


def run_local(source):
    result = validate_source(source)
    if not result["valid"]:
        return result
    worker = Path(__file__).with_name("worker.py")
    # Do not pass Django secrets from the environment to the child. This is
    # hygiene only: arbitrary Python still has the local user's OS privileges.
    environment = {key: os.environ[key] for key in ("SystemRoot", "WINDIR", "TEMP", "TMP") if key in os.environ}
    try:
        with tempfile.TemporaryDirectory(prefix="algorithm-lab-") as directory:
            process = subprocess.run(
                [sys.executable, "-I", "-S", str(worker)], input=source.encode("utf-8"),
                stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
                cwd=directory, env=environment, timeout=TIMEOUT_SECONDS, check=False,
                creationflags=subprocess.CREATE_NO_WINDOW if os.name == "nt" else 0,
            )
    except subprocess.TimeoutExpired:
        return failure("timeout", stage="local_execution")
    except OSError:
        return failure("execution_unavailable", stage="local_execution")
    codes = {20: "runtime_error", 21: "incorrect_result", 22: "invalid_signature"}
    if process.returncode != 0:
        return failure(codes.get(process.returncode, "runtime_error"), stage="local_execution")
    return {"valid": True, "stage": "local_execution", "errors": []}
