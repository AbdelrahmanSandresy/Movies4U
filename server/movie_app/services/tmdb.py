import os

import requests


TMDB_BASE_URL = "https://api.themoviedb.org/3"


class TmdbConfigurationError(RuntimeError):
    pass


def search_movies(query, page=1):
    access_token = os.environ.get("TMDB_READ_ACCESS_TOKEN")
    if not access_token:
        raise TmdbConfigurationError(
            "TMDB_READ_ACCESS_TOKEN is not configured."
        )

    response = requests.get(
        f"{TMDB_BASE_URL}/search/movie",
        headers={
            "Authorization": f"Bearer {access_token}",
            "accept": "application/json",
        },
        params={
            "query": query,
            "include_adult": "false",
            "language": "en-US",
            "page": page,
        },
        timeout=8,
    )
    response.raise_for_status()
    return response.json()

def get_movie_details(movie_id):
    access_token = os.environ.get("TMDB_READ_ACCESS_TOKEN")

    if not access_token:
        raise TmdbConfigurationError(
            "TMDB_READ_ACCESS_TOKEN is not configured."
        )

    response = requests.get(
        f"{TMDB_BASE_URL}/movie/{movie_id}",
        headers={
            "Authorization": f"Bearer {access_token}",
            "accept": "application/json",
        },
        params={"language": "en-US"},
        timeout=8,
    )

    response.raise_for_status()
    return response.json()
