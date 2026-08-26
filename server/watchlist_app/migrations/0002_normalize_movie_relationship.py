import django.db.models.deletion
from django.db import migrations, models


def create_movies_from_watchlist(apps, schema_editor):
    Movie = apps.get_model("movie_app", "Movie")
    WatchlistItem = apps.get_model("watchlist_app", "WatchlistItem")

    for item in WatchlistItem.objects.all().iterator():
        movie, _ = Movie.objects.update_or_create(
            tmdb_id=item.tmdb_id,
            defaults={
                "title": item.title,
                "overview": item.overview or "",
                "poster_path": item.poster_path or "",
                "release_date": item.release_date or "",
                "vote_average": item.vote_average,
                "original_language": item.original_language or "",
            },
        )
        item.movie_id = movie.id
        item.save(update_fields=["movie"])


def restore_watchlist_movie_fields(apps, schema_editor):
    WatchlistItem = apps.get_model("watchlist_app", "WatchlistItem")

    for item in WatchlistItem.objects.select_related("movie").all().iterator():
        movie = item.movie
        item.tmdb_id = movie.tmdb_id
        item.title = movie.title
        item.overview = movie.overview
        item.poster_path = movie.poster_path
        item.release_date = movie.release_date
        item.vote_average = movie.vote_average
        item.original_language = movie.original_language
        item.save(
            update_fields=[
                "tmdb_id",
                "title",
                "overview",
                "poster_path",
                "release_date",
                "vote_average",
                "original_language",
            ]
        )


class Migration(migrations.Migration):

    dependencies = [
        ("movie_app", "0001_initial"),
        ("watchlist_app", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="watchlistitem",
            name="movie",
            field=models.ForeignKey(
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name="watchlist_items",
                to="movie_app.movie",
            ),
        ),
        migrations.AlterField(
            model_name="watchlistitem",
            name="tmdb_id",
            field=models.PositiveIntegerField(null=True),
        ),
        migrations.AlterField(
            model_name="watchlistitem",
            name="title",
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
        migrations.AlterField(
            model_name="watchlistitem",
            name="overview",
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name="watchlistitem",
            name="poster_path",
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
        migrations.AlterField(
            model_name="watchlistitem",
            name="release_date",
            field=models.CharField(blank=True, max_length=10, null=True),
        ),
        migrations.AlterField(
            model_name="watchlistitem",
            name="original_language",
            field=models.CharField(blank=True, max_length=10, null=True),
        ),
        migrations.RunPython(
            create_movies_from_watchlist,
            restore_watchlist_movie_fields,
        ),
        migrations.RemoveConstraint(
            model_name="watchlistitem",
            name="unique_user_tmdb_watchlist_item",
        ),
        migrations.RemoveField(
            model_name="watchlistitem",
            name="tmdb_id",
        ),
        migrations.RemoveField(
            model_name="watchlistitem",
            name="title",
        ),
        migrations.RemoveField(
            model_name="watchlistitem",
            name="overview",
        ),
        migrations.RemoveField(
            model_name="watchlistitem",
            name="poster_path",
        ),
        migrations.RemoveField(
            model_name="watchlistitem",
            name="release_date",
        ),
        migrations.RemoveField(
            model_name="watchlistitem",
            name="vote_average",
        ),
        migrations.RemoveField(
            model_name="watchlistitem",
            name="original_language",
        ),
        migrations.AlterField(
            model_name="watchlistitem",
            name="movie",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name="watchlist_items",
                to="movie_app.movie",
            ),
        ),
        migrations.AddConstraint(
            model_name="watchlistitem",
            constraint=models.UniqueConstraint(
                fields=("user", "movie"),
                name="unique_user_movie_watchlist_item",
            ),
        ),
    ]
