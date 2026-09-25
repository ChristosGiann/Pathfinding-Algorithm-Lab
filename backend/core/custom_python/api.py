from rest_framework.decorators import api_view, parser_classes
from rest_framework.exceptions import ParseError
from rest_framework.parsers import JSONParser
from rest_framework.response import Response

from .validation import failure, validate_source


@api_view(["POST"])
@parser_classes([JSONParser])
def validate_custom_python(request):
    try:
        data = request.data
    except ParseError:
        return Response(failure("invalid_request"), status=400)
    if not isinstance(data, dict) or set(data) != {"source"} or not isinstance(data["source"], str):
        return Response(failure("invalid_request"), status=400)
    # Source validation failures are domain results (200), not transport errors.
    return Response(validate_source(data["source"]))
