import { useEffect, useState } from "react";
import {
  searchMovies,
  getMovieDetails,
  listCinemas,
  listScreenings,
  createScreening,
  deleteScreening,
} from "../../api/client.js";
import { posterUrl, formatDateISO } from "../../api/utils.js";

// Admin page for managing screenings: new-screening form plus the list of scheduled ones
export default function AdminScreenings() {
  const [screenings, setScreenings] = useState([]);
  const [movieTitles, setMovieTitles] = useState({}); // tmdbId -> title
  const [cinemas, setCinemas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reload();
    listCinemas().then(setCinemas);
  }, []);

  // Refetches the screenings and resolves each one's movie title via TMDB
  async function reload() {
    setLoading(true);
    try {
      const data = await listScreenings();
      setScreenings(data);

      const uniqueTmdbIds = [...new Set(data.map((s) => s.tmdbId))];
      const titles = {};
      for (const tmdbId of uniqueTmdbIds) {
        try {
          const movie = await getMovieDetails(tmdbId);
          titles[tmdbId] = movie.title;
        } catch {
          titles[tmdbId] = "Movie unavailable";
        }
      }
      setMovieTitles(titles);
    } finally {
      setLoading(false);
    }
  }

  // Deletes a screening after confirmation; the backend also cancels its active bookings
  async function handleDelete(id) {
    if (!window.confirm("Delete this screening? Related bookings will be cancelled")) {
      return;
    }
    await deleteScreening(id);
    reload();
  }

  return (
    <div className="admin-section">
      <NewScreeningForm cinemas={cinemas} onCreated={reload} />

      <div>
        <h2 className="marquee-title" style={{ fontSize: "1.4rem", marginBottom: 12 }}>
          Scheduled screenings
        </h2>
        {loading ? (
          <p className="empty-state">Loading...</p>
        ) : screenings.length === 0 ? (
          <p className="empty-state">No screenings added yet</p>
        ) : (
          <div className="admin-section__list">
            {screenings.map((s) => (
              <div className="admin-section__item card" key={s._id}>
                <div>
                  <strong>{movieTitles[s.tmdbId] || "Loading title..."}</strong> — {s.cinemaId?.name}
                  <br />
                  <span className="eyebrow">
                    {new Date(s.date).toLocaleDateString("en-GB")} · {s.showtimes.join(", ")}
                  </span>
                </div>
                <div className="admin-section__item-actions">
                  <button type="button" className="admin-section__remove" onClick={() => handleDelete(s._id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// A screening belongs to a single room: scheduling it in another one means filling the form again from scratch
function NewScreeningForm({ cinemas, onCreated }) {
  const [movieQuery, setMovieQuery] = useState("");
  const [movieResults, setMovieResults] = useState([]);
  const [chosenMovie, setChosenMovie] = useState(null);

  const [cinemaId, setCinemaId] = useState("");
  const [roomId, setRoomId] = useState("");
  const [date, setDate] = useState(formatDateISO());
  const [showtimes, setShowtimes] = useState([""]);

  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const selectedCinema = cinemas.find((c) => c._id === cinemaId);

  // Searches TMDB for the typed movie title
  async function handleSearchMovie(e) {
    e.preventDefault();
    if (!movieQuery.trim()) return;
    const { results } = await searchMovies(movieQuery);
    setMovieResults(results || []);
  }

  // Appends one blank showtime field to the form
  function addShowtime() {
    setShowtimes((s) => [...s, ""]);
  }

  // Removes one showtime field from the form by index
  function removeShowtime(index) {
    setShowtimes((s) => s.filter((_, i) => i !== index));
  }

  // Updates one showtime field's value in the form
  function updateShowtime(index, value) {
    setShowtimes((s) => s.map((t, i) => (i === index ? value : t)));
  }

  // Creates the screening; form resets after success so another one can be entered right away
  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await createScreening({
        tmdbId: chosenMovie.id,
        cinemaId,
        room: roomId,
        date,
        showtimes,
      });

      setMovieQuery("");
      setMovieResults([]);
      setChosenMovie(null);
      setCinemaId("");
      setRoomId("");
      setShowtimes([""]);
      onCreated();
    } catch (err) {
      setError(err.response?.data?.error || "Error while creating the screening");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="admin-section__form card" style={{ maxWidth: 620 }}>
      <h2>New screening</h2>

      {!chosenMovie && (
        <>
          <form className="admin-section__row" onSubmit={handleSearchMovie}>
            <input
              placeholder="Search movie title..."
              value={movieQuery}
              onChange={(e) => setMovieQuery(e.target.value)}
            />
            <button type="submit" className="btn">
              Search
            </button>
          </form>

          <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
            {movieResults.map((movie) => (
              <button
                type="button"
                key={movie.id}
                className="admin-section__item"
                style={{
                  textAlign: "left",
                  cursor: "pointer",
                  border: "1px solid var(--color-border)",
                  borderRadius: 8,
                  background: "var(--color-surface-raised)",
                }}
                onClick={() => setChosenMovie(movie)}
              >
                {posterUrl(movie.poster_path, "w92") && (
                  <img
                    src={posterUrl(movie.poster_path, "w92")}
                    alt=""
                    style={{ width: 40, borderRadius: 4 }}
                  />
                )}
                <span>
                  {movie.title} {movie.release_date ? "(" + movie.release_date.slice(0, 4) + ")" : ""}
                </span>
              </button>
            ))}
          </div>
        </>
      )}

      {chosenMovie && (
        <form onSubmit={handleSubmit}>
          <p className="eyebrow">
            Selected movie: {chosenMovie.title}{" "}
            <button type="button" className="admin-section__remove" onClick={() => setChosenMovie(null)}>
              change
            </button>
          </p>

          <label htmlFor="cinema">Cinema</label>
          <select
            id="cinema"
            required
            value={cinemaId}
            onChange={(e) => {
              setCinemaId(e.target.value);
              setRoomId("");
            }}
          >
            <option value="">Select a cinema...</option>
            {cinemas.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name} — {c.city}
              </option>
            ))}
          </select>

          {selectedCinema && (
            <>
              <label htmlFor="room">Room</label>
              <select id="room" required value={roomId} onChange={(e) => setRoomId(e.target.value)}>
                <option value="">Select a room...</option>
                {selectedCinema.rooms.map((r) => (
                  <option key={r._id} value={r._id}>
                    {r.name} ({r.capacity} seats)
                  </option>
                ))}
              </select>
            </>
          )}

          <label htmlFor="date">Date</label>
          <input id="date" type="date" required value={date} onChange={(e) => setDate(e.target.value)} />

          <label style={{ marginTop: 12 }}>Showtimes</label>
          {showtimes.map((time, index) => (
            <div className="admin-section__row" key={index}>
              <input
                type="time"
                required
                value={time}
                onChange={(e) => updateShowtime(index, e.target.value)}
              />
              {showtimes.length > 1 && (
                <button type="button" className="admin-section__remove" onClick={() => removeShowtime(index)}>
                  Remove
                </button>
              )}
            </div>
          ))}
          <button type="button" className="btn" onClick={addShowtime}>
            + Add showtime
          </button>

          {error && <p className="admin-section__error">{error}</p>}

          <div className="admin-section__row" style={{ marginTop: 12 }}>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? "Saving..." : "Create screening"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
