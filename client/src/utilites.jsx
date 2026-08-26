import axios from "axios";
import { redirect } from "react-router-dom";

export const api = axios.create({
    baseURL: "/api/v1/"
})

export const getRandomMovieTrivia = async (signal) => {
    const response = await fetch(
        "https://opentdb.com/api.php?amount=1&category=11&type=boolean&encode=url3986",
        { signal }
    )

    if (!response.ok) {
        throw new Error("Unable to load movie trivia.")
    }

    const data = await response.json()
    const trivia = data.results?.[0]

    if (data.response_code !== 0 || !trivia) {
        throw new Error("The trivia service did not return a question.")
    }

    return {
        question: decodeURIComponent(trivia.question),
        correctAnswer: decodeURIComponent(trivia.correct_answer),
        difficulty: decodeURIComponent(trivia.difficulty),
    }
}

// Run immediately before every request this client sends

api.interceptors.request.use((config)=>{
    const token = localStorage.getItem("token");
    if(token){
        config.headers.Authorization = `Token ${token}`
    }
    return config

})

const errorMessage = (error)=>{
    const data = error.response?.data;
    if (!data) return "Could not reach the server.";
    if (typeof data === "string") return data;
    if (data.detail) return data.detail;
    return JSON.stringify(data);
}


// REGISTER and Login
export const userAuth = async (email, password, create)=>{
    try{
        const response = await api.post(
            create ? "user/register/" : "user/login/",
            {
                email,
                password
            }
        );
        const { email: userEmail, token} = response.data
        localStorage.setItem("token", token)
        return userEmail

    }catch (error){
        alert(errorMessage(error))
        return null;
    }

}

export const userConfirmation = async () => {
    const token = localStorage.getItem("token");
    if(!token){return null}
    try{
        const response = await api.get("user/");
        return response.data.email;
    } catch (error){
        localStorage.removeItem("token");
        console.log(error)
        return null;
    }
}

export const userLogOut = async () =>{
    try{
        await api.post("user/logout/")
    }catch(error){
        console.error("Logout request failed; clearing the local session anyway", error)
    }
    localStorage.removeItem("token")
    return null

}

//  blocks a route: bounce to login page if there is no token
export const requireLogin =()=>{
    if (!localStorage.getItem("token")) throw redirect("/");
    return null;
}

//  a logged in user shouldn't go to login page
export const redirectIfLoggedIn =()=>{
    return localStorage.getItem("token") ? redirect("/home") : null;
}

export const searchMovies = async (query, page = 1) => {
    const response = await api.get("movies/search/", {
        params: { q: query, page }
    })
    return response.data
}

export const homeLoader = ()=>{
    requireLogin()
    return null
}

export const getMovieDetails = async (movieId) => {
    const response = await api.get(`movies/${movieId}/`)
    return response.data
}

export const getWatchlist = async () => {
    const response = await api.get("watchlist/")
    return response.data
}

export const getWatchlistItem = async (movieId) => {
    try {
        const response = await api.get(`watchlist/${movieId}/`)
        return response.data
    } catch (error) {
        if (error.response?.status === 404) return null
        throw error
    }
}

export const addToWatchlist = async (movie) => {
    const response = await api.post("watchlist/", {
        id: movie.id,
        title: movie.title,
        overview: movie.overview || "",
        poster_path: movie.poster_path || "",
        release_date: movie.release_date || "",
        vote_average: movie.vote_average,
        original_language: movie.original_language || "",
    })
    return response.data
}

export const removeFromWatchlist = async (movieId) => {
    await api.delete(`watchlist/${movieId}/`)
}

export const updateWatchlistItem = async (movieId, updates) => {
    const response = await api.patch(`watchlist/${movieId}/`, updates)
    return response.data
}

export const getMovieReviews = async (movieId) => {
    const response = await api.get("reviews/", {
        params: { movie_id: movieId }
    })
    return response.data
}

export const createReview = async (movie, rating, reviewText) => {
    const response = await api.post("reviews/", {
        movie: {
            id: movie.id,
            title: movie.title,
            overview: movie.overview || "",
            poster_path: movie.poster_path || "",
            release_date: movie.release_date || "",
            vote_average: movie.vote_average,
            original_language: movie.original_language || "",
        },
        rating,
        review_text: reviewText,
    })
    return response.data
}

export const updateReview = async (reviewId, updates) => {
    const response = await api.patch(`reviews/${reviewId}/`, updates)
    return response.data
}

export const deleteReview = async (reviewId) => {
    await api.delete(`reviews/${reviewId}/`)
}

export const movieDetailsLoader = async ({ params }) => {
    requireLogin()
    const [movie, watchlistItem, reviews] = await Promise.all([
        getMovieDetails(params.movieId),
        getWatchlistItem(params.movieId),
        getMovieReviews(params.movieId),
    ])
    return { movie, watchlistItem, reviews }
}

export const watchlistLoader = async () => {
    requireLogin()
    return getWatchlist()
}
