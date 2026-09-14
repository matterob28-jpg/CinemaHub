const { searchMovies, getMovieDetails } = require("../config/tmdb");

const DEFAULT_DURATION_MINUTES = 120;

// Searches TMDB for movies matching the typed query
async function search(req, res) {
  const { query } = req.query;

  if (!query || !query.trim()) {
    return res.status(400).json({ error: "query is missing or empty" });
  }

  try {
    const result = await searchMovies(query);
    res.json(result);
  } catch (error) {
    console.error("Searching error TMDB:", error.message);
    res.status(502).json({ error: "unreachable server" });
  }
}

// Fetches one movie's details from TMDB by id
async function detail(req, res) {
  const { tmdbId } = req.params;

  try {
    const film = await getMovieDetails(tmdbId);
    res.json(film);
  } catch (error) {
    if (error.response?.status === 404) { //http error
      return res.status(404).json({ error: "movie not found" });
    }
    console.error("TMDB details error:", error.message);
    res.status(502).json({ error: "unreachable server" });
  }
}

// Returns a film's runtime from TMDB, falling back to a default duration if TMDB has no
// runtime or the request fails, instead of blocking screening creation
async function getFilmDuration(tmdbId) {
  try {
    const film = await getMovieDetails(tmdbId);
    return { duration: film.runtime || DEFAULT_DURATION_MINUTES, title: film.title };
  } catch {
    return { duration: DEFAULT_DURATION_MINUTES, title: "TMDB film "+tmdbId };
  }
}

module.exports = { search, detail,getFilmDuration };
