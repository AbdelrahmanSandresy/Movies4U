import requests

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .services.tmdb import (
    TmdbConfigurationError,
    get_movie_details,
    search_movies,
)


class MovieSearch(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        query = request.query_params.get("q", "").strip()

        if not query:
            return Response(
                {"detail": "A search query is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            page = int(request.query_params.get("page", 1))
            if page < 1:
                raise ValueError
        except (TypeError, ValueError):
            return Response(
                {"detail": "Page must be a positive integer."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            data = search_movies(query, page)
        except TmdbConfigurationError:
            return Response(
                {"detail": "TMDB is not configured on the server."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
        except requests.Timeout:
            return Response(
                {"detail": "TMDB timed out."},
                status=status.HTTP_504_GATEWAY_TIMEOUT,
            )
        except requests.RequestException:
            return Response(
                {"detail": "Unable to contact TMDB."},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        movies = [
            {
                "id": movie["id"],
                "title": movie.get("title"),
                "overview": movie.get("overview"),
                "poster_path": movie.get("poster_path"),
                "release_date": movie.get("release_date"),
                "vote_average": movie.get("vote_average"),
                "original_language": movie.get("original_language", ""),
            }
            for movie in data.get("results", [])
        ]

        return Response(
            {
                "page": data.get("page"),
                "total_pages": data.get("total_pages"),
                "results": movies,
            }
        )


class MovieDetail(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, movie_id):
        try:
            movie = get_movie_details(movie_id)

        except TmdbConfigurationError:
            return Response(
                {"detail": "TMDB is not configured on the server."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        except requests.Timeout:
            return Response(
                {"detail": "TMDB timed out."},
                status=status.HTTP_504_GATEWAY_TIMEOUT,
            )

        except requests.HTTPError as error:
            if error.response.status_code == 404:
                return Response(
                    {"detail": "Movie not found."},
                    status=status.HTTP_404_NOT_FOUND,
                )

            return Response(
                {"detail": "TMDB rejected the request."},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        except requests.RequestException:
            return Response(
                {"detail": "Unable to contact TMDB."},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        return Response({
            "id": movie["id"],
            "title": movie.get("title"),
            "overview": movie.get("overview"),
            "poster_path": movie.get("poster_path"),
            "backdrop_path": movie.get("backdrop_path"),
            "release_date": movie.get("release_date"),
            "vote_average": movie.get("vote_average"),
            "original_language": movie.get("original_language"),
            "runtime": movie.get("runtime"),
            "status": movie.get("status"),
            "genres": [
                genre["name"]
                for genre in movie.get("genres", [])
            ],
        })
