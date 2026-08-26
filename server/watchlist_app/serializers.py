from rest_framework import serializers

from .models import WatchlistItem


class WatchlistItemSerializer(serializers.Serializer):
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
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)
    status = serializers.ChoiceField(
        choices=("want_to_watch", "watching", "watched"),
        required=False,
        default="want_to_watch",
    )
    personal_rating = serializers.IntegerField(
        min_value=1,
        max_value=10,
        required=False,
        allow_null=True,
    )
    notes = serializers.CharField(
        max_length=1000,
        required=False,
        allow_blank=True,
        default="",
    )

    def to_representation(self, instance):
        movie = instance.movie
        return {
            "id": movie.tmdb_id,
            "title": movie.title,
            "overview": movie.overview,
            "poster_path": movie.poster_path,
            "release_date": movie.release_date,
            "vote_average": movie.vote_average,
            "original_language": movie.original_language,
            "created_at": instance.created_at.isoformat(),
            "updated_at": instance.updated_at.isoformat(),
            "status": instance.status,
            "personal_rating": instance.personal_rating,
            "notes": instance.notes,
        }


class WatchlistItemUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = WatchlistItem
        fields = ("status", "personal_rating", "notes")
        extra_kwargs = {
            "notes": {"required": False, "allow_blank": True},
            "personal_rating": {"required": False, "allow_null": True},
            "status": {"required": False},
        }
