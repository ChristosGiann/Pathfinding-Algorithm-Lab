from django.db.models import Prefetch
from rest_framework.decorators import api_view
from rest_framework.generics import ListAPIView
from rest_framework.response import Response

from .models import Algorithm, AlgorithmImplementation
from .serializers import AlgorithmSerializer


@api_view(["GET"])
def health_check(request):
    return Response(
        {
            "status": "ok",
        }
    )


class AlgorithmListAPIView(ListAPIView):
    serializer_class = AlgorithmSerializer

    def get_queryset(self):
        active_built_in_implementations = (
            AlgorithmImplementation.objects.filter(
                source_type=AlgorithmImplementation.SourceType.BUILT_IN,
                is_active=True,
            ).order_by("name")
        )

        return (
            Algorithm.objects.filter(
                problem__slug="sorting",
                implementations__source_type=(
                    AlgorithmImplementation.SourceType.BUILT_IN
                ),
                implementations__is_active=True,
            )
            .select_related("problem")
            .prefetch_related(
                Prefetch(
                    "implementations",
                    queryset=active_built_in_implementations,
                    to_attr="active_built_in_implementations",
                )
            )
            .distinct()
        )