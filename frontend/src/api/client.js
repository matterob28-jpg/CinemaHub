import axios from "axios";

// Backend URL built from the page's own hostname, so it works from localhost
// and from a phone on the same network; the port stays fixed at 5000 (npm run dev)
const API_BASE_URL = "http://" + window.location.hostname + ":5000/api/v1";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 8000,
});

// Interceptor that attaches the token to every request, so it doesn't need repeating in each function below
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("cinemahub_token");
  if (token) {
    config.headers.Authorization = "Bearer " + token;
  }
  return config;
});

// Films, these just proxy to TMDB through our own backend

// Searches movies by title
export function searchMovies(query) {
  return api.get("/films/search", { params: { query } }).then((res) => res.data);
}

// Fetches one movie's full details by tmdb id
export function getMovieDetails(tmdbId) {
  return api.get("/films/" + tmdbId).then((res) => res.data);
}

// Cinemas

// Lists all cinemas, or the ones matching a search term
export function listCinemas(search) {
  return api.get("/cinemas", { params: search ? { search } : {} }).then((res) => res.data);
}

// Fetches one cinema plus its screenings for a given date
export function getCinemaDetails(id, date) {
  return api.get("/cinemas/" + id, { params: date ? { date } : {} }).then((res) => res.data);
}

// Screenings

// Lists screenings, optionally filtered by film and/or date
export function listScreenings({ film, date } = {}) {
  const params = {};
  if (film) params.film = film;
  if (date) params.date = date;
  return api.get("/screenings", { params }).then((res) => res.data);
}

// Authentication

// Creates a new account and logs it in
export function register({ name, email, password }) {
  return api.post("/auth/register", { name, email, password }).then((res) => res.data);
}

// Logs in with email and password
export function login({ email, password }) {
  return api.post("/auth/login", { email, password }).then((res) => res.data);
}

// Reservations, all of these need the user to be logged in, the token gets attached by the interceptor above

// Fetches the logged in user's own bookings
export function getMyReservations() {
  return api.get("/reservations/me").then((res) => res.data);
}

// Books tickets for a screening's showtime
export function createReservation({ screeningId, showtime, ticketCount }) {
  return api.post("/reservations", { screeningId, showtime, ticketCount }).then((res) => res.data);
}

// Cancels one booking by id
export function cancelReservation(id) {
  return api.delete("/reservations/" + id).then((res) => res.data);
}

// Fetches one booking's full details by id
export function getReservationById(id) {
  return api.get("/reservations/" + id).then((res) => res.data);
}

// Admin, managing cinemas and screenings, these need a token belonging to an admin user

// Creates a new cinema
export function createCinema(cinemaData) {
  return api.post("/cinemas", cinemaData).then((res) => res.data);
}

// Updates an existing cinema
export function updateCinema(id, cinemaData) {
  return api.put("/cinemas/" + id, cinemaData).then((res) => res.data);
}

// Deletes a cinema
export function deleteCinema(id) {
  return api.delete("/cinemas/" + id).then((res) => res.data);
}

// Creates a new screening
export function createScreening(screeningData) {
  return api.post("/screenings", screeningData).then((res) => res.data);
}

// Updates an existing screening
export function updateScreening(id, screeningData) {
  return api.put("/screenings/" + id, screeningData).then((res) => res.data);
}

// Deletes a screening
export function deleteScreening(id) {
  return api.delete("/screenings/" + id).then((res) => res.data);
}

export default api;

// Every function already returns res.data instead of the whole response, so callers don't have to repeat that everywhere
