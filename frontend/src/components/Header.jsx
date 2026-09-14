import { Link, useNavigate } from "react-router-dom";
import SearchBar from "./SearchBar.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import "./Header.css";

// Top navigation bar: logo, search bar, and auth-dependent links or buttons
export default function Header() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  // Logs out and returns to the home page
  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Link to="/" className="site-header__logo marquee-title">
          CinemaHub
        </Link>

        <SearchBar />

        <nav className="site-header__nav">
          {isAuthenticated ? (
            <>
              {isAdmin && (
                <Link to="/admin/cinemas" className="site-header__link">
                  Admin
                </Link>
              )}
              <Link to="/my-bookings" className="site-header__link">
                My bookings
              </Link>
              <span className="site-header__user">Hi, {user.name.split(" ")[0]}</span>
              <button type="button" className="btn" onClick={handleLogout}>
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn">
                Log in
              </Link>
              <Link to="/register" className="btn btn-primary">
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
