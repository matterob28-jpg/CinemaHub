import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyReservations, cancelReservation } from "../api/client.js";
import { formatDateReadable } from "../api/utils.js";
import "./MyBookings.css";

// "Past" depends only on the screening's date/time, not on status
function isPast(screening, showtime) {
  if (!screening?.date || !showtime) return false;
  // combines the screening's date with the "HH:MM" showtime string into one comparable Date
  const [hours, minutes] = showtime.split(":").map(Number);
  const showtimeDate = new Date(screening.date);
  showtimeDate.setHours(hours, minutes, 0, 0);
  return showtimeDate < new Date();
}

// Lists the logged in user's bookings, each with a cancel button when still active and upcoming
export default function MyBookings() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmingId, setConfirmingId] = useState(null);

  useEffect(() => {
    loadReservations();
  }, []);

  // Fetches the logged in user's bookings
  function loadReservations() {
    setLoading(true);
    getMyReservations()
      .then(setReservations)
      .catch(() => setError("Unable to load your bookings"))
      .finally(() => setLoading(false));
  }

  // Reloads the whole list instead of patching one item locally, for simplicity
  async function confirmCancel(id) {
    try {
      await cancelReservation(id);
      setConfirmingId(null);
      loadReservations();
    } catch {
      setError("Unable to cancel this booking");
    }
  }

  if (loading) return <p className="empty-state">Loading...</p>;
  if (error) return <p className="empty-state">{error}</p>;

  return (
    <div className="container my-bookings">
      <h1 className="marquee-title">My bookings</h1>

      {reservations.length === 0 ? (
        <p className="empty-state">You don't have any bookings yet</p>
      ) : (
        <div className="my-bookings__list">
          {reservations.map((r) => {
            const screening = r.screeningId;
            const cinema = screening?.cinemaId;
            const cancelled = r.status === "cancelled";
            const past = isPast(screening, r.showtime);

            return (
              <div key={r._id} className={"my-bookings__item card " + (cancelled ? "is-cancelled" : "")}>
                <div className="my-bookings__info">
                  {cinema && (
                    <Link to={"/cinema/" + cinema._id} className="my-bookings__cinema">
                      {cinema.name}
                    </Link>
                  )}
                  {screening && (
                    <span className="eyebrow">
                      {formatDateReadable(screening.date)} · {r.showtime}
                    </span>
                  )}
                  <span className="my-bookings__tickets">
                    {r.ticketCount} {r.ticketCount === 1 ? "ticket" : "tickets"}
                    {r.seats?.length ? " · seats " + r.seats.join(", ") : ""}
                  </span>
                </div>

                <div className="my-bookings__status">
                  <Link to={"/ticket/" + r._id} className="btn">
                    View ticket
                  </Link>

                  {cancelled && <span className="my-bookings__badge">Cancelled</span>}
                  {!cancelled && past && <span className="my-bookings__badge">Past</span>}

                  {!cancelled && !past && confirmingId !== r._id && (
                    <button type="button" className="btn" onClick={() => setConfirmingId(r._id)}>
                      Cancel
                    </button>
                  )}

                  {!cancelled && !past && confirmingId === r._id && (
                    <div className="my-bookings__confirm">
                      <span>Are you sure?</span>
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => confirmCancel(r._id)}
                      >
                        Confirm
                      </button>
                      <button type="button" className="btn" onClick={() => setConfirmingId(null)}>
                        No
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
