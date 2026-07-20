from django.db import models


class Problem(models.Model):
    name = models.CharField(
        max_length=100,
        unique=True,
    )

    slug = models.SlugField(
        max_length=100,
        unique=True,
    )

    description = models.TextField(
        blank=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class Algorithm(models.Model):
    problem = models.ForeignKey(
        Problem,
        on_delete=models.CASCADE,
        related_name="algorithms",
    )

    name = models.CharField(
        max_length=100,
    )

    slug = models.SlugField(
        max_length=100,
    )

    description = models.TextField(
        blank=True,
    )

    best_case_complexity = models.CharField(
        max_length=50,
        blank=True,
    )

    average_case_complexity = models.CharField(
        max_length=50,
        blank=True,
    )

    worst_case_complexity = models.CharField(
        max_length=50,
        blank=True,
    )

    space_complexity = models.CharField(
        max_length=50,
        blank=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        ordering = ["name"]

        constraints = [
            models.UniqueConstraint(
                fields=["problem", "slug"],
                name="unique_algorithm_slug_per_problem",
            ),
        ]

    def __str__(self):
        return f"{self.name} ({self.problem.name})"


class AlgorithmImplementation(models.Model):
    class Language(models.TextChoices):
        PYTHON = "python", "Python"

    class SourceType(models.TextChoices):
        BUILT_IN = "built_in", "Built-in"
        CUSTOM = "custom", "Custom"

    algorithm = models.ForeignKey(
        Algorithm,
        on_delete=models.CASCADE,
        related_name="implementations",
    )

    name = models.CharField(
        max_length=100,
    )

    slug = models.SlugField(
        max_length=100,
    )

    language = models.CharField(
        max_length=20,
        choices=Language.choices,
        default=Language.PYTHON,
    )

    source_type = models.CharField(
        max_length=20,
        choices=SourceType.choices,
        default=SourceType.BUILT_IN,
    )

    registry_key = models.CharField(
        max_length=150,
        unique=True,
        blank=True,
        null=True,
        help_text=(
            "Το μοναδικό key που θα συνδέει την εγγραφή "
            "με built-in Python implementation."
        ),
    )

    description = models.TextField(
        blank=True,
    )

    is_reference = models.BooleanField(
        default=False,
    )

    is_active = models.BooleanField(
        default=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        ordering = ["algorithm__name", "name"]

        constraints = [
            models.UniqueConstraint(
                fields=["algorithm", "slug"],
                name="unique_implementation_slug_per_algorithm",
            ),
        ]

    def __str__(self):
        return f"{self.algorithm.name} — {self.name}"