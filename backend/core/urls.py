from django.urls import path

from .views import AlgorithmListAPIView, health_check
from .benchmarks.api import bubble_sort_benchmark


urlpatterns = [
    path("benchmarks/bubble-sort/", bubble_sort_benchmark, name="bubble-sort-benchmark"),
    path(
        "health/",
        health_check,
        name="health",
    ),
    path(
        "algorithms/",
        AlgorithmListAPIView.as_view(),
        name="algorithm-list",
    ),
]
