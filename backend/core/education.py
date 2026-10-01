"""Curated, versioned educational text for the implemented sorting variants.

Complexity values remain in Algorithm fields, not in this content dictionary.
"""


def bilingual(el, en, stable, in_place, walkthrough):
    keys = ("what", "intuition", "how", "strengths", "weaknesses", "uses", "pitfalls")
    return {"el": dict(zip(keys, el)), "en": dict(zip(keys, en)),
            "stable": stable, "in_place": in_place, "walkthrough": walkthrough}


EDUCATION = {
    "bubble-sort": bilingual([
        "Ταξινόμηση με επαναλαμβανόμενες συγκρίσεις γειτονικών στοιχείων.",
        "Κάθε πέρασμα μετακινεί το μεγαλύτερο στοιχείο προς το τέλος.",
        ["Σύγκρινε γειτονικά στοιχεία.", "Αν είναι ανάποδα, αντάλλαξέ τα.", "Μείωσε το ενεργό τέλος. Σταμάτα αν δεν έγινε ανταλλαγή."],
        "Απλός έλεγχος ροής, σταθερή σειρά ίσων στοιχείων και early exit.",
        "Πολλές συγκρίσεις και ανταλλαγές σε μεγάλα ή αντίστροφα inputs.",
        "Μικρά εκπαιδευτικά παραδείγματα. Απόφυγέ τον για μεγάλα γενικά datasets.",
        "Το early exit χρειάζεται flag ανά πέρασμα. Ανταλλαγή ίσων στοιχείων χάνει τη stability.",
    ], [
        "Sorting by repeated comparisons of adjacent elements.",
        "Each pass moves the largest remaining item toward the end.",
        ["Compare adjacent items.", "Swap them when out of order.", "Shrink the active end; stop after a pass without swaps."],
        "Simple control flow, stable equal keys and an early exit.",
        "Many comparisons and swaps on large or reversed inputs.",
        "Small teaching examples; avoid it for large general datasets.",
        "Reset the early-exit flag each pass. Swapping equal keys loses stability.",
    ], True, True, [[3, 1, 2], [1, 3, 2], [1, 2, 3]]),
    "insertion-sort": bilingual([
        "Χτίζει ταξινομημένο prefix εισάγοντας ένα νέο στοιχείο κάθε φορά.",
        "Όπως βάζεις ένα χαρτί στη σωστή θέση μέσα σε ήδη ταξινομημένο χέρι.",
        ["Κράτησε το επόμενο στοιχείο σε προσωρινό key.", "Μετακίνησε δεξιά όσα προηγούμενα είναι μεγαλύτερα.", "Τοποθέτησε το key στο κενό και επέκτεινε το prefix."],
        "Απλός, stable και αποτελεσματικός σε μικρά ή σχεδόν ταξινομημένα inputs.",
        "Πολλές μετακινήσεις όταν το input είναι μεγάλο και ανάποδο.",
        "Μικρά arrays ή λίγες προσθήκες σε ταξινομημένη ακολουθία· όχι μεγάλα αντίστροφα arrays.",
        "Μην χάσεις το key κατά τα shifts. Μετακίνησε μόνο αυστηρά μεγαλύτερες τιμές για stability.",
    ], [
        "Builds a sorted prefix by inserting one new item at a time.",
        "Like placing a card into the right position in an already sorted hand.",
        ["Keep the next item in a temporary key.", "Shift larger preceding items to the right.", "Place the key into the gap and extend the prefix."],
        "Simple, stable and effective on small or nearly sorted inputs.",
        "Many shifts on large reversed inputs.",
        "Small arrays or a few additions to a sorted sequence; avoid large reversed arrays.",
        "Keep the key during shifts. Shift only strictly larger values to preserve stability.",
    ], True, True, [[3, 1, 2], [1, 3, 2], [1, 2, 3]]),
    "selection-sort": bilingual([
        "Επιλέγει το ελάχιστο από το υπόλοιπο array για κάθε θέση.",
        "Γέμισε τις τελικές θέσεις μία μία με το μικρότερο διαθέσιμο στοιχείο.",
        ["Θεώρησε την πρώτη ενεργή θέση ως ελάχιστο.", "Σάρωσε το υπόλοιπο array και κράτησε τη θέση του ελάχιστου.", "Αντάλλαξέ το με την αρχή και προχώρησε μία θέση."],
        "Λίγες ανταλλαγές και σταθερή επιπλέον μνήμη.",
        "Σαρώνει το υπόλοιπο input ακόμη κι αν είναι ταξινομημένο. Δεν είναι stable.",
        "Εκμάθηση επιλογής ελάχιστου ή όταν οι εγγραφές κοστίζουν περισσότερο από τις συγκρίσεις· όχι μεγάλα inputs.",
        "Η μακρινή ανταλλαγή μπορεί να αντιστρέψει ίσα keys. Στο [2a, 2b, 1] δίνει [1, 2b, 2a].",
    ], [
        "Selects the minimum remaining item for each position.",
        "Fill final positions one by one using the smallest available item.",
        ["Treat the first active position as the minimum.", "Scan the rest and remember the minimum index.", "Swap it into the first active position and advance."],
        "Few swaps and constant auxiliary memory.",
        "Scans the remaining input even when already sorted. Not stable.",
        "Learning minimum selection or when writes cost more than comparisons; avoid large inputs.",
        "A distant swap may reverse equal keys: [2a, 2b, 1] becomes [1, 2b, 2a].",
    ], False, True, [[3, 1, 2], [1, 3, 2], [1, 2, 3]]),
    "merge-sort": bilingual([
        "Συνδυάζει ταξινομημένα τμήματα σε μεγαλύτερα ταξινομημένα τμήματα.",
        "Δύο ήδη ταξινομημένες ουρές ενώνονται επιλέγοντας κάθε φορά το μικρότερο πρώτο στοιχείο.",
        ["Ξεκίνα με runs μήκους 1.", "Συγχώνευσε γειτονικά runs σε βοηθητικό buffer.", "Αντέγραψε το buffer και διπλασίασε το μήκος μέχρι να καλύψει όλο το array."],
        "Stable και προβλέψιμη αύξηση συγκρίσεων σε διαφορετικές διατάξεις input.",
        "Η υλοποίηση array απαιτεί επιπλέον buffer ανάλογο του input.",
        "Όταν χρειάζεται stability και προβλέψιμη συμπεριφορά· όχι όταν η βοηθητική μνήμη είναι αυστηρά περιορισμένη.",
        "Σε ισοπαλία πάρε πρώτα από το αριστερό run. Η δική μας έκδοση είναι bottom-up, χωρίς recursion.",
    ], [
        "Combines sorted sections into larger sorted sections.",
        "Merge two sorted queues by repeatedly taking the smaller front item.",
        ["Start with runs of length 1.", "Merge adjacent runs into an auxiliary buffer.", "Copy the buffer and double the run width until it covers the array."],
        "Stable, with predictable comparison growth across input orders.",
        "This array implementation needs a buffer proportional to input size.",
        "When stability and predictable behavior matter; avoid under strict auxiliary-memory limits.",
        "Take from the left run on ties. Our variant is bottom-up, without recursion.",
    ], True, False, [[3, 1, 2], [1, 3, 2], [1, 2, 3]]),
    "quick-sort": bilingual([
        "Χωρίζει το array γύρω από pivot και ταξινομεί τα μικρότερα υποπροβλήματα.",
        "Βάλε τα μικρότερα αριστερά, τα ίσα στη μέση και τα μεγαλύτερα δεξιά.",
        ["Διάλεξε την τιμή της μεσαίας θέσης ως pivot.", "Κάνε three-way partition με ανταλλαγές.", "Επεξεργάσου τα εξωτερικά ranges, πρώτα το μικρότερο, με explicit stack."],
        "Partition πάνω στο array και καλή διαχείριση πολλών ίσων τιμών με three-way partition.",
        "Μη ισορροπημένα partitions μπορούν να οδηγήσουν σε τετραγωνικό χρόνο. Δεν είναι stable.",
        "Γενικά arrays όταν η stability δεν είναι απαίτηση· όχι όταν απαιτείται εγγυημένος worst-case χρόνος.",
        "Μετά από swap με το upper άκρο ξαναέλεγξε την τρέχουσα θέση. In-place partition δεν σημαίνει μηδενική βοηθητική μνήμη: υπάρχει stack. Το catalogue περιγράφει τη γενική οικογένεια, ενώ η παρούσα έκδοση περιορίζει το pending stack επεξεργάζοντας μικρά ranges πρώτα.",
    ], [
        "Partitions around a pivot and sorts the smaller subproblems.",
        "Put smaller values on the left, equal values in the middle and larger values on the right.",
        ["Choose the middle-position value as pivot.", "Perform a three-way partition using swaps.", "Process outer ranges, smaller first, using an explicit stack."],
        "Partitions within the array and handles many equal values well with three-way partitioning.",
        "Unbalanced partitions can cause quadratic time. Not stable.",
        "General arrays when stability is unnecessary; avoid when a worst-case time guarantee is required.",
        "Recheck the current position after swapping with the upper end. In-place partition does not mean zero auxiliary memory: a stack remains. Catalogue complexities describe the general family; this variant limits the pending stack by processing smaller ranges first.",
    ], False, True, [[3, 1, 2], [2, 1, 3], [1, 2, 3]]),
}
