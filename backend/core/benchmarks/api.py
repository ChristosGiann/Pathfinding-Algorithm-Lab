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
    custom_source = serializers.CharField(required=False, max_length=32768, trim_whitespace=False)
    trusted = serializers.BooleanField(required=False)

    def validate(self, data):
        custom = "custom_source" in data
        minimum, maximum = (1, 4) if custom else (2, 5)
        if not minimum <= len(data["algorithms"]) <= maximum:
            raise serializers.ValidationError({"algorithms": "Select 2–5 built-ins, or 1–4 with custom."})
        if custom and data.get("trusted") is not True:
            raise serializers.ValidationError({"trusted": "Trusted code acknowledgement required."})
        return data

    algorithms = serializers.ListField(child=serializers.ChoiceField(choices=SORTING_ALGORITHMS),
                                       min_length=1, max_length=5)

    def validate_algorithms(self, values):
        if len(set(values)) != len(values):
            raise serializers.ValidationError("Select distinct algorithms.")
        return values


@api_view(["POST"])
def sorting_comparison(request):
    serializer = ComparisonRequestSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    from .persistence import sign_comparison
    from core.custom_python.benchmark_api import execution_allowed
    data = dict(serializer.validated_data)
    data.pop("trusted", None)
    result = compare_sorting(**data, custom_allowed=execution_allowed(request))
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
