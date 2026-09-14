import { getMovieDetails } from "./client.js";

// Each screening stays its own entry instead of being merged by movie, so it doesn't hide
// which room it's actually in. Returns an object shaped like
export async function groupScreeningsByCinema(screenings) {
  // Fetches the movie title for every screening (one request per screening)
  const titles = {};
  for (const screening of screenings) {
    try {
      const movie = await getMovieDetails(screening.tmdbId);
      titles[screening.tmdbId] = movie.title;
    } catch {
      titles[screening.tmdbId] = "Movie unavailable";
    }
  }

  const map = {};
  screenings.forEach((screening) => {
    const cinema = screening.cinemaId;
    // Falls back to the raw id if cinemaId wasn't populated into a full object
    const cinemaId = cinema?._id || screening.cinemaId;
    if (!map[cinemaId]) map[cinemaId] = [];

    const room = cinema?.rooms?.find((r) => r._id === screening.room); // room isn't populated on the backend, but both ids are plain strings after JSON so === still works

    map[cinemaId].push({
      screeningId: screening._id,
      tmdbId: screening.tmdbId,
      title: titles[screening.tmdbId],
      roomName: room ? room.name : null,
      showtimes: screening.showtimes,
    });
  });

  return map;
}
