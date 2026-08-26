from django.urls import path

from .views import WatchlistCollection, WatchlistItemDetail


urlpatterns = [
    path("", WatchlistCollection.as_view(), name="watchlist-collection"),
    path(
        "<int:movie_id>/",
        WatchlistItemDetail.as_view(),
        name="watchlist-item-detail",
    ),
]
