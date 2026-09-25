export const customPythonTexts = {
  el: {
    title: "Έλεγχος custom Python", source: "Κώδικας Python", submit: "Έλεγχος κώδικα",
    running: "Έλεγχος σε εξέλιξη…", success: "Η σύνταξη και η δήλωση solve(values) είναι έγκυρες. Ο κώδικας δεν εκτελέστηκε.",
    hint: "Γράψε def solve(values): με μία παράμετρο. Η συνάρτηση μπορεί να επιστρέφει ταξινομημένη λίστα ή να ταξινομεί την είσοδο επιτόπου και να επιστρέφει None.",
    limit: "Όριο: 32.768 bytes UTF-8", tooLarge: "Ο κώδικας ξεπερνά το όριο μεγέθους.",
    note: "Ο στατικός έλεγχος δεν αποδεικνύει ορθότητα ή ασφάλεια. Η εκτέλεση επιτρέπεται μόνο τοπικά για δικό σου κώδικα, μέσω της εντολής ανάπτυξης. Δεν υπάρχει sandbox για δημόσια εκτέλεση.",
    error: "Δεν ολοκληρώθηκε ο έλεγχος. Έλεγξε τη σύνδεση και δοκίμασε ξανά. Ο κώδικάς σου διατηρήθηκε.",
    line: "Γραμμή", column: "στήλη", errors: "Σφάλματα ελέγχου",
  },
  en: {
    title: "Custom Python validation", source: "Python source", submit: "Validate code",
    running: "Validating…", success: "Syntax and solve(values) declaration are valid. The code was not executed.",
    hint: "Write def solve(values): with one parameter. Return a sorted list, or sort the input in place and return None.",
    limit: "Limit: 32,768 UTF-8 bytes", tooLarge: "The source exceeds the size limit.",
    note: "Static validation does not prove correctness or safety. Execution is available only locally for your own code through the development command. There is no sandbox for public execution.",
    error: "Validation could not finish. Check your connection and retry. Your source was preserved.",
    line: "Line", column: "column", errors: "Validation errors",
  },
} as const;
