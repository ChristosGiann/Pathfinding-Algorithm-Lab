import type { Language } from "./translations";

const messages: Record<Language, Record<string, string>> = {
  "el": {
    "invalid_request": "Στείλε μόνο το πεδίο source ως κείμενο Python.",
    "empty_source": "Πρόσθεσε κώδικα Python πριν τον έλεγχο.",
    "source_too_large": "Ο κώδικας ξεπερνά το όριο των 32.768 bytes UTF-8.",
    "invalid_encoding": "Ο κώδικας περιέχει μη έγκυρους χαρακτήρες Unicode.",
    "syntax_error": "Συντακτικό σφάλμα Python. Έλεγξε την υποδεικνυόμενη θέση.",
    "too_complex": "Ο κώδικας έχει υπερβολικά σύνθετη δομή για αυτόν τον έλεγχο.",
    "missing_solve": "Χρειάζεται μία συνάρτηση def solve(values): στο κύριο επίπεδο του αρχείου.",
    "invalid_signature": "Η solve πρέπει να είναι απλή σύγχρονη συνάρτηση με μοναδική παράμετρο values, χωρίς προεπιλογές ή decorators.",
    "generator_solve": "Η solve πρέπει να επιστρέφει λίστα ή να ταξινομεί την είσοδο επιτόπου, χωρίς yield."
  },
  "en": {
    "invalid_request": "Send only the source field as Python text.",
    "empty_source": "Enter Python code before validating.",
    "source_too_large": "The source exceeds the 32,768 UTF-8 byte limit.",
    "invalid_encoding": "The source contains invalid Unicode characters.",
    "syntax_error": "Python syntax error. Check the indicated position.",
    "too_complex": "The source is too complex for this check.",
    "missing_solve": "Define a top-level function def solve(values):.",
    "invalid_signature": "solve must be a synchronous function with only the values parameter, without defaults or decorators.",
    "generator_solve": "solve must return a list or sort the input in place, without yield."
  }
};
const fallback = { el: "Ο έλεγχος επέστρεψε άγνωστο σφάλμα. Έλεγξε τον κώδικα και δοκίμασε ξανά.", en: "Validation returned an unknown error. Check the code and try again." };

// Keep codes in state so existing results follow the current UI language.
export function pythonErrorMessage(code: string, language: Language): string {
  return Object.hasOwn(messages[language], code) ? messages[language][code] : fallback[language];
}
