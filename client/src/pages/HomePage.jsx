import { useEffect, useState } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";

import MovieCard from "../components/MovieCard";
import Search from "../components/Search";
import { getRandomMovieTrivia, searchMovies, userLogOut } from "../utilites";


const HomePage = () => {
    const {setUser} = useOutletContext()
    const navigate = useNavigate()
    const [searchTerm, setSearchTerm] = useState("")
    const [movies, setMovies] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [trivia, setTrivia] = useState(null)
    const [triviaLoading, setTriviaLoading] = useState(true)
    const [triviaError, setTriviaError] = useState("")
    const [selectedAnswer, setSelectedAnswer] = useState(null)
    const [nextQuestionCooldown, setNextQuestionCooldown] = useState(0)

    useEffect(() => {
        const controller = new AbortController()

        getRandomMovieTrivia(controller.signal)
            .then((randomTrivia) => {
                setTrivia(randomTrivia)
                setTriviaError("")
                setNextQuestionCooldown(5)
            })
            .catch((requestError) => {
                if (requestError.name !== "AbortError") {
                    console.error(requestError)
                    setTriviaError("Movie trivia is unavailable right now.")
                }
            })
            .finally(() => {
                if (!controller.signal.aborted) setTriviaLoading(false)
            })

        return () => controller.abort()
    }, [])

    useEffect(() => {
        if (nextQuestionCooldown <= 0) return undefined

        const timeout = setTimeout(() => {
            setNextQuestionCooldown((current) => Math.max(0, current - 1))
        }, 1000)

        return () => clearTimeout(timeout)
    }, [nextQuestionCooldown])

    useEffect(() => {
        const query = searchTerm.trim()
        if (!query) return

        let active = true
        const timeout = setTimeout(async () => {
            setLoading(true)
            setError("")

            try {
                const data = await searchMovies(query)
                if (active) setMovies(data.results)
            } catch (requestError) {
                console.error(requestError)
                if (active) {
                    setError("Unable to search for movies.")
                    setMovies([])
                }
            } finally {
                if (active) setLoading(false)
            }
        }, 400)

        return () => {
            active = false
            clearTimeout(timeout)
        }
    }, [searchTerm])

    const handleSearchTermChange = (value) => {
        setSearchTerm(value)
        if (!value.trim()) {
            setMovies([])
            setError("")
            setLoading(false)
        }
    }

    const handleLogOut=async()=>{
        setUser(await userLogOut());
        navigate('/')
        
    }

    const handleNewTrivia = async () => {
        setTriviaLoading(true)
        setTriviaError("")
        setSelectedAnswer(null)

        try {
            setTrivia(await getRandomMovieTrivia())
            setNextQuestionCooldown(5)
        } catch (requestError) {
            console.error(requestError)
            setTriviaError("Could not load another trivia question right now.")
        } finally {
            setTriviaLoading(false)
        }
    }

    const answerFeedback = selectedAnswer
        ? selectedAnswer === trivia?.correctAnswer
            ? "Correct!"
            : `Not quite. The correct answer is ${trivia?.correctAnswer}.`
        : ""

    return (
        <>
            <header className="home-header">
                <img
                    className="site-logo home-logo"
                    src="/logo.png"
                    alt="Movies4U"
                />
                <div className="trivia-card">
                    <p className="trivia-label">Movie Trivia · True or False</p>
                    {trivia && !triviaLoading && !triviaError && (
                        <p className="trivia-meta">{trivia.difficulty} difficulty</p>
                    )}
                    <h1 className="trivia-question">
                        {triviaLoading
                            ? "Loading a movie question..."
                            : triviaError || trivia?.question}
                    </h1>
                    {trivia && !triviaLoading && !triviaError && (
                        <>
                            <div className="trivia-answers">
                                {["True", "False"].map((answer) => {
                                    const isCorrect = selectedAnswer
                                        && answer === trivia.correctAnswer
                                    const isIncorrect = selectedAnswer === answer
                                        && answer !== trivia.correctAnswer

                                    return (
                                        <button
                                            type="button"
                                            key={answer}
                                            className={`trivia-answer${isCorrect ? " correct" : ""}${isIncorrect ? " incorrect" : ""}`}
                                            disabled={Boolean(selectedAnswer)}
                                            onClick={() => setSelectedAnswer(answer)}
                                        >
                                            {answer}
                                        </button>
                                    )
                                })}
                            </div>
                            {answerFeedback && (
                                <p className="trivia-feedback" role="status">
                                    {answerFeedback}
                                </p>
                            )}
                        </>
                    )}
                    {selectedAnswer && (
                        <button
                            type="button"
                            className="trivia-next-button"
                            disabled={triviaLoading || nextQuestionCooldown > 0}
                            onClick={handleNewTrivia}
                        >
                            {nextQuestionCooldown > 0
                                ? `Next question in ${nextQuestionCooldown}s`
                                : "↻ Next question"}
                        </button>
                    )}
                    <a
                        className="trivia-attribution"
                        href="https://opentdb.com/"
                        target="_blank"
                        rel="noreferrer"
                    >
                        Questions from Open Trivia DB
                    </a>
                </div>
                <div className="home-actions">
                    <button
                        type="button"
                        className="nav-button"
                        onClick={() => navigate("/watchlist")}
                    >
                        My Watchlist
                    </button>
                    <button
                        type="button"
                        className="logout-button"
                        onClick={handleLogOut}
                    >
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            aria-hidden="true"
                        >
                            <path
                                d="M10 17l5-5-5-5M15 12H3M21 19V5a2 2 0 00-2-2h-6"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                        Log Out
                    </button>
                </div>
            </header>

            <Search
                searchTerm={searchTerm}
                setSearchTerm={handleSearchTermChange}
            />

            <section className="all-movies">
                <h2>Search Results</h2>

                {loading && <p>Searching...</p>}
                {error && <p>{error}</p>}
                {!loading && !error && searchTerm.trim() && movies.length === 0 && (
                    <p>No movies found.</p>
                )}

                {!loading && !error && movies.length > 0 && (
                    <ul>
                        {movies.map((movie) => (
                            <li key={movie.id}>
                                <MovieCard movie={movie} />
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </>
    )
}

export default HomePage;
