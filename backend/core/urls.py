from django.urls import path

from .views import AlgorithmListAPIView, health_check


urlpatterns = [
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