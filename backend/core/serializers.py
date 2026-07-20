from rest_framework import serializers

from .models import Algorithm, AlgorithmImplementation


class AlgorithmImplementationSerializer(serializers.ModelSerializer):
    class Meta:
        model = AlgorithmImplementation

        fields = (
            "name",
            "slug",
            "language",
            "source_type",
            "is_reference",
            "is_active",
        )


class AlgorithmSerializer(serializers.ModelSerializer):
    problem = serializers.CharField(
        source="problem.name",
        read_only=True,
    )

    implementations = AlgorithmImplementationSerializer(
        source="active_built_in_implementations",
        many=True,
        read_only=True,
    )

    class Meta:
        model = Algorithm

        fields = (
            "name",
            "slug",
            "description",
            "problem",
            "best_case_complexity",
            "average_case_complexity",
            "worst_case_complexity",
            "space_complexity",
            "implementations",
        )