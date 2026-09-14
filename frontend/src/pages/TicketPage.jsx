import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getReservationById, getMovieDetails } from "../api/client.js";
import { formatDateReadable } from "../api/utils.js";
import "./TicketPage.css";

// "Ticket no." is just the reservation's own Mongo _id, there's no dedicated ticket numbering
export default function TicketPage() {
  const { id } = useParams();

  const [reservation, setReservation] = useState(null);
  const [movieTitle, setMovieTitle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getReservationById(id)
      .then(async (data) => {
        setReservation(data);
        const tmdbId = data.screeningId?.tmdbId;
        if (tmdbId) {
          try {
            const movie = await getMovieDetails(tmdbId);
            setMovieTitle(movie.title);
          } catch {
            setMovieTitle(null);
          }
        }
      })
      .catch(() => setError("Unable to find this ticket"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="empty-state">Loading ticket...</p>;
  if (error) return <p className="empty-state">{error}</p>;
  if (!reservation) return null;

  const screening = reservation.screeningId;
  const cinema = screening?.cinemaId;
  const room = cinema?.rooms?.find((r) => r._id === screening.room); // room isn't populated on the backend, but both ids are plain strings after JSON so === still works
  const cancelled = reservation.status === "cancelled";

  return (
    <div className="container ticket-page">
      <div className={"ticket-page__ticket card " + (cancelled ? "is-cancelled" : "")}>
        <div className="ticket-page__header">
          <span className="eyebrow">Your ticket</span>
          {cancelled && <span className="ticket-page__badge">Cancelled</span>}
        </div>
        <h1 className="marquee-title ticket-page__movie">{movieTitle || "Movie"}</h1>

        <div className="ticket-page__details">
          <div>
            <span className="ticket-page__label">Cinema</span>
            <span className="ticket-page__value">{cinema?.name || "—"}</span>
            {cinema && (
              <span className="ticket-page__subvalue">
                {cinema.address}, {cinema.city}
              </span>
            )}
          </div>

          <div className="ticket-page__double-row">
            <div>
              <span className="ticket-page__label">Date</span>
              <span className="ticket-page__value">
                {screening?.date ? formatDateReadable(screening.date) : "—"}
              </span>
            </div>
            <div>
              <span className="ticket-page__label">Time</span>
              <span className="ticket-page__value">{reservation.showtime}</span>
            </div>
          </div>

          <div className="ticket-page__double-row">
            <div>
              <span className="ticket-page__label">Room</span>
              <span className="ticket-page__value">{room ? room.name : "—"}</span>
            </div>
            <div>
              <span className="ticket-page__label">Seats</span>
              <span className="ticket-page__value">
                {reservation.seats?.length ? reservation.seats.join(", ") : "—"}
              </span>
            </div>
          </div>

          <div>
            <span className="ticket-page__label">Tickets</span>
            <span className="ticket-page__value">{reservation.ticketCount}</span>
          </div>
        </div>

        <p className="ticket-page__note">Ticket no. {reservation._id}</p>
      </div>

      <Link to="/my-bookings" className="btn" style={{ marginTop: 20 }}>
        Back to my bookings
      </Link>
    </div>
  );
}
