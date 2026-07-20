export const translations = {
  el: {
    app: {
      title: "Εργαστήριο Αλγορίθμων",
      subtitle:
        "Οπτικοποίησε, δοκίμασε και σύγκρινε αλγορίθμους.",
    },

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
      subtitle:
        "Visualize, test and compare algorithms.",
    },

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