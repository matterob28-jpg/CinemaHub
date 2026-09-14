const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

// Returns null when there's no path, so the component can show a placeholder instead of a broken image
export function posterUrl(path, size = "w342") {
  if (!path) return null;
  return TMDB_IMAGE_BASE + "/" + size + path;
}

// YYYY-MM-DD is the format the backend expects in its queries
export function formatDateISO(date = new Date()) {
  return date.toISOString().split("T")[0];
}

// Formats a date for display
export function formatDateReadable(date) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
