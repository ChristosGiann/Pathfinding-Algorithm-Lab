from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models


RATING_FIELDS = ("performance", "readability", "simplicity", "reliability", "learning_value", "overall")
TEXT_FIELDS = ("strengths", "weaknesses", "use_cases", "notes")


def rating_field():
    return models.PositiveSmallIntegerField(
        null=True, blank=True, validators=[MinValueValidator(1), MaxValueValidator(5)],
    )


class ImplementationReview(models.Model):
    """One subjective review per implementation in the single-user local MVP."""

    implementation = models.OneToOneField(
        "core.AlgorithmImplementation", on_delete=models.CASCADE, related_name="review",
    )
    performance = rating_field()
    readability = rating_field()
    simplicity = rating_field()
    reliability = rating_field()
    learning_value = rating_field()
    overall = rating_field()
    strengths = models.TextField(blank=True, max_length=5000)
    weaknesses = models.TextField(blank=True, max_length=5000)
    use_cases = models.TextField(blank=True, max_length=5000)
    notes = models.TextField(blank=True, max_length=5000)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.CheckConstraint(
                condition=models.Q(**{f"{field}__isnull": True}) | models.Q(**{f"{field}__range": (1, 5)}),
                name=f"review_{field}_1_to_5",
            ) for field in RATING_FIELDS
        ]
