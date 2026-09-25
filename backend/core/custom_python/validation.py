"""Static syntax/contract checks only. Passing these checks is not a safety claim."""
import ast

MAX_SOURCE_BYTES = 32_768

MESSAGES = {
    "invalid_request": "Στείλε μόνο το πεδίο source ως κείμενο Python.",
    "empty_source": "Πρόσθεσε κώδικα Python πριν τον έλεγχο.",
    "source_too_large": "Ο κώδικας ξεπερνά το όριο των 32.768 bytes UTF-8.",
    "invalid_encoding": "Ο κώδικας περιέχει μη έγκυρους χαρακτήρες Unicode.",
    "syntax_error": "Συντακτικό σφάλμα Python. Έλεγξε την υποδεικνυόμενη θέση.",
    "too_complex": "Ο κώδικας έχει υπερβολικά σύνθετη δομή για αυτόν τον έλεγχο.",
    "missing_solve": "Χρειάζεται μία συνάρτηση def solve(values): στο κύριο επίπεδο του αρχείου.",
    "invalid_signature": "Η solve πρέπει να είναι απλή σύγχρονη συνάρτηση με μοναδική παράμετρο values, χωρίς προεπιλογές ή decorators.",
    "generator_solve": "Η solve πρέπει να επιστρέφει λίστα ή να ταξινομεί την είσοδο επιτόπου, χωρίς yield.",
    "runtime_error": "Ο κώδικας απέτυχε κατά την τοπική εκτέλεση.",
    "incorrect_result": "Η solve δεν ταξινόμησε σωστά όλα τα δοκιμαστικά δεδομένα.",
    "timeout": "Η τοπική εκτέλεση ξεπέρασε το όριο των 2 δευτερολέπτων και το process τερματίστηκε.",
    "execution_unavailable": "Δεν ήταν δυνατή η εκκίνηση της τοπικής εκτέλεσης.",
    "file_error": "Δεν ήταν δυνατή η ανάγνωση του αρχείου ως κείμενο UTF-8.",
}


def failure(code, *, stage="static", line=None, column=None):
    return {"valid": False, "stage": stage, "errors": [
        {"code": code, "message": MESSAGES[code], "line": line, "column": column},
    ]}


class YieldFinder(ast.NodeVisitor):
    found = False

    def visit_Yield(self, node):
        self.found = True

    visit_YieldFrom = visit_Yield

    # Nested functions/classes do not make the outer solve a generator.
    def visit_FunctionDef(self, node):
        pass

    visit_AsyncFunctionDef = visit_FunctionDef
    visit_Lambda = visit_FunctionDef
    visit_ClassDef = visit_FunctionDef


def validate_source(source):
    if not isinstance(source, str):
        return failure("invalid_request")
    try:
        size = len(source.encode("utf-8"))
    except UnicodeEncodeError:
        return failure("invalid_encoding")
    if size > MAX_SOURCE_BYTES:
        return failure("source_too_large")
    if not source.strip():
        return failure("empty_source")
    try:
        tree = ast.parse(source, filename="<custom-implementation>")
        # Also detects syntax accepted by AST parsing, such as return outside a function.
        compile(tree, "<custom-implementation>", "exec", dont_inherit=True)
        definitions = [node for node in tree.body
                       if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)) and node.name == "solve"]
        if not definitions:
            return failure("missing_solve")
        solve = definitions[0]
        args = solve.args
        parameters = args.posonlyargs + args.args
        if (len(definitions) != 1 or isinstance(solve, ast.AsyncFunctionDef)
                or solve.decorator_list or len(parameters) != 1 or parameters[0].arg != "values"
                or args.vararg or args.kwarg or args.kwonlyargs or args.defaults):
            return failure("invalid_signature", line=solve.lineno)
        finder = YieldFinder()
        for statement in solve.body:
            finder.visit(statement)
        if finder.found:
            return failure("generator_solve", line=solve.lineno)
    except SyntaxError as error:
        return failure("syntax_error", line=error.lineno, column=error.offset)
    except (RecursionError, MemoryError):
        return failure("too_complex")
    except ValueError:
        return failure("syntax_error")
    return {"valid": True, "stage": "static", "errors": []}
