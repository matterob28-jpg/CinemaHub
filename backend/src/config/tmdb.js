const axios = require("axios");

const TMDB_BASE_URL = "https://api.themoviedb.org/3";

// The TMDB client lives only here: the key never reaches the frontend, which only ever talks to our own backend
const tmdbClient= axios.create({
  baseURL: TMDB_BASE_URL,
  params: {
    api_key: process.env.TMDB_API_KEY,
    language: "it-IT", // asks TMDB for italian results when they are available
  },
  timeout: 5000,
});

// Searches TMDB for movies matching a title
async function searchMovies(query) {
  const {data }= await tmdbClient.get("/search/movie", {
    params:{ query },
  });
  return data;
}

// Fetches full details for one movie from TMDB by id
async function getMovieDetails(tmdbId) {
  const { data }= await tmdbClient.get("/movie/"+tmdbId);
  return data;
}

module.exports= { searchMovies, getMovieDetails };
