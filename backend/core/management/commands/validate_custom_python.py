import json
from pathlib import Path

from django.core.management.base import BaseCommand

from core.custom_python.local_runner import run_local
from core.custom_python.validation import MAX_SOURCE_BYTES, failure, validate_source


class Command(BaseCommand):
    help = "Validate UTF-8 Python source; --run-local explicitly executes trusted local code without a sandbox."

    def add_arguments(self, parser):
        parser.add_argument("path")
        parser.add_argument("--run-local", action="store_true", help="Execute developer-owned code locally (NOT sandboxed), with a 2s timeout.")

    def handle(self, *args, **options):
        try:
            with Path(options["path"]).open("rb") as source_file:
                data = source_file.read(MAX_SOURCE_BYTES + 1)
            if len(data) > MAX_SOURCE_BYTES:
                result = failure("source_too_large")
            else:
                source = data.decode("utf-8")
                result = run_local(source) if options["run_local"] else validate_source(source)
        except (OSError, UnicodeError):
            result = failure("file_error")
        self.stdout.write(json.dumps(result, ensure_ascii=False))
        if not result["valid"]:
            raise SystemExit(1)
