import django.core.validators
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("watchlist_app", "0002_normalize_movie_relationship"),
    ]

    operations = [
        migrations.AddField(
            model_name="watchlistitem",
            name="notes",
            field=models.TextField(blank=True, max_length=1000),
        ),
        migrations.AddField(
            model_name="watchlistitem",
            name="personal_rating",
            field=models.PositiveSmallIntegerField(
                blank=True,
                null=True,
                validators=[
                    django.core.validators.MinValueValidator(1),
                    django.core.validators.MaxValueValidator(10),
                ],
            ),
        ),
        migrations.AddField(
            model_name="watchlistitem",
            name="status",
            field=models.CharField(
                choices=[
                    ("want_to_watch", "Want to watch"),
                    ("watching", "Watching"),
                    ("watched", "Watched"),
                ],
                default="want_to_watch",
                max_length=20,
            ),
        ),
        migrations.AddField(
            model_name="watchlistitem",
            name="updated_at",
            field=models.DateTimeField(auto_now=True),
        ),
    ]
