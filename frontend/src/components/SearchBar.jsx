import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./SearchBar.css";

// Passes mode and query through URL params, which SearchResults.jsx reads back (no shared state between the two)
export default function SearchBar() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Pre-fills from the url's own params if already on the search page
  const [mode, setMode] = useState(searchParams.get("type") || "film");
  const [query, setQuery] = useState(searchParams.get("q") || "");

  // Navigates to the search results page carrying the mode and query in the URL
  function handleSubmit(e) {
    e.preventDefault();
    if (!query.trim()) return;
    navigate("/search?type=" + mode + "&q=" + encodeURIComponent(query.trim()));
  }

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <div className="search-bar__toggle">
        <button
          type="button"
          className={"search-bar__tab " + (mode === "film" ? "is-active" : "")}
          onClick={() => setMode("film")}
        >
          Search movies
        </button>
        <button
          type="button"
          className={"search-bar__tab " + (mode === "cinema" ? "is-active" : "")}
          onClick={() => setMode("cinema")}
        >
          Search cinemas
        </button>
      </div>

      <div className="search-bar__input-row">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={
            mode === "film"
              ? "Movie title..."
              : "Cinema name or city..."
          }
        />
        <button type="submit" className="btn btn-primary">
          Search
        </button>
      </div>
    </form>
  );
}
