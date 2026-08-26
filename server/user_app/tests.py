from rest_framework import status
from rest_framework.test import APITestCase

from .models import AppUser


class RegistrationTests(APITestCase):
    def test_existing_email_returns_a_clear_message(self):
        AppUser.objects.create_user(
            email="movie-fan@example.com",
            password="strong-test-password",
        )

        response = self.client.post(
            "/api/v1/user/register/",
            {
                "email": "MOVIE-FAN@example.com",
                "password": "another-strong-password",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_409_CONFLICT)
        self.assertEqual(
            response.data,
            {
                "detail": (
                    "An account with this email already exists. "
                    "Please log in instead."
                )
            },
        )
