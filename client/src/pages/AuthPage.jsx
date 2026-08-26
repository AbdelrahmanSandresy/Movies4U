import { useOutletContext } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import AuthForm from "../components/AuthForm";

const AuthPage = () => {
    const {setUser} = useOutletContext()

    return (
        <div className="auth-page">
            <header className="auth-header">
                <img
                    className="site-logo auth-logo"
                    src="/logo.png"
                    alt="Movies4U"
                />
                <h1>Welcome to Movies4U</h1>
                <p>Sign in to discover, save, and review your favorite movies.</p>
            </header>
            <AuthForm setUser={setUser} />
        </div>
    )
}

export default AuthPage;
