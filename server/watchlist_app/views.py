from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from movie_app.models import Movie

from .models import WatchlistItem
from .serializers import WatchlistItemSerializer, WatchlistItemUpdateSerializer


class WatchlistCollection(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        items = WatchlistItem.objects.filter(
            user=request.user
        ).select_related("movie")
        return Response(WatchlistItemSerializer(items, many=True).data)

    def post(self, request):
        serializer = WatchlistItemSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        movie_data = dict(serializer.validated_data)
        tmdb_id = movie_data.pop("id")
        watchlist_defaults = {
            "status": movie_data.pop("status", WatchlistItem.Status.WANT_TO_WATCH),
            "personal_rating": movie_data.pop("personal_rating", None),
            "notes": movie_data.pop("notes", ""),
        }
        movie, _ = Movie.objects.update_or_create(
            tmdb_id=tmdb_id,
            defaults=movie_data,
        )
        item, created = WatchlistItem.objects.get_or_create(
            user=request.user,
            movie=movie,
            defaults=watchlist_defaults,
        )

        return Response(
            WatchlistItemSerializer(item).data,
            status=(
                status.HTTP_201_CREATED
                if created
                else status.HTTP_200_OK
            ),
        )


class WatchlistItemDetail(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, request, movie_id):
        return get_object_or_404(
            WatchlistItem,
            user=request.user,
            movie__tmdb_id=movie_id,
        )

    def get(self, request, movie_id):
        item = self.get_object(request, movie_id)
        return Response(WatchlistItemSerializer(item).data)

    def put(self, request, movie_id):
        return self.update(request, movie_id)

    def patch(self, request, movie_id):
        return self.update(request, movie_id, partial=True)

    def update(self, request, movie_id, partial=False):
        item = self.get_object(request, movie_id)
        serializer = WatchlistItemUpdateSerializer(
            item,
            data=request.data,
            partial=partial,
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(WatchlistItemSerializer(item).data)

    def delete(self, request, movie_id):
        item = self.get_object(request, movie_id)
        item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
