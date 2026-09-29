"""Private child-process entry point for developer-owned code, not isolation."""
import inspect
import sys
import types


def main():
    source = sys.stdin.buffer.read().decode("utf-8")
    # Capture helpers before user code; this is not protection against hostile code.
    cases = [[], [1], [3, 1, 2], [3, -1, 3, 0], [1, 2, 3], [5, 4, 3, 2, 1]]
    try:
        namespace = {"__name__": "__custom_implementation__"}
        exec(compile(source, "<custom-implementation>", "exec"), namespace)
        solve = namespace.get("solve")
        if not isinstance(solve, types.FunctionType) or inspect.iscoroutinefunction(solve) or inspect.isgeneratorfunction(solve):
            return 22
        parameters = list(inspect.signature(solve).parameters.values())
        if (len(parameters) != 1 or parameters[0].name != "values"
                or parameters[0].kind not in (inspect.Parameter.POSITIONAL_ONLY, inspect.Parameter.POSITIONAL_OR_KEYWORD)
                or parameters[0].default is not inspect.Parameter.empty):
            return 22
        for original in cases:
            values = original.copy()
            result = solve(values)
            actual = values if result is None else result
            if type(actual) is not list or any(type(value) is not int for value in actual) or actual != sorted(original):
                return 21
    except BaseException:
        return 20
    return 0


if __name__ == "__main__":
    sys.exit(main())
