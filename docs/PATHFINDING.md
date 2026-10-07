# Pathfinding evaluation foundation (#65)

Το sorting evaluation είναι διαθέσιμο στο dev. Η επόμενη οικογένεια ξεκινά με
καθαρό TypeScript domain στο `src/pathfinding/evaluation.ts`, χωρίς DOM dependency.
Ο BFS (#1) είναι διαθέσιμος ως καθαρό search function και το #4 τον συνδέει με
visited/path animation στο UI. Ο DFS (#8) χρησιμοποιεί το ίδιο playback/statistics flow. Dijkstra/A* παραμένουν μελλοντικά. Το #2 καλύπτεται από το υπάρχον `neighbours` και
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
Exception ενός algorithm δεν ακυρώνει τα υπόλοιπα. Το registry.ts περιέχει μόνο τις πραγματικές bfs/dfs implementations, χωρίς placeholders.

Η UI σύνδεση είναι: existing Grid → adapter → trusted algorithm registry
→ evaluation → result → ανεξάρτητη animation των visited/path. Animation delays
και rendering δεν εισέρχονται στο execution-time metric. Persistence, repeated
pathfinding benchmarks και animation suite είναι μελλοντικό scope.

Tests χρησιμοποιούν μικρά injected traces για contract validation, clock boundaries,
invalid/no-path/same-cell inputs, walls, neighbour ordering και copy isolation.
Το πλήρες frontend suite συνεχίζει να ελέγχει το sorting flow.

## Ανακατασκευή διαδρομής (#3)

Το reconstructPath(start, end) στο src/pathfinding/reconstructPath.ts ακολουθεί SearchNode.previous references και επιστρέφει row-major IDs από start προς end. Τα nodes είναι τοπικά στο search, όχι UI nodes. Η αρχή αναγνωρίζεται από την ίδια object reference· start=end δίνει ένα ID. Null end, disconnected chain ή cycle δίνουν []. Iterative O(k) χρόνος/χώρος, χωρίς recursion ή mutation. Το utility δεν ελέγχει walls/adjacency: αυτά ανήκουν στον search και στο evaluation contract. Tests: διαδρομή, same-node, no-path/cycle, isolation και 10.000-node chain.

## BFS (#1)

Το bfs στο src/pathfinding/bfs.ts δέχεται validated GridInput (από gridToInput/snapshotInput ή μέσω evaluatePathfinding). FIFO queue με head cursor, discovery στο enqueue και previous references· κάθε cell μπαίνει μία φορά. Επιστρέφει processed visited nodes μέχρι και το end, found και shortest path σε unit-cost cardinal grid. No-path δίνει found:false/path:[], start=end δίνει [start]. O(V+E) χρόνος και O(V) χώρος. Δεν μεταβάλλει input ούτε αγγίζει React/DOM/timers. Η UI σύνδεση και το animation είναι το #4.

## BFS animation (#4)

Το Pathfinding component κατέχει το grid και το playback state. Ο BFS/evaluation εκτελείται μία φορά πριν από timers· κατόπιν τα visited και path IDs γίνονται frames, με αυτή τη σειρά. Slow/normal/fast: 80/25/5 ms ανά frame (όχι εγγύηση wall-clock διάρκειας). Το advancePlayback αλλάζει μόνο React state, διατηρώντας start/end/walls. Idle/running/found/no-path/error μηνύματα είναι el/en. Νέο run καθαρίζει παλιό trace· reset/edit ακυρώνει playback και stale callbacks αγνοούνται με state identity. Effect cleanup ακυρώνει timer σε αλλαγή state/unmount. Το #5 κλειδώνει cells, toolbar buttons και selects όσο status=running. Native disabled props και handler guards προστατεύουν το grid· σε completion/no-path/error ενεργοποιούνται ξανά. Οι Dijkstra/A* επιλογές παραμένουν disabled. Το comparison (#9) είναι διαθέσιμο εκτός animation.

## Clear path (#6)

Το clearPath utility αφαιρεί μόνο visited/path marks με immutable copies. Το κουμπί Καθαρισμός διαδρομής επαναφέρει idle playback/result, κρατώντας walls/start/end και την ταχύτητα. Χρησιμοποιείται και από το υπάρχον idlePlayback για κοινή συμπεριφορά. Disabled όσο τρέχει animation, χωρίς DOM manipulation.

## Στατιστικά μετά το animation (#7)

Το PathfindingStatistics δέχεται μόνο playback status και measured result. Εμφανίζεται στο completed, ποτέ σε idle/running/error: algorithm, found, visitedNodeCount, pathLength σε ακμές και executionTimeMs. Null length εμφανίζεται ως —, μηδέν ως 0. Ο χρόνος αποκλείει animation/rendering και μορφοποιείται με έως 6 δεκαδικά σε el/en. Clear/reset/edit ή νέο run κρύβει προηγούμενα στοιχεία· αλλαγή γλώσσας μεταφράζει το ίδιο αποτέλεσμα χωρίς rerun. Δεν γίνεται DOM inspection, persistence ή αλλαγή του timing contract.

## DFS (#8)

Το dfs.ts υλοποιεί το ίδιο Search contract με BFS: validated immutable GridInput → found/visited/path. Iterative LIFO stack, processed set στο pop, reverse neighbour pushes για σταθερή up/right/down/left προτεραιότητα. Duplicate pending entries παραλείπονται όταν έχουν ήδη processed το ίδιο ID. Previous references ανακατασκευάζουν την πραγματική DFS route. O(V+E) χρόνος/χώρος· στο cardinal grid E≤4V, άρα O(V) χώρος. Δεν εγγυάται shortest path και δεν χρησιμοποιεί recursion.

Το UI διαθέτει controlled BFS/DFS selector και dispatch μέσω typed registry. Η αλλαγή algorithm εκτός animation διατηρεί walls/endpoints/speed αλλά καθαρίζει trace/result ώστε να μη φαίνονται metrics άλλου algorithm. Κατά το animation ο selector κλειδώνει. Animation, statistics, clear path και el/en λειτουργούν κοινά, χωρίς algorithm-specific rendering.

## Σύγκριση στο UI (#9)

Το Compare τρέχει όλους τους διαθέσιμους algorithms του registry (BFS/DFS) μέσω comparePathfinding σε ανεξάρτητα immutable copies του ίδιου grid. Δεν δημιουργεί playback frames: καθαρίζει προηγούμενο trace και single-run statistics, διατηρώντας walls/endpoints/selector/speed. Ο πίνακας εμφανίζει algorithm, found, path length σε βήματα, visited count και execution time σε ms. Error rows έχουν μεταφρασμένο μήνυμα χωρίς επινοημένα metrics· οι υπόλοιπες εκτελέσεις συνεχίζουν.

Grid edits, clear/reset, αλλαγή algorithm ή νέο visualization καθαρίζουν τη σύγκριση. Αλλαγή γλώσσας μεταφράζει το ίδιο αποτέλεσμα χωρίς rerun· αλλαγή speed δεν αλλάζει metrics. Ο χρόνος αφορά μόνο το search, χωρίς αντιγραφές, validation, animation ή rendering. Πρόκειται για μία μέτρηση ανά algorithm, χωρίς ισχυρισμό γενικής υπεροχής ή persistence.
