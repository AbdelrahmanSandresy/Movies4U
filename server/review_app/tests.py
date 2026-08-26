from rest_framework import status
from rest_framework.test import APITestCase

from movie_app.models import Movie
from user_app.models import AppUser

from .models import Review


class ReviewCrudTests(APITestCase):
    def setUp(self):
        self.user = AppUser.objects.create_user(
            email="reviewer@example.com",
            password="strong-test-password",
        )
        self.other_user = AppUser.objects.create_user(
            email="other-reviewer@example.com",
            password="strong-test-password",
        )
        self.movie = Movie.objects.create(
            tmdb_id=603,
            title="The Matrix",
            release_date="1999-03-31",
        )
        self.client.force_authenticate(self.user)

    def review_payload(self):
        return {
            "movie": {
                "id": self.movie.tmdb_id,
                "title": self.movie.title,
                "overview": "A computer hacker discovers the truth.",
                "poster_path": "",
                "release_date": self.movie.release_date,
                "vote_average": 8.2,
                "original_language": "en",
            },
            "rating": 9,
            "review_text": "A landmark science-fiction movie.",
        }

    def test_authenticated_user_can_create_read_update_and_delete_review(self):
        create_response = self.client.post(
            "/api/v1/reviews/",
            self.review_payload(),
            format="json",
        )
        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(create_response.data["is_owner"])
        review_id = create_response.data["id"]

        list_response = self.client.get(
            f"/api/v1/reviews/?movie_id={self.movie.tmdb_id}"
        )
        self.assertEqual(list_response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(list_response.data), 1)

        update_response = self.client.patch(
            f"/api/v1/reviews/{review_id}/",
            {"rating": 10, "review_text": "Still an all-time favorite."},
            format="json",
        )
        self.assertEqual(update_response.status_code, status.HTTP_200_OK)
        self.assertEqual(update_response.data["rating"], 10)

        delete_response = self.client.delete(f"/api/v1/reviews/{review_id}/")
        self.assertEqual(delete_response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Review.objects.exists())

    def test_user_cannot_change_or_delete_another_users_review(self):
        review = Review.objects.create(
            user=self.other_user,
            movie=self.movie,
            rating=8,
            review_text="A very good movie.",
        )

        update_response = self.client.patch(
            f"/api/v1/reviews/{review.id}/",
            {"rating": 1},
            format="json",
        )
        delete_response = self.client.delete(f"/api/v1/reviews/{review.id}/")

        self.assertEqual(update_response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(delete_response.status_code, status.HTTP_403_FORBIDDEN)
        review.refresh_from_db()
        self.assertEqual(review.rating, 8)

    def test_user_can_only_create_one_review_per_movie(self):
        Review.objects.create(
            user=self.user,
            movie=self.movie,
            rating=8,
            review_text="First review.",
        )

        response = self.client.post(
            "/api/v1/reviews/",
            self.review_payload(),
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_409_CONFLICT)
