from django.urls import path

from .views import MovieDetail, MovieSearch


urlpatterns = [
    path("search/", MovieSearch.as_view(), name="movie-search"),
    path("<int:movie_id>/", MovieDetail.as_view(), name="movie-detail"),
]
