export const translations = {
  el: {
    app: {
      title: "Εργαστήριο Αλγορίθμων",
      language: "Γλώσσα", greek: "Ελληνικά", english: "English",
      subtitle:
        "Οπτικοποίησε, δοκίμασε και σύγκρινε αλγορίθμους.",
    },

    pathfinding: {
      title: "Pathfinding — BFS / DFS", description: "Μπλε: εξερεύνηση · Κίτρινο: διαδρομή. Η ταχύτητα αφορά μόνο το animation, όχι τη μέτρηση του αλγορίθμου.",
      idle: "Σχεδίασε εμπόδια, επίλεξε BFS ή DFS και πάτησε Οπτικοποίηση.",
      searchNote: "Ο BFS βρίσκει τη συντομότερη διαδρομή σε αυτό το grid. Ο DFS εξερευνά πρώτα σε βάθος και δεν εγγυάται τη συντομότερη διαδρομή.",
      running: "Η αναζήτηση οπτικοποιείται…", found: "Βρέθηκε διαδρομή.",
      noPath: "Δεν υπάρχει διαδρομή.", error: "Δεν ήταν δυνατή η εκτέλεση. Έλεγξε το grid και δοκίμασε ξανά.",
      comparison: {
        title: "Σύγκριση διαδρομών", ready: "Η σύγκριση ολοκληρώθηκε. Δες τα αποτελέσματα στον πίνακα.",
        caption: "Αποτελέσματα BFS / DFS στο ίδιο grid",
        note: "Τρέχουν όλοι οι διαθέσιμοι αλγόριθμοι στο ίδιο grid, χωρίς animation. Ο BFS βρίσκει συντομότερη διαδρομή· ο DFS δεν το εγγυάται.",
        errors: { runner_error: "Η εκτέλεση απέτυχε.", invalid_result: "Ο αλγόριθμος επέστρεψε μη έγκυρο αποτέλεσμα.", invalid_clock: "Δεν ήταν δυνατή η μέτρηση χρόνου." },
      },
      statistics: {
        title: "Στατιστικά διαδρομής", algorithm: "Αλγόριθμος", found: "Βρέθηκε διαδρομή",
        yes: "Ναι", no: "Όχι", visited: "Visited nodes", length: "Μήκος διαδρομής (βήματα)", time: "Χρόνος εκτέλεσης",
        note: "Το μήκος μετρά βήματα μεταξύ cells· — σημαίνει ότι δεν υπάρχει διαδρομή. Ο χρόνος αφορά μόνο τον αλγόριθμο, χωρίς animation ή rendering. Μία μέτρηση δεν αποτελεί γενικό συμπέρασμα απόδοσης.",
      },
    },

    grid: { cell: (row: number, col: number) => `Κελί γραμμής ${row}, στήλης ${col}` },

    backendStatus: {
      loading: "Έλεγχος σύνδεσης με το backend...",
      online: "Το backend είναι διαθέσιμο",
      offline: "Δεν είναι δυνατή η σύνδεση με το backend",
    },

    toolbar: {
      ariaLabel: "Εργαλεία αλγορίθμων",
      algorithmLabel: "Αλγόριθμος",
      speedLabel: "Ταχύτητα",
      visualize: "Οπτικοποίηση",
      compare: "Σύγκριση",
      resetGrid: "Επαναφορά πλέγματος",
      clearWalls: "Καθαρισμός εμποδίων",
      clearPath: "Καθαρισμός διαδρομής",
    },

    algorithms: {
      bfs: "BFS",
      dfs: "DFS",
      dijkstra: "Dijkstra",
      astar: "A*",
    },

    speed: {
      slow: "Αργά",
      normal: "Κανονικά",
      fast: "Γρήγορα",
    },

    algorithmLibrary: {
      eyebrow: "Sorting algorithms",
      title: "Βιβλιοθήκη Αλγορίθμων",
      description:
        "Εξερεύνησε τους διαθέσιμους αλγορίθμους ταξινόμησης, τις πολυπλοκότητές τους και τις υλοποιήσεις που μπορούν να χρησιμοποιηθούν στα πειράματα.",
      loading: "Φόρτωση αλγορίθμων...",
      error:
        "Δεν ήταν δυνατή η φόρτωση των αλγορίθμων.",
      retry: "Νέα προσπάθεια",
      empty: "Δεν υπάρχουν διαθέσιμοι αλγόριθμοι.",
      problem: "Πρόβλημα",
      bestCase: "Καλύτερη περίπτωση",
      averageCase: "Μέση περίπτωση",
      worstCase: "Χειρότερη περίπτωση",
      spaceComplexity: "Χωρική πολυπλοκότητα",
      implementations: "Υλοποιήσεις",
      reference: "αναφοράς",
    },
  },

  en: {
    app: {
      title: "Algorithm Lab",
      language: "Language", greek: "Ελληνικά", english: "English",
      subtitle:
        "Visualize, test and compare algorithms.",
    },

    pathfinding: {
      title: "Pathfinding — BFS / DFS", description: "Blue: exploration · Yellow: path. Speed affects animation only, not algorithm measurement.",
      idle: "Draw walls, choose BFS or DFS and press Visualize.",
      searchNote: "BFS finds a shortest path on this grid. DFS explores depth first and does not guarantee a shortest path.",
      running: "Animating the search…", found: "Path found.",
      noPath: "No path exists.", error: "The search could not run. Check the grid and try again.",
      comparison: {
        title: "Path comparison", ready: "Comparison completed. See the results in the table.",
        caption: "BFS / DFS results on the same grid",
        note: "All available algorithms run on the same grid without animation. BFS finds a shortest path; DFS does not guarantee one.",
        errors: { runner_error: "Execution failed.", invalid_result: "The algorithm returned an invalid result.", invalid_clock: "Execution time could not be measured." },
      },
      statistics: {
        title: "Path statistics", algorithm: "Algorithm", found: "Path found",
        yes: "Yes", no: "No", visited: "Visited nodes", length: "Path length (steps)", time: "Execution time",
        note: "Length counts steps between cells; — means no path exists. Time measures the algorithm only, excluding animation and rendering. A single measurement is not a general performance conclusion.",
      },
    },

    grid: { cell: (row: number, col: number) => `Cell row ${row}, column ${col}` },

    backendStatus: {
      loading: "Checking backend connection...",
      online: "Backend is available",
      offline: "Unable to connect to the backend",
    },

    toolbar: {
      ariaLabel: "Algorithm tools",
      algorithmLabel: "Algorithm",
      speedLabel: "Speed",
      visualize: "Visualize",
      compare: "Compare",
      resetGrid: "Reset grid",
      clearWalls: "Clear walls",
      clearPath: "Clear path",
    },

    algorithms: {
      bfs: "BFS",
      dfs: "DFS",
      dijkstra: "Dijkstra",
      astar: "A*",
    },

    speed: {
      slow: "Slow",
      normal: "Normal",
      fast: "Fast",
    },

    algorithmLibrary: {
      eyebrow: "Sorting algorithms",
      title: "Algorithm Library",
      description:
        "Explore the available sorting algorithms, their complexity characteristics and the implementations that can be used in experiments.",
      loading: "Loading algorithms...",
      error: "Unable to load the algorithms.",
      retry: "Try again",
      empty: "No algorithms are currently available.",
      problem: "Problem",
      bestCase: "Best case",
      averageCase: "Average case",
      worstCase: "Worst case",
      spaceComplexity: "Space complexity",
      implementations: "Implementations",
      reference: "reference",
    },
  },
} as const;

export type Language = keyof typeof translations;
export type AppTexts = (typeof translations)[Language];
