import { useEffect, useState } from "react";
import { listCinemas, listScreenings } from "../api/client.js";
import { groupScreeningsByCinema } from "../api/screeningHelpers.js";
import { formatDateISO, formatDateReadable } from "../api/utils.js";
import CinemaCard from "../components/CinemaCard.jsx";
import "./Home.css";

// Cinemas with no screenings on the selected date are hidden instead of shown empty
export default function Home() {
  const [date, setDate] = useState(formatDateISO());
  const [cinemas, setCinemas] = useState([]);
  const [screeningsByCinema, setScreeningsByCinema] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Loads all cinemas and the day's screenings, then groups the screenings by cinema
    async function loadHomeData() {
      setLoading(true);
      try {
        const cinemaList = await listCinemas();
        const screeningsData = await listScreenings({ date });
        setCinemas(cinemaList);
        const map = await groupScreeningsByCinema(screeningsData);
        setScreeningsByCinema(map);
      } catch {
        setError("Unable to reach the server");
      } finally {
        setLoading(false);
      }
    }

    loadHomeData();
  }, [date]);

  if (error) {
    return <p className="empty-state">{error}</p>;
  }

  const isToday = date === formatDateISO();

  return (
    <div className="container home">
      <section className="home__hero">
        <span className="eyebrow">{formatDateReadable(date)}</span>
        <h1 className="marquee-title home__title">
          {isToday ? "What's on tonight?" : "What's on"}
        </h1>
        <p className="home__subtitle">
          Every cinema in town, in one place.
        </p>

        <div className="home__date-picker">
          <label htmlFor="home-date">Show listings for</label>
          <input
            id="home-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
      </section>

      <section className="home__list">
        {loading ? (
          <p className="empty-state">Loading...</p>
        ) : (
          // we can use early returns for the different empty states inside the JSX
          (() => {
            const cinemasWithScreenings = cinemas.filter(
              (cinema) => (screeningsByCinema[cinema._id] || []).length > 0
            );

            if (cinemas.length === 0) {
              return (
                <p className="empty-state">
                  No cinemas in the database
                </p>
              );
            }

            if (cinemasWithScreenings.length === 0) {
              return (
                <p className="empty-state">
                  No cinema has screenings scheduled for this date
                </p>
              );
            }

            return cinemasWithScreenings.map((cinema) => (
              <CinemaCard
                key={cinema._id}
                cinema={cinema}
                todaysScreenings={screeningsByCinema[cinema._id] || []}
              />
            ));
          })()
        )}
      </section>
    </div>
  );
}
