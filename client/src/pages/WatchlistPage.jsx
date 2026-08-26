import { useState } from "react"
import { useLoaderData, useNavigate } from "react-router-dom"

import MovieCard from "../components/MovieCard"
import { removeFromWatchlist, updateWatchlistItem } from "../utilites"


const WatchlistPage = () => {
    const initialMovies = useLoaderData()
    const navigate = useNavigate()
    const [movies, setMovies] = useState(initialMovies)
    const [removingId, setRemovingId] = useState(null)
    const [savingId, setSavingId] = useState(null)
    const [savedId, setSavedId] = useState(null)
    const [error, setError] = useState("")
    const [drafts, setDrafts] = useState(() => Object.fromEntries(
        initialMovies.map((movie) => [
            movie.id,
            {
                status: movie.status || "want_to_watch",
                personal_rating: movie.personal_rating ?? "",
                notes: movie.notes || "",
            },
        ])
    ))

    const handleDraftChange = (movieId, field, value) => {
        setDrafts((currentDrafts) => ({
            ...currentDrafts,
            [movieId]: {
                ...currentDrafts[movieId],
                [field]: value,
            },
        }))
        setSavedId(null)
    }

    const handleSave = async (movieId) => {
        setSavingId(movieId)
        setSavedId(null)
        setError("")

        try {
            const draft = drafts[movieId]
            const updatedMovie = await updateWatchlistItem(movieId, {
                ...draft,
                personal_rating: draft.personal_rating === ""
                    ? null
                    : Number(draft.personal_rating),
            })
            setMovies((currentMovies) => currentMovies.map((movie) => (
                movie.id === movieId ? updatedMovie : movie
            )))
            setSavedId(movieId)
        } catch (requestError) {
            console.error(requestError)
            setError("Unable to save your watchlist changes.")
        } finally {
            setSavingId(null)
        }
    }

    const handleRemove = async (movieId) => {
        setRemovingId(movieId)
        setError("")

        try {
            await removeFromWatchlist(movieId)
            setMovies((currentMovies) => (
                currentMovies.filter((movie) => movie.id !== movieId)
            ))
        } catch (requestError) {
            console.error(requestError)
            setError("Unable to remove that movie from your watchlist.")
        } finally {
            setRemovingId(null)
        }
    }

    return (
        <main className="watchlist-page">
            <div className="wrapper">
                <header className="watchlist-header">
                    <div>
                        <p className="eyebrow">Your saved movies</p>
                        <h1>My Watchlist</h1>
                    </div>
                    <button
                        type="button"
                        className="nav-button"
                        onClick={() => navigate("/home")}
                    >
                        Back to Search
                    </button>
                </header>

                {error && (
                    <p className="watchlist-message error" role="alert">
                        {error}
                    </p>
                )}

                {movies.length === 0 ? (
                    <section className="empty-watchlist">
                        <h2>Your watchlist is empty</h2>
                        <p>Search for a movie and add it from the details page.</p>
                        <button
                            type="button"
                            className="nav-button"
                            onClick={() => navigate("/home")}
                        >
                            Find Movies
                        </button>
                    </section>
                ) : (
                    <section className="all-movies">
                        <ul>
                            {movies.map((movie) => (
                                <li className="watchlist-entry" key={movie.id}>
                                    <MovieCard movie={movie} />
                                    <div className="watchlist-editor">
                                        <label>
                                            Status
                                            <select
                                                value={drafts[movie.id].status}
                                                onChange={(event) => handleDraftChange(
                                                    movie.id,
                                                    "status",
                                                    event.target.value,
                                                )}
                                            >
                                                <option value="want_to_watch">Want to watch</option>
                                                <option value="watching">Watching</option>
                                                <option value="watched">Watched</option>
                                            </select>
                                        </label>
                                        <label>
                                            Your rating (1–10)
                                            <input
                                                type="number"
                                                min="1"
                                                max="10"
                                                value={drafts[movie.id].personal_rating}
                                                onChange={(event) => handleDraftChange(
                                                    movie.id,
                                                    "personal_rating",
                                                    event.target.value,
                                                )}
                                            />
                                        </label>
                                        <label>
                                            Notes
                                            <textarea
                                                maxLength="1000"
                                                rows="3"
                                                value={drafts[movie.id].notes}
                                                onChange={(event) => handleDraftChange(
                                                    movie.id,
                                                    "notes",
                                                    event.target.value,
                                                )}
                                            />
                                        </label>
                                        <button
                                            type="button"
                                            className="save-watchlist-button"
                                            disabled={savingId === movie.id}
                                            onClick={() => handleSave(movie.id)}
                                        >
                                            {savingId === movie.id
                                                ? "Saving..."
                                                : savedId === movie.id
                                                    ? "Saved"
                                                    : "Save Changes"}
                                        </button>
                                    </div>
                                    <button
                                        type="button"
                                        className="remove-button"
                                        disabled={removingId === movie.id}
                                        onClick={() => handleRemove(movie.id)}
                                    >
                                        {removingId === movie.id
                                            ? "Removing..."
                                            : "Remove"}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </section>
                )}
            </div>
        </main>
    )
}

export default WatchlistPage
