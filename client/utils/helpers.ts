import { TMDB_IMAGE_BASE, TMDBImageSizes } from "@/constants/theme";
import { Movie, TVShow, MediaItem, MediaType } from "@/types/tmdb";

export function getImageUrl(
  path: string | null,
  type: "poster" | "backdrop" | "profile" = "poster",
  size: "small" | "medium" | "large" | "original" = "medium"
): string | null {
  if (!path) return null;
  const sizeValue = TMDBImageSizes[type][size];
  return `${TMDB_IMAGE_BASE}/${sizeValue}${path}`;
}

export function formatDate(dateString: string): string {
  if (!dateString) return "Unknown";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatYear(dateString: string): string {
  if (!dateString) return "";
  return new Date(dateString).getFullYear().toString();
}

export function formatRuntime(minutes: number): string {
  if (!minutes) return "";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

export function formatRating(rating: number): string {
  return rating.toFixed(1);
}

export function getRatingColor(rating: number): string {
  if (rating >= 7) return "#46D369";
  if (rating >= 5) return "#FFB800";
  return "#E50914";
}

export function isMovie(item: Movie | TVShow): item is Movie {
  return "title" in item;
}

export function isTVShow(item: Movie | TVShow): item is TVShow {
  return "name" in item;
}

export function normalizeToMediaItem(
  item: Movie | TVShow,
  mediaType?: MediaType
): MediaItem {
  if (isMovie(item)) {
    return {
      id: item.id,
      mediaType: mediaType || "movie",
      title: item.title,
      posterPath: item.poster_path,
      backdropPath: item.backdrop_path,
      voteAverage: item.vote_average,
      releaseDate: item.release_date,
      overview: item.overview,
    };
  }
  return {
    id: item.id,
    mediaType: mediaType || "tv",
    title: item.name,
    posterPath: item.poster_path,
    backdropPath: item.backdrop_path,
    voteAverage: item.vote_average,
    releaseDate: item.first_air_date,
    overview: item.overview,
  };
}

export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "...";
}

export function debounce<T extends (...args: unknown[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
