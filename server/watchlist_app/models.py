from django.conf import settings
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models

from movie_app.models import Movie


class WatchlistItem(models.Model):
    class Status(models.TextChoices):
        WANT_TO_WATCH = "want_to_watch", "Want to watch"
        WATCHING = "watching", "Watching"
        WATCHED = "watched", "Watched"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="watchlist_items",
    )
    movie = models.ForeignKey(
        Movie,
        on_delete=models.CASCADE,
        related_name="watchlist_items",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.WANT_TO_WATCH,
    )
    personal_rating = models.PositiveSmallIntegerField(
        null=True,
        blank=True,
        validators=[MinValueValidator(1), MaxValueValidator(10)],
    )
    notes = models.TextField(blank=True, max_length=1000)

    class Meta:
        ordering = ["-created_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["user", "movie"],
                name="unique_user_movie_watchlist_item",
            )
        ]

    def __str__(self):
        return f"{self.user.email}: {self.movie.title}"
