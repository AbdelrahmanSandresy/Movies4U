from django.urls import path

from .views import ReviewCollection, ReviewDetail


urlpatterns = [
    path("", ReviewCollection.as_view(), name="review-collection"),
    path("<int:review_id>/", ReviewDetail.as_view(), name="review-detail"),
]
