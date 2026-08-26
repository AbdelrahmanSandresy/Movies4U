from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager


class AppUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Email is required")

        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.full_clean()
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_active", True)
        return self.create_user(email, password, **extra_fields)


class AppUser(AbstractUser):
    username = None

    email = models.EmailField(
        verbose_name="email address",
        max_length=255,
        unique=True,
    )

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    watchlist = models.ManyToManyField(
        "movie_app.Movie",
        through="watchlist_app.WatchlistItem",
        related_name="watchlisted_by",
        blank=True,
    )

    objects = AppUserManager()
