from django.contrib import admin

from .models import Algorithm, AlgorithmImplementation, Problem


@admin.register(Problem)
class ProblemAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "slug",
        "created_at",
        "updated_at",
    )

    search_fields = (
        "name",
        "slug",
        "description",
    )

    ordering = ("name",)


@admin.register(Algorithm)
class AlgorithmAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "problem",
        "slug",
        "created_at",
        "updated_at",
    )

    list_filter = (
        "problem",
    )

    search_fields = (
        "name",
        "slug",
        "description",
        "problem__name",
    )

    ordering = (
        "problem__name",
        "name",
    )


@admin.register(AlgorithmImplementation)
class AlgorithmImplementationAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "algorithm",
        "language",
        "source_type",
        "is_reference",
        "is_active",
    )

    list_filter = (
        "language",
        "source_type",
        "is_reference",
        "is_active",
        "algorithm__problem",
        "algorithm",
    )

    search_fields = (
        "name",
        "slug",
        "registry_key",
        "description",
        "algorithm__name",
        "algorithm__problem__name",
    )

    ordering = (
        "algorithm__name",
        "name",
    )