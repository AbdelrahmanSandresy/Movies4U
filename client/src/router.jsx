import { createBrowserRouter } from 'react-router-dom'
import AuthPage from "./pages/AuthPage"
import HomePage from "./pages/HomePage"
import ErrorPage from "./pages/ErrorPage"
import MovieDetailsPage from "./pages/MovieDetailsPage"
import WatchlistPage from "./pages/WatchlistPage"
import App from "./App"
import {
    homeLoader,
    movieDetailsLoader,
    redirectIfLoggedIn,
    userConfirmation,
    watchlistLoader,
} from "./utilites"


const router = createBrowserRouter([
    {
        path:"/",
        element: <App/>,
        loader: userConfirmation,
        errorElement: <ErrorPage />,
        children:[
            {
                index:true,
                element:<AuthPage/>,
                loader:redirectIfLoggedIn,
            },
            {
                path:"home",
                element: <HomePage />,
                loader:homeLoader,
            },
            {
                path: "movies/:movieId",
                element: <MovieDetailsPage />,
                loader: movieDetailsLoader,
            },
            {
                path: "watchlist",
                element: <WatchlistPage />,
                loader: watchlistLoader,
            }
            
        ]
    }
])

export default router
