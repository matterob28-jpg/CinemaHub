import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { searchMovies, listCinemas, listScreenings } from "../api/client.js";
import { groupScreeningsByCinema } from "../api/screeningHelpers.js";
import { formatDateISO } from "../api/utils.js";
import FilmCard from "../components/FilmCard.jsx";
import CinemaCard from "../components/CinemaCard.jsx";
import "./SearchResults.css";

// Search results page: shows films or cinemas depending on the "type" URL param
export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const type = searchParams.get("type") || "film";
  const query = searchParams.get("q") || "";

  const [results, setResults] = useState([]);
  const [screeningsByCinema, setScreeningsByCinema] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    // Runs either the cinema search or the movie search depending on the active mode
    async function runSearch() {
      setLoading(true);
      setError(null);

      try {
        if (type === "cinema") {
          // Also loads today's screenings alongside the found cinemas, otherwise the cards showed up with no movies
          const foundCinemas = await listCinemas(query);
          const todaysScreenings = await listScreenings({ date: formatDateISO() });
          setResults(foundCinemas);
          const map = await groupScreeningsByCinema(todaysScreenings);
          setScreeningsByCinema(map);
        } else {
          const data = await searchMovies(query);
          setResults(data.results || []);
        }
      } catch {
        setError("Search failed");
      } finally {
        setLoading(false);
      }
    }

    runSearch();
  }, [type, query]);

  return (
    <div className="container search-results">
      <p className="eyebrow">
        {type === "cinema" ? "Cinema search" : "Movie search"}
      </p>
      <h1 className="marquee-title search-results__title">
        Results for "{query}"
      </h1>

      {loading && <p className="empty-state">Searching...</p>}
      {error && <p className="empty-state">{error}</p>}

      {!loading && !error && results.length === 0 && (
        <p className="empty-state">No results found</p>
      )}

      {!loading && !error && results.length > 0 && (
        <div
          className={
            type === "cinema" ? "search-results__cinema-list" : "search-results__film-list"
          }
        >
          {type === "cinema"
            ? results.map((cinema) => (
                <CinemaCard
                  key={cinema._id}
                  cinema={cinema}
                  todaysScreenings={screeningsByCinema[cinema._id] || []}
                />
              ))
            : results.map((film) => <FilmCard key={film.id} film={film} />)}
        </div>
      )}
    </div>
  );
}
