from django.db import IntegrityError, transaction
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from movie_app.models import Movie

from .models import Review
from .serializers import (
    ReviewCreateSerializer,
    ReviewSerializer,
    ReviewUpdateSerializer,
)


class ReviewCollection(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        reviews = Review.objects.select_related("user", "movie")
        movie_id = request.query_params.get("movie_id")

        if movie_id is not None:
            try:
                movie_id = int(movie_id)
                if movie_id < 1:
                    raise ValueError
            except (TypeError, ValueError):
                return Response(
                    {"detail": "Movie ID must be a positive integer."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            reviews = reviews.filter(movie__tmdb_id=movie_id)

        serializer = ReviewSerializer(
            reviews,
            many=True,
            context={"request": request},
        )
        return Response(serializer.data)

    def post(self, request):
        serializer = ReviewCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        validated_data = dict(serializer.validated_data)
        movie_data = dict(validated_data.pop("movie"))
        tmdb_id = movie_data.pop("id")

        try:
            with transaction.atomic():
                movie, _ = Movie.objects.update_or_create(
                    tmdb_id=tmdb_id,
                    defaults=movie_data,
                )
                review = Review.objects.create(
                    user=request.user,
                    movie=movie,
                    **validated_data,
                )
        except IntegrityError:
            return Response(
                {"detail": "You have already reviewed this movie."},
                status=status.HTTP_409_CONFLICT,
            )

        return Response(
            ReviewSerializer(review, context={"request": request}).data,
            status=status.HTTP_201_CREATED,
        )


class ReviewDetail(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, review_id):
        return get_object_or_404(
            Review.objects.select_related("user", "movie"),
            id=review_id,
        )

    def require_owner(self, request, review):
        if review.user_id != request.user.id:
            raise PermissionDenied("You can only change your own reviews.")

    def get(self, request, review_id):
        review = self.get_object(review_id)
        return Response(
            ReviewSerializer(review, context={"request": request}).data
        )

    def put(self, request, review_id):
        return self.update(request, review_id)

    def patch(self, request, review_id):
        return self.update(request, review_id, partial=True)

    def update(self, request, review_id, partial=False):
        review = self.get_object(review_id)
        self.require_owner(request, review)
        serializer = ReviewUpdateSerializer(
            review,
            data=request.data,
            partial=partial,
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            ReviewSerializer(review, context={"request": request}).data
        )

    def delete(self, request, review_id):
        review = self.get_object(review_id)
        self.require_owner(request, review)
        review.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
