from rest_framework import serializers
from rest_framework.decorators import api_view
from rest_framework.response import Response

from core.datasets.generators import DATASET_TYPES
from .runner import MAX_BENCHMARK_SIZE, run_bubble_sort_benchmark


class StrictIntegerField(serializers.IntegerField):
    def to_internal_value(self, data):
        if type(data) is not int:
            self.fail("invalid")
        return super().to_internal_value(data)


class BenchmarkRequestSerializer(serializers.Serializer):
    size = StrictIntegerField(min_value=1, max_value=MAX_BENCHMARK_SIZE)
    seed = StrictIntegerField(default=42, min_value=-(2**31), max_value=2**31 - 1)
    dataset_type = serializers.ChoiceField(choices=DATASET_TYPES, default="random")

    def to_internal_value(self, data):
        if isinstance(data, dict):
            unknown = set(data) - set(self.fields)
            if unknown:
                raise serializers.ValidationError({key: ["Unknown field."] for key in unknown})
        return super().to_internal_value(data)


@api_view(["POST"])
def bubble_sort_benchmark(request):
    serializer = BenchmarkRequestSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    return Response(run_bubble_sort_benchmark(**serializer.validated_data))
