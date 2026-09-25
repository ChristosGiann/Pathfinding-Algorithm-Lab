import json
from io import StringIO
from pathlib import Path
from tempfile import TemporaryDirectory
from unittest.mock import patch

from django.core.management import call_command
from django.test import SimpleTestCase
from django.urls import reverse
from rest_framework.test import APISimpleTestCase

from .validation import MAX_SOURCE_BYTES, validate_source
from .local_runner import run_local

VALID = "def solve(values):\n    return sorted(values)\n"


class StaticValidationTests(SimpleTestCase):
    def code(self, source):
        return validate_source(source)["errors"][0]["code"]

    def test_valid_returning_inplace_and_positional_only(self):
        for source in [VALID, "def solve(values):\n    values.sort()", "def solve(values, /):\n    return sorted(values)"]:
            self.assertTrue(validate_source(source)["valid"])

    def test_does_not_execute_top_level_statements_or_loop(self):
        self.assertTrue(validate_source("raise RuntimeError('must not run')\n" + VALID)["valid"])
        self.assertTrue(validate_source("while True: pass\n" + VALID)["valid"])

    def test_syntax_errors_and_compile_only_errors(self):
        for source in ["def solve(values)\n pass", "return 1\n" + VALID, "\x00" + VALID]:
            self.assertEqual(self.code(source), "syntax_error")
        error = validate_source("def solve(values)\n pass")["errors"][0]
        self.assertEqual(error["line"], 1)
        self.assertIsInstance(error["column"], int)

    def test_requires_top_level_definition(self):
        for source in ["x = 1", "class X:\n def solve(values): pass", "if True:\n def solve(values): pass", "solve = lambda values: values"]:
            self.assertEqual(self.code(source), "missing_solve")

    def test_signature_variants_rejected(self):
        for header in ["def solve():", "def solve(items):", "def solve(values, other):", "def solve(values=[]):", "def solve(*values):", "def solve(*, values):", "def solve(values, **kwargs):", "async def solve(values):"]:
            self.assertEqual(self.code(header + "\n pass"), "invalid_signature")
        self.assertEqual(self.code(VALID + VALID), "invalid_signature")
        self.assertEqual(self.code("@decorator\n" + VALID), "invalid_signature")

    def test_generator_is_rejected_but_nested_generator_allowed(self):
        self.assertEqual(self.code("def solve(values):\n yield from values"), "generator_solve")
        self.assertTrue(validate_source("def solve(values):\n def nested():\n  yield 1\n return sorted(values)")["valid"])

    def test_utf8_byte_limit_and_empty_or_invalid_source(self):
        exact = VALID + "#" * (MAX_SOURCE_BYTES - len(VALID.encode()))
        self.assertTrue(validate_source(exact)["valid"])
        self.assertEqual(self.code(exact + "#"), "source_too_large")
        self.assertEqual(self.code(VALID + "#" + "α" * 17000), "source_too_large")
        self.assertEqual(self.code(" \n"), "empty_source")
        self.assertEqual(self.code(None), "invalid_request")
        self.assertEqual(self.code("\ud800"), "invalid_encoding")


class ValidationAPITests(APISimpleTestCase):
    def test_results_are_structured_and_never_launch_process(self):
        with patch("core.custom_python.local_runner.subprocess.run") as execute:
            for source in [VALID, "raise RuntimeError()\n" + VALID, "def solve(x): pass", "syntax error"]:
                response = self.client.post(reverse("validate-custom-python"), {"source": source}, format="json")
                self.assertEqual(response.status_code, 200)
                self.assertEqual(response.data["stage"], "static")
                for error in response.data["errors"]:
                    self.assertEqual(set(error), {"code", "message", "line", "column"})
            execute.assert_not_called()

    def test_rejects_malformed_requests_and_execution_flags(self):
        for payload in [{}, [], {"source": 1}, {"source": VALID, "execute": True}]:
            response = self.client.post(reverse("validate-custom-python"), payload, format="json")
            self.assertEqual(response.status_code, 400)
            self.assertEqual(response.data["errors"][0]["code"], "invalid_request")
        response = self.client.post(reverse("validate-custom-python"), "{broken", content_type="application/json")
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data["errors"][0]["code"], "invalid_request")
        self.assertEqual(self.client.get(reverse("validate-custom-python")).status_code, 405)


class LocalExecutionTests(SimpleTestCase):
    def test_correct_return_and_inplace(self):
        for source in [VALID, "def solve(values):\n values.sort()"]:
            self.assertEqual(run_local(source), {"valid": True, "stage": "local_execution", "errors": []})

    def test_wrong_results_runtime_errors_and_rebinding(self):
        for source, code in [("def solve(values):\n return values", "incorrect_result"),
                             ("def solve(values):\n raise ValueError('private detail')", "runtime_error"),
                             ("raise RuntimeError()\n" + VALID, "runtime_error"),
                             (VALID + "solve = 1", "invalid_signature"),
                             ("def solve(values):\n return iter(sorted(values))", "incorrect_result")]:
            result = run_local(source)
            self.assertEqual(result["errors"][0]["code"], code)
            self.assertNotIn("private detail", json.dumps(result))

    def test_real_infinite_loops_timeout_at_import_and_call(self):
        for source in ["while True: pass\n" + VALID, "def solve(values):\n while True: pass"]:
            self.assertEqual(run_local(source)["errors"][0]["code"], "timeout")

    def test_invalid_source_does_not_start_worker(self):
        with patch("core.custom_python.local_runner.subprocess.run") as execute:
            self.assertFalse(run_local("def broken(")["valid"])
            execute.assert_not_called()

    def test_output_does_not_corrupt_protocol_and_secrets_not_inherited(self):
        source = "import os\nassert 'DJANGO_SECRET_KEY' not in os.environ\nprint('noise' * 10000)\n" + VALID
        with patch.dict("os.environ", {"DJANGO_SECRET_KEY": "test-only"}):
            self.assertTrue(run_local(source)["valid"])

    def test_command_defaults_static_and_requires_explicit_execution_flag(self):
        with TemporaryDirectory() as directory:
            path = Path(directory) / "example.py"
            path.write_bytes(VALID.encode("utf-8"))
            with patch("core.management.commands.validate_custom_python.run_local") as execute:
                output = StringIO()
                call_command("validate_custom_python", str(path), stdout=output)
                self.assertTrue(json.loads(output.getvalue())["valid"])
                execute.assert_not_called()
                execute.return_value = {"valid": True, "stage": "local_execution", "errors": []}
                call_command("validate_custom_python", str(path), run_local=True, stdout=StringIO())
                execute.assert_called_once_with(VALID)

    def test_command_failure_is_structured_and_nonzero(self):
        with TemporaryDirectory() as directory:
            path = Path(directory) / "invalid.py"
            for data, code in [(b"x" * (MAX_SOURCE_BYTES + 1), "source_too_large"), (b"\xff", "file_error"), (b"oops(", "syntax_error")]:
                path.write_bytes(data)
                output = StringIO()
                with self.assertRaises(SystemExit) as raised:
                    call_command("validate_custom_python", str(path), stdout=output)
                self.assertEqual(raised.exception.code, 1)
                self.assertEqual(json.loads(output.getvalue())["errors"][0]["code"], code)
