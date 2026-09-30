from rest_framework import serializers
from rest_framework.decorators import api_view
from rest_framework.response import Response

from core.datasets.generators import DATASET_TYPES
from .runner import MAX_BENCHMARK_SIZE, SORTING_ALGORITHMS, compare_sorting, run_bubble_sort_benchmark, run_sorting_benchmark


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


class SortingBenchmarkRequestSerializer(BenchmarkRequestSerializer):
    algorithm = serializers.ChoiceField(choices=SORTING_ALGORITHMS)


@api_view(["POST"])
def sorting_benchmark(request):
    serializer = SortingBenchmarkRequestSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    return Response(run_sorting_benchmark(**serializer.validated_data))


class ComparisonRequestSerializer(BenchmarkRequestSerializer):
    algorithms = serializers.ListField(child=serializers.ChoiceField(choices=SORTING_ALGORITHMS),
                                       min_length=2, max_length=5)

    def validate_algorithms(self, values):
        if len(set(values)) != len(values):
            raise serializers.ValidationError("Select distinct algorithms.")
        return values


@api_view(["POST"])
def sorting_comparison(request):
    serializer = ComparisonRequestSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    from .persistence import sign_comparison
    result = compare_sorting(**serializer.validated_data)
    return Response({**result, "save_token": sign_comparison(result)})


class SaveComparisonSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=200)
    token = serializers.CharField(max_length=65536)

    def to_internal_value(self, data):
        if isinstance(data, dict) and set(data) - {"name", "token"}:
            raise serializers.ValidationError({"request": "Only name and token are accepted."})
        return super().to_internal_value(data)


@api_view(["POST"])
def persist_comparison(request):
    from .persistence import save_comparison
    from core.experiments.api import ExperimentSerializer
    serializer = SaveComparisonSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    experiment = save_comparison(**serializer.validated_data)
    return Response(ExperimentSerializer(experiment).data, status=201)
