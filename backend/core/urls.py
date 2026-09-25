from django.urls import path

from .views import AlgorithmListAPIView, health_check
from .benchmarks.api import bubble_sort_benchmark
from .experiments.api import ExperimentCreateAPIView, ExperimentDetailAPIView
from .custom_python.api import validate_custom_python


urlpatterns = [
    path("implementations/validate-python/", validate_custom_python, name="validate-custom-python"),
    path("experiments/", ExperimentCreateAPIView.as_view(), name="experiment-create"),
    path("experiments/<int:pk>/", ExperimentDetailAPIView.as_view(), name="experiment-detail"),
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
