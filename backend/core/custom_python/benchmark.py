"""Opt-in trusted local execution. Limits reduce accidents; this is not a sandbox."""
import ast
import json
import os
from pathlib import Path
import signal
import subprocess
import sys
import tempfile
from threading import Lock

from .validation import validate_source

TIMEOUT_SECONDS = 2
_slot = Lock()
METHODS = {"sort", "append", "extend", "pop", "copy", "insert", "count", "index", "remove", "reverse", "clear", "get", "keys", "values", "items"}
BUILTINS = ("len", "range", "sorted", "min", "max", "enumerate", "zip", "reversed", "list", "tuple",
            "int", "bool", "abs", "sum", "any", "all", "set", "dict", "Exception", "ValueError", "RuntimeError")


def error_result(code, validation=None):
    result = {"algorithm": "custom-python", "source_type": "custom",
              "status": "timeout" if code == "timeout" else "error", "error": code}
    if validation is not None:
        result["validation"] = validation
    return result


def execution_validation(source):
    result = validate_source(source)
    if not result["valid"]:
        return result
    tree = ast.parse(source)
    # Deliberately narrow sorting contract: no imports, I/O or introspection.
    unsupported = any(not isinstance(node, ast.FunctionDef) for node in tree.body)
    for node in ast.walk(tree):
        unsupported |= isinstance(node, (ast.Import, ast.ImportFrom, ast.ClassDef, ast.AsyncFunctionDef))
        unsupported |= isinstance(node, ast.Attribute) and node.attr not in METHODS
        unsupported |= isinstance(node, ast.Name) and (node.id.startswith("__") or node.id in
            {"open", "eval", "exec", "compile", "getattr", "setattr", "globals", "locals", "vars", "dir", "input", "print", "breakpoint"})
        if isinstance(node, ast.FunctionDef):
            unsupported |= bool(node.decorator_list or node.args.defaults or node.args.kw_defaults or node.returns)
            unsupported |= any(arg.annotation is not None for arg in node.args.args + node.args.posonlyargs + node.args.kwonlyargs)
    if unsupported:
        return {"valid": False, "stage": "static", "errors": [{"code": "unsupported_execution_contract", "line": None, "column": None}]}
    return result


def measure_custom(source, dataset):
    validation = execution_validation(source)
    if not validation["valid"]:
        return error_result("validation_error", validation)
    if not _slot.acquire(blocking=False):
        return error_result("execution_busy")
    try:
        with tempfile.TemporaryDirectory(prefix="sorting-custom-") as directory:
            output = Path(directory) / "result.json"
            payload = json.dumps({"source": source, "values": dataset.values,
                                  "dataset_type": dataset.dataset_type, "size": dataset.size, "seed": dataset.seed})
            env = {key: os.environ[key] for key in ("SYSTEMROOT", "WINDIR", "TEMP", "TMP") if key in os.environ}
            process = subprocess.run([sys.executable, "-I", "-S", str(Path(__file__).with_name("benchmark_worker.py")), str(output)],
                input=payload.encode("utf-8"), stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
                cwd=directory, env=env, timeout=TIMEOUT_SECONDS,
                creationflags=subprocess.CREATE_NO_WINDOW if os.name == "nt" else 0)
            if os.name != "nt" and process.returncode == -signal.SIGXCPU:
                return error_result("timeout")
            if process.returncode or not output.exists() or output.stat().st_size > 16384:
                return error_result("runtime_error")
            return json.loads(output.read_text(encoding="utf-8"))
    except subprocess.TimeoutExpired:
        return error_result("timeout")
    except (OSError, ValueError):
        return error_result("execution_unavailable")
    finally:
        _slot.release()
