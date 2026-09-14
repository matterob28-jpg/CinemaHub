import { Link } from "react-router-dom";
import { posterUrl } from "../api/utils.js";
import "./FilmCard.css";

// film comes raw from TMDB (not our backend), so its fields are TMDB's own
export default function FilmCard({ film }) {
  const poster = posterUrl(film.poster_path, "w185");
  const year = film.release_date ? film.release_date.slice(0, 4) : null;

  return (
    <Link to={"/film/" + film.id} className="film-card card">
      <div className="film-card__poster">
        {poster ? (
          <img src={poster} alt={film.title + " poster"} loading="lazy" />
        ) : (
          <div className="film-card__placeholder">
            🎬
          </div>
        )}
      </div>
      <div className="film-card__info">
        <h3 className="film-card__title">{film.title}</h3>
        {year && <span className="eyebrow">{year}</span>}
      </div>
    </Link>
  );
}
