from django.urls import path
from .api import implementation_review

urlpatterns = [
    path("implementations/<int:implementation_id>/review/", implementation_review, name="implementation-review"),
]
