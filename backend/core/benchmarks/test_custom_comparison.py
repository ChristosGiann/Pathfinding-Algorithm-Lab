from unittest.mock import patch
from django.test import override_settings
from rest_framework.test import APISimpleTestCase
from core.datasets import generate_dataset
from .runner import compare_sorting

class CustomComparisonTests(APISimpleTestCase):
    def test_shared_dataset_and_fresh_copies_including_worker(self):
        original=generate_dataset("reversed",8,42)
        copies=[]
        def sorter(values):
            self.assertEqual(values,list(original.values))
            copies.append(values)
            values.sort()
        source=f"def solve(values):\n    assert values == {list(original.values)!r}\n    values.sort()"
        with patch("core.benchmarks.runner.generate_dataset",return_value=original) as generate, patch("core.benchmarks.runner.bubble_sort",side_effect=sorter):
            result=compare_sorting(["bubble-sort"],8,dataset_type="reversed",custom_source=source,custom_allowed=True)
        generate.assert_called_once_with("reversed",8,42)
        self.assertEqual(len({id(item) for item in copies}),10)
        self.assertEqual([r["source_type"] for r in result["results"]],["built_in","custom"])
        self.assertTrue(all(r["measurement"]["correct"] for r in result["results"]))
        self.assertEqual(result["baseline_algorithm"],"bubble-sort")
        self.assertGreater(result["results"][1]["measurement"]["relative_speed"],0)

    @override_settings(DEBUG=True, ENABLE_TRUSTED_CUSTOM_EXECUTION=True)
    def test_api_success_invalid_and_failed_custom_preserve_builtin(self):
        for source,status in [("def solve(values): return sorted(values)","completed"),
                              ("def solve(values): return []","completed"),
                              ("def solve(values): raise ValueError()","error"),
                              ("import os\ndef solve(values): pass","error"),
                              ("def solve(values):\n    while True: pass","timeout")]:
            response=self.client.post("/api/benchmarks/sorting/compare/",{"algorithms":["quick-sort"],"size":8,"custom_source":source,"trusted":True},format="json",HTTP_ORIGIN="http://127.0.0.1:5173")
            self.assertEqual(response.status_code,200)
            builtin,custom=response.data["results"]
            self.assertTrue(builtin["measurement"]["correct"])
            self.assertEqual(custom["status"],status)
            self.assertIsNone(response.data["save_token"])
            if status!="completed": self.assertNotIn("measurement",custom)
        response=self.client.post("/api/benchmarks/sorting/compare/",{"algorithms":["quick-sort"],"size":8,"custom_source":"def solve(values): pass"},format="json")
        self.assertEqual(response.status_code,400)

    def test_disabled_custom_never_runs_but_builtin_does(self):
        with patch("core.custom_python.benchmark.measure_custom") as custom:
            response=compare_sorting(["quick-sort"],8,custom_source="def solve(values): pass")
        custom.assert_not_called()
        self.assertTrue(response["results"][0]["measurement"]["correct"])
        self.assertEqual(response["results"][1]["error"],"execution_disabled")
