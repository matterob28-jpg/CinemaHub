import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getMovieDetails, listScreenings } from "../api/client.js";
import { posterUrl, formatDateISO, formatDateReadable } from "../api/utils.js";
import BookShowtime from "../components/BookShowtime.jsx";
import "./FilmDetail.css";

// Today's screenings aren't dropped entirely: only the showtimes already past get removed,
// keeping whatever is still upcoming today
function groupFutureScreenings(screenings) {
  const todayISO = formatDateISO();
  const now = new Date();

  const future = screenings
    .map((s) => {
      const dateISO = formatDateISO(new Date(s.date));
      let showtimes = s.showtimes;

      if (dateISO === todayISO) {
        // combines today's date with each "HH:MM" showtime string into one comparable Date
        showtimes = s.showtimes.filter((time) => {
          const [hours, minutes] = time.split(":").map(Number);
          const showtimeDate = new Date();
          showtimeDate.setHours(hours, minutes, 0, 0);
          return showtimeDate > now;
        });
      }

      return { ...s, showtimes, dateISO };
    })
    .filter((s) => s.dateISO >= todayISO && s.showtimes.length > 0)
    .sort((a, b) => a.dateISO.localeCompare(b.dateISO));

  const groups = {};
  future.forEach((s) => {
    if (!groups[s.dateISO]) groups[s.dateISO] = [];
    groups[s.dateISO].push(s);
  });

  return groups;
}

// Movie details page: poster,overview plus every upcoming screening grouped by date and cinema
export default function FilmDetail() {
  const { tmdbId } = useParams();

  const [film, setFilm] = useState(null);
  const [groupsByDate, setGroupsByDate] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Loads the movie details and its upcoming screenings grouped by date
    async function loadFilm() {
      setLoading(true);
      setError(null);

      try {
        const movieData = await getMovieDetails(tmdbId);
        const screeningsData = await listScreenings({ film: tmdbId });
        setFilm(movieData);
        setGroupsByDate(groupFutureScreenings(screeningsData));
      } catch {
        setError("Unable to find this movie");
      } finally {
        setLoading(false);
      }
    }

    loadFilm();
  }, [tmdbId]);

  if (loading) return <p className="empty-state">Loading...</p>;
  if (error) return <p className="empty-state">{error}</p>;
  if (!film) return null;

  const poster = posterUrl(film.poster_path, "w342");
  const sortedDates = Object.keys(groupsByDate);

  return (
    <div className="container film-detail">
      <div className="film-detail__hero">
        {poster && (
          <img
            src={poster}
            alt={film.title + " poster"}
            className="film-detail__poster"
          />
        )}
        <div className="film-detail__info">
          <h1 className="marquee-title film-detail__title">{film.title}</h1>
          <p className="eyebrow">
            {film.release_date?.slice(0, 4)}
            {film.runtime ? " · " + film.runtime + " min" : ""}
            {film.genres?.length ? " · " + film.genres.map((g) => g.name).join(", ") : ""}
          </p>
          <p className="film-detail__overview">{film.overview}</p>
        </div>
      </div>

      <section className="film-detail__screenings">
        <h2 className="marquee-title">Where to watch it</h2>

        {sortedDates.length === 0 ? (
          <p className="empty-state">
            No upcoming screenings scheduled for this movie right now
          </p>
        ) : (
          sortedDates.map((dateISO) => (
            <div key={dateISO} className="film-detail__date-group">
              <h3 className="film-detail__date-title eyebrow">
                {formatDateReadable(dateISO)}
              </h3>
              <div className="film-detail__cinema-list">
                {groupsByDate[dateISO].map((screening) => {
                  // room isn't populated on the backend, but both ids are plain strings after JSON so === still works
                  const room = screening.cinemaId.rooms?.find(
                    (r) => r._id === screening.room
                  );
                  return (
                    <div key={screening._id} className="film-detail__cinema-block card">
                      <Link
                        to={"/cinema/" + screening.cinemaId._id}
                        className="film-detail__cinema-name"
                      >
                        {screening.cinemaId.name}
                      </Link>
                      <span className="eyebrow">
                        {screening.cinemaId.city}
                        {room && " · " + room.name}
                      </span>
                      <div className="film-detail__showtimes">
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
            </div>
          ))
        )}
      </section>
    </div>
  );
}
