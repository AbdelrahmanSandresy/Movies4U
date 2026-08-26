from unittest.mock import patch

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from user_app.models import AppUser


class MovieApiTests(APITestCase):
    def setUp(self):
        self.user = AppUser.objects.create_user(
            email="movie-fan@example.com",
            password="strong-test-password",
        )
        self.client.force_authenticate(self.user)

    @patch("movie_app.views.search_movies")
    def test_authenticated_user_can_search_for_movies(self, mock_search_movies):
        mock_search_movies.return_value = {
            "page": 1,
            "total_pages": 1,
            "results": [
                {
                    "id": 603,
                    "title": "The Matrix",
                    "overview": "A hacker discovers the truth about reality.",
                    "poster_path": "/matrix.jpg",
                    "release_date": "1999-03-31",
                    "vote_average": 8.2,
                    "original_language": "en",
                }
            ],
        }

        response = self.client.get(
            reverse("movie-search"),
            {"q": "Matrix", "page": 1},
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        mock_search_movies.assert_called_once_with("Matrix", 1)
        self.assertEqual(response.data["page"], 1)
        self.assertEqual(response.data["total_pages"], 1)
        self.assertEqual(len(response.data["results"]), 1)
        self.assertEqual(response.data["results"][0]["id"], 603)
        self.assertEqual(response.data["results"][0]["title"], "The Matrix")

    @patch("movie_app.views.get_movie_details")
    def test_authenticated_user_can_get_movie_details(self, mock_get_movie_details):
        mock_get_movie_details.return_value = {
            "id": 603,
            "title": "The Matrix",
            "overview": "A hacker discovers the truth about reality.",
            "poster_path": "/matrix.jpg",
            "backdrop_path": "/matrix-backdrop.jpg",
            "release_date": "1999-03-31",
            "vote_average": 8.2,
            "original_language": "en",
            "runtime": 136,
            "status": "Released",
            "genres": [
                {"id": 28, "name": "Action"},
                {"id": 878, "name": "Science Fiction"},
            ],
        }

        response = self.client.get(reverse("movie-detail", args=[603]))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        mock_get_movie_details.assert_called_once_with(603)
        self.assertEqual(response.data["id"], 603)
        self.assertEqual(response.data["title"], "The Matrix")
        self.assertEqual(response.data["runtime"], 136)
        self.assertEqual(response.data["genres"], ["Action", "Science Fiction"])
