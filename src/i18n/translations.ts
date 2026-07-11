export const translations = {
  el: {
    app: {
      title: "Εργαστήριο Αλγορίθμων Διαδρομής",
      subtitle:
        "Οπτικοποίησε, δοκίμασε και σύγκρινε αλγορίθμους εύρεσης διαδρομής σε πλέγμα.",
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
  },

  en: {
    app: {
      title: "Pathfinding Algorithm Lab",
      subtitle:
        "Visualize, test and compare pathfinding algorithms on a grid.",
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
  },
} as const;

export type Language = keyof typeof translations;
export type AppTexts = (typeof translations)[Language];