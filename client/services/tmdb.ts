import axios from "axios";
import {
  Movie,
  TVShow,
  MovieDetails,
  TVShowDetails,
  Genre,
  TMDBResponse,
  SeasonDetails,
  PersonDetails,
} from "@/types/tmdb";
import { getApiUrl } from "@/lib/query-client";

const api = axios.create({
  baseURL: getApiUrl(),
  timeout: 15000,
});

// Movies
export async function getTrendingMovies(
  timeWindow: "day" | "week" = "day"
): Promise<TMDBResponse<Movie>> {
  const response = await api.get(`/api/tmdb/trending/movie/${timeWindow}`);
  return response.data;
}

export async function getPopularMovies(page = 1): Promise<TMDBResponse<Movie>> {
  const response = await api.get(`/api/tmdb/movie/popular`, {
    params: { page },
  });
  return response.data;
}

export async function getTopRatedMovies(
  page = 1
): Promise<TMDBResponse<Movie>> {
  const response = await api.get(`/api/tmdb/movie/top_rated`, {
    params: { page },
  });
  return response.data;
}

export async function getUpcomingMovies(
  page = 1
): Promise<TMDBResponse<Movie>> {
  const response = await api.get(`/api/tmdb/movie/upcoming`, {
    params: { page },
  });
  return response.data;
}

export async function getNowPlayingMovies(
  page = 1
): Promise<TMDBResponse<Movie>> {
  const response = await api.get(`/api/tmdb/movie/now_playing`, {
    params: { page },
  });
  return response.data;
}

export async function getMovieDetails(id: number): Promise<MovieDetails> {
  const response = await api.get(`/api/tmdb/movie/${id}`, {
    params: { append_to_response: "credits,videos,similar,recommendations" },
  });
  return response.data;
}

export async function getMoviesByGenre(
  genreId: number,
  page = 1
): Promise<TMDBResponse<Movie>> {
  const response = await api.get(`/api/tmdb/discover/movie`, {
    params: { with_genres: genreId, page },
  });
  return response.data;
}

// TV Shows
export async function getTrendingTVShows(
  timeWindow: "day" | "week" = "day"
): Promise<TMDBResponse<TVShow>> {
  const response = await api.get(`/api/tmdb/trending/tv/${timeWindow}`);
  return response.data;
}

export async function getPopularTVShows(
  page = 1
): Promise<TMDBResponse<TVShow>> {
  const response = await api.get(`/api/tmdb/tv/popular`, { params: { page } });
  return response.data;
}

export async function getTopRatedTVShows(
  page = 1
): Promise<TMDBResponse<TVShow>> {
  const response = await api.get(`/api/tmdb/tv/top_rated`, {
    params: { page },
  });
  return response.data;
}

export async function getOnTheAirTVShows(
  page = 1
): Promise<TMDBResponse<TVShow>> {
  const response = await api.get(`/api/tmdb/tv/on_the_air`, {
    params: { page },
  });
  return response.data;
}

export async function getTVShowDetails(id: number): Promise<TVShowDetails> {
  const response = await api.get(`/api/tmdb/tv/${id}`, {
    params: { append_to_response: "credits,videos,similar,recommendations" },
  });
  return response.data;
}

export async function getTVSeasonDetails(
  tvId: number,
  seasonNumber: number
): Promise<SeasonDetails> {
  const response = await api.get(
    `/api/tmdb/tv/${tvId}/season/${seasonNumber}`
  );
  return response.data;
}

export async function getTVShowsByGenre(
  genreId: number,
  page = 1
): Promise<TMDBResponse<TVShow>> {
  const response = await api.get(`/api/tmdb/discover/tv`, {
    params: { with_genres: genreId, page },
  });
  return response.data;
}

// Genres
export async function getMovieGenres(): Promise<{ genres: Genre[] }> {
  const response = await api.get(`/api/tmdb/genre/movie/list`);
  return response.data;
}

export async function getTVGenres(): Promise<{ genres: Genre[] }> {
  const response = await api.get(`/api/tmdb/genre/tv/list`);
  return response.data;
}

// Search
export async function searchMovies(
  query: string,
  page = 1
): Promise<TMDBResponse<Movie>> {
  const response = await api.get(`/api/tmdb/search/movie`, {
    params: { query, page },
  });
  return response.data;
}

export async function searchTVShows(
  query: string,
  page = 1
): Promise<TMDBResponse<TVShow>> {
  const response = await api.get(`/api/tmdb/search/tv`, {
    params: { query, page },
  });
  return response.data;
}

export async function searchMulti(
  query: string,
  page = 1
): Promise<TMDBResponse<Movie | TVShow>> {
  const response = await api.get(`/api/tmdb/search/multi`, {
    params: { query, page },
  });
  return response.data;
}

// Person
export async function getPersonDetails(id: number): Promise<PersonDetails> {
  const response = await api.get(`/api/tmdb/person/${id}`, {
    params: { append_to_response: "combined_credits" },
  });
  return response.data;
}
