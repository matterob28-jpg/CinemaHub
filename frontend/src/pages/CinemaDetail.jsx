import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getCinemaDetails, getMovieDetails } from "../api/client.js";
import { formatDateISO } from "../api/utils.js";
import BookShowtime from "../components/BookShowtime.jsx";
import "./CinemaDetail.css";

// Cinema details page: info, date picker, and that day's screenings with booking buttons
export default function CinemaDetail() {
  const { id } = useParams();

  const [date, setDate] = useState(formatDateISO());
  const [cinema, setCinema] = useState(null);
  const [screenings, setScreenings] = useState([]);
  const [movieTitles, setMovieTitles] = useState({}); // tmdbId -> title
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Loads the cinema and its screenings for the selected date, then resolves each movie's title
    async function loadCinema() {
      setLoading(true);
      setError(null);

      try {
        const response = await getCinemaDetails(id, date);
        setCinema(response.cinema);
        setScreenings(response.screenings);

        // Resolves titles via TMDB since a screening only stores the tmdbId
        // Set removes duplicate ids, the spread turns it back into an array
        const uniqueTmdbIds = [...new Set(response.screenings.map((s) => s.tmdbId))];
        const map = {};
        for (const tmdbId of uniqueTmdbIds) {
          try {
            const movie = await getMovieDetails(tmdbId);
            map[tmdbId] = movie.title;
          } catch {
            map[tmdbId] = "Movie unavailable";
          }
        }
        setMovieTitles(map);
      } catch {
        setError("Unable to find this cinema");
      } finally {
        setLoading(false);
      }
    }

    loadCinema();
  }, [id, date]);

  if (loading && !cinema) return <p className="empty-state">Loading...</p>;
  if (error) return <p className="empty-state">{error}</p>;
  if (!cinema) return null;

  return (
    <div className="container cinema-detail">
      <h1 className="marquee-title cinema-detail__title">{cinema.name}</h1>
      <p className="eyebrow">{cinema.city}</p>
      <p className="cinema-detail__address">
        {cinema.address}
        {cinema.phone ? " · " + cinema.phone : ""}
      </p>

      <div className="cinema-detail__date-picker">
        <label htmlFor="cinema-date">Showtimes for</label>
        <input
          id="cinema-date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      {screenings.length === 0 ? (
        <p className="empty-state">No screenings scheduled for this date</p>
      ) : (
        <div className="cinema-detail__screening-list">
          {screenings.map((screening) => {
            // screening.room is only the room's ObjectId: resolved by looking it up among the already loaded cinema's rooms
            // both ids are plain strings after JSON, so === works despite there being no populate on room
            const room = cinema.rooms.find((r) => r._id === screening.room);
            return (
              <div key={screening._id} className="cinema-detail__screening card">
                <div className="cinema-detail__screening-info">
                  <div>
                    <strong className="cinema-detail__movie-title">
                      {movieTitles[screening.tmdbId] || "Loading title..."}
                    </strong>
                    <span className="eyebrow" style={{ display: "block" }}>
                      {room ? room.name : "Room"}
                    </span>
                  </div>
                </div>
                <div className="cinema-detail__showtimes">
                  {screening.showtimes.map((time) => (
                    <BookShowtime
                      key={time}
                      screeningId={screening._id}
                      time={time}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
