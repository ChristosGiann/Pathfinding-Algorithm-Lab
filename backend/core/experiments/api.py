from django.db import transaction
from rest_framework import generics, serializers

from core.models import AlgorithmImplementation, DatasetDefinition, Experiment


class StrictIntegerField(serializers.IntegerField):
    def to_internal_value(self, data):
        if type(data) is not int:
            self.fail("invalid")
        return super().to_internal_value(data)


class StrictInputSerializer(serializers.ModelSerializer):
    def to_internal_value(self, data):
        if isinstance(data, dict):
            allowed = {name for name, field in self.fields.items() if not field.read_only}
            unexpected = set(data) - allowed
            if unexpected:
                raise serializers.ValidationError({key: ["Unknown or read-only field."] for key in unexpected})
        return super().to_internal_value(data)


class DatasetDefinitionSerializer(StrictInputSerializer):
    size = StrictIntegerField(min_value=1, max_value=100_000)
    seed = StrictIntegerField(default=42, min_value=-(2**31), max_value=2**31 - 1)

    class Meta:
        model = DatasetDefinition
        fields = ("id", "dataset_type", "size", "seed")
        read_only_fields = ("id",)


class SelectedImplementationSerializer(serializers.ModelSerializer):
    algorithm = serializers.CharField(source="algorithm.slug")

    class Meta:
        model = AlgorithmImplementation
        fields = ("id", "name", "slug", "algorithm", "language", "is_active", "source_type")


class ExperimentSerializer(StrictInputSerializer):
    implementation_ids = serializers.ListField(
        child=StrictIntegerField(min_value=1), min_length=1, max_length=20, write_only=True,
    )
    implementations = SelectedImplementationSerializer(many=True, read_only=True)
    datasets = DatasetDefinitionSerializer(many=True, allow_empty=False)

    class Meta:
        model = Experiment
        fields = ("id", "name", "status", "implementation_ids", "implementations", "datasets", "created_at", "updated_at")
        read_only_fields = ("id", "status", "created_at", "updated_at")

    def validate_implementation_ids(self, ids):
        if len(ids) != len(set(ids)):
            raise serializers.ValidationError("Duplicate implementation IDs are not allowed.")
        implementations = list(AlgorithmImplementation.objects.filter(
            pk__in=ids, is_active=True,
            source_type=AlgorithmImplementation.SourceType.BUILT_IN,
            algorithm__problem__slug="sorting",
        ))
        if len(implementations) != len(ids):
            raise serializers.ValidationError("Select existing active built-in sorting implementations.")
        return implementations

    def validate_datasets(self, datasets):
        if len(datasets) > 20:
            raise serializers.ValidationError("At most 20 dataset definitions are allowed.")
        configurations = [(item["dataset_type"], item["size"], item["seed"]) for item in datasets]
        if len(set(configurations)) != len(configurations):
            raise serializers.ValidationError("Duplicate dataset configurations are not allowed.")
        return datasets

    @transaction.atomic
    def create(self, validated_data):
        implementations = validated_data.pop("implementation_ids")
        datasets = validated_data.pop("datasets")
        experiment = Experiment.objects.create(**validated_data)
        experiment.implementations.set(implementations)
        DatasetDefinition.objects.bulk_create([
            DatasetDefinition(experiment=experiment, **config) for config in datasets
        ])
        return experiment


class ExperimentCreateAPIView(generics.CreateAPIView):
    serializer_class = ExperimentSerializer


class ExperimentDetailAPIView(generics.RetrieveAPIView):
    serializer_class = ExperimentSerializer
    queryset = Experiment.objects.prefetch_related("implementations__algorithm", "datasets")
