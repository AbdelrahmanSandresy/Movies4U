from rest_framework import status
from rest_framework.test import APITestCase

from movie_app.models import Movie
from user_app.models import AppUser

from .models import WatchlistItem


class WatchlistCrudTests(APITestCase):
    def setUp(self):
        self.user = AppUser.objects.create_user(
            email="movie-fan@example.com",
            password="strong-test-password",
        )
        self.client.force_authenticate(self.user)
        self.movie = Movie.objects.create(
            tmdb_id=550,
            title="Fight Club",
        )

    def test_authenticated_user_can_create_read_update_and_delete_item(self):
        create_response = self.client.post(
            "/api/v1/watchlist/",
            {
                "id": self.movie.tmdb_id,
                "title": self.movie.title,
                "overview": "",
                "poster_path": "",
                "release_date": "1999-10-15",
                "vote_average": 8.4,
                "original_language": "en",
            },
            format="json",
        )
        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(create_response.data["status"], "want_to_watch")

        list_response = self.client.get("/api/v1/watchlist/")
        self.assertEqual(list_response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(list_response.data), 1)

        update_response = self.client.patch(
            f"/api/v1/watchlist/{self.movie.tmdb_id}/",
            {
                "status": "watched",
                "personal_rating": 9,
                "notes": "Worth watching again.",
            },
            format="json",
        )
        self.assertEqual(update_response.status_code, status.HTTP_200_OK)
        self.assertEqual(update_response.data["personal_rating"], 9)
        self.assertEqual(update_response.data["status"], "watched")

        delete_response = self.client.delete(
            f"/api/v1/watchlist/{self.movie.tmdb_id}/"
        )
        self.assertEqual(delete_response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(WatchlistItem.objects.exists())

    def test_user_cannot_access_another_users_watchlist_item(self):
        other_user = AppUser.objects.create_user(
            email="other@example.com",
            password="strong-test-password",
        )
        WatchlistItem.objects.create(user=other_user, movie=self.movie)

        response = self.client.patch(
            f"/api/v1/watchlist/{self.movie.tmdb_id}/",
            {"status": "watched"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
