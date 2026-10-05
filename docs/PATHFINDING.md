# Pathfinding evaluation foundation (#65)

Το sorting evaluation είναι διαθέσιμο στο dev. Η επόμενη οικογένεια ξεκινά με
καθαρό TypeScript domain στο `src/pathfinding/evaluation.ts`, χωρίς DOM dependency.
Δεν υπάρχουν ακόμη πραγματικές BFS/DFS/Dijkstra/A* implementations ή ενεργά
execution/animation controls. Το #2 καλύπτεται από το υπάρχον `neighbours` και
ξεχωριστό regression suite· τα υπόλοιπα pathfinding issues ακολουθούν σταδιακά.

## Input και algorithm contract

`gridToInput(existingGrid)` μετατρέπει το υπάρχον UI grid σε immutable snapshot:

```ts
interface GridInput {
  readonly rows: number;
  readonly cols: number;
  readonly start: number;
  readonly end: number;
  readonly walls: readonly boolean[];
}
type Search = (input: GridInput) => {
  found: boolean;
  visited: readonly number[];
  path: readonly number[];
};
```

IDs είναι row-major (`row * cols + col`). Απαιτούνται rectangular grid,
σωστές συντεταγμένες και ακριβώς ένα start/end. Walls δεν είναι traversable.
Visited/path UI colors αγνοούνται ως animation state και γίνονται traversable.
Το utility δέχεται έως 10.000 cells. Invalid input απορρίπτεται πριν κληθεί algorithm.
Το καθαρό input υποστηρίζει start=end (path `[start]`, μήκος 0), παρότι το
σημερινό UI node type δεν αναπαριστά δύο markers στο ίδιο cell.

`neighbours` επιστρέφει walkable cardinal neighbours σε σταθερή σειρά
up/right/down/left, χωρίς wrapping ή diagonals. Edge cost είναι 1· weighted
grids θα χρειαστούν ρητή επέκταση. Οι τέσσερις identities ταιριάζουν στο Toolbar:
`bfs`, `dfs`, `dijkstra`, `astar`. BFS/DFS δουλεύουν με την ίδια είσοδο, Dijkstra
με unit costs και A* μπορεί αργότερα να χρησιμοποιεί Manhattan heuristic.

Το #2 επαληθεύεται στο `tests/pathfinding.test.mjs` με `npm test`: κέντρο,
γωνίες/άκρες χωρίς row wrapping, walls, invalid origins, single cell/row/column
και ανεξάρτητα result arrays. Το utility παραμένει στο pathfinding feature,
χωρίς UI logic και χωρίς δεύτερη, ασύμβατη αναπαράσταση γειτόνων.

## Result και μέτρηση

`evaluatePathfinding(identity,input,search,clock?)` μετρά μόνο το synchronous
search call με `performance.now()` σε milliseconds. Αντιγραφή/validation πριν,
έλεγχος αποτελέσματος μετά. Algorithm state (queue, visited set, parents) πρέπει
να είναι τοπικό στην εκτέλεση, όχι μεταβολή του frozen input.

- Completed: `found`, `executionTimeMs`, `visitedNodeCount`, `pathLength`,
  immutable `visited`/`path` και algorithm identity.
- `visited`: μοναδικά walkable nodes που ο algorithm επεξεργάστηκε, με τη σειρά
  επεξεργασίας. Found path nodes πρέπει να περιλαμβάνονται σε αυτά.
- `pathLength`: αριθμός ακμών (όχι nodes), ή `null` όταν δεν βρέθηκε path.
- No-path: `found:false`, `path:[]`. Είναι ολοκληρωμένη εκτέλεση, όχι exception.
- Errors: `runner_error`, `invalid_result`, `invalid_clock`, χωρίς fabricated metrics.

Ελέγχονται endpoints, cardinal adjacency, walls και μοναδικότητα path. Η απουσία
διαδρομής ή η βέλτιστη διαδρομή δεν αποδεικνύονται από αυτό το structural validator·
η ορθότητα κάθε algorithm θα ελεγχθεί στα δικά του tests. DFS δεν υπόσχεται shortest path.

## Same-grid comparison και επόμενα βήματα

`comparePathfinding` δέχεται 1–4 διαφορετικές identities με injected search
functions. Παίρνει κοινό snapshot και δίνει νέο frozen copy σε κάθε εκτέλεση.
Exception ενός algorithm δεν ακυρώνει τα υπόλοιπα. Δεν υπάρχει production
registry με placeholder implementations ή προσποίηση έτοιμων algorithms.

Η μελλοντική UI σύνδεση είναι: existing Grid → adapter → trusted algorithm registry
→ evaluation → result → ανεξάρτητη animation των visited/path. Animation delays
και rendering δεν εισέρχονται στο execution-time metric. Persistence, repeated
pathfinding benchmarks και animation suite είναι μελλοντικό scope.

Tests χρησιμοποιούν μικρά injected traces για contract validation, clock boundaries,
invalid/no-path/same-cell inputs, walls, neighbour ordering και copy isolation.
Το πλήρες frontend suite συνεχίζει να ελέγχει το sorting flow.

## Ανακατασκευή διαδρομής (#3)

Το reconstructPath(start, end) στο src/pathfinding/reconstructPath.ts ακολουθεί SearchNode.previous references και επιστρέφει row-major IDs από start προς end. Τα nodes είναι τοπικά στο search, όχι UI nodes. Η αρχή αναγνωρίζεται από την ίδια object reference· start=end δίνει ένα ID. Null end, disconnected chain ή cycle δίνουν []. Iterative O(k) χρόνος/χώρος, χωρίς recursion ή mutation. Το utility δεν ελέγχει walls/adjacency: αυτά ανήκουν στον search και στο evaluation contract. Tests: διαδρομή, same-node, no-path/cycle, isolation και 10.000-node chain.
