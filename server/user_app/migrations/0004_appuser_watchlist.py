from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("movie_app", "0001_initial"),
        ("user_app", "0003_alter_appuser_managers"),
        ("watchlist_app", "0002_normalize_movie_relationship"),
    ]

    operations = [
        migrations.AddField(
            model_name="appuser",
            name="watchlist",
            field=models.ManyToManyField(
                blank=True,
                related_name="watchlisted_by",
                through="watchlist_app.WatchlistItem",
                to="movie_app.movie",
            ),
        ),
    ]
