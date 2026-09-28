export const experimentTexts = {
  el: {
    title: "Αποθηκευμένα experiments", description: "Αποθήκευσε τις επιλογές σου, εκτέλεσε το experiment και άνοιξε ξανά τις μετρήσεις με το ID του.",
    name: "Όνομα experiment", implementations: "Υλοποιήσεις προς εκτέλεση", save: "Αποθήκευση draft", run: "Εκτέλεση experiment", open: "Άνοιγμα", refresh: "Ανανέωση από server", id: "ID experiment",
    loading: "Φόρτωση υλοποιήσεων…", loadError: "Δεν φορτώθηκαν οι υλοποιήσεις.", retry: "Νέα προσπάθεια", empty: "Δεν υπάρχουν εκτελέσιμες υλοποιήσεις.",
    busy: "Επικοινωνία με τον server…", invalid: "Δώσε όνομα, 1–4 υλοποιήσεις, μέγεθος 1–1000 και ακέραιο seed 32-bit.", invalidId: "Δώσε θετικό ακέραιο ID.",
    error: "Η ενέργεια απέτυχε. Έλεγξε το ID, τη σύνδεση και τα όρια εκτέλεσης.", uncertain: "Η απάντηση εκτέλεσης δεν επιβεβαιώθηκε. Κάνε ανανέωση από τον server πριν δοκιμάσεις ξανά· η εκτέλεση μπορεί να έχει ολοκληρωθεί.",
    saveError: "Δεν επιβεβαιώθηκε η αποθήκευση. Το draft μπορεί να δημιουργήθηκε στον server. Νέα αποθήκευση μπορεί να δημιουργήσει δεύτερο draft.",
    saved: "Αποθηκευμένα αποτελέσματα", noResults: "Δεν υπάρχουν αποθηκευμένες μετρήσεις.", runnerError: "Η εκτέλεση απέτυχε στον runner.", incorrect: "Τουλάχιστον μία ταξινόμηση απέτυχε στον έλεγχο ορθότητας.",
    note: "Κράτησε το ID για άνοιγμα μετά από refresh. Κάθε νέο draft αυτής της φόρμας έχει ένα dataset. Η αλλαγή της φόρμας δεν τροποποιεί το ήδη αποθηκευμένο experiment.",
    states: { draft: "Πρόχειρο", pending: "Σε αναμονή", running: "Σε εκτέλεση", completed: "Ολοκληρωμένο", failed: "Αποτυχημένο" },
  },
  en: {
    title: "Saved experiments", description: "Save your selection, run the experiment and reopen its measurements using its ID.",
    name: "Experiment name", implementations: "Implementations to run", save: "Save draft", run: "Run experiment", open: "Open", refresh: "Refresh from server", id: "Experiment ID",
    loading: "Loading implementations…", loadError: "Could not load implementations.", retry: "Retry", empty: "No executable implementations available.",
    busy: "Contacting the server…", invalid: "Enter a name, 1–4 implementations, size 1–1000 and an integer 32-bit seed.", invalidId: "Enter a positive integer ID.",
    error: "The action failed. Check the ID, connection and execution limits.", uncertain: "The run response was not confirmed. Refresh from the server before trying again; execution may already have completed.",
    saveError: "Saving was not confirmed. The server may have created the draft. Saving again may create another draft.",
    saved: "Saved results", noResults: "No saved measurements.", runnerError: "Execution failed in the runner.", incorrect: "At least one sorter failed its correctness check.",
    note: "Keep the ID to reopen after refresh. Each new draft from this form has one dataset. Editing the form does not change the saved experiment.",
    states: { draft: "Draft", pending: "Pending", running: "Running", completed: "Completed", failed: "Failed" },
  },
} as const;
