# Επιλογή γλώσσας — #11

Στο header υπάρχει επιλογή Ελληνικά / English. Η αρχική γλώσσα είναι el.
Η επιλογή αλλάζει αμέσως header, backend status, benchmark form/results,
custom Python feedback, toolbar, grid labels, Algorithm Library controls και
implementation reviews. Αριθμοί και review timestamps μορφοποιούνται με τη
γλώσσα που είναι επιλεγμένη. Το document lang και το browser title ενημερώνονται.

Η επιλογή ισχύει για το τρέχον page load. Refresh επαναφέρει τα Ελληνικά·
δεν υπάρχει localStorage, cookie ή αλλαγή backend profile.

## Διατήρηση δεδομένων

Η αλλαγή γλώσσας δεν κάνει reload ή remount τις ενότητες. Διατηρούνται grid walls,
benchmark inputs/results, Python source/validation result και μη αποθηκευμένα
review fields. Το language δεν είναι dependency των data-loading effects.
Τα status/error codes κρατιούνται ως δεδομένα και τα labels υπολογίζονται
κατά το render, ώστε να αλλάζουν και παλιότερα αποτελέσματα ή εκκρεμή αιτήματα.

Τα ονόματα αλγορίθμων, οι περιγραφές του catalogue και το περιεχόμενο των
σημειώσεων είναι δεδομένα, όχι UI translations. Παραμένουν όπως τα επιστρέφει
το API ή όπως τα έγραψε ο χρήστης. Δεν προστίθεται αυτόματη μετάφραση.

## Python errors

Το API contract παραμένει ίδιο: stable code και ελληνικό message. Το UI
χρησιμοποιεί το code μέσω `src/i18n/pythonErrors.ts` για μήνυμα στην επιλεγμένη
γλώσσα, ακόμη και μετά την ολοκλήρωση προηγούμενου validation. Άγνωστος code
εμφανίζει generic localized feedback. Δεν εμφανίζεται ανεπεξέργαστο backend
message ως αγγλικό UI κείμενο. Το CLI εξακολουθεί να επιστρέφει ελληνικά μηνύματα.

## Έλεγχοι

Πέντε νέα frontend tests καλύπτουν ίδια translation keys, selector label/selected
value, grid accessible labels, γνωστά/άγνωστα validation codes και το rendering
υπαρχόντων αποτελεσμάτων με σωστή γλώσσα και αριθμούς. Μαζί με τα τέσσερα
υπάρχοντα tests, το `npm test` τρέχει εννέα. Η διατήρηση state κατά τα πραγματικά
clicks ελέγχεται χωριστά στον browser· το static rendering test δεν την αποδεικνύει.

## Επαλήθευση #11 — 2026-09-28

Πέρασαν 9 frontend tests (5 νέα), 60 backend tests, lint/build, Django check και
migration dry-run. Στον browser ελέγχθηκαν default Ελληνικά, αλλαγή σε English
και επιστροφή, localized benchmark results και ήδη υπάρχον validation error.
Διατηρήθηκαν source, αποτέλεσμα benchmark, grid wall και μη αποθηκευμένο review
draft. Το draft δεν αποθηκεύτηκε στη βάση. Το document lang/title ακολουθεί τη
γλώσσα και το refresh επιστρέφει στο el. Δεν παρατηρήθηκαν console errors.
Δεν έγινε ξεχωριστό delayed-request ή offline end-to-end σενάριο κατά την
αλλαγή γλώσσας. Τα tests rendering δεν υποκαθιστούν τα browser interaction checks.
