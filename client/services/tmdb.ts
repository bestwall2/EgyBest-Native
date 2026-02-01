import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
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
import { TMDB_BASE_URL, TMDB_API_KEY } from "@/lib/query-client";

const api = axios.create({
  baseURL: TMDB_BASE_URL,
  params: {
    api_key: TMDB_API_KEY,
  },
  timeout: 15000,
});

api.interceptors.request.use(async (config) => {
  const language = (await AsyncStorage.getItem("user-language")) || "ar";
  config.params = {
    ...config.params,
    language,
  };
  return config;
});

// Movies
export async function getTrendingMovies(
  timeWindow: "day" | "week" = "day",
): Promise<TMDBResponse<Movie>> {
  const response = await api.get(`/trending/movie/${timeWindow}`);
  return response.data;
}

export async function getPopularMovies(page = 1): Promise<TMDBResponse<Movie>> {
  const response = await api.get(`/movie/popular`, {
    params: { page },
  });
  return response.data;
}

export async function getTopRatedMovies(
  page = 1,
): Promise<TMDBResponse<Movie>> {
  const response = await api.get(`/movie/top_rated`, {
    params: { page },
  });
  return response.data;
}

export async function getUpcomingMovies(
  page = 1,
): Promise<TMDBResponse<Movie>> {
  const response = await api.get(`/movie/upcoming`, {
    params: { page },
  });
  return response.data;
}

export async function getNowPlayingMovies(
  page = 1,
): Promise<TMDBResponse<Movie>> {
  const response = await api.get(`/movie/now_playing`, {
    params: { page },
  });
  return response.data;
}

export async function getMovieDetails(id: number): Promise<MovieDetails> {
  const response = await api.get(`/movie/${id}`, {
    params: { append_to_response: "credits,videos,similar,recommendations" },
  });
  return response.data;
}

export async function getMoviesByGenre(
  genreId: number,
  page = 1,
): Promise<TMDBResponse<Movie>> {
  const response = await api.get(`/discover/movie`, {
    params: { with_genres: genreId, page },
  });
  return response.data;
}

// TV Shows
export async function getTrendingTVShows(
  timeWindow: "day" | "week" = "day",
): Promise<TMDBResponse<TVShow>> {
  const response = await api.get(`/trending/tv/${timeWindow}`);
  return response.data;
}

export async function getPopularTVShows(
  page = 1,
): Promise<TMDBResponse<TVShow>> {
  const response = await api.get(`/tv/popular`, { params: { page } });
  return response.data;
}

export async function getTopRatedTVShows(
  page = 1,
): Promise<TMDBResponse<TVShow>> {
  const response = await api.get(`/tv/top_rated`, {
    params: { page },
  });
  return response.data;
}

export async function getOnTheAirTVShows(
  page = 1,
): Promise<TMDBResponse<TVShow>> {
  const response = await api.get(`/tv/on_the_air`, {
    params: { page },
  });
  return response.data;
}

export async function getTVShowDetails(id: number): Promise<TVShowDetails> {
  const response = await api.get(`/tv/${id}`, {
    params: { append_to_response: "credits,videos,similar,recommendations" },
  });
  return response.data;
}

export async function getTVSeasonDetails(
  tvId: number,
  seasonNumber: number,
): Promise<SeasonDetails> {
  const response = await api.get(`/tv/${tvId}/season/${seasonNumber}`);
  return response.data;
}

export async function getTVShowsByGenre(
  genreId: number,
  page = 1,
): Promise<TMDBResponse<TVShow>> {
  const response = await api.get(`/discover/tv`, {
    params: { with_genres: genreId, page },
  });
  return response.data;
}

// Genres
export async function getMovieGenres(): Promise<{ genres: Genre[] }> {
  const response = await api.get(`/genre/movie/list`);
  return response.data;
}

export async function getTVGenres(): Promise<{ genres: Genre[] }> {
  const response = await api.get(`/genre/tv/list`);
  return response.data;
}

// Search
export async function searchMovies(
  query: string,
  page = 1,
): Promise<TMDBResponse<Movie>> {
  const response = await api.get(`/search/movie`, {
    params: { query, page },
  });
  return response.data;
}

export async function searchTVShows(
  query: string,
  page = 1,
): Promise<TMDBResponse<TVShow>> {
  const response = await api.get(`/search/tv`, {
    params: { query, page },
  });
  return response.data;
}

export async function searchMulti(
  query: string,
  page = 1,
): Promise<TMDBResponse<Movie | TVShow>> {
  const response = await api.get(`/search/multi`, {
    params: { query, page },
  });
  return response.data;
}

// Person
export async function getPersonDetails(id: number): Promise<PersonDetails> {
  const response = await api.get(`/person/${id}`, {
    params: { append_to_response: "combined_credits" },
  });
  return response.data;
}
