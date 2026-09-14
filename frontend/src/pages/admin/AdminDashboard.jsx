import { NavLink, Outlet } from "react-router-dom";
import "./AdminDashboard.css";

// Admin section layout: tabs for Cinemas/Screenings plus the active sub-page via Outlet
export default function AdminDashboard() {
  return (
    <div className="container admin-dashboard">
      <h1 className="marquee-title">Admin panel</h1>

      <nav className="admin-dashboard__tabs">
        <NavLink
          to="/admin/cinemas"
          className={({ isActive }) => "admin-dashboard__tab " + (isActive ? "is-active" : "")}
        >
          Cinemas
        </NavLink>
        <NavLink
          to="/admin/screenings"
          className={({ isActive }) => "admin-dashboard__tab " + (isActive ? "is-active" : "")}
        >
          Screenings
        </NavLink>
      </nav>

      <div className="admin-dashboard__content">
        <Outlet />
      </div>
    </div>
  );
}
