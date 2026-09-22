from django.shortcuts import get_object_or_404
from rest_framework import serializers
from rest_framework.decorators import api_view
from rest_framework.response import Response

from core.models import AlgorithmImplementation
from .models import ImplementationReview, RATING_FIELDS, TEXT_FIELDS


class RatingField(serializers.IntegerField):
    def to_internal_value(self, data):
        if type(data) is not int:
            self.fail("invalid")
        return super().to_internal_value(data)


class NoteField(serializers.CharField):
    def to_internal_value(self, data):
        if not isinstance(data, str):
            self.fail("invalid")
        return super().to_internal_value(data)


class ReviewInputSerializer(serializers.Serializer):
    def get_fields(self):
        return {
            **{key: RatingField(min_value=1, max_value=5, allow_null=True) for key in RATING_FIELDS},
            **{key: NoteField(allow_blank=True, max_length=5000, trim_whitespace=False) for key in TEXT_FIELDS},
        }

    def to_internal_value(self, data):
        if isinstance(data, dict):
            unknown = set(data) - set(self.fields)
            if unknown:
                raise serializers.ValidationError({key: ["Unknown or read-only field."] for key in unknown})
        return super().to_internal_value(data)


class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = ImplementationReview
        fields = ("implementation_id", *RATING_FIELDS, *TEXT_FIELDS, "updated_at")
        read_only_fields = fields


@api_view(["GET", "PUT"])
def implementation_review(request, implementation_id):
    implementation = get_object_or_404(
        AlgorithmImplementation, pk=implementation_id, is_active=True,
        source_type=AlgorithmImplementation.SourceType.BUILT_IN,
        algorithm__problem__slug="sorting",
    )
    if request.method == "GET":
        # Reading an untouched implementation must not create a database record.
        review = ImplementationReview.objects.filter(implementation=implementation).first()
        if review is None:
            review = ImplementationReview(implementation=implementation)
        return Response(ReviewSerializer(review).data)

    serializer = ReviewInputSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    review, created = ImplementationReview.objects.update_or_create(
        implementation=implementation, defaults=serializer.validated_data,
    )
    return Response(ReviewSerializer(review).data, status=201 if created else 200)
