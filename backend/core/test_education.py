from django.test import SimpleTestCase
from .education import EDUCATION
from .benchmarks.runner import SORTING_ALGORITHMS

class EducationTests(SimpleTestCase):
    def test_supported_catalogue_has_complete_bilingual_content(self):
        self.assertEqual(set(EDUCATION), set(SORTING_ALGORITHMS))
        for content in EDUCATION.values():
            self.assertEqual(set(content["el"]), set(content["en"]))
            for language in ("el", "en"):
                self.assertTrue(all(content[language].values()))
                self.assertEqual(len(content[language]["how"]), 3)
            self.assertEqual(content["walkthrough"][-1], sorted(content["walkthrough"][0]))
            self.assertIsInstance(content["stable"], bool)
