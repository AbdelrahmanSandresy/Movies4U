from rest_framework import serializers

from .models import Review


class ReviewMovieSerializer(serializers.Serializer):
    id = serializers.IntegerField(min_value=1)
    title = serializers.CharField(max_length=255)
    overview = serializers.CharField(required=False, allow_blank=True)
    poster_path = serializers.CharField(
        required=False,
        allow_blank=True,
        max_length=255,
    )
    release_date = serializers.CharField(
        required=False,
        allow_blank=True,
        max_length=10,
    )
    vote_average = serializers.FloatField(required=False, allow_null=True)
    original_language = serializers.CharField(
        required=False,
        allow_blank=True,
        max_length=10,
    )


class ReviewCreateSerializer(serializers.Serializer):
    movie = ReviewMovieSerializer()
    rating = serializers.IntegerField(min_value=1, max_value=10)
    review_text = serializers.CharField(max_length=2000)


class ReviewUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ("rating", "review_text")


class ReviewSerializer(serializers.ModelSerializer):
    movie_id = serializers.IntegerField(source="movie.tmdb_id", read_only=True)
    movie_title = serializers.CharField(source="movie.title", read_only=True)
    author = serializers.EmailField(source="user.email", read_only=True)
    is_owner = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = (
            "id",
            "movie_id",
            "movie_title",
            "author",
            "rating",
            "review_text",
            "is_owner",
            "created_at",
            "updated_at",
        )

    def get_is_owner(self, review):
        request = self.context.get("request")
        return bool(request and request.user == review.user)
