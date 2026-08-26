import { useState } from "react"
import { useLoaderData, useNavigate } from "react-router-dom"

import {
    addToWatchlist,
    createReview,
    deleteReview,
    removeFromWatchlist,
    updateReview,
} from "../utilites"

const MovieDetailsPage = () => {
    const { movie, watchlistItem, reviews: initialReviews } = useLoaderData()
    const navigate = useNavigate()
    const [isSaved, setIsSaved] = useState(Boolean(watchlistItem))
    const [saving, setSaving] = useState(false)
    const [watchlistError, setWatchlistError] = useState("")
    const initialOwnReview = initialReviews.find((review) => review.is_owner)
    const [reviews, setReviews] = useState(initialReviews)
    const [reviewRating, setReviewRating] = useState(
        initialOwnReview ? String(initialOwnReview.rating) : ""
    )
    const [reviewText, setReviewText] = useState(
        initialOwnReview?.review_text || ""
    )
    const [reviewSaving, setReviewSaving] = useState(false)
    const [reviewDeleting, setReviewDeleting] = useState(false)
    const [reviewError, setReviewError] = useState("")
    const [reviewMessage, setReviewMessage] = useState("")
    const ownReview = reviews.find((review) => review.is_owner)
    const posterUrl = movie.poster_path
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : "/no-movie.png"
    const backdropUrl = movie.backdrop_path
        ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
        : posterUrl

    const handleWatchlist = async () => {
        setSaving(true)
        setWatchlistError("")

        try {
            if (isSaved) {
                await removeFromWatchlist(movie.id)
                setIsSaved(false)
            } else {
                await addToWatchlist(movie)
                setIsSaved(true)
            }
        } catch (error) {
            console.error(error)
            setWatchlistError("Unable to update your watchlist.")
        } finally {
            setSaving(false)
        }
    }

    const handleReviewSubmit = async (event) => {
        event.preventDefault()
        setReviewSaving(true)
        setReviewError("")
        setReviewMessage("")

        try {
            const rating = Number(reviewRating)
            const savedReview = ownReview
                ? await updateReview(ownReview.id, {
                    rating,
                    review_text: reviewText,
                })
                : await createReview(movie, rating, reviewText)

            setReviews((currentReviews) => ownReview
                ? currentReviews.map((review) => (
                    review.id === savedReview.id ? savedReview : review
                ))
                : [savedReview, ...currentReviews]
            )
            setReviewRating(String(savedReview.rating))
            setReviewText(savedReview.review_text)
            setReviewMessage(ownReview ? "Review updated." : "Review added.")
        } catch (error) {
            console.error(error)
            setReviewError(
                error.response?.data?.detail || "Unable to save your review."
            )
        } finally {
            setReviewSaving(false)
        }
    }

    const handleReviewDelete = async () => {
        if (!ownReview) return

        setReviewDeleting(true)
        setReviewError("")
        setReviewMessage("")

        try {
            await deleteReview(ownReview.id)
            setReviews((currentReviews) => (
                currentReviews.filter((review) => review.id !== ownReview.id)
            ))
            setReviewRating("")
            setReviewText("")
            setReviewMessage("Review deleted.")
        } catch (error) {
            console.error(error)
            setReviewError("Unable to delete your review.")
        } finally {
            setReviewDeleting(false)
        }
    }

    return (
        <main className="movie-detail-page">
            <div
                className="backdrop"
                style={{ backgroundImage: `url(${backdropUrl})` }}
                aria-hidden="true"
            />

            <button
                type="button"
                className="back-button"
                onClick={() => navigate(-1)}
            >
                ← Back
            </button>

            <div className="wrapper">
                <section className="movie-info">
                    <div className="detail-layout">
                        <img
                            className="detail-poster"
                            src={posterUrl}
                            alt={`${movie.title} poster`}
                        />

                        <div className="detail-copy">
                            <h1>{movie.title}</h1>

                            <div className="meta-info">
                                <span className="pill rating">
                                    ★ {movie.vote_average?.toFixed(1) ?? "N/A"}
                                </span>
                                <span className="pill">
                                    {movie.release_date || "Release date unknown"}
                                </span>
                                <span className="pill">
                                    {movie.runtime
                                        ? `${movie.runtime} minutes`
                                        : "Runtime unknown"}
                                </span>
                                {movie.status && (
                                    <span className="pill">{movie.status}</span>
                                )}
                            </div>

                            <p className="overview">
                                {movie.overview || "No overview is available."}
                            </p>

                            <div className="info-grid">
                                <div>
                                    <h3>Movie Information</h3>
                                    <dl className="details-list">
                                        <div>
                                            <dt>Original language</dt>
                                            <dd>
                                                {movie.original_language?.toUpperCase() || "Unknown"}
                                            </dd>
                                        </div>
                                        <div>
                                            <dt>Release date</dt>
                                            <dd>{movie.release_date || "Unknown"}</dd>
                                        </div>
                                        <div>
                                            <dt>Runtime</dt>
                                            <dd>
                                                {movie.runtime
                                                    ? `${movie.runtime} minutes`
                                                    : "Unknown"}
                                            </dd>
                                        </div>
                                    </dl>
                                </div>

                                <div>
                                    <h3>Genres</h3>
                                    <div className="genre-list">
                                        {movie.genres?.length ? (
                                            movie.genres.map((genre) => (
                                                <span className="tag" key={genre}>
                                                    {genre}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="tag">Unknown</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <button
                                type="button"
                                className={`watchlist-button${isSaved ? " saved" : ""}`}
                                disabled={saving}
                                aria-pressed={isSaved}
                                onClick={handleWatchlist}
                            >
                                {saving
                                    ? "Updating..."
                                    : isSaved
                                        ? "Remove from Watchlist"
                                        : "Add to Watchlist"}
                            </button>
                            {watchlistError && (
                                <p className="watchlist-error" role="alert">
                                    {watchlistError}
                                </p>
                            )}
                        </div>
                    </div>

                    <section className="reviews-section">
                        <div className="review-form-panel">
                            <p className="eyebrow">Your opinion</p>
                            <h2>{ownReview ? "Edit Your Review" : "Review This Movie"}</h2>
                            <form className="review-form" onSubmit={handleReviewSubmit}>
                                <label htmlFor="review-rating">Rating</label>
                                <select
                                    id="review-rating"
                                    required
                                    value={reviewRating}
                                    onChange={(event) => setReviewRating(event.target.value)}
                                >
                                    <option value="">Choose 1–10</option>
                                    {Array.from({ length: 10 }, (_, index) => index + 1).map(
                                        (rating) => (
                                            <option key={rating} value={rating}>
                                                {rating}/10
                                            </option>
                                        )
                                    )}
                                </select>

                                <label htmlFor="review-text">Review</label>
                                <textarea
                                    id="review-text"
                                    required
                                    maxLength="2000"
                                    rows="5"
                                    value={reviewText}
                                    onChange={(event) => setReviewText(event.target.value)}
                                    placeholder="What did you think of this movie?"
                                />

                                <div className="review-form-actions">
                                    <button
                                        type="submit"
                                        className="review-submit-button"
                                        disabled={reviewSaving || reviewDeleting}
                                    >
                                        {reviewSaving
                                            ? "Saving..."
                                            : ownReview
                                                ? "Update Review"
                                                : "Add Review"}
                                    </button>
                                    {ownReview && (
                                        <button
                                            type="button"
                                            className="review-delete-button"
                                            disabled={reviewSaving || reviewDeleting}
                                            onClick={handleReviewDelete}
                                        >
                                            {reviewDeleting ? "Deleting..." : "Delete Review"}
                                        </button>
                                    )}
                                </div>
                            </form>
                            {reviewError && (
                                <p className="review-message error" role="alert">
                                    {reviewError}
                                </p>
                            )}
                            {reviewMessage && (
                                <p className="review-message success" role="status">
                                    {reviewMessage}
                                </p>
                            )}
                        </div>

                        <div className="review-list-panel">
                            <p className="eyebrow">Community</p>
                            <h2>Movie Reviews</h2>
                            {reviews.length === 0 ? (
                                <p className="no-reviews">No reviews yet. Be the first.</p>
                            ) : (
                                <ul className="review-list">
                                    {reviews.map((review) => (
                                        <li key={review.id}>
                                            <div className="review-heading">
                                                <strong>{review.author}</strong>
                                                <span>★ {review.rating}/10</span>
                                            </div>
                                            <p>{review.review_text}</p>
                                            <small>
                                                {new Date(review.updated_at).toLocaleDateString()}
                                                {review.is_owner ? " · Your review" : ""}
                                            </small>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </section>
                </section>
            </div>
        </main>
    )
}

export default MovieDetailsPage
