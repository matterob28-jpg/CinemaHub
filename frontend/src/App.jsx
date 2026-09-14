import { Routes, Route } from "react-router-dom";
import Header from "./components/Header.jsx";
import RequireAdmin from "./components/RequireAdmin.jsx";
import RequireAuth from "./components/RequireAuth.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import Home from "./pages/Home.jsx";
import SearchResults from "./pages/SearchResults.jsx";
import FilmDetail from "./pages/FilmDetail.jsx";
import CinemaDetail from "./pages/CinemaDetail.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import MyBookings from "./pages/MyBookings.jsx";
import TicketPage from "./pages/TicketPage.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import AdminCinemas from "./pages/admin/AdminCinemas.jsx";
import AdminScreenings from "./pages/admin/AdminScreenings.jsx";

// Root component: wraps the app in AuthProvider and declares every route
export default function App() {
  return (
    <AuthProvider>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/film/:tmdbId" element={<FilmDetail />} />
          <Route path="/cinema/:id" element={<CinemaDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/my-bookings" element={<MyBookings />} />
          <Route
            path="/ticket/:id"
            element={
              <RequireAuth>
                <TicketPage />
              </RequireAuth>
            }
          />

          <Route
            path="/admin"
            element={
              <RequireAdmin>
                <AdminDashboard />
              </RequireAdmin>
            }
          >
            <Route path="cinemas" element={<AdminCinemas />} />
            <Route path="screenings" element={<AdminScreenings />} />
          </Route>
        </Routes>
      </main>
    </AuthProvider>
  );
}
